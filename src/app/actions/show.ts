"use server"

import { z } from "zod"
import { CATEGORIA_IDS } from "@/content/bible-show/cartas"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { isLiveConfigured } from "@/data/supabase/admin"
import { applyShow, broadcastShow, createShow, loadShow } from "@/data/supabase/show"
import { ESTILOS, type Config, type ShowAction, type ShowState } from "@/domain/bible-show"

// Bible Show em sala: qualquer celular com o código pode jogar (é um jogo de
// grupo, sem segredo a proteger além da carta). O servidor valida a ação,
// marca a hora e aplica o reducer.

const Code = z.string().transform(normalizeRoomCode).refine(isRoomCode, "Código inválido")
const R = z.number().min(0).max(1)
const T = z.number()
const LadoId = z.string().regex(/^l\d{1,2}$/)

const ConfigSchema: z.ZodType<Config> = z.object({
  modo: z.enum(["equipes", "individual"]),
  nomes: z.array(z.string().max(40)).min(1).max(12),
  segundos: z.number().int(),
  casas: z.number().int(),
  estilos: z.array(z.enum(ESTILOS as [string, ...string[]])).min(1) as z.ZodType<Config["estilos"]>,
  categorias: z.array(z.enum(CATEGORIA_IDS as [string, ...string[]])).min(1) as z.ZodType<Config["categorias"]>,
})

const ActionSchema: z.ZodType<ShowAction> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("girar"), r: R }),
  z.object({ type: z.literal("rolar"), r: R }),
  z.object({ type: z.literal("sortear"), r1: R, r2: R }),
  z.object({ type: z.literal("trocar"), r: R }),
  z.object({ type: z.literal("valendo"), agora: T }),
  z.object({ type: z.literal("pausar"), agora: T }),
  z.object({ type: z.literal("continuar"), agora: T }),
  z.object({ type: z.literal("acertaram"), agora: T }),
  z.object({ type: z.literal("acertou"), por: LadoId }),
  z.object({ type: z.literal("voltar"), agora: T }),
  z.object({ type: z.literal("errou"), prazo: T.optional() }),
  z.object({ type: z.literal("letra"), l: z.string().length(1), agora: T }),
  z.object({ type: z.literal("arriscar"), agora: T }),
  z.object({ type: z.literal("chutar"), palavra: z.string().max(60), agora: T }),
  z.object({ type: z.literal("passar"), agora: T, prazo: T.optional() }),
  z.object({ type: z.literal("proxima") }),
  z.object({ type: z.literal("cumprir"), alvo: LadoId.optional() }),
  z.object({ type: z.literal("revanche"), r: R.optional() }),
  z.object({ type: z.literal("configurar") }),
])

type Resposta = { state: ShowState; version: number; now: number } | { error: string }

export async function criarSalaShow(rawConfig: unknown): Promise<{ code: string } | { error: string }> {
  if (!isLiveConfigured()) return { error: "As salas não estão disponíveis agora." }
  const config = ConfigSchema.safeParse(rawConfig)
  if (!config.success) return { error: "Configuração inválida" }
  try {
    return { code: await createShow(config.data) }
  } catch (e) {
    console.error("criarSalaShow", e)
    return { error: "Não foi possível criar a sala. Tente de novo." }
  }
}

export async function lerSalaShow(rawCode: string): Promise<Resposta> {
  const code = Code.safeParse(rawCode)
  if (!code.success || !isLiveConfigured()) return { error: "Sala inválida" }
  try {
    const snap = await loadShow(code.data)
    return snap ? { ...snap, now: Date.now() } : { error: "Sala não encontrada ou expirada" }
  } catch (e) {
    console.error("lerSalaShow", e)
    return { error: "Não foi possível abrir a sala agora." }
  }
}

export async function jogarSalaShow(rawCode: string, rawAction: unknown): Promise<Resposta> {
  const code = Code.safeParse(rawCode)
  const parsed = ActionSchema.safeParse(rawAction)
  if (!code.success || !parsed.success || !isLiveConfigured()) return { error: "Jogada inválida" }
  // A hora é a do servidor: todos os celulares contam o mesmo tempo.
  const action = "agora" in parsed.data ? { ...parsed.data, agora: Date.now() } : parsed.data
  try {
    const result = await applyShow(code.data, action)
    if (!result) return { error: "Sala não encontrada ou expirada" }
    const { mudou, ...snap } = result
    if (mudou) await broadcastShow(code.data, snap)
    return { ...snap, now: Date.now() }
  } catch (e) {
    console.error("jogarSalaShow", e)
    return { error: "A jogada não chegou. Tente de novo." }
  }
}
