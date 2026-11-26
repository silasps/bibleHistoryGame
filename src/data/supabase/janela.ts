import "server-only"

import { generateRoomCode } from "@/data/room-code"
import { ehJanela, estadoInicial, publico, reduceJanela, type JanelaAction, type JanelaState } from "@/domain/janela-verde"
import { admin } from "./admin"
import { hashSecret, newSecret } from "./secrets"

// Salas da Janela Verde: reaproveitam a tabela show_rooms. Muitos celulares
// agem ao mesmo tempo, então o laço de versão tenta mais vezes, com espera.

export interface JanelaSnapshot {
  state: JanelaState
  version: number
}

export async function loadJanela(code: string): Promise<JanelaSnapshot | null> {
  const { data, error } = await admin().from("show_rooms").select("state, version, expires_at").eq("code", code).maybeSingle()
  if (error) throw error
  if (!data || new Date(data.expires_at).getTime() < Date.now()) return null
  if (!ehJanela(data.state)) return null
  return { state: data.state, version: data.version }
}

export async function createJanela(): Promise<{ code: string; chave: string }> {
  const chave = newSecret()
  const state = estadoInicial(hashSecret(chave))
  for (let i = 0; i < 5; i++) {
    const code = generateRoomCode()
    const { error } = await admin().from("show_rooms").insert({ code, state })
    if (!error) return { code, chave }
    if (error.code !== "23505") throw error
  }
  throw new Error("Não foi possível criar a sala")
}

/** `autoriza`: conferência no mesmo estado carregado (ex.: a chave do condutor), sem outra ida ao banco. */
export async function applyJanela(
  code: string,
  action: JanelaAction,
  autoriza?: (state: JanelaState) => boolean,
): Promise<(JanelaSnapshot & { mudou: boolean }) | null | "negado"> {
  for (let i = 0; i < 8; i++) {
    const snap = await loadJanela(code)
    if (!snap) return null
    if (autoriza && !autoriza(snap.state)) return "negado"
    const next = reduceJanela(snap.state, action)
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
    await new Promise((r) => setTimeout(r, 15 + Math.random() * 65))
  }
  const snap = await loadJanela(code)
  return snap && { ...snap, mudou: false }
}

export async function broadcastJanela(code: string, snap: JanelaSnapshot) {
  const channel = admin().channel(`janela:${code}`)
  try {
    await channel.httpSend("estado", { state: publico(snap.state), version: snap.version, now: Date.now() })
  } catch (e) {
    console.error("broadcast da Janela Verde falhou", e)
  } finally {
    void admin().removeChannel(channel)
  }
}
