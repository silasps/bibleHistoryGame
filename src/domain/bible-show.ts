import { CARTAS, CATEGORIA_IDS, type CategoriaId } from "@/content/bible-show/cartas"

// Bible Show: mímica, desenho e perguntas em grupo, num aparelho só que passa de mão em
// mão. Sem tabuleiro físico: a trilha fica na tela. Lógica pura (o relógio e
// o sorteio entram pelas ações), para testar e salvar no aparelho.

export type Modo = "equipes" | "individual"
export type Estilo = "mimica" | "desenho" | "perguntas"
export const ESTILOS: Estilo[] = ["mimica", "desenho", "perguntas"]

export interface Lado {
  id: string
  nome: string
  cor: string
  /** Casa em que está (0 = partida). */
  casa: number
  acertos: number
}

export interface Config {
  modo: Modo
  nomes: string[]
  segundos: number
  casas: number
  /** Jeitos de jogar ligados; com mais de um, cada vez sorteia. */
  estilos: Estilo[]
  categorias: CategoriaId[]
}

/** Casa da trilha: uma categoria ou a rodada de todos (só em equipes). */
export type Casa = { tipo: "categoria"; categoria: CategoriaId } | { tipo: "todos" }

/** "passa": em Perguntas, a vez de tentar passou para a equipe seguinte. */
export type Fase = "config" | "vez" | "carta" | "tempo" | "quem" | "passa" | "resultado" | "fim"

export interface ShowState {
  v: 2
  fase: Fase
  config: Config
  lados: Lado[]
  vez: number
  /** `tentativa`: em Perguntas, quantas equipes já tentaram e erraram. */
  carta: { id: string; estilo: Estilo; todos: boolean; trocou: boolean; tentativa: number } | null
  usadas: string[]
  /** Cronômetro: prazo absoluto quando corre; `restante` quando pausado. */
  relogio: { prazo?: number; restante: number } | null
  ultima: { tipo: "acerto" | "tempo"; cartaId: string; moveu: { id: string; de: number; para: number }[] } | null
  vencedor: string | null
}

export type ShowAction =
  | { type: "comecar"; config: Config }
  | { type: "sortear"; r1: number; r2: number }
  | { type: "trocar"; r: number }
  | { type: "valendo"; agora: number }
  | { type: "pausar"; agora: number }
  | { type: "continuar"; agora: number }
  /** "Acertaram!": em equipes vale direto; nos outros casos pergunta quem acertou. */
  | { type: "acertaram"; agora: number }
  /** Quem acertou (pessoa, no individual; equipe, na rodada de todos). */
  | { type: "acertou"; por: string }
  | { type: "voltar"; agora: number }
  | { type: "errou" }
  | { type: "proxima" }
  | { type: "revanche" }
  | { type: "configurar" }

export const CORES = ["#d8a948", "#5fb3c9", "#e0736b", "#8fbf6a", "#b18ad8", "#e89a4f", "#e7c6a0", "#6fd1b0", "#f08fb5", "#9aa7ff", "#c9d36b", "#ff9f80"]
export const LIMITES = { equipes: { min: 2, max: 4 }, individual: { min: 2, max: 12 } } as const
export const SEGUNDOS = [30, 45, 60, 90] as const
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
  estilos: ["mimica", "desenho"],
  categorias: [...CATEGORIA_IDS],
}

export const estadoInicial: ShowState = {
  v: 2,
  fase: "config",
  config: configPadrao,
  lados: [],
  vez: 0,
  carta: null,
  usadas: [],
  relogio: null,
  ultima: null,
  vencedor: null,
}

/** Casas 1..N. Em equipes, a cada 5 casas há uma rodada de todos (de mímica ou desenho). */
export function montarTrilha(config: Pick<Config, "casas" | "categorias" | "modo"> & { estilos?: Estilo[] }): Casa[] {
  const cats = config.categorias.length ? config.categorias : [...CATEGORIA_IDS]
  const representa = !config.estilos || config.estilos.some((e) => e !== "perguntas")
  const trilha: Casa[] = []
  let k = 0
  for (let i = 1; i <= config.casas; i++) {
    if (config.modo === "equipes" && representa && i % 5 === 0 && i < config.casas) trilha.push({ tipo: "todos" })
    else trilha.push({ tipo: "categoria", categoria: cats[k++ % cats.length] })
  }
  return trilha
}

/** A casa que o lado da vez tenta alcançar (a seguinte à sua). */
export function proximaCasa(state: ShowState, lado = state.lados[state.vez]): Casa | undefined {
  if (!lado) return undefined
  return montarTrilha(state.config)[Math.min(lado.casa, state.config.casas - 1)]
}

/** Quem tenta agora: em Perguntas, cada erro passa a vez à equipe seguinte. */
export function tentando(state: ShowState): Lado {
  return state.lados[(state.vez + (state.carta?.tentativa ?? 0)) % state.lados.length]
}

/** Segundos da tentativa: o tempo cheio e, a cada equipe seguinte, a metade (mínimo 10). */
export function segundosDaVez(state: ShowState): number {
  const k = state.carta?.tentativa ?? 0
  return k === 0 ? state.config.segundos : Math.max(10, Math.round(state.config.segundos / 2 ** k))
}

const valeCasas = (cartaId: string) => (CARTAS.find((c) => c.id === cartaId)?.categoria === "desafio" ? 2 : 1)

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
    estilos: estilos.length ? estilos : ["mimica", "desenho"],
  }
}

