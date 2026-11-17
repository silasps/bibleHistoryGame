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
    expect(presentableEtapas.map((e) => e.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
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
    for (const e of presentableEtapas.filter((e) => e.n > 1 && e.n <= 11)) {
      const games = ROOM_GAMES.filter((g) => g.etapa === e.n)
      expect(games, `etapa ${e.n}`).toHaveLength(1)
      const g = games[0]
      expect(e.itemIds, g.id).toContain(g.itemId)
      for (const r of [g.ref, g.finale.ref, g.relic.ref]) expect(refOk(r), g.id).toBe(true)
    }
    expect(new Set(ALL_RELICS.map((r) => r.id)).size).toBe(ALL_RELICS.length)
  })
})

describe("roteiro do briefing (16/11/2026)", () => {
  const scenes = sequenceScenes("visao-geral")
  const ids = scenes.map((s) => s.id)

  it("o jogo da arca fica no slide de Noé, antes do Dilúvio; a funda, no Reinado de Davi", () => {
    expect(scenes.find((s) => s.id === "item-noe")?.game?.id).toBe("arca")
    expect(ids.indexOf("item-noe")).toBeLessThan(ids.indexOf("item-diluvio"))
    expect(scenes.find((s) => s.id === "item-davi")?.game?.id).toBe("funda")
  })

  it("Etapa 9: a divisão abre; Acabe vem antes de Elias e do altar; Arã não vira slide", () => {
    const e9 = scenes.filter((s) => s.overview?.etapa === 9 && s.overview.role === "item").map((s) => s.overview!.itemId)
    expect(e9[0]).toBe("divisao-reino")
    expect(e9.indexOf("acabe")).toBeLessThan(e9.indexOf("elias"))
    expect(scenes.find((s) => s.id === "item-elias")?.game?.id).toBe("altar")
    expect(ids).not.toContain("item-aram")
  })

  it("o versículo do plano vem logo depois do item, antes dos momentos (Js 1:7 antes de Raabe/espiões)", () => {
    expect(ids.indexOf("versiculo-03-1")).toBe(ids.indexOf("item-josue") + 1)
    expect(ids.indexOf("momento-daniel-cova")).toBe(ids.indexOf("item-ciro") + 1)
    expect(ids.indexOf("momento-bezerro")).toBe(ids.indexOf("item-alianca-sinai") + 1)
  })

  it("nenhum slide repete a frase de outro slide", () => {
    const lines = scenes.filter((s) => s.overview?.role === "item" && s.overview.stageLine).map((s) => s.overview!.stageLine!)
    expect(lines.length - new Set(lines).size).toBe(0)
  })

  it("todo jogo das etapas 2–11 roda no slide de um tópico, só com o Jogar agora, e vale até 1000 pontos", () => {
    for (const g of ROOM_GAMES) {
      const scene = scenes.find((s) => s.game?.id === g.id)
      expect(scene?.overview?.role, g.id).toBe("item")
      expect(scene?.game).toMatchObject({ startable: true, max: 1000 })
    }
  })

  it("as linhas novas (rascunhos) são curtas, têm referência e fonte", async () => {
    const { allLinhas } = await import("../overview/aprofundar")
    const { MOMENTOS } = await import("./momentos")
    const all = [...allLinhas().map((x) => x.linha), ...Object.values(MOMENTOS).flatMap((m) => [...(m.principal ? [m.principal] : []), ...m.passos])]
    for (const l of all) {
      expect(l.text.length, l.text).toBeLessThanOrEqual(130)
      expect(l.refs.length, l.text).toBeGreaterThan(0)
      expect(l.fonte, l.text).toBeTruthy()
    }
  })
})
