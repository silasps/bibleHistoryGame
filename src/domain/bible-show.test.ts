import { describe, expect, it } from "vitest"
import { CARTAS, CATEGORIA_IDS } from "@/content/bible-show/cartas"
import { SITUACOES } from "@/content/bible-show/situacoes"
import { formatRef, linkNaa } from "@/content/refs"
import {
  casaDe,
  configPadrao,
  controla,
  emJogo,
  estadoInicial,
  montarTrilha,
  nivelDe,
  normalizar,
  painel,
  reduceShow,
  segundosDaVez,
  tentando,
  trilhaDe,
  textoTempo,
  veCarta,
  type Config,
  type ShowAction,
  type ShowState,
} from "./bible-show"

const run = (s: ShowState, ...as: ShowAction[]) => as.reduce(reduceShow, s)
const jogo = (config: Partial<Config> = {}, r = 0.5) => run(estadoInicial, { type: "comecar", config: { ...configPadrao, ...config }, r })
/** Roleta (r: 0 mímica, 0.4 perguntas, 0.9 letras), sorteio de casas (0 = 1 casa) e carta. */
const preparar = (s: ShowState, passos = 0, estilo = 0): ShowState => run(s, { type: "girar", r: estilo }, { type: "rolar", r: passos }, { type: "sortear", r1: 0, r2: 0 })
const naCasa = (s: ShowState, i: number, casa: number): ShowState => ({ ...s, lados: s.lados.map((l, j) => (j === i ? { ...l, casa } : l)) })
const posicao = (s: ShowState, id: string) => trilhaDe(s).findIndex((c) => c.tipo === "situacao" && c.situacao === id) + 1

describe("conteúdo", () => {
  it("cartas e casas especiais têm referência válida e link NAA", () => {
    for (const cat of CATEGORIA_IDS) expect(CARTAS.filter((c) => c.categoria === cat).length, cat).toBeGreaterThanOrEqual(12)
    expect(new Set(CARTAS.map((c) => c.id)).size).toBe(CARTAS.length)
    expect(new Set(SITUACOES.map((c) => c.id)).size).toBe(SITUACOES.length)
    for (const c of [...CARTAS, ...SITUACOES]) expect(formatRef(c.ref as Parameters<typeof formatRef>[0]), c.id).toBeTruthy()
    expect(linkNaa({ book: "Exod", chapter: 2, verseStart: 10 })).toBe("https://www.bible.com/bible/1840/EXO.2.10.NAA")
    expect(linkNaa({ book: "Josh", chapter: 7, verseStart: 1, verseEnd: 5 })).toBe("https://www.bible.com/bible/1840/JOS.7.1-5.NAA")
  })
})

describe("trilha", () => {
  it("casa especial a cada 3 (nunca na chegada); rodada para todos só em equipes", () => {
    const t = montarTrilha({ casas: 35, categorias: [...CATEGORIA_IDS], modo: "equipes" }, 7)
    expect(t.map((c, i) => (c.tipo === "situacao" ? i + 1 : 0)).filter(Boolean)).toEqual([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33])
    const todos = SITUACOES.filter((s) => s.efeito.tipo === "arraial").map((s) => s.id)
    expect(t.filter((c, i) => c.tipo === "situacao" && todos.includes(c.situacao) && (i + 1) % 9 === 3)).toHaveLength(4)
    expect(montarTrilha({ casas: 35, categorias: ["bicho"], modo: "individual" }, 7).some((c) => c.tipo === "situacao" && todos.includes(c.situacao))).toBe(false)
  })

  it("cada partida sorteia outra trilha, sem repetir evento numa trilha longa", () => {
    const a = jogo({ casas: 35 }, 0.1)
    const b = jogo({ casas: 35 }, 0.8)
    const ids = (s: ShowState) => trilhaDe(s).flatMap((c) => (c.tipo === "situacao" ? [c.situacao] : []))
    expect(ids(a)).not.toEqual(ids(b))
    const efeitos = ids(a).filter((_, i) => i % 3 !== 0)
    expect(new Set(efeitos).size).toBe(efeitos.length)
    expect(run(a, { type: "revanche", r: 0.3 }).semente).not.toBe(a.semente)
  })
})

