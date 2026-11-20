import "server-only"

import { generateRoomCode } from "@/data/room-code"
import { estadoInicial, reduceShow, type Config, type ShowAction, type ShowState } from "@/domain/bible-show"
import { admin } from "./admin"

// Salas do Bible Show (um celular por equipe). O servidor aplica o mesmo
// reducer do jogo; a versão evita que duas ações se atropelem.

export interface ShowSnapshot {
  state: ShowState
  version: number
}

export async function loadShow(code: string): Promise<ShowSnapshot | null> {
  const { data, error } = await admin().from("show_rooms").select("state, version, expires_at").eq("code", code).maybeSingle()
  if (error) throw error
  if (!data || new Date(data.expires_at).getTime() < Date.now()) return null
  return { state: data.state as ShowState, version: data.version }
}

export async function createShow(config: Config): Promise<string> {
  const state = reduceShow(estadoInicial, { type: "comecar", config })
  for (let i = 0; i < 5; i++) {
    const code = generateRoomCode()
    const { error } = await admin().from("show_rooms").insert({ code, state })
    if (!error) return code
    if (error.code !== "23505") throw error // 23505: código repetido, tenta outro
  }
  throw new Error("Não foi possível criar a sala")
}

/** Aplica a ação no estado mais recente (tenta de novo se outra chegou antes). */
export async function applyShow(code: string, action: ShowAction): Promise<(ShowSnapshot & { mudou: boolean }) | null> {
  for (let i = 0; i < 4; i++) {
    const snap = await loadShow(code)
    if (!snap) return null
    const next = reduceShow(snap.state, action)
    if (next === snap.state) return { ...snap, mudou: false }
    const { data, error } = await admin()
      .from("show_rooms")
      .update({ state: next, version: snap.version + 1, updated_at: new Date().toISOString() })
      .eq("code", code)
      .eq("version", snap.version)
      .select("version")
      .maybeSingle()
    if (error) throw error
    if (data) return { state: next, version: data.version, mudou: true }
  }
  const snap = await loadShow(code)
  return snap && { ...snap, mudou: false }
}

/** Manda o estado novo para os celulares da sala. */
export async function broadcastShow(code: string, snap: ShowSnapshot) {
  const channel = admin().channel(`show:${code}`)
  try {
    await channel.httpSend("estado", { ...snap, now: Date.now() })
  } catch (e) {
    console.error("broadcast do Bible Show falhou", e)
  } finally {
    void admin().removeChannel(channel)
  }
}
