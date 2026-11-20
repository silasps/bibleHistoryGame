import { describe, expect, it } from "vitest"
import { CARTAS, CATEGORIA_IDS } from "@/content/bible-show/cartas"
import { formatRef } from "@/content/refs"
import { configPadrao, estadoInicial, montarTrilha, proximaCasa, reduceShow, segundosDaVez, tentando, type ShowAction, type ShowState } from "./bible-show"

const run = (s: ShowState, ...as: ShowAction[]) => as.reduce(reduceShow, s)
const equipes = () => run(estadoInicial, { type: "comecar", config: { ...configPadrao, nomes: ["Azul", "Ouro", ""] } })
const individual = () => run(estadoInicial, { type: "comecar", config: { ...configPadrao, modo: "individual", nomes: ["Ana", "Bia", "Caio"] } })

describe("cartas", () => {
  it("toda categoria tem cartas, ids únicos e referência válida", () => {
    for (const cat of CATEGORIA_IDS) expect(CARTAS.filter((c) => c.categoria === cat).length, cat).toBeGreaterThanOrEqual(12)
    expect(new Set(CARTAS.map((c) => c.id)).size).toBe(CARTAS.length)
    for (const c of CARTAS) expect(formatRef(c.ref as Parameters<typeof formatRef>[0]), c.id).toBeTruthy()
  })
})

describe("trilha", () => {
  it("equipes: rodada de todos a cada 5 casas, nunca na chegada; individual: sem rodada de todos", () => {
    const t = montarTrilha({ casas: 15, categorias: [...CATEGORIA_IDS], modo: "equipes" })
    expect(t).toHaveLength(15)
    expect(t.map((c, i) => (c.tipo === "todos" ? i + 1 : 0)).filter(Boolean)).toEqual([5, 10])
    expect(montarTrilha({ casas: 15, categorias: ["bicho"], modo: "individual" }).every((c) => c.tipo === "categoria" && c.categoria === "bicho")).toBe(true)
  })
})

describe("partida em equipes", () => {
  it("limpa nomes, sorteia carta da casa seguinte e avança quem acerta", () => {
    let s = equipes()
    expect(s.lados.map((l) => l.nome)).toEqual(["Azul", "Ouro", "Equipe 3"])
    const casa = proximaCasa(s)!
    s = run(s, { type: "sortear", r1: 0.3, r2: 0.2 })
    expect(s.fase).toBe("carta")
    expect(CARTAS.find((c) => c.id === s.carta!.id)!.categoria).toBe(casa.tipo === "categoria" ? casa.categoria : "")
    expect(s.carta!.estilo).toBe("mimica")
    s = run(s, { type: "valendo", agora: 1000 }, { type: "acertaram", agora: 5000 })
    expect(s.fase).toBe("resultado")
    expect(s.lados[0]).toMatchObject({ casa: 1, acertos: 1 })
    s = run(s, { type: "proxima" })
    expect(s.vez).toBe(1)
  })

  it("trocar a carta só uma vez e para outra da mesma categoria", () => {
    let s = run(equipes(), { type: "sortear", r1: 0, r2: 0 })
    const antes = s.carta!.id
    s = run(s, { type: "trocar", r: 0 })
    expect(s.carta!.id).not.toBe(antes)
    const depois = s.carta!.id
    expect(run(s, { type: "trocar", r: 0.9 }).carta!.id).toBe(depois)
  })

  it("cronômetro pausa e continua do ponto em que parou; tempo esgotado não avança", () => {
    let s = run(equipes(), { type: "sortear", r1: 0, r2: 0 }, { type: "valendo", agora: 0 }, { type: "pausar", agora: 20_000 })
    expect(s.relogio).toEqual({ restante: 40_000 })
    s = run(s, { type: "continuar", agora: 100_000 })
    expect(s.relogio?.prazo).toBe(140_000)
    s = run(s, { type: "errou" })
    expect(s.fase).toBe("resultado")
    expect(s.lados.every((l) => l.casa === 0)).toBe(true)
  })

  it("rodada de todos: a equipe que acertou primeiro avança (pode ser outra que não a da vez)", () => {
    let s = equipes()
    s = { ...s, lados: s.lados.map((l, i) => (i === 0 ? { ...l, casa: 4 } : l)) }
    expect(proximaCasa(s)?.tipo).toBe("todos")
    s = run(s, { type: "sortear", r1: 0.5, r2: 0.9 }, { type: "valendo", agora: 0 }, { type: "acertaram", agora: 10_000 })
    expect(s.fase).toBe("quem")
    s = run(s, { type: "acertou", por: "l2" })
    expect(s.lados[1].casa).toBeGreaterThanOrEqual(1)
    expect(s.lados[0].casa).toBe(4)
  })

  it("chegar ao fim encerra com vencedor; desafio vale 2 casas", () => {
    let s = run(estadoInicial, { type: "comecar", config: { ...configPadrao, casas: 15, categorias: ["desafio"] } })
    s = { ...s, lados: s.lados.map((l, i) => (i === 0 ? { ...l, casa: 14 } : l)) }
    s = run(s, { type: "sortear", r1: 0, r2: 0 }, { type: "valendo", agora: 0 }, { type: "acertaram", agora: 1 })
    expect(s.fase).toBe("fim")
    expect(s.vencedor).toBe("l1")
    expect(s.lados[0].casa).toBe(15)
    expect(run(s, { type: "revanche" }).lados.every((l) => l.casa === 0)).toBe(true)
  })
})