describe("rodada", () => {
  it("roleta, depois sorteio de casas, depois a carta; acertar anda o que saiu", () => {
    let s = jogo({ nomes: ["Azul", "Ouro"] })
    expect(run(s, { type: "rolar", r: 0.5 }).rodada?.passos).toBeNull() // sem roleta, sem sorteio
    s = run(s, { type: "girar", r: 0.4 })
    expect(s.rodada?.estilo).toBe("perguntas")
    expect(run(s, { type: "girar", r: 0 }).rodada?.estilo).toBe("perguntas") // não gira de novo
    s = run(s, { type: "rolar", r: 0.2 }, { type: "sortear", r1: 0, r2: 0 })
    expect(s.rodada?.passos).toBe(2)
    expect(s.fase).toBe("carta")
    s = run(s, { type: "valendo", agora: 0 }, { type: "acertaram", agora: 1 })
    const casas = CARTAS.find((c) => c.id === s.ultima!.cartaId)!.categoria === "desafio" ? 3 : 2
    expect(s.lados[0].casa).toBe(casas)
  })

  it("só um jeito ligado: não precisa de roleta", () => {
    const s = jogo({ estilos: ["mimica"] })
    expect(s.rodada?.estilo).toBe("mimica")
    expect(run(s, { type: "rolar", r: 0 }).rodada?.passos).toBe(1)
  })

  it("a categoria vem da casa em que a equipe está", () => {
    let s = naCasa(jogo(), 0, 1)
    const casa = casaDe(s, s.lados[0])!
    s = preparar(s)
    expect(casa.tipo === "categoria" && CARTAS.find((c) => c.id === s.carta!.id)!.categoria).toBe(casa.tipo === "categoria" ? casa.categoria : "")
  })

  it("tempo esgotado não anda e passa a vez", () => {
    let s = run(preparar(jogo()), { type: "valendo", agora: 0 }, { type: "pausar", agora: 20_000 })
    expect(s.relogio).toEqual({ restante: 40_000 })
    s = run(s, { type: "errou" }, { type: "proxima" })
    expect(s.lados.every((l) => l.casa === 0)).toBe(true)
    expect(s.vez).toBe(1)
    expect(s.rodada).toMatchObject({ lider: "l2", estilo: null, passos: null })
  })
})

describe("casas especiais", () => {
  /** Uma semente em que a casa aparece na trilha de 35. */
  const comCasa = (id: string, modo: Config["modo"] = "equipes") => {
    for (let r = 0.01; r < 1; r += 0.01) if (posicao(jogo({ categorias: ["quem"], casas: 35, modo }, r), id) > 0) return r
    throw new Error(id)
  }
  const cairCom = (id: string, config: Partial<Config> = {}) => {
    const r = comCasa(id, config.modo)
    const base = jogo({ categorias: ["quem"], casas: 35, ...config }, r)
    const p = posicao(base, id)
    const s = run(naCasa(base, 0, p - 1), { type: "girar", r: 0 }, { type: "rolar", r: 0 }, { type: "sortear", r1: 0, r2: 0 }, { type: "valendo", agora: 0 }, { type: "acertaram", agora: 1 })
    return { s: run(s, { type: "proxima" }), p }
  }

  it("voltar: a equipe volta e a vez passa", () => {
    const { s, p } = cairCom("ai")
    expect(s.fase).toBe("situacao")
    expect(s.pendentes[0]).toEqual({ situacao: "ai", lado: "l1" })
    const depois = run(s, { type: "cumprir" })
    expect(depois.lados[0].casa).toBe(p - 1)
    expect(depois.vez).toBe(1)
  })

  it("rodada para todos: começa já; quem acertar anda", () => {
    const base = jogo({ categorias: ["quem"] })
    const id = trilhaDe(base)[2]
    expect(id.tipo).toBe("situacao")
    let s = run(naCasa(base, 0, 2), { type: "girar", r: 0 }, { type: "rolar", r: 0 }, { type: "sortear", r1: 0, r2: 0 }, { type: "valendo", agora: 0 }, { type: "acertaram", agora: 1 }, { type: "proxima" }, { type: "cumprir" })
    expect(s.fase).toBe("vez")
    expect(s.vez).toBe(0)
    expect(s.rodada).toMatchObject({ lider: "l1", todos: true })
    s = run(preparar(s), { type: "valendo", agora: 0 }, { type: "acertaram", agora: 1 })
    expect(s.fase).toBe("quem")
    s = run(s, { type: "acertou", por: "l2" })
    expect(s.lados.map((l) => l.casa)).toEqual([3, 1])
    expect(run(s, { type: "proxima" }).vez).toBe(1)
  })

  it("escolher, junto e dar precisam de outra equipe", () => {
    for (const [id, esperado] of [
      ["babel", [null, -1]],
      ["rute", [1, 1]],
      ["davi-saul", [0, 1]],
    ] as const) {
      const { s, p } = cairCom(id)
      const outra = { ...s, lados: s.lados.map((l, i) => (i === 1 ? { ...l, casa: 4 } : l)) }
      expect(run(outra, { type: "cumprir" }), id).toBe(outra)
      expect(run(outra, { type: "cumprir", alvo: "l1" }), id).toBe(outra)
      const depois = run(outra, { type: "cumprir", alvo: "l2" })
      expect(depois.lados[1].casa, id).toBe(4 + esperado[1])
      if (esperado[0] !== null) expect(depois.lados[0].casa, id).toBe(p + esperado[0])
    }
  })

  it("ficar de fora pula a próxima vez; jogar de novo repete a vez", () => {
    let { s } = cairCom("exilio", { nomes: ["A", "B", "C"] })
    s = run(s, { type: "cumprir" })
    expect(s.vez).toBe(1)
    s = run(preparar(s), { type: "valendo", agora: 0 }, { type: "errou" }, { type: "proxima" })
    expect(s.vez).toBe(2)
    s = run(preparar(s), { type: "valendo", agora: 0 }, { type: "errou" }, { type: "proxima" })
    expect(s.vez).toBe(1) // A ficou de fora
    expect(s.lados[0].exilio).toBe(false)
    expect(run(cairCom("sol").s, { type: "cumprir" }).vez).toBe(0)
  })

  it("chegar ao fim encerra com vencedor", () => {
    let s = naCasa(jogo({ casas: 15 }), 0, 14)
    s = run(preparar(s, 0.99), { type: "valendo", agora: 0 }, { type: "acertaram", agora: 1 })
    expect(s.fase).toBe("fim")
    expect(s.vencedor).toBe("l1")
    expect(run(s, { type: "revanche" }).lados.every((l) => l.casa === 0)).toBe(true)
  })
})

