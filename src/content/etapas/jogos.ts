import type { GameKind } from "../game-kinds"
import { ref } from "../refs"

// Minijogos das etapas 2 a 11. Cada jogo termina sempre onde o texto termina
// (o desfecho é o relato, não o resultado do jogador) e entrega a relíquia da
// etapa. Os rótulos são paráfrases curtas com a referência (NAA), não citações.

type Ref = ReturnType<typeof ref>

export interface EtapaRelic {
  id: string
  label: string
  ref: Ref
  /** Nome da imagem em public/art/reliquias/. */
  art: string
}

interface BaseGame {
  id: string
  etapa: number
  afterItemId: string
  title: string
  instruction: string
  ref: Ref
  /** Fundo da cena em public/art/cenas/ (com "-celular" para a versão em pé). */
  art: string
  /** Cores do fundo provisório, até chegar a imagem. */
  palette: [string, string, string]
  finale: { label: string; ref: Ref }
  relic: EtapaRelic
}

/** Tocar para juntar: cada rodada tem uma meta (ex.: dias do maná). */
export interface CollectGame extends BaseGame {
  mechanic: "juntar"
  rounds: number[]
  roundLabel?: string
  /** Desenho de cada peça: emoji ou um dos desenhos do app. */
  pieces: string[]
  /** "surgir": aparecem pela tela; "cair": caem do alto. */
  spawn: "surgir" | "cair"
  /** Toques além da meta da rodada (ex.: maná guardado demais). */
  overflow?: { label: string; ref: Ref }
}

export interface HoldGame extends BaseGame {
  mechanic: "segurar"
  seconds: number
}

export interface RhythmGame extends BaseGame {
  mechanic: "ritmo"
  /** Voltas por dia (Js 6: um por dia durante seis dias; sete no sétimo). */
  laps: number[]
  finalAction: string
}

/** Vedar e entregar: passar betume nas frestas do cesto e depois levá-lo até alguém. */
export interface CaulkGame extends BaseGame {
  mechanic: "vedar"
  /** Instrução da segunda parte (o cesto já no rio). */
  riverHint: string
  /** Quem recebe o cesto na margem. */
  receiver: string
}

export interface SlingGame extends BaseGame {
  mechanic: "funda"
  target: string
}

export interface ScratchGame extends BaseGame {
  mechanic: "raspar"
  /** Camada a raspar: escuro da noite ou pedra. */
  cover: "escuro" | "pedra"
}

export type EtapaRoomGame = (CollectGame | HoldGame | RhythmGame | SlingGame | ScratchGame | CaulkGame) & { kind: GameKind }

const relic = (id: string, label: string, r: Ref): EtapaRelic => ({ id, label, ref: r, art: id })