function sortearCarta(state: ShowState, categoria: CategoriaId | null, r: number, evitar?: string): { id: string; usadas: string[] } {
  const cats = categoria ? [categoria] : state.config.categorias
  const doMonte = CARTAS.filter((c) => cats.includes(c.categoria) && c.id !== evitar)
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

function avancar(state: ShowState, ids: string[], passos: number): ShowState {
  const moveu: { id: string; de: number; para: number }[] = []
  const lados = state.lados.map((l) => {
    if (!ids.includes(l.id)) return l
    const para = Math.min(state.config.casas, l.casa + passos)
    moveu.push({ id: l.id, de: l.casa, para })
    return { ...l, casa: para, acertos: l.acertos + 1 }
  })
  // Chegou ao fim: vence quem foi mais longe (no empate, quem fez mais acertos).
  const chegou = lados.filter((l) => l.casa >= state.config.casas)
  const vencedor = chegou.sort((a, b) => b.acertos - a.acertos)[0]?.id ?? null
  return { ...state, lados, relogio: null, ultima: { tipo: "acerto", cartaId: state.carta!.id, moveu }, fase: vencedor ? "fim" : "resultado", vencedor }
}

export function reduceShow(state: ShowState, a: ShowAction): ShowState {
  switch (a.type) {
    case "comecar": {
      const config = limpar(a.config)
      const lados = config.nomes.map((nome, i) => ({ id: `l${i + 1}`, nome, cor: CORES[i % CORES.length], casa: 0, acertos: 0 }))
      return { ...estadoInicial, fase: "vez", config, lados }
    }
    case "sortear": {
      if (state.fase !== "vez") return state
      const casa = proximaCasa(state)
      const todos = casa?.tipo === "todos"
      const { id, usadas } = sortearCarta(state, casa?.tipo === "categoria" ? casa.categoria : null, a.r1)
      // A rodada de todos é sempre de representar (mímica ou desenho).
      const ligados = todos ? state.config.estilos.filter((e) => e !== "perguntas") : state.config.estilos
      const lista: Estilo[] = ligados.length ? ligados : ["mimica"]
      const estilo = lista[Math.min(lista.length - 1, Math.floor(a.r2 * lista.length))]
      return { ...state, fase: "carta", carta: { id, estilo, todos, trocou: false, tentativa: 0 }, usadas }
    }
    case "trocar": {
      if (state.fase !== "carta" || !state.carta || state.carta.trocou) return state
      const atual = CARTAS.find((c) => c.id === state.carta!.id)!
      const { id, usadas } = sortearCarta(state, atual.categoria, a.r, atual.id)
      return { ...state, carta: { ...state.carta, id, trocou: true }, usadas }
    }
    case "valendo": {
      if (state.fase !== "carta" && state.fase !== "passa") return state
      const ms = segundosDaVez(state) * 1000
      return { ...state, fase: "tempo", relogio: { prazo: a.agora + ms, restante: ms } }
    }
    case "pausar":
      if (state.fase !== "tempo" || !state.relogio?.prazo) return state
      return { ...state, relogio: { restante: Math.max(0, state.relogio.prazo - a.agora) } }
    case "continuar":
      if (state.fase !== "tempo" || !state.relogio || state.relogio.prazo) return state
      return { ...state, relogio: { prazo: a.agora + state.relogio.restante, restante: state.relogio.restante } }
    case "acertaram": {
      if (state.fase !== "tempo" || !state.carta) return state
      // Perguntas: quem estava perguntando acertou e anda (sozinho ou com a equipe).
      if (state.carta.estilo === "perguntas") return avancar(state, [tentando(state).id], valeCasas(state.carta.id))
      // Equipe da vez acertou a própria carta: avança direto.
      if (state.config.modo === "equipes" && !state.carta.todos) return avancar(state, [state.lados[state.vez].id], valeCasas(state.carta.id))
      const restante = state.relogio?.prazo ? Math.max(0, state.relogio.prazo - a.agora) : (state.relogio?.restante ?? 0)
      return { ...state, fase: "quem", relogio: { restante } }
    }
    case "voltar":
      if (state.fase !== "quem" || !state.relogio) return state
      return { ...state, fase: "tempo", relogio: { prazo: a.agora + state.relogio.restante, restante: state.relogio.restante } }
    case "acertou": {
      if (state.fase !== "quem" || !state.carta) return state
      const ator = state.lados[state.vez].id
      if (!state.lados.some((l) => l.id === a.por)) return state
      // Individual: quem fez a mímica e quem acertou andam juntos. Rodada de todos: só a equipe que acertou primeiro.
      if (state.config.modo === "individual") {
        if (a.por === ator) return state
        return avancar(state, [ator, a.por], valeCasas(state.carta.id))
      }
      return avancar(state, [a.por], valeCasas(state.carta.id))
    }
    case "errou":
      if ((state.fase !== "tempo" && state.fase !== "quem") || !state.carta) return state
      // Perguntas em equipes: a equipe seguinte tenta, com menos tempo, até todas terem tentado.
      if (state.carta.estilo === "perguntas" && state.config.modo === "equipes" && state.carta.tentativa + 1 < state.lados.length)
        return { ...state, fase: "passa", relogio: null, carta: { ...state.carta, tentativa: state.carta.tentativa + 1 } }
      return { ...state, fase: "resultado", relogio: null, ultima: { tipo: "tempo", cartaId: state.carta.id, moveu: [] } }
    case "proxima":
      if (state.fase !== "resultado") return state
      return { ...state, fase: "vez", vez: (state.vez + 1) % state.lados.length, carta: null, ultima: null }
    case "revanche":
      return reduceShow(state, { type: "comecar", config: state.config })
    case "configurar":
      return { ...estadoInicial, config: state.config }
  }
}

/** Classificação: mais longe na trilha; no empate, mais acertos. */
export function classificacao(lados: Lado[]): Lado[] {
  return [...lados].sort((a, b) => b.casa - a.casa || b.acertos - a.acertos)
}