describe("perguntas", () => {
  it("errou: a equipe seguinte tenta com metade do tempo; quem acerta anda", () => {
    let s = run(preparar(jogo({ estilos: ["perguntas"], nomes: ["A", "B", "C"] })), { type: "valendo", agora: 0 })
    expect(s.relogio?.prazo).toBe(180_000) // 3 minutos por padrão
    s = run(s, { type: "errou" })
    expect(s.fase).toBe("passa")
    expect(tentando(s).id).toBe("l2")
    expect(segundosDaVez(s)).toBe(90)
    s = run(s, { type: "valendo", agora: 0 }, { type: "errou" })
    expect(segundosDaVez(s)).toBe(45)
    s = run(s, { type: "valendo", agora: 0 }, { type: "acertaram", agora: 1 })
    expect(s.lados.map((l) => l.casa)).toEqual([0, 0, 1])
  })

  it("cada jogo tem o seu tempo, escolhido por nível ou um a um", () => {
    const p = run(preparar(jogo({ estilos: ["perguntas"], perguntas: 300 })), { type: "valendo", agora: 0 })
    expect(p.relogio?.prazo).toBe(300_000)
    expect(jogo({ perguntas: 7, letras: 7 }).config).toMatchObject({ perguntas: 180, letras: 60 })
    expect(nivelDe(configPadrao)?.id).toBe("normal")
    expect(nivelDe({ ...configPadrao, letras: 90 })).toBeNull()
    const l = run(preparar(jogo({ estilos: ["letras"], letras: 45 })), { type: "valendo", agora: 0 })
    expect(l.relogio?.prazo).toBe(45_000)
    const m = run(preparar(jogo({ estilos: ["mimica"], segundos: 45, perguntas: 300 })), { type: "valendo", agora: 0 })
    expect(m.relogio?.prazo).toBe(45_000)
    expect([textoTempo(45), textoTempo(180), textoTempo(90)]).toEqual(["45s", "3 min", "1:30"])
  })

  it("individual: só quem adivinhou anda", () => {
    const s = run(preparar(jogo({ estilos: ["perguntas"], modo: "individual", nomes: ["Ana", "Bia"] })), { type: "valendo", agora: 0 }, { type: "acertaram", agora: 1 })
    expect(s.lados.map((l) => l.casa)).toEqual([1, 0])
  })
})