describe("cada um por si", () => {
  it("quem fez a mímica e quem acertou avançam juntos; ninguém acerta a própria carta", () => {
    let s = run(individual(), { type: "sortear", r1: 0, r2: 0 }, { type: "valendo", agora: 0 }, { type: "acertaram", agora: 3000 })
    expect(s.fase).toBe("quem")
    expect(run(s, { type: "acertou", por: "l1" }).fase).toBe("quem")
    s = run(s, { type: "acertou", por: "l3" })
    expect(s.lados.map((l) => l.casa)).toEqual([1, 0, 1])
  })

  it("voltar do 'quem acertou?' retoma o tempo que faltava", () => {
    const s = run(individual(), { type: "sortear", r1: 0, r2: 0 }, { type: "valendo", agora: 0 }, { type: "acertaram", agora: 15_000 }, { type: "voltar", agora: 50_000 })
    expect(s.fase).toBe("tempo")
    expect(s.relogio?.prazo).toBe(95_000)
  })
})

describe("perguntas", () => {
  const perguntas = (modo: "equipes" | "individual", nomes: string[]) => run(estadoInicial, { type: "comecar", config: { ...configPadrao, modo, nomes, estilos: ["perguntas"] } })

  it("errou: a equipe seguinte tenta com metade do tempo; quem acerta anda", () => {
    let s = run(perguntas("equipes", ["A", "B", "C"]), { type: "sortear", r1: 0, r2: 0 })
    expect(s.carta!.estilo).toBe("perguntas")
    s = run(s, { type: "valendo", agora: 0 })
    expect(s.relogio?.prazo).toBe(60_000)
    s = run(s, { type: "errou" })
    expect(s.fase).toBe("passa")
    expect(tentando(s).id).toBe("l2")
    expect(segundosDaVez(s)).toBe(30)
    s = run(s, { type: "valendo", agora: 100_000 }, { type: "errou" })
    expect(tentando(s).id).toBe("l3")
    expect(segundosDaVez(s)).toBe(15)
    s = run(s, { type: "valendo", agora: 0 }, { type: "acertaram", agora: 5000 })
    expect(s.lados.map((l) => l.casa)).toEqual([0, 0, 1])
    expect(run(s, { type: "proxima" }).vez).toBe(1)
  })

  it("todas as equipes erraram: ninguém anda; individual não passa a vez", () => {
    let s = run(perguntas("equipes", ["A", "B"]), { type: "sortear", r1: 0, r2: 0 }, { type: "valendo", agora: 0 }, { type: "errou" }, { type: "valendo", agora: 0 }, { type: "errou" })
    expect(s.fase).toBe("resultado")
    expect(s.lados.every((l) => l.casa === 0)).toBe(true)
    s = run(perguntas("individual", ["Ana", "Bia"]), { type: "sortear", r1: 0, r2: 0 }, { type: "valendo", agora: 0 }, { type: "acertaram", agora: 1 })
    expect(s.lados.map((l) => l.casa)).toEqual([1, 0])
  })

  it("só perguntas: sem rodada de todos; com mímica, a rodada de todos nunca é de perguntas", () => {
    expect(montarTrilha({ casas: 15, categorias: ["bicho"], modo: "equipes", estilos: ["perguntas"] }).some((c) => c.tipo === "todos")).toBe(false)
    let s = run(estadoInicial, { type: "comecar", config: { ...configPadrao, estilos: ["mimica", "perguntas"] } })
    s = { ...s, lados: s.lados.map((l, i) => (i === 0 ? { ...l, casa: 4 } : l)) }
    expect(run(s, { type: "sortear", r1: 0, r2: 0.99 }).carta).toMatchObject({ todos: true, estilo: "mimica" })
  })
})
