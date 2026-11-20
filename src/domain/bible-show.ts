import { CARTAS, CATEGORIA_IDS, type CategoriaId } from "@/content/bible-show/cartas"
import { escolheOutro, getSituacao, SITUACOES, type SituacaoId } from "@/content/bible-show/situacoes"

// Bible Show: mímica, perguntas e letras em grupo. Sem tabuleiro físico: a
// trilha fica na tela. Lógica pura (o relógio e o sorteio entram pelas ações),
// a mesma num celular só ou numa sala com um celular por equipe.

export type Modo = "equipes" | "individual"
export type Estilo = "mimica" | "perguntas" | "letras"
export const ESTILOS: Estilo[] = ["mimica", "perguntas", "letras"]
/** Letras: tempo de cada jogada (escolher uma letra ou decidir arriscar). */
export const LETRAS_MS = 15_000
/** Letras: lâmpadas acesas no começo, para todas as equipes juntas. */
export const LAMPADAS = 7
export const VOGAIS = ["A", "E", "I", "O", "U"]

export interface Lado {
  id: string
  nome: string
  cor: string
  /** Casa em que está (0 = partida). */
  casa: number
  acertos: number
  /** Exílio: fica de fora na próxima vez. */
  exilio?: boolean
}

export interface Config {
  modo: Modo
  nomes: string[]
  segundos: number
  casas: number
  /** Jeitos de jogar ligados; com mais de um, a roleta sorteia. */
  estilos: Estilo[]
  categorias: CategoriaId[]
}

/** Casa da trilha: uma categoria ou uma casa especial. */
export type Casa = { tipo: "categoria"; categoria: CategoriaId } | { tipo: "situacao"; situacao: SituacaoId }

/**
 * vez: roleta, sorteio de casas e carta · carta: quem pode, vê · tempo: cronômetro ·
 * letras: a palavra escondida, letra por letra · quem: quem acertou ·
 * passa: em Perguntas, a equipe seguinte tenta ·
 * resultado · situacao: casa especial a cumprir · fim.
 */
export type Fase = "config" | "vez" | "carta" | "tempo" | "letras" | "quem" | "passa" | "resultado" | "situacao" | "fim"

/** A rodada em curso: quem conduz, o jeito (roleta) e quantas casas vale (sorteio). */
export interface Rodada {
  lider: string
  todos: boolean
  estilo: Estilo | null
  passos: number | null
}

export interface ShowState {
  v: 4
  fase: Fase
  config: Config
  /** Sorteio da trilha desta partida (quais casas especiais e em que ordem). */
  semente: number
  lados: Lado[]
  /** Dono da vez (índice em `lados`). */
  vez: number
  rodada: Rodada | null
  /**
   * `tentativa`: em Perguntas e em Letras, quantas vezes a vez já passou para a equipe seguinte.
   * `letras`: em Letras, as letras já escolhidas (sem acento, maiúsculas).
   * `lampadas`: em Letras, quantas ainda estão acesas. `arriscando`: a equipe da vez vai dizer a palavra.
   */
  carta: {
    id: string
    estilo: Estilo
    todos: boolean
    trocou: boolean
    tentativa: number
    letras?: string[]
    lampadas?: number
    arriscando?: boolean
  } | null
  usadas: string[]
  /** Cronômetro: prazo absoluto quando corre; `restante` quando pausado. */
  relogio: { prazo?: number; restante: number } | null
  ultima: { tipo: "acerto" | "tempo"; cartaId: string; moveu: { id: string; de: number; para: number }[] } | null
  /** Casas especiais em que alguém parou e que ainda vão ser cumpridas. */
  pendentes: { situacao: SituacaoId; lado: string }[]
  /** "O sol parou": joga de novo na próxima vez. */
  denovo: string | null
  vencedor: string | null
}