describe("letras", () => {
  const letras = (nomes = ["A", "B", "C"]) => preparar(jogo({ estilos: ["letras"], nomes, categorias: ["quem"] }))
  const palavraDe = (s: ShowState) => CARTAS.find((c) => c.id === s.carta!.id)!.palavra
  const letrasDe = (palavra: string) => [...new Set(painel(palavra, []).filter((x) => x.letra).map((x) => normalizar(x.c)))]
  const fora = (palavra: string) => "BCDFGHJKLMNPQRSTVWXYZ".split("").filter((l) => !letrasDe(palavra).includes(l))

  it("60 s por equipe; letra certa dá 10 s, errada tira 5 s, e a vez não passa", () => {
    let s = letras()
    expect(s.fase).toBe("letras")
    expect(run(s, { type: "letra", l: "B", agora: 0 })).toBe(s) // precisa tocar em Valendo
    s = run(s, { type: "valendo", agora: 0 })
    expect(s.relogio?.prazo).toBe(60_000)
    expect(run(s, { type: "valendo", agora: 5000 })).toBe(s) // Valendo não recomeça o tempo
    const palavra = palavraDe(s)
    s = run(s, { type: "letra", l: letrasDe(palavra)[0], agora: 1000 })
    expect([tentando(s).id, s.relogio?.prazo]).toEqual(["l1", 70_000])
    s = run(s, { type: "letra", l: fora(palavra)[0], agora: 2000 })
    expect([tentando(s).id, s.relogio?.prazo]).toEqual(["l1", 65_000])
    expect(run(s, { type: "letra", l: fora(palavra)[0], agora: 3000 })).toBe(s) // letra repetida
  })

  it("acabou o tempo: a vez passa e a equipe seguinte começa com 60 s ao tocar em Valendo", () => {
    let s = run(letras(), { type: "valendo", agora: 0 })
    s = run(s, { type: "letra", l: letrasDe(palavraDe(s))[0], agora: 1000 })
    s = run(s, { type: "passar", agora: 70_000, prazo: 70_000 })
    expect([tentando(s).id, s.relogio, s.carta!.comecou]).toEqual(["l2", { restante: 60_000 }, false])
    expect(s.carta!.letras).toHaveLength(1) // as letras abertas ficam
    expect(run(s, { type: "continuar", agora: 71_000 })).toBe(s)
    s = run(s, { type: "valendo", agora: 80_000 })
    expect(s.relogio?.prazo).toBe(140_000)
  })

  it("letra errada que zera o tempo passa a vez", () => {
    let s = run(letras(), { type: "valendo", agora: 0 })
    s = run(s, { type: "letra", l: fora(palavraDe(s))[0], agora: 57_000 })
    expect([tentando(s).id, s.relogio]).toEqual(["l2", { restante: 60_000 }])
  })

  it("arriscar para o tempo e não tem volta; errou passa a vez; acertou anda", () => {
    let s = run(letras(), { type: "valendo", agora: 0 })
    expect(run(s, { type: "chutar", palavra: "x", agora: 1 })).toBe(s) // precisa tocar em Arriscar antes
    s = run(s, { type: "arriscar", agora: 4000 })
    expect(s.relogio).toEqual({ restante: 56_000 })
    expect(run(s, { type: "letra", l: "B", agora: 5000 })).toBe(s)
    expect(run(s, { type: "passar", agora: 5000 })).toBe(s)
    expect(run(s, { type: "continuar", agora: 5000 })).toBe(s)
    s = run(s, { type: "chutar", palavra: "errado", agora: 9000 })
    expect([tentando(s).id, s.carta!.arriscando, s.relogio]).toEqual(["l2", false, { restante: 60_000 }])
    s = run(s, { type: "valendo", agora: 10_000 }, { type: "arriscar", agora: 11_000 }, { type: "chutar", palavra: normalizar(palavraDe(s)).toLowerCase(), agora: 12_000 })
    expect(s.fase).toBe("resultado")
    expect(s.lados.map((l) => l.casa)).toEqual([0, 1, 0])
  })

  it("tempo esgotado avisado por dois celulares: só o primeiro aviso vale", () => {
    let s = run(letras(["A", "B", "C"]), { type: "valendo", agora: 0 })
    const prazo = s.relogio!.prazo!
    s = run(s, { type: "passar", agora: 60_000, prazo }, { type: "passar", agora: 60_050, prazo })
    expect(tentando(s).id).toBe("l2")
    let p = run(preparar(jogo({ estilos: ["perguntas"], nomes: ["A", "B"] })), { type: "valendo", agora: 0 })
    const fim = p.relogio!.prazo!
    p = run(p, { type: "errou", prazo: fim }, { type: "errou", prazo: fim })
    expect(p.fase).toBe("passa")
  })

  it("abrir a última letra vence; numa sala, só quem está na vez tem o teclado", () => {
    let s = run(letras(["A", "B"]), { type: "valendo", agora: 0 })
    expect([controla(s, "l1"), controla(s, "l2")]).toEqual([true, false])
    for (const l of letrasDe(palavraDe(s))) s = run(s, { type: "letra", l, agora: 1 })
    expect(s.fase).toBe("resultado")
    expect(s.lados[0].casa).toBe(1)
  })
})

