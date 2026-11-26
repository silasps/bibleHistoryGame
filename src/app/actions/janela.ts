"use server"

import { z } from "zod"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { isLiveConfigured } from "@/data/supabase/admin"
import { applyJanela, broadcastJanela, createJanela, loadJanela } from "@/data/supabase/janela"
import { secretMatches } from "@/data/supabase/secrets"
import { ACOES_DE_PALCO, publico, type JanelaAction, type JanelaState } from "@/domain/janela-verde"

// Janela Verde em sala: ações de palco exigem a chave do condutor; as dos
// grupos e do compromisso são públicas. A hora é sempre a do servidor.

const Code = z.string().transform(normalizeRoomCode).refine(isRoomCode, "Código inválido")
const Id = z.string().min(1).max(64)
const Grupo = z.enum(["auren", "nair"])
const Visita = z.enum(["yanomami", "sawi"])
const Valor = z.enum(["sim", "parte", "nao"])
const T = z.number().finite()
const De = z.object({ etapa: z.number().int(), passo: z.number().int() })

const ActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("comecar"), agora: T }),
  z.object({ type: z.literal("avancar"), de: De, agora: T }),
  z.object({ type: z.literal("voltar"), de: De, agora: T }),
  z.object({ type: z.literal("ir"), etapa: z.number().int(), agora: T }),
  z.object({ type: z.literal("encerrar"), agora: T }),
  z.object({ type: z.literal("reiniciar"), agora: T }),
  z.object({ type: z.literal("relogio"), minutos: T, agora: T }),
  z.object({ type: z.literal("pausar"), agora: T }),
  z.object({ type: z.literal("continuar"), agora: T }),
  z.object({ type: z.literal("parar") }),
  z.object({ type: z.literal("som"), volume: T.optional(), mudo: z.boolean().optional() }),
  z.object({ type: z.literal("pular"), etapa: Id, on: z.boolean() }),
  z.object({ type: z.literal("corte"), id: Id, on: z.boolean() }),
  z.object({ type: z.literal("perguntas"), ids: z.array(Id).max(20) }),
  z.object({ type: z.literal("recebe"), visita: Visita, quem: z.string().max(30) }),
  z.object({ type: z.literal("pista"), visita: Visita, id: Id, usada: z.boolean() }),
  z.object({ type: z.literal("mostrarPalavra"), id: Id.nullable() }),
  z.object({ type: z.literal("entrar"), grupo: Grupo, agora: T }),
  z.object({ type: z.literal("orou"), grupo: Grupo, etapa: Id, card: Id }),
  z.object({ type: z.literal("compartilhou"), grupo: Grupo }),
  z.object({ type: z.literal("responder"), visita: Visita, grupo: Grupo, valor: Valor }),
  z.object({ type: z.literal("palavra"), id: Id, grupo: Grupo, texto: z.string().max(600), agora: T }),
  z.object({ type: z.literal("comprometer"), aparelho: Id, ops: z.array(Id).max(20) }),
  z.object({ type: z.literal("tempo"), prazo: T }),
])

type Resposta = { state: JanelaState; version: number; now: number } | { error: string }

export async function criarJanela(): Promise<{ code: string; chave: string } | { error: string }> {
  if (!isLiveConfigured()) return { error: "As salas não estão disponíveis agora." }
  try {
    return await createJanela()
  } catch (e) {
    console.error("criarJanela", e)
    return { error: "Não foi possível criar a sala. Tente de novo." }
  }
}

export async function lerJanela(rawCode: string): Promise<Resposta> {
  const code = Code.safeParse(rawCode)
  if (!code.success || !isLiveConfigured()) return { error: "Sala inválida" }
  try {
    const snap = await loadJanela(code.data)
    return snap ? { state: publico(snap.state), version: snap.version, now: Date.now() } : { error: "Sala não encontrada ou expirada" }
  } catch (e) {
    console.error("lerJanela", e)
    return { error: "Não foi possível abrir a sala agora." }
  }
}

export async function agirJanela(rawCode: string, rawAction: unknown, chave?: string | null): Promise<Resposta> {
  const code = Code.safeParse(rawCode)
  const parsed = ActionSchema.safeParse(rawAction)
  if (!code.success || !parsed.success || !isLiveConfigured()) return { error: "Ação inválida" }
  const data = parsed.data as JanelaAction
  const action = "agora" in data ? ({ ...data, agora: Date.now() } as JanelaAction) : data
  try {
    const palco = ACOES_DE_PALCO.has(action.type)
    const result = await applyJanela(code.data, action, palco ? (s) => secretMatches(chave ?? undefined, s.chaveHash) : undefined)
    if (result === "negado") return { error: "Só o condutor pode fazer isso." }
    if (!result) return { error: "Sala não encontrada ou expirada" }
    const { mudou, ...snap } = result
    if (mudou) await broadcastJanela(code.data, snap)
    return { state: publico(snap.state), version: snap.version, now: Date.now() }
  } catch (e) {
    console.error("agirJanela", e)
    return { error: "A ação não chegou. Tente de novo." }
  }
}

export async function conferirChave(rawCode: string, chave: string): Promise<{ ok: boolean }> {
  const code = Code.safeParse(rawCode)
  if (!code.success || !isLiveConfigured()) return { ok: false }
  try {
    const snap = await loadJanela(code.data)
    return { ok: !!snap && secretMatches(chave, snap.state.chaveHash) }
  } catch {
    return { ok: false }
  }
}
