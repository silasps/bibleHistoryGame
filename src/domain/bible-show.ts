import { CARTAS, categoriasDoTema, doTema, type CategoriaId, type Tema } from "@/content/bible-show/cartas"
import { escolheOutro, getSituacao, SITUACOES, type SituacaoId } from "@/content/bible-show/situacoes"

// Bible Show: mímica, perguntas e letras em grupo. Sem tabuleiro físico: a
// trilha fica na tela. Lógica pura (o relógio e o sorteio entram pelas ações),
// a mesma num celular só ou numa sala com um celular por equipe.

/** livre: só brincar, sem disputa (sem equipes, trilha nem pontos), num celular só. */
export type Modo = "equipes" | "individual" | "livre"
export type Estilo = "mimica" | "perguntas" | "letras"
export const ESTILOS: Estilo[] = ["mimica", "perguntas", "letras"]
/** Letras: letra que está na palavra dá tempo; letra que não está tira. */
export const LETRA_CERTA_MS = 10_000
export const LETRA_ERRADA_MS = 5_000

export interface Lado {
  id: string
  nome: string
  cor: string
  /** Casa em que está (0 = partida). */
  casa: number
  acertos: number
  /** Exílio: fica de fora na próxima vez. */
  exilio?: boolean
  /** Saiu da partida (pode voltar, na mesma casa). */
  fora?: boolean
}