describe("cada um por si", () => {
  it("quem representou e quem acertou andam juntos", () => {
    let s = run(preparar(jogo({ modo: "individual", nomes: ["Ana", "Bia", "Caio"] })), { type: "valendo", agora: 0 }, { type: "acertaram", agora: 3000 })
    expect(run(s, { type: "acertou", por: "l1" }).fase).toBe("quem")
    s = run(s, { type: "acertou", por: "l3" })
    expect(s.lados.map((l) => l.casa)).toEqual([1, 0, 1])
  })
})

describe("um celular por equipe", () => {
  it("só a equipe da vez conduz e vê a carta de mímica; em Perguntas todas as equipes veem", () => {
    const s = preparar(jogo({ nomes: ["A", "B"] }))
    expect([controla(s, "l1"), controla(s, "l2"), controla(s, null), controla(s, "l2", true)]).toEqual([true, false, true, true])
    expect([veCarta(s, "l1"), veCarta(s, "l2")]).toEqual([true, false])
    const p = preparar(jogo({ estilos: ["perguntas"], modo: "individual", nomes: ["Ana", "Bia"] }))
    expect([veCarta(p, "l1"), veCarta(p, "l2")]).toEqual([false, true])
  })
})

describe("sair e voltar", () => {
  const ids = (s: ShowState) => emJogo(s).map((l) => l.id)

  it("quem sai fica fora da vez; a partida segue; volta na mesma casa", () => {
    let s = naCasa(jogo({ estilos: ["mimica"], nomes: ["A", "B", "C"] }), 1, 4)
    s = run(s, { type: "sair", id: "l2" })
    expect(ids(s)).toEqual(["l1", "l3"])
    expect(s.fase).toBe("vez") // a vez de A continua
    s = run(preparar(s), { type: "valendo", agora: 0 }, { type: "errou" }, { type: "proxima" })
    expect(s.lados[s.vez].id).toBe("l3") // B foi pulada
    s = run(s, { type: "voltou", id: "l2" })
    expect([ids(s), s.lados[1].casa]).toEqual([["l1", "l2", "l3"], 4])
  })

  it("com 2 em jogo, ninguém sai; quem conduzia sai: a vez passa", () => {
    let s = jogo({ estilos: ["mimica"], nomes: ["A", "B", "C"] })
    s = run(preparar(s), { type: "sair", id: "l1" })
    expect([s.fase, s.lados[s.vez].id]).toEqual(["vez", "l2"])
    expect(run(s, { type: "sair", id: "l3" })).toBe(s)
  })

  it("perguntas: saiu quem ia tentar, tenta o seguinte; quem volta não muda quem está tentando", () => {
    let s = run(preparar(jogo({ estilos: ["perguntas"], nomes: ["A", "B", "C", "D"] })), { type: "valendo", agora: 0 }, { type: "errou" })
    expect([s.fase, tentando(s).id]).toEqual(["passa", "l2"])
    s = run(s, { type: "sair", id: "l2" })
    expect([s.fase, tentando(s).id]).toEqual(["passa", "l3"])
    s = run(s, { type: "voltou", id: "l2" })
    expect(tentando(s).id).toBe("l3")
    s = run(s, { type: "valendo", agora: 0 }, { type: "errou" })
    expect(tentando(s).id).toBe("l4")
  })

  it("letras: saiu quem estava tentando, o seguinte começa com o tempo cheio; as letras ficam", () => {
    let s = run(preparar(jogo({ estilos: ["letras"], nomes: ["A", "B", "C", "D"], categorias: ["quem"] })), { type: "valendo", agora: 0 }, { type: "letra", l: "A", agora: 1000 })
    s = run(s, { type: "passar", agora: 70_000 }, { type: "valendo", agora: 71_000 })
    expect(tentando(s).id).toBe("l2")
    s = run(s, { type: "sair", id: "l2" })
    expect([tentando(s).id, s.carta!.comecou, s.relogio, s.carta!.letras]).toEqual(["l3", false, { restante: 60_000 }, ["A"]])
    // Quem começou a vez sai: a rodada segue com quem está tentando.
    s = run(s, { type: "sair", id: "l1" })
    expect([s.fase, tentando(s).id, controla(s, "l3"), ids(s)]).toEqual(["letras", "l3", true, ["l3", "l4"]])
    expect(run(s, { type: "sair", id: "l4" })).toBe(s)
  })
})
