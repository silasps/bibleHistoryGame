import "server-only"

import { getSequence, sequenceScenes } from "@/content"
import { generateRoomCode } from "@/data/room-code"
import {
  createSession,
  reduceAudience,
  reduceHost,
  type HostCommand,
  type Participant,
  type PlayResult,
  type SessionState,
} from "@/domain/session"
import { admin } from "./admin"
import { hashSecret, newSecret, secretMatches } from "./secrets"

// Repositório das salas ao vivo. O estado do palco fica em rooms.state;
// participantes, votos e luzes em tabelas próprias. `compose` junta tudo num
// SessionState para reaproveitar o mesmo reducer e as mesmas projeções da demo.

interface RoomRow {
  code: string
  host_secret_hash: string
  sequence_id: string
  state: SessionState
  version: number
  expires_at: string
  ended_at: string | null
}

export type SyncScope = "stage" | "votes" | "people" | "lights" | "plays"

const ROOM_COLUMNS = "code, host_secret_hash, sequence_id, state, version, expires_at, ended_at"

async function loadRow(code: string): Promise<RoomRow | null> {
  const { data, error } = await admin().from("rooms").select(ROOM_COLUMNS).eq("code", code).maybeSingle()
  if (error) throw error
  if (!data) return null
  if (new Date(data.expires_at).getTime() < Date.now()) return null
  return data as RoomRow
}

/** Estado do palco sem dados que vivem em outras tabelas. */
function stageOnly(state: SessionState): SessionState {
  return {
    ...state,
    participants: {},
    lights: {},
    plays: {},
    polls: Object.fromEntries(Object.entries(state.polls).map(([id, p]) => [id, { ...p, votes: {} }])),
  }
}

export async function loadRoom(code: string): Promise<{ row: RoomRow; state: SessionState } | null> {
  const row = await loadRow(code)
  if (!row) return null
  const db = admin()
  const [people, votes, lights, played] = await Promise.all([
    db.from("participants").select("id, nickname, join_order, joined_at, last_seen_at").eq("room_code", code),
    db.from("votes").select("poll_id, participant_id, option_id").eq("room_code", code),
    db.from("lights").select("participant_id, lit_at").eq("room_code", code),
    db.from("plays").select("game_id, participant_id, value, done, updated_at").eq("room_code", code),
  ])
  for (const r of [people, votes, lights]) if (r.error) throw r.error
  // Sem a tabela dos minijogos (migration ainda não aplicada), a sala segue sem somar os jogos.
  if (played.error) console.warn("plays indisponível", played.error.message)

  const participants: Record<string, Participant> = {}
  for (const p of people.data ?? []) {
    participants[p.id] = {
      id: p.id,
      nickname: p.nickname ?? undefined,
      order: p.join_order,
      joinedAt: Date.parse(p.joined_at),
      lastSeenAt: Date.parse(p.last_seen_at),
    }
  }
  const polls = { ...row.state.polls }
  for (const v of votes.data ?? []) {
    const poll = polls[v.poll_id]
    if (poll) polls[v.poll_id] = { ...poll, votes: { ...poll.votes, [v.participant_id]: v.option_id } }
  }
  const lit = Object.fromEntries((lights.data ?? []).map((l) => [l.participant_id, Date.parse(l.lit_at)]))
  const plays: Record<string, Record<string, PlayResult>> = {}
  // updated_at = quando o resultado melhorou (só se grava o que mudou): desempata o pódio.
  for (const p of played.data ?? []) (plays[p.game_id] ??= {})[p.participant_id] = { value: p.value, done: p.done, at: Date.parse(p.updated_at) }
  return { row, state: { ...row.state, participants, polls, lights: lit, plays } }
}

export async function createRoom(sequenceId: string, rehearsal: boolean): Promise<{ code: string; secret: string }> {
  const seq = getSequence(sequenceId)
  if (!seq) throw new Error("Sequência desconhecida")
  const secret = newSecret()
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode()
    const state = createSession({ roomCode: code, sequenceId: seq.id, sceneIds: seq.sceneIds, rehearsal, now: Date.now() })
    const { error } = await admin()
      .from("rooms")
      .insert({ code, host_secret_hash: hashSecret(secret), sequence_id: seq.id, state, version: 0 })
    if (!error) return { code, secret }
    if (error.code !== "23505") throw error // colisão de código: tenta outro
  }
  throw new Error("Não foi possível gerar um código de sala")
}

export async function isHost(code: string, secret: string | undefined): Promise<boolean> {
  const row = await loadRow(code)
  return !!row && secretMatches(secret, row.host_secret_hash)
}

/** Devolve só o estado do palco; votos, participantes e luzes vêm da rota /host. */
export async function applyHostCommand(
  code: string,
  secret: string | undefined,
  cmd: HostCommand,
): Promise<{ state?: SessionState; error?: string }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    // Comandos de palco não dependem de votos nem participantes: basta a linha da sala.
    const row = await loadRow(code)
    if (!row) return { error: "Sala não encontrada ou expirada" }
    if (!secretMatches(secret, row.host_secret_hash)) return { error: "Sem permissão de apresentador" }
    const loaded = { row, state: stageOnly(row.state) }
    const narrative = { scenes: sequenceScenes(row.sequence_id) }
    const { state, error } = reduceHost(loaded.state, cmd, { now: Date.now(), narrative })
    if (error) return { error }
    if (state === loaded.state) return { state }

    const patch: Record<string, unknown> = { state: stageOnly(state), version: loaded.row.version + 1, updated_at: new Date().toISOString() }
    if (cmd.type === "end") patch.ended_at = new Date().toISOString()
    const { data, error: dbError } = await admin()
      .from("rooms")
      .update(patch)
      .eq("code", code)
      .eq("version", loaded.row.version)
      .select("version")
    if (dbError) throw dbError
    if (data && data.length > 0) {
      if (cmd.type === "end") await purgeAudience(code)
      return { state }
    }
    // Outro comando do host gravou antes: tenta de novo com o estado atual.
  }
  return { error: "Conflito ao salvar; tente de novo" }
}

