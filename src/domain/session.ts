import type { Poll, Scene } from "@/content/schema"
import { castVote, closePoll, createPoll, openPoll, type PollState, type VoteResult } from "./poll"

export type MomentKind = "haja-luz" | "luzes"
/** "selo": o apresentador quebra o selo da pista no telão. */
export type CueKind = "trem" | "muro" | "selo"

/** Toques que cada pessoa dá no celular para quebrar o selo de uma pista. */
export const SEAL_TAPS = 6
const SEAL_PREFIX = "selo-"
/**
 * O selo de uma pista usa o mesmo registro dos minijogos (tabela `plays`):
 * `done` = a pessoa já quebrou o selo no celular.
 */
export const sealGameId = (evidenceId: string) => `${SEAL_PREFIX}${evidenceId}`
const sealEvidenceId = (gameId: string) => (gameId.startsWith(SEAL_PREFIX) ? gameId.slice(SEAL_PREFIX.length) : undefined)

export interface Participant {
  id: string
  nickname?: string
  joinedAt: number
  lastSeenAt: number
  /** Ordem de entrada (para a "onda" de luz). */
  order: number
}

/** Resultado de uma pessoa num minijogo: quanto avançou e se chegou ao fim. */
export interface PlayResult {
  value: number
  done: boolean
  /** Quando o resultado subiu pela última vez (desempate do pódio: quem chegou antes). */
  at?: number
}

export interface SessionState {
  version: number
  roomCode: string
  sequenceId: string
  sceneIds: string[]
  index: number
  status: "lobby" | "running" | "ended"
  paused: boolean
  rehearsal: boolean
  polls: Record<string, PollState>
  released: string[]
  participants: Record<string, Participant>
  /** participantId → instante em que acendeu a luz. */
  lights: Record<string, number>
  /** Minijogos: gameId → participantId → resultado (salas antigas podem não ter). */
  plays?: Record<string, Record<string, PlayResult>>
  moment: { kind: MomentKind; startedAt: number } | null
  /** Passos revelados na cena atual (ex.: candidatos a motorista). */
  step: number
  /** Efeito disparado na cena atual (ex.: trem passando, muro subindo). */
  cue: { kind: CueKind; at: number } | null
  /** Objeto da skin do personagem em destaque na cena atual. */
  spotlight?: string | null
  /** Último minijogo encerrado (ao sair da cena): o telão e os celulares mostram o pódio por alguns segundos. */
  lastGame?: { gameId: string; sceneIndex: number; at: number } | null
  timing: {
    startedAt?: number
    sceneEnteredAt?: number
    pausedAt?: number
    pausedMs: number
    sceneMs: Record<string, number>
  }
  createdAt: number
}

export type HostCommand =
  | { type: "start" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "goto"; index: number }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "open_poll"; pollId: string }
  | { type: "close_poll"; pollId: string }
  | { type: "show_results"; pollId: string }
  | { type: "hide_results"; pollId: string }
  | { type: "release"; evidenceId: string }
  | { type: "moment"; kind: MomentKind }
  | { type: "clear_moment" }
  | { type: "step"; delta: 1 | -1 }
  | { type: "cue"; kind: CueKind }
  | { type: "spotlight"; skinId: string | null }
  | { type: "set_rehearsal"; value: boolean }
  | { type: "end" }

export type AudienceCommand =
  | { type: "join"; participantId: string; nickname?: string }
  | { type: "vote"; participantId: string; pollId: string; optionId: string }
  | { type: "light"; participantId: string }
  | { type: "play"; participantId: string; gameId: string; value: number; done: boolean }
  | { type: "heartbeat"; participantId: string }

/** Parte da narrativa de que o reducer precisa: as cenas da sequência, em ordem. */
export interface SessionNarrative {
  scenes: Scene[]
}

export interface Ctx {
  now: number
  narrative: SessionNarrative
}

export type HostResult = { state: SessionState; error?: string }
export type AudienceResult = { state: SessionState; result: VoteResult | "ok" | "rejected" }

export function createSession(input: {
  roomCode: string
  sequenceId: string
  sceneIds: string[]
  rehearsal?: boolean
  now: number
}): SessionState {
  return {
    version: 0,
    roomCode: input.roomCode,
    sequenceId: input.sequenceId,
    sceneIds: input.sceneIds,
    index: 0,
    status: "lobby",
    paused: false,
    rehearsal: input.rehearsal ?? false,
    polls: {},
    released: [],
    participants: {},
    lights: {},
    plays: {},
    moment: null,
    step: 0,
    cue: null,
    spotlight: null,
    timing: { pausedMs: 0, sceneMs: {} },
    createdAt: input.now,
  }
}

export function currentSceneId(state: SessionState): string | undefined {
  return state.sceneIds[state.index]
}

