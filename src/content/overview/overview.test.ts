import { describe, expect, it } from "vitest"
import { allWeekConnections } from "../released/overview"
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

  it("tem as 11 semanas, com material nas semanas 1 a 6", () => {
    expect(weeks.map((w) => w.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(weeks.filter((w) => w.status === "com_material").map((w) => w.week)).toEqual([1, 2, 3, 4, 5, 6])
    expect(items.some((i) => i.week >= 7)).toBe(false)
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
    for (const i of items) expect(i.refs.length, i.id).toBeGreaterThan(0)
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