export const ROOM_GAMES: EtapaRoomGame[] = [
  {
    id: "arca", kind: "arca", etapa: 2, afterItemId: "diluvio", mechanic: "juntar",
    title: "Para dentro da arca",
    instruction: "Toque nos animais para levá-los à arca, de dois em dois",
    ref: ref("Gen", 7, 8, 9),
    art: "arca", palette: ["#cfe0f0", "#5c7e9c", "#1c2a3a"],
    rounds: [7], pieces: ["🦁", "🐑", "🐘", "🦒", "🐎", "🐪", "🐄", "🐇", "🐻", "🦌"], spawn: "surgir",
    finale: { label: "O Senhor fecha a porta da arca", ref: ref("Gen", 7, 16) },
    relic: relic("arco-iris", "O arco-íris", ref("Gen", 9, 13)),
  },
  {
    id: "estrelas", kind: "estrelas", etapa: 3, afterItemId: "alianca-abraamica", mechanic: "juntar",
    title: "Conte as estrelas",
    instruction: "Toque nas estrelas para contá-las",
    ref: ref("Gen", 15, 5),
    art: "estrelas", palette: ["#3a4a8a", "#141c44", "#05070d"],
    rounds: [30], pieces: ["estrela"], spawn: "surgir",
    finale: { label: "Uma descendência que não se pode contar", ref: ref("Gen", 15, 5) },
    relic: relic("estrela", "Uma posteridade numerosa", ref("Gen", 15, 5)),
  },
  {
    id: "cesto", kind: "cesto", etapa: 4, afterItemId: "moises", mechanic: "vedar",
    title: "O cesto no Nilo",
    instruction: "Passe o dedo nas frestas para vedar o cesto com betume",
    riverHint: "A filha do faraó viu o cesto entre os juncos. Busque o cesto para ela",
    receiver: "A filha do faraó",
    ref: ref("Exod", 2, 3),
    art: "nilo", palette: ["#d8e8c0", "#4f8f8a", "#123a3a"],
    finale: { label: "A filha do faraó encontra o menino", ref: ref("Exod", 2, 5, 6) },
    relic: relic("cesto", "O cesto de junco", ref("Exod", 2, 3)),
  },
  {
    id: "mar", kind: "mar", etapa: 5, afterItemId: "exodo", mechanic: "segurar",
    title: "O mar se abre",
    instruction: "Segure para o vento oriental soprar",
    ref: ref("Exod", 14, 21),
    art: "mar-aberto", palette: ["#bfe0f5", "#2f6fa0", "#0a1f3a"],
    seconds: 6,
    finale: { label: "O povo atravessa em terra seca", ref: ref("Exod", 14, 22) },
    relic: relic("cajado", "O cajado de Moisés", ref("Exod", 14, 16)),
  },
  {
    id: "mana", kind: "mana", etapa: 6, afterItemId: "peregrinacao", mechanic: "juntar",
    title: "O maná de cada dia",
    instruction: "Junte o maná da manhã: só o necessário para o dia",
    ref: ref("Exod", 16, 16, 18),
    art: "deserto", palette: ["#f5e2b8", "#c9a066", "#3a2a1a"],
    rounds: [5, 5, 5, 5, 5, 10], roundLabel: "Dia", pieces: ["mana"], spawn: "cair",
    overflow: { label: "Guardado para o dia seguinte, estragou", ref: ref("Exod", 16, 20) },
    finale: { label: "No sétimo dia, descanso", ref: ref("Exod", 16, 26) },
    relic: relic("vaso-mana", "O vaso de maná", ref("Exod", 16, 33)),
  },
  {
    id: "jerico", kind: "jerico", etapa: 7, afterItemId: "conquista-canaa", mechanic: "ritmo",
    title: "As muralhas de Jericó",
    instruction: "Toque no ritmo: cada toque é uma volta ao redor da cidade",
    ref: ref("Josh", 6, 3, 4),
    art: "jerico", palette: ["#f0d8a8", "#b08050", "#3a2414"],
    laps: [1, 1, 1, 1, 1, 1, 7], finalAction: "Tocar as trombetas e gritar",
    finale: { label: "As muralhas caem", ref: ref("Josh", 6, 20) },
    relic: relic("trombeta", "A trombeta", ref("Josh", 6, 4, 5)),
  },
  {
    id: "funda", kind: "funda", etapa: 8, afterItemId: "davi-ungido", mechanic: "funda",
    title: "A funda de Davi",
    instruction: "Puxe e solte a funda",
    ref: ref("1Sam", 17, 40),
    art: "vale-ela", palette: ["#e8d8b0", "#9a8a5a", "#2a2414"],
    target: "golias",
    finale: { label: "Davi vence com uma funda e uma pedra", ref: ref("1Sam", 17, 49, 50) },
    relic: relic("funda", "A funda e a pedra", ref("1Sam", 17, 40)),
  },
  {
    id: "altar", kind: "altar", etapa: 9, afterItemId: "elias", mechanic: "juntar",
    title: "O altar no Carmelo",
    instruction: "Despeje a água sobre o altar: quatro talhas, três vezes",
    ref: ref("1Kgs", 18, 33, 35),
    art: "carmelo", palette: ["#e0c8a0", "#8a6a4a", "#2a1a10"],
    rounds: [4, 4, 4], roundLabel: "Vez", pieces: ["🏺"], spawn: "surgir",
    finale: { label: "O fogo do Senhor cai e consome tudo", ref: ref("1Kgs", 18, 38) },
    relic: relic("fogo", "O fogo do altar", ref("1Kgs", 18, 38)),
  },
  {
    id: "ninive", kind: "ninive", etapa: 10, afterItemId: "jonas", mechanic: "raspar",
    title: "A mensagem chega a Nínive",
    instruction: "Deslize para levar a mensagem por toda a cidade",
    ref: ref("Jonah", 3, 4, 5),
    art: "ninive", palette: ["#f0d8b0", "#a07850", "#2a1a10"],
    cover: "escuro",
    finale: { label: "Nínive se arrepende, e Deus tem compaixão", ref: ref("Jonah", 3, 10) },
    relic: relic("planta-jonas", "A planta de Jonas", ref("Jonah", 4, 6, 11)),
  },
  {
    id: "coracao", kind: "coracao", etapa: 11, afterItemId: "ezequiel", mechanic: "raspar",
    title: "Um coração novo",
    instruction: "Deslize para tirar o coração de pedra",
    ref: ref("Ezek", 36, 26),
    art: "coracao", palette: ["#ffd8c8", "#c0504a", "#3a1414"],
    cover: "pedra",
    finale: { label: "Deus dá um coração novo", ref: ref("Ezek", 36, 26) },
    relic: relic("coracao-novo", "O coração novo", ref("Ezek", 36, 26)),
  },
]

export function getRoomGame(id: string): EtapaRoomGame | undefined {
  return ROOM_GAMES.find((g) => g.id === id)
}

/** Maior valor que o celular envia em cada jogo (contagem ou porcentagem). */
export function gameMax(g: EtapaRoomGame): number {
  switch (g.mechanic) {
    case "juntar":
      return g.rounds.length > 1 ? g.rounds.length : g.rounds[0]
    case "ritmo":
      return g.laps.reduce((a, b) => a + b, 0)
    case "funda":
      return 1
    default:
      return 100
  }
}
