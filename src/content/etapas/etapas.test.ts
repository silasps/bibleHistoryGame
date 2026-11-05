import { describe, expect, it } from "vitest"
import { sequenceScenes } from "@/content"
import { items, weeks } from "../overview"
import { getBook } from "../books"
import { PRESENTATION_MAX_MINUTES } from "../rubric"
import { ROOM_GAMES } from "./jogos"
import { ALL_RELICS } from "./relics"
import { etapaBudgetSeconds, etapaOfItem, etapas, itemsOfEtapa, prdMoments, presentableEtapas, validateEtapas } from "."

describe("etapas da história", () => {
  it("passam na validação: cada item numa etapa só, cada versículo com lugar", () => {
    expect(validateEtapas()).toEqual([])
    for (const i of items) expect(etapaOfItem(i.id), i.id).toBeDefined()
  })

  it("os tempos de referência das etapas somam os 45 min do Manual", () => {
    const total = etapas.reduce((n, e) => n + etapaBudgetSeconds(e.n), 0)
    expect(Math.abs(total - PRESENTATION_MAX_MINUTES * 60)).toBeLessThanOrEqual(etapas.length)
  })

  it("começam pela Criação e seguem a ordem dos itens", () => {
    expect(itemsOfEtapa(1).map((i) => i.id)).toEqual(["criacao", "adao-eva", "queda"])
    expect(presentableEtapas.map((e) => e.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })

  it("o fio do plano começa em Gn 3:15 e passa por todos os versículos das semanas com material", () => {
    expect(prdMoments[0]).toMatchObject({ week: 1, refIndex: 0, etapa: 1, knot: 1 })
    const verses = weeks.filter((w) => w.status === "com_material").reduce((n, w) => n + w.memoryVerse.length, 0)
    expect(prdMoments).toHaveLength(verses)
    expect(prdMoments.map((p) => p.knot)).toEqual(prdMoments.map((_, i) => i + 1))
  })

  it("na sequência, cada versículo vem logo depois do seu item, e a pista depois do último versículo da semana", () => {
    const ids = sequenceScenes("visao-geral").map((s) => s.id)
    // Depois da Queda: Deus veste o homem (Gn 3:21), fora do jardim, e então o versículo.
    expect(ids.slice(ids.indexOf("item-queda"), ids.indexOf("item-queda") + 4)).toEqual(["item-queda", "jogo-vestes", "jogo-fora", "versiculo-01"])
    expect(ids.indexOf("pista-01")).toBe(ids.indexOf("versiculo-01") + 1)
    expect(ids.indexOf("versiculo-03-1")).toBe(ids.indexOf("item-josue") + 1)
    expect(ids.indexOf("pista-03")).toBe(ids.indexOf("versiculo-03-2") + 1)
    expect(ids.indexOf("pista-03")).toBeGreaterThan(ids.indexOf("item-alianca-davidica"))
  })

  it("cada etapa de 2 a 11 tem um minijogo, depois de um item dela, com referências válidas e uma relíquia", () => {
    const refOk = (r: { book: Parameters<typeof getBook>[0]; chapter: number }) => r.chapter <= getBook(r.book).chapters
    for (const e of presentableEtapas.filter((e) => e.n > 1)) {
      const games = ROOM_GAMES.filter((g) => g.etapa === e.n)
      expect(games, `etapa ${e.n}`).toHaveLength(1)
      const g = games[0]
      expect(e.itemIds, g.id).toContain(g.afterItemId)
      for (const r of [g.ref, g.finale.ref, g.relic.ref]) expect(refOk(r), g.id).toBe(true)
    }
    expect(new Set(ALL_RELICS.map((r) => r.id)).size).toBe(ALL_RELICS.length)
  })
})