export type ShowAction =
  | { type: "comecar"; config: Config; r?: number }
  | { type: "girar"; r: number }
  | { type: "rolar"; r: number }
  | { type: "sortear"; r1: number; r2: number }
  | { type: "trocar"; r: number }
  | { type: "valendo"; agora: number }
  | { type: "pausar"; agora: number }
  | { type: "continuar"; agora: number }
  /** "Acertaram!": vale direto quando só um lado pode ter acertado; senão pergunta quem. */
  | { type: "acertaram"; agora: number }
  | { type: "acertou"; por: string }
  | { type: "voltar"; agora: number }
  /** `prazo`: aviso de tempo esgotado; vale só se o relógio ainda for aquele (vários celulares avisam). */
  | { type: "errou"; prazo?: number }
  /** Letras: escolhe uma letra; se não houver na palavra, a vez passa. */
  | { type: "letra"; l: string; agora: number }
  /** Letras: a equipe vai arriscar (o tempo para e não tem volta). */
  | { type: "arriscar"; agora: number }
  /** Letras: a palavra arriscada; se errar, apaga uma lâmpada e a vez passa. */
  | { type: "chutar"; palavra: string; agora: number }
  /** Letras: o tempo da jogada acabou (ou a equipe passou a vez). */
  | { type: "passar"; agora: number; prazo?: number }
  | { type: "proxima" }
  /** Cumpre a casa especial; `alvo` quando a casa manda escolher alguém. */
  | { type: "cumprir"; alvo?: string }
  | { type: "revanche"; r?: number }
  | { type: "configurar" }

export const CORES = ["#d8a948", "#5fb3c9", "#e0736b", "#8fbf6a", "#b18ad8", "#e89a4f", "#e7c6a0", "#6fd1b0", "#f08fb5", "#9aa7ff", "#c9d36b", "#ff9f80"]
export const LIMITES = { equipes: { min: 2, max: 4 }, individual: { min: 2, max: 12 } } as const
export const SEGUNDOS = [30, 45, 60, 90] as const
export const PASSOS = [1, 2, 3, 4, 5, 6] as const
export const TRILHAS = [
  { casas: 15, nome: "Curta" },
  { casas: 25, nome: "Média" },
  { casas: 35, nome: "Longa" },
] as const

export const configPadrao: Config = {
  modo: "equipes",
  nomes: ["Equipe 1", "Equipe 2"],
  segundos: 60,
  casas: 25,
  estilos: ["mimica", "perguntas", "letras"],
  categorias: [...CATEGORIA_IDS],
}

export const estadoInicial: ShowState = {
  v: 4,
  fase: "config",
  config: configPadrao,
  semente: 1,
  lados: [],
  vez: 0,
  rodada: null,
  carta: null,
  usadas: [],
  relogio: null,
  ultima: null,
  pendentes: [],
  denovo: null,
  vencedor: null,
}