export interface Config {
  modo: Modo
  nomes: string[]
  /** Mímica: segundos da vez. */
  segundos: number
  /** Perguntas: segundos da vez (padrão: 3 minutos). */
  perguntas?: number
  /** Letras: segundos de cada equipe quando a vez chega a ela (padrão: 1 minuto). */
  letras?: number
  casas: number
  /** Jeitos de jogar ligados; com mais de um, a roleta sorteia. */
  estilos: Estilo[]
  categorias: CategoriaId[]
  /** Cartas da Bíblia, gerais ou as duas (padrão: Bíblia). */
  tema?: Tema
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
   * `comecou`: em Letras, a equipe da vez já tocou em Valendo. `arriscando`: a equipe da vez vai dizer a palavra.
   */
  carta: {
    id: string
    estilo: Estilo
    todos: boolean
    trocou: boolean
    tentativa: number
    letras?: string[]
    comecou?: boolean
    arriscando?: boolean
  } | null
  usadas: string[]
  /** Cronômetro: prazo absoluto quando corre; `restante` quando pausado. */
  relogio: { prazo?: number; restante: number } | null
  /** `errou`: em Letras, arriscaram e erraram (só brincar). */
  ultima: { tipo: "acerto" | "tempo" | "errou"; cartaId: string; moveu: { id: string; de: number; para: number }[] } | null
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
  /** Letras: escolhe uma letra; certa dá 10 s, errada tira 5 s (a vez continua). */
  | { type: "letra"; l: string; agora: number }
  /** Letras: a equipe vai arriscar (o tempo para e não tem volta). */
  | { type: "arriscar"; agora: number }
  /** Letras: a palavra arriscada; se errar, a vez passa. */
  | { type: "chutar"; palavra: string; agora: number }
  /** Letras: o tempo da equipe acabou; a vez passa. */
  | { type: "passar"; agora: number; prazo?: number }
  | { type: "proxima" }
  /** Cumpre a casa especial; `alvo` quando a casa manda escolher alguém. */
  | { type: "cumprir"; alvo?: string }
  | { type: "revanche"; r?: number }
  /** Uma equipe (ou pessoa) sai da partida, que continua com os outros; pode voltar depois. */
  | { type: "sair"; id: string }
  | { type: "voltou"; id: string }
  | { type: "configurar" }

export const CORES = ["#d8a948", "#5fb3c9", "#e0736b", "#8fbf6a", "#b18ad8", "#e89a4f", "#e7c6a0", "#6fd1b0", "#f08fb5", "#9aa7ff", "#c9d36b", "#ff9f80"]
export const LIMITES = { equipes: { min: 2, max: 4 }, individual: { min: 2, max: 12 }, livre: { min: 1, max: 1 } } as const
/** Tempos que dá para escolher em cada jogo (segundos). */
export const SEGUNDOS = [30, 45, 60, 90] as const
export const SEGUNDOS_PERGUNTAS = [120, 180, 240, 300] as const
export const SEGUNDOS_LETRAS = [45, 60, 90] as const
/** Níveis: cada um acerta o tempo dos três jogos de uma vez. */
export const NIVEIS = [
  { id: "facil", nome: "Fácil", segundos: 90, perguntas: 300, letras: 90 },
  { id: "normal", nome: "Normal", segundos: 60, perguntas: 180, letras: 60 },
  { id: "dificil", nome: "Difícil", segundos: 45, perguntas: 120, letras: 45 },
] as const
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
  perguntas: 180,
  letras: 60,
  casas: 25,
  estilos: ["mimica", "perguntas", "letras"],
  categorias: categoriasDoTema("biblia"),
  tema: "biblia",
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
  const cats = config.categorias.length ? config.categorias : categoriasDoTema("biblia")
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

/** Quem está jogando (quem saiu fica de fora até voltar). */
export const emJogo = (state: ShowState) => state.lados.filter((l) => !l.fora)

/** O lado `k` posições depois de quem conduz, entre os que estão jogando. */
export function tentandoCom(state: ShowState, k: number): Lado {
  const roda = emJogo(state)
  const i = Math.max(0, roda.indexOf(lider(state)))
  return roda[(((i + k) % roda.length) + roda.length) % roda.length] ?? lider(state)
}

/** Quem tenta agora: em Perguntas e em Letras, a vez passa à equipe seguinte. */
export const tentando = (state: ShowState): Lado => tentandoCom(state, state.carta?.tentativa ?? 0)

/** Segundos da tentativa: o tempo cheio e, a cada equipe seguinte, a metade (mínimo 10). */
export function segundosDaVez(state: ShowState): number {
  const k = state.carta?.tentativa ?? 0
  const cheio = state.carta?.estilo === "perguntas" ? (state.config.perguntas ?? 180) : state.config.segundos
  return k === 0 ? cheio : Math.max(10, Math.round(cheio / 2 ** k))
}

/** Letras: milissegundos de cada equipe quando a vez chega a ela. */
export const tempoLetras = (config: Config) => (config.letras ?? 60) * 1000

/** O nível que bate com os tempos escolhidos (nulo se foram ajustados um a um). */
export function nivelDe(config: Config) {
  return NIVEIS.find((n) => n.segundos === config.segundos && n.perguntas === (config.perguntas ?? 180) && n.letras === (config.letras ?? 60)) ?? null
}

/** A categoria da carta pode aparecer para todos? Em Perguntas, só no nível Fácil (senão é dica para quem adivinha). */
export const categoriaVisivel = (state: ShowState) => state.carta?.estilo !== "perguntas" || nivelDe(state.config)?.id === "facil"

/** Tempo para mostrar: "45s", "3 min", "1:30". */
export function textoTempo(segundos: number): string {
  if (segundos < 60) return `${segundos}s`
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return s ? `${m}:${String(s).padStart(2, "0")}` : `${m} min`
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
  const base = config.modo === "equipes" ? "Equipe" : config.modo === "livre" ? "Grupo" : "Jogador"
  const nomes = (config.modo === "livre" ? ["Grupo"] : config.nomes).slice(0, max).map((n, i) => n.trim().slice(0, 20) || `${base} ${i + 1}`)
  while (nomes.length < min) nomes.push(`${base} ${nomes.length + 1}`)
  const tema: Tema = config.tema === "geral" || config.tema === "ambos" ? config.tema : "biblia"
  const doTemaIds = categoriasDoTema(tema)
  const categorias = config.categorias.filter((c) => doTemaIds.includes(c))
  const estilos = ESTILOS.filter((e) => (config.estilos ?? []).includes(e))
  return {
    ...config,
    nomes,
    segundos: SEGUNDOS.includes(config.segundos as (typeof SEGUNDOS)[number]) ? config.segundos : 60,
    perguntas: SEGUNDOS_PERGUNTAS.includes(config.perguntas as (typeof SEGUNDOS_PERGUNTAS)[number]) ? config.perguntas : 180,
    letras: SEGUNDOS_LETRAS.includes(config.letras as (typeof SEGUNDOS_LETRAS)[number]) ? config.letras : 60,
    casas: TRILHAS.some((t) => t.casas === config.casas) ? config.casas : 25,
    categorias: categorias.length ? categorias : doTemaIds,
    tema,
    estilos: estilos.length ? estilos : ["mimica", "perguntas", "letras"],
  }
}

function novaRodada(state: ShowState, liderId: string, todos: boolean): Rodada {
  const { estilos } = state.config
  return { lider: liderId, todos, estilo: estilos.length === 1 ? estilos[0] : null, passos: null }
}

function sortearCarta(state: ShowState, categoria: CategoriaId, r: number, evitar?: string): { id: string; usadas: string[] } {
  // No nível Fácil, as cartas difíceis ficam de fora.
  const facil = nivelDe(state.config)?.id === "facil"
  const tema = state.config.tema ?? "biblia"
  const vale = (c: (typeof CARTAS)[number]) => c.id !== evitar && doTema(c, tema) && !(facil && c.dificil)
  // A categoria sem cartas no tema (não deveria acontecer): qualquer carta do tema.
  const daCategoria = CARTAS.filter((c) => c.categoria === categoria && vale(c))
  const doMonte = daCategoria.length ? daCategoria : CARTAS.filter(vale)
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
  // Só brincar: acertaram e pronto (ninguém anda).
  if (state.config.modo === "livre") return { ...state, relogio: null, ultima: { tipo: "acerto", cartaId: state.carta!.id, moveu: [] }, pendentes: [], fase: "resultado" }
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

/**
 * Letras: a vez passa para a equipe seguinte, que começa com o tempo cheio ao tocar em Valendo.
 * Só brincar: não há seguinte; a carta acaba e a palavra aparece.
 */
const vezSeguinte = (state: ShowState, errou = false): ShowState =>
  state.config.modo === "livre"
    ? { ...state, fase: "resultado", relogio: null, ultima: { tipo: errou ? "errou" : "tempo", cartaId: state.carta!.id, moveu: [] } }
    : {
        ...state,
        carta: { ...state.carta!, tentativa: state.carta!.tentativa + 1, arriscando: false, comecou: false },
        relogio: { restante: tempoLetras(state.config) },
      }

/** Passa a vez: "o sol parou" joga de novo; quem está no exílio pula uma vez. */
function passarVez(state: ShowState): ShowState {
  const n = state.lados.length
  let lados = state.lados
  const denovo = lados.findIndex((l) => l.id === state.denovo && !l.fora)
  let vez = denovo >= 0 ? denovo : (state.vez + 1) % n
  // Pula quem saiu da partida e quem está no exílio (o exílio vale uma vez só).
  for (let i = 0; i < 2 * n && (lados[vez].fora || lados[vez].exilio); i++) {
    const pula = vez
    if (!lados[pula].fora) lados = lados.map((l, j) => (j === pula ? { ...l, exilio: false } : l))
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
      if (!escolheOutro(efeito) || !alvo || alvo === p.lado || !ladoPorId(state, alvo) || ladoPorId(state, alvo)!.fora) return state
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
      if (state.fase !== "vez" || !state.rodada?.estilo || state.rodada.passos || state.config.modo === "livre") return state
      return { ...state, rodada: { ...state.rodada, passos: PASSOS[Math.min(PASSOS.length - 1, Math.floor(a.r * PASSOS.length))] } }
    case "sortear": {
      const rodada = state.rodada
      // Só brincar: sem dado (a carta não vale casas).
      if (state.fase !== "vez" || !rodada?.estilo || (!rodada.passos && state.config.modo !== "livre")) return state
      // Categoria da casa em que o líder está; na partida e nas casas especiais, sorteada.
      const casa = casaDe(state, lider(state))
      const cats = state.config.categorias
      // Perguntas (fora do Fácil): a categoria é sorteada e fica em segredo, para não dar dica a quem adivinha.
      const daCasa = casa?.tipo === "categoria" && (rodada.estilo !== "perguntas" || nivelDe(state.config)?.id === "facil")
      const categoria = daCasa && casa?.tipo === "categoria" ? casa.categoria : cats[Math.min(cats.length - 1, Math.floor(a.r2 * cats.length))]
      const { id, usadas } = sortearCarta(state, categoria, a.r1)
      // Letras: ninguém vê a carta; a palavra aparece escondida para todos.
      if (rodada.estilo === "letras")
        return { ...state, fase: "letras", carta: { id, estilo: "letras", todos: rodada.todos, trocou: false, tentativa: 0, letras: [], comecou: false }, relogio: { restante: tempoLetras(state.config) }, usadas }
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
        if (!state.carta || state.carta.comecou || state.relogio?.prazo) return state
        const ms = state.relogio?.restante ?? tempoLetras(state.config)
        return { ...state, carta: { ...state.carta, comecou: true }, relogio: { prazo: a.agora + ms, restante: ms } }
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
      if (state.fase === "letras" && !state.carta?.comecou) return state
      return { ...state, relogio: { prazo: a.agora + state.relogio.restante, restante: state.relogio.restante } }
    case "acertaram": {
      if (state.fase !== "tempo" || !state.carta) return state
      if (state.config.modo === "livre") return avancar(state, [])
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
      if (state.fase !== "quem" || !state.carta || !ladoPorId(state, a.por) || ladoPorId(state, a.por)!.fora) return state
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
      const com: ShowState = { ...state, carta: { ...c, letras } }
      if (painel(palavra, letras).every((x) => x.aberta)) return avancar(com, [tentando(state).id])
      // A vez continua com a mesma equipe: letra certa dá 10 s; errada tira 5 s.
      const prazo = state.relogio.prazo + (tem ? LETRA_CERTA_MS : -LETRA_ERRADA_MS)
      if (prazo <= a.agora) return vezSeguinte(com)
      return { ...com, relogio: { prazo, restante: prazo - a.agora } }
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
      // Errou a palavra: a vez passa.
      return vezSeguinte(state, true)
    }
    case "passar":
      // Letras: acabou o tempo da equipe; a vez passa.
      if (state.fase !== "letras" || !state.carta || state.carta.arriscando) return state
      if (a.prazo !== undefined && state.relogio?.prazo !== a.prazo) return state
      return vezSeguinte(state)
    case "errou":
      if (a.prazo !== undefined && state.relogio?.prazo !== a.prazo) return state
      if (state.fase === "letras" && state.carta) return { ...state, fase: "resultado", relogio: null, ultima: { tipo: "tempo", cartaId: state.carta.id, moveu: [] } }
      if ((state.fase !== "tempo" && state.fase !== "quem") || !state.carta) return state
      // Perguntas em equipes: a equipe seguinte tenta, com menos tempo, até todas terem tentado.
      if (state.carta.estilo === "perguntas" && !state.carta.todos && state.config.modo === "equipes" && state.carta.tentativa + 1 < emJogo(state).length)
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
    case "sair":
      return sair(state, a.id)
    case "voltou":
      return voltou(state, a.id)
  }
}

/** Depois de alguém sair ou voltar, a tentativa que aponta para o mesmo lado que antes. */
function mesmaTentativa(depois: ShowState, alvo: string, ordem: number[]): ShowState {
  const c = depois.carta
  if (!c) return depois
  for (const d of ordem) if (tentandoCom(depois, c.tentativa + d).id === alvo) return { ...depois, carta: { ...c, tentativa: c.tentativa + d } }
  return depois
}

const EM_VEZ: Fase[] = ["vez", "carta", "tempo", "letras", "quem", "passa"]

/** Sai da partida, que continua com quem ficou (pelo menos 2). */
function sair(state: ShowState, id: string): ShowState {
  const lado = ladoPorId(state, id)
  if (!lado || lado.fora || state.fase === "config" || state.fase === "fim" || emJogo(state).length <= 2) return state
  const antes = state.carta && EM_VEZ.includes(state.fase) ? tentando(state).id : null
  const conduzia = state.fase === "situacao" ? state.pendentes[0]?.lado === id : lider(state).id === id
  const next: ShowState = {
    ...state,
    lados: state.lados.map((l) => (l.id === id ? { ...l, fora: true, exilio: false } : l)),
    pendentes: state.pendentes.filter((p) => p.lado !== id),
    denovo: state.denovo === id ? null : state.denovo,
  }
  // Letras: se quem saiu é quem começou a vez, a rodada segue com quem está tentando (ou com o seguinte).
  if (state.fase === "letras" && next.carta && lider(state).id === id) {
    const seguinte = antes !== id ? antes! : tentandoCom(state, state.carta!.tentativa + 1).id
    const segue: ShowState = { ...next, rodada: { ...next.rodada!, lider: seguinte }, carta: { ...next.carta, tentativa: 0 } }
    return antes !== id ? segue : { ...segue, carta: { ...segue.carta!, arriscando: false, comecou: false }, relogio: { restante: tempoLetras(state.config) } }
  }
  // Saiu quem conduzia: a vez acaba (as casas especiais dos outros ainda valem).
  if (conduzia) return next.pendentes.length && (state.fase === "resultado" || state.fase === "situacao") ? { ...next, fase: "situacao" } : passarVez(next)
  if (!antes || !next.carta) return next
  if (antes !== id) return mesmaTentativa(next, antes, [0, -1, 1])
  // Saiu quem estava tentando: a vez passa para o seguinte, do começo.
  if (state.fase === "letras") return { ...next, carta: { ...next.carta, arriscando: false, comecou: false }, relogio: { restante: tempoLetras(state.config) } }
  if ((state.fase === "tempo" || state.fase === "passa") && next.carta.tentativa >= emJogo(next).length)
    return { ...next, fase: "resultado", relogio: null, ultima: { tipo: "tempo", cartaId: next.carta.id, moveu: [] } }
  if (state.fase === "tempo") return { ...next, fase: "passa", relogio: null }
  return next
}

/** Volta à partida, na mesma casa; não muda quem está tentando agora. */
function voltou(state: ShowState, id: string): ShowState {
  const lado = ladoPorId(state, id)
  if (!lado?.fora || state.fase === "config" || state.fase === "fim") return state
  const antes = state.carta && EM_VEZ.includes(state.fase) ? tentando(state).id : null
  const next: ShowState = { ...state, lados: state.lados.map((l) => (l.id === id ? { ...l, fora: false } : l)) }
  return antes ? mesmaTentativa(next, antes, [0, 1, -1]) : next
}

/** Classificação: mais longe na trilha; no empate, mais acertos. */
export function classificacao(lados: Lado[]): Lado[] {
  return [...lados].sort((a, b) => b.casa - a.casa || b.acertos - a.acertos)
}
