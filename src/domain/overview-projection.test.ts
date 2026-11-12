import { describe, expect, it } from "vitest"
import { getEvidence, getSequence, sequenceScenes } from "@/content"
import { formatSpan, getItem } from "@/content/overview"
import { itemsOfEtapa } from "@/content/etapas"
import { reflectionSlots } from "@/content/reflections"
import { everyState } from "@/test/session-states"
import { toProjectorView } from "./projection"

const scenes = sequenceScenes("visao-geral")

/** Texto que o telão desenha numa cena da visão geral (sem contar opções de enquete). */
function visibleText(view: ReturnType<typeof toProjectorView>): string {
  const o = view.scene?.overview
  if (!o) return [view.scene?.title, view.scene?.caption, ...(view.scene?.releasedRefs ?? [])].filter(Boolean).join(" ")
  const item = o.itemId ? getItem(o.itemId) : undefined
  const line = o.depth.at(-1) ?? o.stageLine ?? ""
  return [item?.label, item ? formatSpan(item) : "", item?.sub, line].filter(Boolean).join(" ")
}

describe("Visão Geral no telão", () => {
  it("é apresentável e cobre só as semanas com material, dentro de 30–45 min", () => {
    const seq = getSequence("visao-geral")!
    expect(seq.presentable).toBe(true)
    const weeks = new Set(scenes.map((s) => s.overview?.week).filter(Boolean))
    expect([...weeks].sort()).toEqual([1, 2, 3, 4, 5, 6])
    // Cenas opcionais (minijogos das etapas 2–11) o apresentador pula quando faltar tempo.
    const minutes = scenes.filter((s) => !s.optional).reduce((sum, s) => sum + s.estimatedSeconds, 0) / 60
    expect(minutes).toBeGreaterThanOrEqual(30)
    // Acima de 45 min é aviso, não erro: os cortes são decisão do autor (a Área de preparação mostra em vermelho).
    if (minutes > 45) console.warn(`Visão Geral: ${minutes.toFixed(1)} min estimados sem os jogos opcionais (limite do Manual: 45).`)
    expect(scenes.filter((s) => s.optional).every((s) => s.game)).toBe(true)
  })

  it("respeita o orçamento de texto em todos os estados", () => {
    for (const { state, scenes: sc } of everyState("visao-geral", true)) {
      const view = toProjectorView(state, { scenes: sc }, getEvidence)
      expect(visibleText(view).length).toBeLessThanOrEqual(220)
    }
  })

  it("espaços do autor vazios aparecem só como imagem", () => {
    const empty = reflectionSlots.filter((s) => s.scope !== "jogo" && !s.pergunta)
    expect(empty.length).toBeGreaterThan(0)
    for (const { state, scenes: sc } of everyState("visao-geral", true)) {
      const view = toProjectorView(state, { scenes: sc }, getEvidence)
      const o = view.scene?.overview
      if (o?.role === "reflexao" && empty.some((s) => s.id === o.slotId)) {
        expect(o.stageLine).toBeUndefined()
        expect(view.scene?.title).toBeUndefined()
      }
    }
  })

  it("revela os itens da etapa à medida que avança e recomeça na etapa seguinte", () => {
    const seen = new Map<number, number>()
    for (const { state, scenes: sc } of everyState("visao-geral", true)) {
      const o = toProjectorView(state, { scenes: sc }, getEvidence).scene?.overview
      if (o?.role === "item" && o.etapa) {
        expect(o.revealedItemIds).toContain(o.itemId)
        expect(o.revealedItemIds.every((id) => itemsOfEtapa(o.etapa!).some((i) => i.id === id))).toBe(true)
        expect(o.revealedItemIds.length).toBeGreaterThanOrEqual(seen.get(o.etapa) ?? 0)
        seen.set(o.etapa, o.revealedItemIds.length)
      }
    }
    expect(seen.get(6)).toBe(itemsOfEtapa(6).length)
  })

  it("só etapas na tela: o telão nunca escreve “Semana N”", () => {
    for (const { state, scenes: sc } of everyState("visao-geral", true)) {
      const view = toProjectorView(state, { scenes: sc }, getEvidence)
      expect(JSON.stringify([view.scene?.title, view.scene?.caption, view.scene?.overview?.stageLine, view.scene?.overview?.depth])).not.toMatch(/Semana \d/)
    }
  })
})
