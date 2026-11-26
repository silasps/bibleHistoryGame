import { describe, expect, it } from "vitest"
import { BARREIRAS, DECLARACOES, FATOS, ORACOES, ORCAMENTO_MIN, LIMITE_MIN, ROTEIRO, VISITAS } from "@/content/janela-verde"
import {
  ACOES_DE_PALCO,
  barreiraCaiu,
  cardsDaOracao,
  contarCompromissos,
  estadoInicial,
  itensDe,
  luzes,
  orcamento,
  publico,
  rachadura,
  reduceJanela,
  ritmo,
  tempoPorEtapa,
  type JanelaAction,
  type JanelaState,
} from "./janela-verde"

const MIN = 60_000
const run = (s: JanelaState, ...as: JanelaAction[]) => as.reduce(reduceJanela, s)
const av = (s: JanelaState, agora = 0): JanelaAction => ({ type: "avancar", de: { etapa: s.etapa, passo: s.passo }, agora })
const idx = (id: string) => ROTEIRO.findIndex((e) => e.id === id)

function ate(id: string, s = estadoInicial("h")): JanelaState {
  return reduceJanela(s, { type: "ir", etapa: idx(id), agora: 0 })
}

describe("conteúdo da Janela Verde", () => {
  it("todo fato e toda declaração têm fonte com nome e URL", () => {
    for (const f of [...FATOS, ...DECLARACOES]) {
      expect(f.fonte.nome.length).toBeGreaterThan(1)
      expect(f.fonte.url).toMatch(/^https:\/\//)
    }
  })

  it("toda etapa tem marca, e o orçamento cabe em 45 min (limite de 50)", () => {
    for (const e of ROTEIRO) expect(["explicacao", "dinamica", "oracao"]).toContain(e.marca)
    const total = ROTEIRO.reduce((n, e) => n + e.minutos, 0)
    expect(total).toBeLessThanOrEqual(ORCAMENTO_MIN)
    expect(ORCAMENTO_MIN).toBeLessThan(LIMITE_MIN)
  })

  it("cada barreira termina numa oração antes da próxima começar", () => {
    for (const b of BARREIRAS) {
      const doBloco = ROTEIRO.filter((e) => e.bloco === b.n)
      expect(doBloco.some((e) => e.marca === "oracao")).toBe(true)
      const ultimaOracao = doBloco.findLastIndex((e) => e.tela.tipo === "oracao")
      const primeiraDoProximo = ROTEIRO.findIndex((e) => e.bloco === b.n + 1)
      if (primeiraDoProximo >= 0) expect(ROTEIRO.indexOf(doBloco[ultimaOracao])).toBeLessThan(primeiraDoProximo)
    }
  })

  it("versículo só aparece inteiro quando foi conferido por completo", () => {
    for (const v of Object.values(VISITAS)) {
      for (const m of v.mensagens) if (m.kind === "texto_biblico" && !m.completo) expect(m.texto.endsWith(",")).toBe(true)
    }
  })
})

describe("palco", () => {
  it("avança item por item e depois de etapa, guardando o histórico", () => {
    let s = run(estadoInicial("h"), { type: "comecar", agora: 0 })
    s = run(s, av(s, 1000)) // grupos (1 item) → abertura
    expect(ROTEIRO[s.etapa].id).toBe("abertura")
    s = run(s, av(s, 2000))
    expect(s.passo).toBe(1)
    s = run(s, av(s, 3000))
    expect(ROTEIRO[s.etapa].id).toBe("isolamento")
    expect(s.historico.map((h) => h.etapa)).toEqual(["grupos", "abertura", "isolamento"])
  })

  it("dois condutores tocando avançar ao mesmo tempo avançam uma vez só", () => {
    const s = ate("abertura")
    const toque = av(s)
    const depois = run(s, toque, toque)
    expect(depois.passo).toBe(1)
    expect(depois.etapa).toBe(s.etapa)
  })

  it("voltar no primeiro item vai para o último item da etapa anterior", () => {
    let s = ate("isolamento")
    s = run(s, { type: "voltar", de: { etapa: s.etapa, passo: 0 }, agora: 0 })
    expect(ROTEIRO[s.etapa].id).toBe("abertura")
    expect(s.passo).toBe(1)
  })

  it("etapas puladas ficam de fora do avanço e do orçamento", () => {
    let s = ate("comparacao")
    s = run(s, { type: "pular", etapa: "reflexao", on: true })
    for (let i = 0; i < 10 && ROTEIRO[s.etapa].id === "comparacao"; i++) s = run(s, av(s))
    expect(ROTEIRO[s.etapa].id).toBe("baka")
    expect(orcamento(s)).toBe(ORCAMENTO_MIN - 3)
  })

  it("não deixa pular a etapa em que a sala está", () => {
    const s = ate("reflexao")
    expect(run(s, { type: "pular", etapa: "reflexao", on: true })).toBe(s)
  })

  it("a oração mostra os pedidos juntos e o próximo toque abre a barreira; o corte deixa 2", () => {
    let s = ate("oracao-isolamento")
    const etapa = ROTEIRO[s.etapa]
    expect(itensDe(s, etapa)).toBe(2)
    expect(cardsDaOracao(s, etapa)).toHaveLength(ORACOES.isolamento.cards.length)
    expect(barreiraCaiu(s)).toBe(false)
    s = run(s, av(s))
    expect(barreiraCaiu(s)).toBe(true)
    s = run(s, { type: "corte", id: "oracao-isolamento-2cards", on: true })
    expect(cardsDaOracao(s, etapa)).toHaveLength(2)
  })

  it("a reflexão usa as perguntas escolhidas", () => {
    let s = ate("reflexao")
    s = run(s, { type: "perguntas", ids: ["p9", "p1", "p1", "xx"] })
    expect(s.perguntas).toEqual(["p1", "p9"])
    expect(itensDe(s, ROTEIRO[s.etapa])).toBe(2)
    s = run(s, { type: "corte", id: "reflexao-1", on: true })
    expect(itensDe(s, ROTEIRO[s.etapa])).toBe(1)
  })

  it("o relógio pausa, continua, e o fim avisado por vários aparelhos vale uma vez", () => {
    let s = run(ate("encontro"), { type: "relogio", minutos: 5, agora: 0 })
    s = run(s, { type: "pausar", agora: MIN })
    expect(s.relogio).toEqual({ total: 5 * MIN, restante: 4 * MIN })
    s = run(s, { type: "continuar", agora: 2 * MIN })
    const prazo = s.relogio!.prazo!
    expect(prazo).toBe(6 * MIN)
    const fim = run(s, { type: "tempo", prazo })
    expect(fim.relogio?.restante).toBe(0)
    expect(run(fim, { type: "tempo", prazo })).toBe(fim)
  })

  it("a lista das ações de palco não inclui as do público", () => {
    for (const t of ["orou", "palavra", "comprometer", "entrar", "responder", "compartilhou", "tempo"] as const) expect(ACOES_DE_PALCO.has(t)).toBe(false)
    expect(ACOES_DE_PALCO.has("avancar")).toBe(true)
    expect(ACOES_DE_PALCO.has("mostrarPalavra")).toBe(true)
  })

  it("reiniciar volta ao começo e apaga o andamento, mas guarda as palavras, a chave e o volume", () => {
    let s = run(ate("oracao-lingua"), { type: "comecar", agora: 0 }, { type: "som", volume: 0.3 }, { type: "palavra", id: "p", grupo: "auren", texto: "x", agora: 0 })
    const palavras = s.palavras
    s = run(s, { type: "reiniciar", agora: 9 })
    expect(s).toEqual({ ...estadoInicial("h"), som: { volume: 0.3, mudo: false }, palavras })
  })

  it("apagar uma palavra também a tira do telão", () => {
    let s = run(ate("oracao-lingua"), { type: "palavra", id: "p", grupo: "auren", texto: "x", agora: 0 }, { type: "mostrarPalavra", id: "p" })
    s = run(s, { type: "apagarPalavra", id: "p" })
    expect(s.palavras).toHaveLength(0)
    expect(s.noTelao).toBeNull()
  })

  it("o estado público não leva o hash da chave", () => {
    expect(publico(estadoInicial("segredo")).chaveHash).toBe("")
  })
})

describe("grupos", () => {
  it("Oramos repetido pelo mesmo grupo conta uma vez e racha a barreira", () => {
    let s = ate("oracao-isolamento")
    const card = ORACOES.isolamento.cards[0].id
    s = run(s, { type: "orou", grupo: "auren", etapa: "oracao-isolamento", card }, { type: "orou", grupo: "auren", etapa: "oracao-isolamento", card })
    expect(s.oracoes["oracao-isolamento"][card]).toEqual(["auren"])
    s = run(s, { type: "orou", grupo: "nair", etapa: "oracao-isolamento", card })
    expect(rachadura(s)).toBeCloseTo(2 / 8)
    expect(luzes(s).amazonia).toBe(2)
  })

  it("palavra recebida leva o momento, e só aparece no telão quando mostrada", () => {
    let s = ate("oracao-lingua")
    s = run(s, { type: "palavra", id: "w1", grupo: "nair", texto: "  Uma   palavra para os Baka  ", agora: 5 })
    expect(s.palavras[0]).toMatchObject({ etapa: "oracao-lingua", texto: "Uma palavra para os Baka", grupo: "nair" })
    expect(s.noTelao).toBeNull()
    s = run(s, { type: "mostrarPalavra", id: "w1" })
    expect(s.noTelao).toBe("w1")
    expect(run(s, { type: "palavra", id: "w1", grupo: "nair", texto: "de novo", agora: 6 }).palavras).toHaveLength(1)
  })

  it("palavra vazia é ignorada e a longa é cortada em 500 caracteres", () => {
    const s = ate("oracao-lingua")
    expect(run(s, { type: "palavra", id: "a", grupo: "auren", texto: "   ", agora: 0 })).toBe(s)
    const longa = run(s, { type: "palavra", id: "b", grupo: "auren", texto: "x".repeat(900), agora: 0 })
    expect(longa.palavras[0].texto).toHaveLength(500)
  })

  it("quem responde a visita é o grupo que ouviu", () => {
    const s = ate("visita-yanomami")
    expect(run(s, { type: "responder", visita: "yanomami", grupo: "auren", valor: "sim" })).toBe(s)
    expect(run(s, { type: "responder", visita: "yanomami", grupo: "nair", valor: "parte" }).respostas.yanomami).toBe("parte")
  })

  it("compromisso por aparelho: repetir não conta duas vezes", () => {
    let s = estadoInicial("h")
    s = run(s, { type: "comprometer", aparelho: "a1", ops: ["ir", "orar-povos"] }, { type: "comprometer", aparelho: "a1", ops: ["ir", "orar-povos"] })
    s = run(s, { type: "comprometer", aparelho: "a2", ops: ["ir", "invalido"] })
    expect(contarCompromissos(s)).toMatchObject({ ir: 2, "orar-povos": 1, discipular: 0 })
  })
})

describe("ritmo", () => {
  it("antes de começar, a previsão é o orçamento", () => {
    const r = ritmo(estadoInicial("h"), 0)
    expect(r.comecou).toBe(false)
    expect(r.previsaoMs).toBe(ORCAMENTO_MIN * MIN)
  })

  it("mostra atraso, previsão de fim e sugere cortes só com mais de 1 min de atraso", () => {
    let s = run(estadoInicial("h"), { type: "comecar", agora: 0 })
    // Chega na oração do isolamento com 9 min (previsto: 5 min antes dela).
    s = run(s, { type: "ir", etapa: idx("oracao-isolamento"), agora: 9 * MIN })
    const r = ritmo(s, 9 * MIN)
    expect(r.atrasoMs).toBe(4 * MIN)
    expect(r.previsaoMs).toBe((ORCAMENTO_MIN + 4) * MIN)
    expect(r.sugestoes[0].economiza).toBe(2)
    const emDia = ritmo(run(estadoInicial("h"), { type: "comecar", agora: 0 }), 30_000)
    expect(emDia.sugestoes).toHaveLength(0)
  })

  it("adiantado vira atraso negativo, e a etapa que estoura soma ao atraso", () => {
    let s = run(estadoInicial("h"), { type: "comecar", agora: 0 })
    s = run(s, { type: "ir", etapa: idx("isolamento"), agora: MIN })
    expect(ritmo(s, MIN).atrasoMs).toBe(-MIN)
    expect(ritmo(s, 5 * MIN).atrasoMs).toBe(-MIN + 2.5 * MIN)
  })

  it("o relatório soma o tempo real de cada etapa", () => {
    let s = run(estadoInicial("h"), { type: "comecar", agora: 0 })
    s = run(s, av(s, 2 * MIN))
    s = run(s, { type: "encerrar", agora: 5 * MIN })
    expect(tempoPorEtapa(s, 9 * MIN)).toEqual({ grupos: 2 * MIN, abertura: 3 * MIN })
  })
})