function pollDef(narrative: SessionNarrative, pollId: string): { poll: Poll; index: number } | undefined {
  const index = narrative.scenes.findIndex((s) => s.poll?.id === pollId)
  const poll = narrative.scenes[index]?.poll
  return poll ? { poll, index } : undefined
}

/** Fecha o relógio da cena atual. */
function stopClock(state: SessionState, now: number): SessionState["timing"] {
  const t = state.timing
  const id = currentSceneId(state)
  if (t.sceneEnteredAt === undefined || !id) return t
  return { ...t, sceneEnteredAt: undefined, sceneMs: { ...t.sceneMs, [id]: (t.sceneMs[id] ?? 0) + (now - t.sceneEnteredAt) } }
}

function moveTo(state: SessionState, index: number, now: number, narrative: SessionNarrative): SessionState {
  if (index < 0 || index >= state.sceneIds.length || index === state.index) return state
  // Saindo de um minijogo com resultados: guarda para o pódio de fim de jogo.
  const game = narrative.scenes[state.index]?.game
  const played = game && game.max > 0 && Object.values(state.plays?.[game.id] ?? {}).some((r) => r.value > 0)
  const lastGame = played ? { gameId: game.id, sceneIndex: state.index, at: now } : (state.lastGame ?? null)
  const timing = stopClock(state, now)
  // Enquetes abertas na cena que sai são fechadas: nada de votos atrasados.
  const polls = Object.fromEntries(Object.entries(state.polls).map(([id, p]) => [id, closePoll(p)]))
  return {
    ...state,
    index,
    polls,
    moment: null,
    step: 0,
    cue: null,
    spotlight: null,
    lastGame,
    timing: { ...timing, sceneEnteredAt: state.paused ? undefined : now },
  }
}

const bump = (s: SessionState): SessionState => ({ ...s, version: s.version + 1 })

export function reduceHost(state: SessionState, cmd: HostCommand, ctx: Ctx): HostResult {
  const { now, narrative } = ctx
  if (state.status === "ended") return { state, error: "Sessão encerrada" }
  if (state.status === "lobby" && cmd.type !== "start" && cmd.type !== "set_rehearsal" && cmd.type !== "end") {
    return { state, error: "A apresentação ainda não começou" }
  }

  switch (cmd.type) {
    case "start":
      if (state.status !== "lobby") return { state }
      return {
        state: bump({ ...state, status: "running", timing: { ...state.timing, startedAt: now, sceneEnteredAt: now } }),
      }
    case "next":
      return { state: bump(moveTo(state, state.index + 1, now, narrative)) }
    case "prev":
      return { state: bump(moveTo(state, state.index - 1, now, narrative)) }
    case "goto":
      return { state: bump(moveTo(state, cmd.index, now, narrative)) }
    case "pause":
      if (state.paused) return { state }
      return { state: bump({ ...state, paused: true, timing: { ...stopClock(state, now), pausedAt: now } }) }
    case "resume": {
      if (!state.paused) return { state }
      const pausedMs = state.timing.pausedMs + (state.timing.pausedAt !== undefined ? now - state.timing.pausedAt : 0)
      return {
        state: bump({
          ...state,
          paused: false,
          timing: { ...state.timing, pausedAt: undefined, pausedMs, sceneEnteredAt: now },
        }),
      }
    }
    case "open_poll": {
      const def = pollDef(narrative, cmd.pollId)
      if (!def || def.index !== state.index) return { state, error: "Enquete não pertence à cena atual" }
      const current = state.polls[cmd.pollId] ?? createPoll(cmd.pollId)
      return { state: bump({ ...state, polls: { ...state.polls, [cmd.pollId]: openPoll(current) } }) }
    }
    case "close_poll": {
      const current = state.polls[cmd.pollId]
      if (!current) return { state, error: "Enquete inexistente" }
      return { state: bump({ ...state, polls: { ...state.polls, [cmd.pollId]: closePoll(current) } }) }
    }
    case "show_results":
    case "hide_results": {
      const current = state.polls[cmd.pollId]
      if (!current) return { state, error: "Enquete inexistente" }
      const resultsVisible = cmd.type === "show_results"
      return { state: bump({ ...state, polls: { ...state.polls, [cmd.pollId]: { ...current, resultsVisible } } }) }
    }
    case "release": {
      // Só libera conexões de cenas já alcançadas na sequência.
      const index = narrative.scenes.findIndex((s) => s.releases === cmd.evidenceId)
      if (index < 0) return { state, error: "Esta pista não pertence à sequência" }
      if (index > state.index) return { state, error: "Esta pista ainda não foi alcançada" }
      if (state.released.includes(cmd.evidenceId)) return { state }
      return { state: bump({ ...state, released: [...state.released, cmd.evidenceId] }) }
    }
    case "moment":
      return { state: bump({ ...state, moment: { kind: cmd.kind, startedAt: now } }) }
    case "clear_moment":
      return { state: bump({ ...state, moment: null }) }
    case "step": {
      const max = narrative.scenes[state.index]?.steps?.length ?? 0
      const step = Math.min(max, Math.max(0, state.step + cmd.delta))
      if (step === state.step) return { state }
      return { state: bump({ ...state, step }) }
    }
    case "cue":
      return { state: bump({ ...state, cue: { kind: cmd.kind, at: now } }) }
    case "spotlight":
      if ((state.spotlight ?? null) === cmd.skinId) return { state }
      return { state: bump({ ...state, spotlight: cmd.skinId }) }
    case "set_rehearsal":
      return { state: bump({ ...state, rehearsal: cmd.value }) }
    case "end":
      return { state: bump({ ...state, status: "ended", paused: false, moment: null, timing: stopClock(state, now) }) }
  }
}