/** Números pseudoaleatórios a partir de uma semente (a mesma trilha em todos os celulares). */
function sorteador(semente: number) {
  let a = Math.floor(semente) >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function embaralhar<T>(lista: T[], rnd: () => number): T[] {
  const a = [...lista]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Casas 1..N. A cada 3 casas há uma casa especial (nunca na chegada); quanto
 * mais longa a trilha, mais especiais. Em equipes, uma em cada três é uma
 * rodada para todos. Quais eventos entram, e em que ordem, a semente sorteia.
 */
export function montarTrilha(config: Pick<Config, "casas" | "categorias" | "modo">, semente = 1): Casa[] {
  const rnd = sorteador(semente)
  const cats = config.categorias.length ? config.categorias : [...CATEGORIA_IDS]
  const efeitos = embaralhar(
    SITUACOES.filter((s) => s.efeito.tipo !== "arraial"),
    rnd,
  )
  const todos = embaralhar(
    SITUACOES.filter((s) => s.efeito.tipo === "arraial"),
    rnd,
  )
  const trilha: Casa[] = []
  let k = 0
  let e = 0
  let t = 0
  for (let i = 1; i <= config.casas; i++) {
    if (i % 3 === 0 && i < config.casas) {
      const n = i / 3 - 1
      const s = config.modo === "equipes" && n % 3 === 0 ? todos[t++ % todos.length] : efeitos[e++ % efeitos.length]
      trilha.push({ tipo: "situacao", situacao: s.id })
    } else trilha.push({ tipo: "categoria", categoria: cats[k++ % cats.length] })
  }
  return trilha
}

/** A trilha desta partida. */
export const trilhaDe = (state: Pick<ShowState, "config" | "semente">) => montarTrilha(state.config, state.semente)

/** Letras: sem acento e em maiúsculas ("Ç" vira "C"). */
export const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()

/** Letras: a palavra com cada letra aberta ou fechada (espaços e hífens sempre à mostra). */
export function painel(palavra: string, letras: string[]): { c: string; letra: boolean; aberta: boolean }[] {
  return [...palavra].map((c) => {
    const n = normalizar(c)
    const letra = /^[A-Z]$/.test(n)
    return { c, letra, aberta: !letra || letras.includes(n) }
  })
}

/** A casa em que um lado está (undefined na partida). */
export function casaDe(state: ShowState, lado: Lado | undefined): Casa | undefined {
  if (!lado || lado.casa === 0) return undefined
  return trilhaDe(state)[Math.min(lado.casa, state.config.casas) - 1]
}

const ladoPorId = (state: ShowState, id: string | undefined) => state.lados.find((l) => l.id === id)

/** Quem conduz a rodada: o dono da vez ou quem parou em "Todo o arraial". */
export function lider(state: ShowState): Lado {
  return ladoPorId(state, state.rodada?.lider) ?? state.lados[state.vez]
}

/** Quem tenta agora: em Perguntas, cada erro passa a vez à equipe seguinte. */
export function tentando(state: ShowState): Lado {
  const i = state.lados.indexOf(lider(state))
  return state.lados[(i + (state.carta?.tentativa ?? 0)) % state.lados.length]
}

/** Segundos da tentativa: o tempo cheio e, a cada equipe seguinte, a metade (mínimo 10). */
export function segundosDaVez(state: ShowState): number {
  const k = state.carta?.tentativa ?? 0
  return k === 0 ? state.config.segundos : Math.max(10, Math.round(state.config.segundos / 2 ** k))
}

/** Num celular por equipe: este aparelho conduz agora? (`eu` nulo = celular único.) */
export function controla(state: ShowState, eu: string | null, anfitriao = false): boolean {
  if (eu === null || anfitriao) return true
  if (state.fase === "situacao") return state.pendentes[0]?.lado === eu
  if (state.fase === "fim") return false
  // Letras: tem o teclado quem está na vez de escolher.
  if (state.fase === "letras") return tentando(state).id === eu
  return lider(state).id === eu
}

/** Num celular por equipe: este aparelho pode ver a carta? */
export function veCarta(state: ShowState, eu: string | null): boolean {
  if (eu === null || !state.carta) return true
  // Perguntas: todos veem, menos quem adivinha (em equipes, a pessoa só não olha o celular da equipe).
  if (state.carta.estilo === "perguntas") return state.config.modo === "equipes" || state.carta.todos || tentando(state).id !== eu
  return lider(state).id === eu
}

const getCartaPalavra = (id: string) => CARTAS.find((c) => c.id === id)?.palavra ?? ""

const valeCasas = (state: ShowState) => (state.rodada?.passos ?? 1) + (CARTAS.find((c) => c.id === state.carta?.id)?.categoria === "desafio" ? 1 : 0)

function limpar(config: Config): Config {
  const { min, max } = LIMITES[config.modo]
  const base = config.modo === "equipes" ? "Equipe" : "Jogador"
  const nomes = config.nomes.slice(0, max).map((n, i) => n.trim().slice(0, 20) || `${base} ${i + 1}`)
  while (nomes.length < min) nomes.push(`${base} ${nomes.length + 1}`)
  const categorias = config.categorias.filter((c) => CATEGORIA_IDS.includes(c))
  const estilos = ESTILOS.filter((e) => (config.estilos ?? []).includes(e))
  return {
    ...config,
    nomes,
    segundos: SEGUNDOS.includes(config.segundos as (typeof SEGUNDOS)[number]) ? config.segundos : 60,
    casas: TRILHAS.some((t) => t.casas === config.casas) ? config.casas : 25,
    categorias: categorias.length ? categorias : [...CATEGORIA_IDS],
    estilos: estilos.length ? estilos : ["mimica", "perguntas", "letras"],
  }
}

function novaRodada(state: ShowState, liderId: string, todos: boolean): Rodada {
  const { estilos } = state.config
  return { lider: liderId, todos, estilo: estilos.length === 1 ? estilos[0] : null, passos: null }
}

function sortearCarta(state: ShowState, categoria: CategoriaId, r: number, evitar?: string): { id: string; usadas: string[] } {
  const doMonte = CARTAS.filter((c) => c.categoria === categoria && c.id !== evitar)
  let livres = doMonte.filter((c) => !state.usadas.includes(c.id))
  let usadas = state.usadas
  // Acabou o monte da categoria: embaralha de novo (sem repetir a que acabou de sair).
  if (livres.length === 0) {
    usadas = usadas.filter((id) => !doMonte.some((c) => c.id === id))
    livres = doMonte
  }
  const carta = livres[Math.min(livres.length - 1, Math.floor(r * livres.length))]
  return { id: carta.id, usadas: [...usadas, carta.id] }
}

const chegou = (state: ShowState, lados: Lado[]) =>
  lados.filter((l) => l.casa >= state.config.casas).sort((a, b) => b.acertos - a.acertos)[0]?.id ?? null

function avancar(state: ShowState, ids: string[]): ShowState {
  const passos = valeCasas(state)
  const trilha = trilhaDe(state)
  const moveu: { id: string; de: number; para: number }[] = []
  const pendentes: ShowState["pendentes"] = []
  const lados = state.lados.map((l) => {
    if (!ids.includes(l.id)) return l
    const para = Math.min(state.config.casas, l.casa + passos)
    moveu.push({ id: l.id, de: l.casa, para })
    const casa = trilha[para - 1]
    if (casa?.tipo === "situacao") pendentes.push({ situacao: casa.situacao, lado: l.id })
    return { ...l, casa: para, acertos: l.acertos + 1 }
  })
  // Chegou ao fim: vence quem foi mais longe (no empate, quem fez mais acertos).
  const vencedor = chegou(state, lados)
  return {
    ...state,
    lados,
    relogio: null,
    ultima: { tipo: "acerto", cartaId: state.carta!.id, moveu },
    pendentes: vencedor ? [] : pendentes,
    fase: vencedor ? "fim" : "resultado",
    vencedor,
  }
}

/** Letras: as lâmpadas se apagaram; a palavra aparece e ninguém anda. */
const apagou = (state: ShowState): ShowState => ({ ...state, fase: "resultado", relogio: null, ultima: { tipo: "tempo", cartaId: state.carta!.id, moveu: [] } })

/** Passa a vez: "o sol parou" joga de novo; quem está no exílio pula uma vez. */
function passarVez(state: ShowState): ShowState {
  const n = state.lados.length
  let lados = state.lados
  let vez = state.denovo ? Math.max(0, lados.findIndex((l) => l.id === state.denovo)) : (state.vez + 1) % n
  for (let i = 0; i < n && lados[vez].exilio; i++) {
    const pula = vez
    lados = lados.map((l, j) => (j === pula ? { ...l, exilio: false } : l))
    vez = (vez + 1) % n
  }
  const proximo: ShowState = { ...state, lados, vez, denovo: null }
  return { ...proximo, fase: "vez", rodada: novaRodada(proximo, lados[vez].id, false), carta: null, relogio: null, ultima: null, pendentes: [] }
}

function cumprir(state: ShowState, alvo?: string): ShowState {
  const [p, ...resto] = state.pendentes
  if (!p) return passarVez(state)
  const { efeito } = getSituacao(p.situacao)
  const mover = (id: string, delta: number) => state.lados.map((l) => (l.id === id ? { ...l, casa: Math.max(0, Math.min(state.config.casas, l.casa + delta)) } : l))
  let next: ShowState = { ...state, pendentes: resto }
  switch (efeito.tipo) {
    case "andar":
      next = { ...next, lados: mover(p.lado, efeito.casas) }
      break
    case "voltar":
      next = { ...next, lados: mover(p.lado, -efeito.casas) }
      break
    case "exilio":
      next = { ...next, lados: state.lados.map((l) => (l.id === p.lado ? { ...l, exilio: true } : l)) }
      break
    case "denovo":
      next = { ...next, denovo: p.lado }
      break
    case "escolher":
    case "junto":
    case "dar": {
      if (!escolheOutro(efeito) || !alvo || alvo === p.lado || !ladoPorId(state, alvo)) return state
      const lados = mover(alvo, efeito.tipo === "escolher" ? -efeito.casas : efeito.casas)
      next = { ...next, lados: efeito.tipo === "junto" ? lados.map((l) => (l.id === p.lado ? { ...l, casa: Math.min(state.config.casas, l.casa + efeito.casas) } : l)) : lados }
      break
    }
    case "arraial":
      // Rodada para todos já, conduzida por quem parou aqui; a vez não muda.
      return { ...next, fase: "vez", rodada: novaRodada(state, p.lado, true), carta: null, relogio: null, ultima: null }
  }
  const vencedor = chegou(state, next.lados)
  if (vencedor) return { ...next, fase: "fim", vencedor, pendentes: [] }
  return resto.length ? { ...next, fase: "situacao" } : passarVez(next)
}

export function reduceShow(state: ShowState, a: ShowAction): ShowState {
  switch (a.type) {
    case "comecar": {
      const config = limpar(a.config)
      const lados = config.nomes.map((nome, i) => ({ id: `l${i + 1}`, nome, cor: CORES[i % CORES.length], casa: 0, acertos: 0 }))
      const semente = Math.floor((a.r ?? 0.5) * 2 ** 31) + 1
      const s: ShowState = { ...estadoInicial, fase: "vez", config, lados, semente }
      return { ...s, rodada: novaRodada(s, lados[0].id, false) }
    }
    case "girar": {
      if (state.fase !== "vez" || !state.rodada || state.rodada.estilo) return state
      const lista = state.config.estilos
      return { ...state, rodada: { ...state.rodada, estilo: lista[Math.min(lista.length - 1, Math.floor(a.r * lista.length))] } }
    }
    case "rolar":
      if (state.fase !== "vez" || !state.rodada?.estilo || state.rodada.passos) return state
      return { ...state, rodada: { ...state.rodada, passos: PASSOS[Math.min(PASSOS.length - 1, Math.floor(a.r * PASSOS.length))] } }
    case "sortear": {
      const rodada = state.rodada
      if (state.fase !== "vez" || !rodada?.estilo || !rodada.passos) return state
      // Categoria da casa em que o líder está; na partida e nas casas especiais, sorteada.
      const casa = casaDe(state, lider(state))
      const cats = state.config.categorias
      const categoria = casa?.tipo === "categoria" ? casa.categoria : cats[Math.min(cats.length - 1, Math.floor(a.r2 * cats.length))]
      const { id, usadas } = sortearCarta(state, categoria, a.r1)
      // Letras: ninguém vê a carta; a palavra aparece escondida para todos.
      if (rodada.estilo === "letras")
        return { ...state, fase: "letras", carta: { id, estilo: "letras", todos: rodada.todos, trocou: false, tentativa: 0, letras: [], lampadas: LAMPADAS }, relogio: { restante: LETRAS_MS }, usadas }
      return { ...state, fase: "carta", carta: { id, estilo: rodada.estilo, todos: rodada.todos, trocou: false, tentativa: 0 }, usadas }
    }
    case "trocar": {
      if (state.fase !== "carta" || !state.carta || state.carta.trocou) return state
      const atual = CARTAS.find((c) => c.id === state.carta!.id)!
      const { id, usadas } = sortearCarta(state, atual.categoria, a.r, atual.id)
      return { ...state, carta: { ...state.carta, id, trocou: true }, usadas }
    }
    case "valendo": {
      if (state.fase === "letras") {
        if (state.relogio?.prazo) return state
        return { ...state, relogio: { prazo: a.agora + LETRAS_MS, restante: LETRAS_MS } }
      }
      if (state.fase !== "carta" && state.fase !== "passa") return state
      const ms = segundosDaVez(state) * 1000
      return { ...state, fase: "tempo", relogio: { prazo: a.agora + ms, restante: ms } }
    }
    case "pausar":
      if ((state.fase !== "tempo" && state.fase !== "letras") || !state.relogio?.prazo) return state
      return { ...state, relogio: { restante: Math.max(0, state.relogio.prazo - a.agora) } }
    case "continuar":
      if ((state.fase !== "tempo" && state.fase !== "letras") || !state.relogio || state.relogio.prazo || state.carta?.arriscando) return state
      return { ...state, relogio: { prazo: a.agora + state.relogio.restante, restante: state.relogio.restante } }
    case "acertaram": {
      if (state.fase !== "tempo" || !state.carta) return state
      if (!state.carta.todos) {
        // Perguntas: quem estava perguntando acertou. Equipes: a equipe da vez acertou a própria carta.
        if (state.carta.estilo === "perguntas") return avancar(state, [tentando(state).id])
        if (state.config.modo === "equipes") return avancar(state, [lider(state).id])
      }
      const restante = state.relogio?.prazo ? Math.max(0, state.relogio.prazo - a.agora) : (state.relogio?.restante ?? 0)
      return { ...state, fase: "quem", relogio: { restante } }
    }
    case "voltar":
      if (state.fase !== "quem" || !state.relogio) return state
      return { ...state, fase: "tempo", relogio: { prazo: a.agora + state.relogio.restante, restante: state.relogio.restante } }
    case "acertou": {
      if (state.fase !== "quem" || !state.carta || !ladoPorId(state, a.por)) return state
      // Individual: quem representou e quem acertou andam juntos. Todo o arraial: só quem acertou primeiro.
      if (state.config.modo === "individual" && !state.carta.todos) {
        const ator = lider(state).id
        if (a.por === ator) return state
        return avancar(state, [ator, a.por])
      }
      return avancar(state, [a.por])
    }
    case "letra": {
      const c = state.carta
      const l = normalizar(a.l)
      if (state.fase !== "letras" || !c || c.arriscando || !state.relogio?.prazo || !/^[A-Z]$/.test(l) || c.letras?.includes(l)) return state
      const letras = [...(c.letras ?? []), l]
      const palavra = getCartaPalavra(c.id)
      const tem = normalizar(palavra).includes(l)
      // Letra que não está na palavra apaga uma lâmpada; vogal apaga sempre ("comprar vogal").
      const lampadas = (c.lampadas ?? LAMPADAS) - (!tem || VOGAIS.includes(l) ? 1 : 0)
      const com: ShowState = { ...state, carta: { ...c, letras, lampadas } }
      if (painel(palavra, letras).every((x) => x.aberta)) return avancar(com, [tentando(state).id])
      if (lampadas <= 0) return apagou(com)
      // Acertou a letra: a mesma equipe joga de novo. Errou: a vez passa.
      return { ...com, carta: { ...com.carta!, tentativa: c.tentativa + (tem ? 0 : 1) }, relogio: { prazo: a.agora + LETRAS_MS, restante: LETRAS_MS } }
    }
    case "arriscar": {
      const c = state.carta
      if (state.fase !== "letras" || !c || c.arriscando || !state.relogio?.prazo) return state
      return { ...state, carta: { ...c, arriscando: true }, relogio: { restante: Math.max(0, state.relogio.prazo - a.agora) } }
    }
    case "chutar": {
      const c = state.carta
      if (state.fase !== "letras" || !c || !c.arriscando) return state
      const so = (t: string) => normalizar(t).replace(/[^A-Z]/g, "")
      if (so(a.palavra) && so(a.palavra) === so(getCartaPalavra(c.id))) return avancar(state, [tentando(state).id])
      const lampadas = (c.lampadas ?? LAMPADAS) - 1
      const errou: ShowState = { ...state, carta: { ...c, lampadas, arriscando: false, tentativa: c.tentativa + 1 } }
      if (lampadas <= 0) return apagou(errou)
      return { ...errou, relogio: { prazo: a.agora + LETRAS_MS, restante: LETRAS_MS } }
    }
    case "passar":
      if (state.fase !== "letras" || !state.carta || state.carta.arriscando) return state
      if (a.prazo !== undefined && state.relogio?.prazo !== a.prazo) return state
      return { ...state, carta: { ...state.carta, tentativa: state.carta.tentativa + 1 }, relogio: { prazo: a.agora + LETRAS_MS, restante: LETRAS_MS } }
    case "errou":
      if (a.prazo !== undefined && state.relogio?.prazo !== a.prazo) return state
      if (state.fase === "letras" && state.carta) return { ...state, fase: "resultado", relogio: null, ultima: { tipo: "tempo", cartaId: state.carta.id, moveu: [] } }
      if ((state.fase !== "tempo" && state.fase !== "quem") || !state.carta) return state
      // Perguntas em equipes: a equipe seguinte tenta, com menos tempo, até todas terem tentado.
      if (state.carta.estilo === "perguntas" && !state.carta.todos && state.config.modo === "equipes" && state.carta.tentativa + 1 < state.lados.length)
        return { ...state, fase: "passa", relogio: null, carta: { ...state.carta, tentativa: state.carta.tentativa + 1 } }
      return { ...state, fase: "resultado", relogio: null, ultima: { tipo: "tempo", cartaId: state.carta.id, moveu: [] } }
    case "proxima":
      if (state.fase !== "resultado") return state
      return state.pendentes.length ? { ...state, fase: "situacao" } : passarVez(state)
    case "cumprir":
      if (state.fase !== "situacao") return state
      return cumprir(state, a.alvo)
    case "revanche":
      return reduceShow(state, { type: "comecar", config: state.config, r: a.r })
    case "configurar":
      return { ...estadoInicial, config: state.config }
  }
}

/** Classificação: mais longe na trilha; no empate, mais acertos. */
export function classificacao(lados: Lado[]): Lado[] {
  return [...lados].sort((a, b) => b.casa - a.casa || b.acertos - a.acertos)
}