/** Retenção mínima: ao encerrar, apaga participantes (e votos/luzes em cascata). */
async function purgeAudience(code: string) {
  const { error } = await admin().from("participants").delete().eq("room_code", code)
  if (error) throw error
}

export async function deleteRoom(code: string, secret: string | undefined): Promise<boolean> {
  if (!(await isHost(code, secret))) return false
  const { error } = await admin().from("rooms").delete().eq("code", code)
  if (error) throw error
  return true
}

export async function participantFor(code: string, token: string | undefined): Promise<{ id: string } | null> {
  if (!token) return null
  const { data, error } = await admin()
    .from("participants")
    .select("id")
    .eq("room_code", code)
    .eq("token_hash", hashSecret(token))
    .maybeSingle()
  if (error) throw error
  return data
}

export async function joinRoom(
  code: string,
  token: string | undefined,
  nickname: string | undefined,
): Promise<{ participantId: string; token: string } | { error: string }> {
  const existing = await participantFor(code, token)
  if (existing && token) {
    // Reconexão: mantém identidade, ordem e votos.
    await admin()
      .from("participants")
      .update({ last_seen_at: new Date().toISOString(), ...(nickname ? { nickname } : {}) })
      .eq("id", existing.id)
    return { participantId: existing.id, token }
  }
  const fresh = newSecret()
  const { data, error } = await admin().rpc("join_room", {
    p_code: code,
    p_token_hash: hashSecret(fresh),
    p_nickname: nickname?.trim().slice(0, 24) ?? "",
  })
  if (error) return { error: error.message.includes("room_unavailable") ? "Sala não encontrada ou encerrada" : "Não foi possível entrar" }
  return { participantId: data as string, token: fresh }
}

export async function castVote(
  code: string,
  token: string | undefined,
  pollId: string,
  optionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const [loaded, participant] = await Promise.all([loadRoom(code), participantFor(code, token)])
  if (!loaded) return { ok: false, error: "Sala não encontrada" }
  if (!participant) return { ok: false, error: "Entre na sala para votar" }
  // Valida com o mesmo reducer da demo (enquete aberta, opção existente).
  const narrative = { scenes: sequenceScenes(loaded.row.sequence_id) }
  const { result } = reduceAudience(
    loaded.state,
    { type: "vote", participantId: participant.id, pollId, optionId },
    { now: Date.now(), narrative },
  )
  if (result === "unchanged") return { ok: true }
  if (result !== "accepted" && result !== "updated") {
    return { ok: false, error: result === "rejected_not_open" ? "A votação está fechada" : "Opção inválida" }
  }
  const { error } = await admin()
    .from("votes")
    .upsert(
      { room_code: code, poll_id: pollId, participant_id: participant.id, option_id: optionId, updated_at: new Date().toISOString() },
      { onConflict: "room_code,poll_id,participant_id" },
    )
  if (error) throw error
  return { ok: true }
}

export async function recordPlay(
  code: string,
  token: string | undefined,
  gameId: string,
  value: number,
  done: boolean,
): Promise<boolean> {
  const [loaded, participant] = await Promise.all([loadRoom(code), participantFor(code, token)])
  if (!loaded || !participant) return false
  // Mesmo reducer da demo: só o jogo da cena atual, valor dentro do limite, sem voltar atrás.
  const narrative = { scenes: sequenceScenes(loaded.row.sequence_id) }
  const { state, result } = reduceAudience(loaded.state, { type: "play", participantId: participant.id, gameId, value, done }, { now: Date.now(), narrative })
  if (result !== "accepted") return result === "unchanged"
  const next = state.plays![gameId][participant.id]
  const { error } = await admin()
    .from("plays")
    .upsert(
      { room_code: code, game_id: gameId, participant_id: participant.id, value: next.value, done: next.done, updated_at: new Date().toISOString() },
      { onConflict: "room_code,game_id,participant_id" },
    )
  if (error) {
    // O jogo continua no celular mesmo que a soma da sala falhe.
    console.warn("plays: não foi possível gravar", error.message)
    return false
  }
  return true
}

export async function lightUp(code: string, token: string | undefined): Promise<boolean> {
  const participant = await participantFor(code, token)
  if (!participant) return false
  const { error } = await admin()
    .from("lights")
    .upsert({ room_code: code, participant_id: participant.id }, { onConflict: "room_code,participant_id", ignoreDuplicates: true })
  if (error) throw error
  return true
}

/** Aviso sem conteúdo: os clientes refazem a busca da própria view. */
export async function broadcast(code: string, scope: SyncScope) {
  const channel = admin().channel(`room:${code}`)
  try {
    await channel.httpSend("sync", { scope, at: Date.now() })
  } catch (e) {
    console.error("broadcast falhou", e)
  } finally {
    void admin().removeChannel(channel)
  }
}