export function reduceAudience(state: SessionState, cmd: AudienceCommand, ctx: Ctx): AudienceResult {
  const { now, narrative } = ctx
  if (state.status === "ended") return { state, result: "rejected" }
  const existing = state.participants[cmd.participantId]

  switch (cmd.type) {
    case "join": {
      const nickname = cmd.nickname?.trim().slice(0, 24) || undefined
      if (existing) {
        // Reconexão: mantém a ordem de entrada e os votos.
        const participant = { ...existing, lastSeenAt: now, nickname: nickname ?? existing.nickname }
        return { state: { ...state, participants: { ...state.participants, [cmd.participantId]: participant } }, result: "ok" }
      }
      const order = Object.keys(state.participants).length
      const participant: Participant = { id: cmd.participantId, nickname, joinedAt: now, lastSeenAt: now, order }
      return { state: bump({ ...state, participants: { ...state.participants, [cmd.participantId]: participant } }), result: "ok" }
    }
    case "heartbeat":
      if (!existing) return { state, result: "rejected" }
      return {
        state: { ...state, participants: { ...state.participants, [cmd.participantId]: { ...existing, lastSeenAt: now } } },
        result: "ok",
      }
    case "vote": {
      if (!existing) return { state, result: "rejected" }
      const def = pollDef(narrative, cmd.pollId)
      const poll = state.polls[cmd.pollId]
      if (!def || !poll) return { state, result: "rejected_not_open" }
      const { poll: updated, result } = castVote(poll, def.poll, cmd.participantId, cmd.optionId)
      if (updated === poll) return { state, result }
      return { state: bump({ ...state, polls: { ...state.polls, [cmd.pollId]: updated } }), result }
    }
    case "light":
      if (!existing) return { state, result: "rejected" }
      if (state.lights[cmd.participantId]) return { state, result: "unchanged" }
      return { state: bump({ ...state, lights: { ...state.lights, [cmd.participantId]: now } }), result: "accepted" }
    case "play": {
      if (!existing || !Number.isFinite(cmd.value)) return { state, result: "rejected" }
      const sealOf = sealEvidenceId(cmd.gameId)
      const game = narrative.scenes[state.index]?.game
      let max: number
      if (sealOf) {
        // Selo de pista: só depois da liberação; vale também depois da cena (no Arquivo).
        if (!state.released.includes(sealOf)) return { state, result: "rejected" }
        max = SEAL_TAPS
      } else {
        // Só vale o jogo da cena atual; avançar a cena encerra a brincadeira.
        if (!game || game.id !== cmd.gameId || game.max === 0) return { state, result: "rejected" }
        max = game.max
      }
      const prev = state.plays?.[cmd.gameId]?.[cmd.participantId]
      const next = mergePlay(prev, { value: Math.min(max, Math.max(0, Math.round(cmd.value))), done: !!cmd.done, at: now })
      if (prev && prev.value === next.value && prev.done === next.done) return { state, result: "unchanged" }
      const plays = { ...state.plays, [cmd.gameId]: { ...state.plays?.[cmd.gameId], [cmd.participantId]: next } }
      return { state: bump({ ...state, plays }), result: "accepted" }
    }
  }
}

/** O progresso nunca anda para trás (reenvios atrasados não apagam o que já foi feito). */
export function mergePlay(prev: PlayResult | undefined, next: PlayResult): PlayResult {
  const value = Math.max(prev?.value ?? 0, next.value)
  const done = !!prev?.done || next.done
  // O instante só muda quando o resultado melhora: é ele que desempata o pódio.
  const improved = !prev || value > prev.value || (done && !prev.done)
  const at = improved ? (next.at ?? prev?.at) : prev?.at
  return at === undefined ? { value, done } : { value, done, at }
}
