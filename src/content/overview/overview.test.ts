import { describe, expect, it } from "vitest"
import { allWeekConnections } from "../released/overview"
import { sequenceScenes } from "@/content"
import { topicosDaCena, validateTopicos } from "./topicos"
import {
  excerpts,
  formatSpan,
  getItem,
  items,
  itemsOfWeek,
  stageLineForItem,
  validateOverview,
  weekIntroExcerpts,
  weeks,
} from "."

describe("visão geral (material do autor)", () => {
  it("passa na validação de integridade", () => {
    expect(validateOverview()).toEqual([])
  })

  it("tem as 11 semanas, com material nas semanas 1 a 7", () => {
    expect(weeks.map((w) => w.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(weeks.filter((w) => w.status === "com_material").map((w) => w.week)).toEqual([1, 2, 3, 4, 5, 6, 7])
    // Semanas 8–11: itens da linha do tempo da escola, ainda sem o resumo do autor.
    expect(items.filter((i) => i.week >= 8).length).toBeGreaterThanOrEqual(29)
  })

  it("segue a ordem da história no mesmo ano: Criação, Adão e Eva, Queda", () => {
    expect(itemsOfWeek(1).slice(0, 3).map((i) => i.id)).toEqual(["criacao", "adao-eva", "queda"])
  })

  it("usa as datas do Manual", () => {
    expect(formatSpan(getItem("abraao")!)).toBe("2166–1991 a.C.")
    expect(formatSpan(getItem("criacao")!)).toBe("± 4000 a.C.")
    expect(formatSpan(getItem("exodo")!)).toBe("1446 a.C.")
  })

  it("ordena cronologicamente", () => {
    const w1 = itemsOfWeek(1).map((i) => i.id)
    expect(w1.indexOf("criacao")).toBeLessThan(w1.indexOf("diluvio"))
    expect(w1.indexOf("migracao-egito")).toBeLessThan(w1.indexOf("exodo"))
  })

  it("linhas de palco respeitam o orçamento e nunca usam “PRD”", () => {
    for (const e of excerpts) {
      if (e.stageLine) expect(e.stageLine.length).toBeLessThanOrEqual(140)
      expect(`${e.text} ${e.stageLine ?? ""}`).not.toMatch(/\bPRD\b/)
    }
  })

  it("cada semana com material tem abertura e itens com linha do autor", () => {
    for (const w of [1, 2, 3, 4, 5]) {
      expect(weekIntroExcerpts(w).length).toBeGreaterThan(0)
      const withLine = itemsOfWeek(w).filter((i) => stageLineForItem(i.id))
      expect(withLine.length).toBeGreaterThan(itemsOfWeek(w).length / 2)
    }
  })

  it("trecho com fato em revisão nunca vira linha de palco", () => {
    for (const i of items) expect(stageLineForItem(i.id)?.pendingFact, i.id).toBeUndefined()
  })

  it("ids dos itens não colidem com as rotas da jornada", () => {
    for (const i of items) expect(i.id).not.toBe("pista")
  })

  it("todo item da jornada tem passagem para o dossiê", () => {
    // Itens só históricos (Nero, Roma queimada…) dizem a fonte em vez da passagem.
    for (const i of items) expect(i.refs.length > 0 || !!i.historico, i.id).toBe(true)
  })

  it("toda semana com material tem o texto NAA do versículo para memorizar", () => {
    for (const w of weeks.filter((w) => w.status === "com_material")) expect(w.memoryVerseText?.length, `semana ${w.week}`).toBe(w.memoryVerse.length)
  })

  it("PRD do autor fica só no módulo server-only", () => {
    const connections = allWeekConnections()
    expect(connections.map((c) => c.week)).toEqual([1, 2, 3, 4, 5, 6])
    for (const c of connections) for (const b of c.blocks) for (const e of excerpts) expect(e.text).not.toContain(b)
  })
})

describe("tópicos para falar (só no painel)", () => {
  const scenes = sequenceScenes("visao-geral")
  const openingIds = new Set(scenes.filter((s) => s.overview?.role === "abertura").map((s) => s.id))

  it("cada tópico aponta um trecho do resumo, cabe no quadro e não fala do PRD", () => {
    expect(validateTopicos(new Set(items.map((i) => i.id)), openingIds)).toEqual([])
  })

  it("semana 8: o resumo entra no painel, mas o telão continua só com nome, data e referência", () => {
    const week8 = excerpts.filter((e) => e.week === 8)
    expect(week8.length).toBeGreaterThan(10)
    for (const e of week8) expect(e.stageLine, e.id).toBeUndefined()
    const jesus = scenes.find((s) => s.id === "item-jesus")!
    const t = topicosDaCena(jesus)
    expect(t.proprios).toBe(true)
    expect(t.linhas.some((l) => l.includes("Mc 10:45"))).toBe(true)
    expect(topicosDaCena(scenes.find((s) => s.id === "etapa-14")!).linhas[0]).toContain("Ele chegou")
  })

  it("slides sem tópicos próprios usam as frases do resumo; versículo e pista não têm tópicos", () => {
    const criacao = scenes.find((s) => s.id === "item-criacao")!
    const t = topicosDaCena(criacao)
    expect(t.proprios).toBe(false)
    expect(t.linhas).toContain(stageLineForItem("criacao")!.stageLine)
    for (const s of scenes.filter((s) => s.overview?.role === "versiculo" || s.overview?.role === "pista")) {
      expect(topicosDaCena(s).linhas).toEqual([])
    }
  })
})
