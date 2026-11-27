import { describe, expect, it } from "vitest"
import { sequenceScenes } from "@/content"
import { items, weeks } from "../overview"
import { getBook } from "../books"
import { PRESENTATION_MAX_MINUTES } from "../rubric"
import { isSchoolItem } from "./escola"
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
    expect(presentableEtapas.map((e) => e.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])
  })

  it("o fio do plano começa em Gn 3:15 e passa por todos os versículos das semanas com material", () => {
    expect(prdMoments[0]).toMatchObject({ week: 1, refIndex: 0, etapa: 1, knot: 1 })
    // Semanas com material do autor + as do Novo Testamento (linha do tempo da escola).
    const verses = weeks.filter((w) => w.status === "com_material" || w.week >= 8).reduce((n, w) => n + w.memoryVerse.length, 0)
    expect(prdMoments).toHaveLength(verses)
    expect(prdMoments.map((p) => p.knot)).toEqual(prdMoments.map((_, i) => i + 1))
  })

  it("na sequência, cada versículo vem logo depois do seu item, e a pista depois do último versículo da semana", () => {
    const ids = sequenceScenes("visao-geral").map((s) => s.id)
    // Depois da Queda: Deus veste o homem (Gn 3:21), fora do jardim, e então o versículo.
    expect(ids.slice(ids.indexOf("item-queda"), ids.indexOf("item-queda") + 4)).toEqual(["item-queda", "jogo-vestes", "jogo-fora", "versiculo-01"])
    expect(ids.indexOf("pista-01")).toBe(ids.indexOf("versiculo-01") + 1)
    // Js 1:7: Deus fala com Josué antes de entrar na terra (autor, 26/11/2026).
    expect(ids.indexOf("versiculo-03-1")).toBe(ids.indexOf("item-josue") + 1)
    expect(ids.indexOf("item-conquista-canaa")).toBeGreaterThan(ids.indexOf("versiculo-03-1"))
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

  it("Etapa 9: a divisão abre; Harã-Síria (slide curto, com mapa) vem antes de Acabe; Acabe antes de Elias e do altar", () => {
    const e9 = scenes.filter((s) => s.overview?.etapa === 9 && s.overview.role === "item").map((s) => s.overview!.itemId)
    expect(e9[0]).toBe("divisao-reino")
    expect(e9.indexOf("aram")).toBe(e9.indexOf("acabe") - 1)
    expect(scenes.find((s) => s.id === "item-aram")?.overview?.mapa?.id).toBe("ara")
    expect(e9.indexOf("acabe")).toBeLessThan(e9.indexOf("elias"))
    expect(scenes.find((s) => s.id === "item-elias")?.game?.id).toBe("altar")
  })

  it("todos os itens da linha do tempo da escola (semanas 1 a 12) têm slide", () => {
    const school = ["criacao", "adao-eva", "queda", "diluvio", "noe", "babel", "abraao", "alianca-abraamica", "sacrificio-isaque", "isaque", "jaco", "migracao-egito", "tempo-egito", "exodo", "moises",
      "peregrinacao", "alianca-sinai", "tabernaculo", "arao", "espioes", "alianca-deuteronomica", "uncao-josue", "morte-moises",
      "conquista-canaa", "josue", "periodo-juizes", "debora", "gideao", "sansao", "rute-boaz",
      "samuel", "saul", "davi-ungido", "davi", "alianca-davidica",
      "aram", "salomao", "templo", "divisao-reino", "jeroboao", "roboao", "elias", "acabe", "eliseu", "assiria",
      "queda-samaria", "cerco-jerusalem", "isaias", "ezequias", "manasses", "babilonia",
      "josias", "jeremias", "queda-jerusalem", "inicio-exilio", "daniel", "ezequiel", "persia", "ciro",
      "primeiro-retorno", "reconstrucao-templo", "segundo-retorno", "terceiro-retorno", "fim-at", "imperio-grego", "macabeus", "pompeu", "imperio-romano",
      "augusto", "herodes", "nascimento-jesus", "jesus", "herodes-antipas", "pilatos", "ministerio-jesus", "morte-ressurreicao", "ascensao",
      "nero", "pentecostes", "estevao", "conversao-paulo", "ministerio-pedro", "visao-pedro", "ministerio-paulo", "primeira-viagem", "concilio", "roma-queimada",
      "segunda-viagem", "timoteo", "terceira-viagem", "prisao-roma", "martirio-paulo-pedro", "templo-artemis",
      "queda-jerusalem-70", "domiciano", "patmos", "morte-joao", "fim-nt"]
    const onSlide = new Set(scenes.flatMap((s) => (s.overview?.role === "item" && s.overview.itemId ? [s.overview.itemId, ...(s.overview.alsoItemIds ?? [])] : [])))
    for (const id of school) expect(onSlide.has(id), id).toBe(true)
  })

  it("o versículo do plano vem logo depois do item da escola; os momentos viram linhas do Aprofundar do tópico", () => {
    // Ordem da Bíblia (autor, 26/11/2026): Sinai → tabernáculo → Arão e Levítico → Lv 20:7–8 → espiões.
    expect(ids.indexOf("item-alianca-sinai")).toBeLessThan(ids.indexOf("item-tabernaculo"))
    expect(ids.indexOf("item-arao")).toBe(ids.indexOf("item-tabernaculo") + 1)
    expect(ids.indexOf("versiculo-02")).toBe(ids.indexOf("item-arao") + 1)
    expect(ids.indexOf("item-espioes")).toBeGreaterThan(ids.indexOf("versiculo-02"))
    // Raabe (Js 2) fica na Conquista de Canaã, sob Josué; os espiões de Moisés ficam só com Nm 13–14.
    const stepsOf = (id: string) => (scenes.find((s) => s.id === id)?.steps ?? []).map((st) => st.text).join(" ")
    expect(stepsOf("item-espioes")).not.toMatch(/Raabe/)
    expect(stepsOf("item-conquista-canaa")).toMatch(/Raabe/)
    // Js 1:7 com a Conquista, Mq 6:8 com Isaías (linha do tempo da escola).
    // Js 1:7: Deus fala com Josué antes de entrar na terra (autor, 26/11/2026).
    expect(ids.indexOf("versiculo-03-1")).toBe(ids.indexOf("item-josue") + 1)
    expect(ids.indexOf("item-conquista-canaa")).toBeGreaterThan(ids.indexOf("versiculo-03-1"))
    expect(ids.indexOf("versiculo-05")).toBe(ids.indexOf("item-isaias") + 1)
    // Roteiro de 45 min: só o arco-íris (pedido do autor) vira slide próprio, logo depois do Dilúvio.
    expect(ids.filter((id) => id.startsWith("momento-"))).toEqual(["momento-arco-iris"])
    expect(ids.indexOf("momento-arco-iris")).toBe(ids.indexOf("item-diluvio") + 1)
    const steps = (id: string) => (scenes.find((s) => s.id === id)?.steps ?? []).map((st) => st.text)
    expect(scenes.find((s) => s.id === "momento-arco-iris")?.overview?.stageLine).toMatch(/sinal da aliança com Noé/)
    // O que vem depois do arco-íris (Noé também erra, Gn 9:20–21) fica no slide dele, na ordem da Bíblia.
    expect(steps("momento-arco-iris").some((t) => /Noé também erra/.test(t))).toBe(true)
    expect(steps("item-diluvio").some((t) => /bem maior/.test(t))).toBe(true)
    expect(steps("item-alianca-sinai").some((t) => /bezerro de ouro/.test(t))).toBe(true)
    expect(steps("item-ciro").some((t) => /cova dos leões/.test(t))).toBe(true)
  })

  it("roteiro de 45 min: só os itens da escola viram slide; os outros entram no tópico ao lado", () => {
    const slides = scenes.filter((s) => s.overview?.role === "item")
    for (const s of slides) expect(isSchoolItem(s.overview!.itemId!), s.id).toBe(true)
    const queda = scenes.find((s) => s.id === "item-queda-samaria")
    expect(queda?.overview?.alsoItemIds).toEqual(expect.arrayContaining(["amos", "oseias", "jonas"]))
    expect(queda?.game?.id).toBe("ninive")
    expect(scenes.find((s) => s.id === "item-imperio-grego")?.overview?.alsoItemIds).toContain("alexandre")
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

describe("duração dos jogos", () => {
  it("estrelas (Abraão) 15 s, maná 30 s; os outros, 75 s", async () => {
    const { gameSecondsOf, getRoomGame, ROOM_GAMES } = await import("./jogos")
    expect(gameSecondsOf(getRoomGame("estrelas"))).toBe(15)
    expect(gameSecondsOf(getRoomGame("mana"))).toBe(30)
    for (const g of ROOM_GAMES.filter((g) => g.id !== "estrelas" && g.id !== "mana")) expect(gameSecondsOf(g), g.id).toBe(75)
  })

  it("maná e codornizes intercalados: manhã maná, tarde codornizes; no sexto dia, o dobro do maná", async () => {
    const { getRoomGame } = await import("./jogos")
    const mana = getRoomGame("mana")
    if (mana?.mechanic !== "juntar") throw new Error("maná sem a mecânica de juntar")
    expect(mana.sessions.map((s) => s.piece).slice(0, 4)).toEqual(["mana", "codorniz", "mana", "codorniz"])
    expect(mana.sessions.find((s) => s.label === "Dia 6 · manhã")?.count).toBe(2 * mana.sessions[0].count)
  })
})
