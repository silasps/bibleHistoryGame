import type { GameKind } from "../game-kinds"
import { ref } from "../refs"

// Minijogos das etapas 2 a 11. Cada jogo termina sempre onde o texto termina
// (o desfecho é o relato, não o resultado do jogador) e entrega a relíquia da
// etapa. Os rótulos são paráfrases curtas com a referência (NAA), não citações.
//
// Rodada 4 (briefing de 16/11/2026): todo jogo tem limite de tempo e PONTOS
// (até 1000, o teto da tabela `plays`), para o pódio fazer sentido. Os jogos
// rodam no slide do tópico, enquanto o apresentador fala.

type Ref = ReturnType<typeof ref>

/** Teto de pontos de todo minijogo das etapas 2–11. */
export const GAME_POINTS = 1000
/** Tempo de cada jogo (60–90 s, decisão do autor). */
export const GAME_SECONDS = 75

export interface EtapaRelic {
  id: string
  label: string
  ref: Ref
  /** Nome da imagem em public/art/reliquias/. */
  art: string
}

/** Gesto que a tela "Como jogar" demonstra com o dedinho. */
export type Gesture = "tocar" | "arrastar" | "girar" | "puxar" | "tocar-rapido" | "percorrer"

interface BaseGame {
  id: string
  etapa: number
  /** Item (slide do tópico) em que o jogo roda, enquanto o apresentador fala. */
  itemId: string
  title: string
  instruction: string
  /** Como se ganha ponto (aparece na tela "Como jogar"). */
  scoring: string
  gesture: Gesture
  ref: Ref
  /** Fundo da cena em public/art/cenas/ (com "-celular" para a versão em pé). */
  art: string
  /** Cores do fundo provisório, até chegar a imagem. */
  palette: [string, string, string]
  finale: { label: string; ref: Ref; note?: { label: string; ref: Ref } }
  relic: EtapaRelic
  /** Duração própria, em segundos (sem ela, GAME_SECONDS). */
  seconds?: number
}

/** Arca: animais aos pares entram; objetos de hoje, não (escolha do autor). */
export interface ChooseGame extends BaseGame {
  mechanic: "escolher"
  pairs: number
  animals: string[]
  wrong: string[]
}

/** Estrelas: cada estrela contada revela outras (Gn 15:5). Ganha quem contar mais. */
export interface MultiplyGame extends BaseGame {
  mechanic: "multiplicar"
}

/** Tocar para juntar por rodadas (maná: cada dia tem a sua medida). */
/** Uma sessão do jogo de juntar: o que cai e quanto juntar antes de avançar. */
export interface CollectSession {
  piece: "mana" | "codorniz"
  count: number
  /** Ex.: "Dia 2 · manhã". */
  label: string
}

/**
 * Maná e codornizes (Êx 16): sessões intercaladas (manhã, maná; tarde,
 * codornizes). Quanto mais rápido juntar, mais sessões a pessoa avança no tempo.
 */
export interface CollectGame extends BaseGame {
  mechanic: "juntar"
  sessions: CollectSession[]
  /** Toques além da medida do maná (o que se guardou estragou). */
  overflow?: { label: string; ref: Ref }
  /** Aviso de cada troca de sessão. */
  announce: Record<CollectSession["piece"], { label: string; ref: Ref }>
}

/** Cesto: vedar as frestas, colocar o menino e levar o cesto até a margem. */
export interface CaulkGame extends BaseGame {
  mechanic: "vedar"
  babyHint: string
  riverHint: string
  receiver: string
}

/** Mar: o cajado abre o mar e os grupos atravessam antes do exército. */
export interface SeaGame extends BaseGame {
  mechanic: "abrir-mar"
  staffHint: string
  crossHint: string
  groups: number
  /** Segundos de cada tentativa de travessia. */
  crossSeconds: number
  lose: string
}

/** Jericó: girar o dedo em volta da cidade; no sétimo dia, sete voltas. */
export interface CircleGame extends BaseGame {
  mechanic: "circular"
  /** Voltas por dia (Js 6: um por dia durante seis dias; sete no sétimo). */
  laps: number[]
  finalAction: string
}

export interface SlingGame extends BaseGame {
  mechanic: "funda"
}

/** Altar do Carmelo: pedras, lenha e novilho, água e a oração. */
export interface AltarGame extends BaseGame {
  mechanic: "altar"
  stones: number
  jars: number[]
  steps: { stones: string; wood: string; water: string; pray: string; prayer: { label: string; ref: Ref } }
}

/** Nínive: levar a mensagem de ponto em ponto da cidade. */
export interface AnnounceGame extends BaseGame {
  mechanic: "anunciar"
  message: { label: string; ref: Ref }
  places: { id: string; label: string; x: number; y: number }[]
  king: { label: string; ref: Ref }
}

/** Coração: tocar até a pedra rachar e aparecer o coração de carne. */
export interface BreakGame extends BaseGame {
  mechanic: "quebrar"
  taps: number
}

export type EtapaRoomGame = (ChooseGame | MultiplyGame | CollectGame | CaulkGame | SeaGame | CircleGame | SlingGame | AltarGame | AnnounceGame | BreakGame) & { kind: GameKind }

const relic = (id: string, label: string, r: Ref): EtapaRelic => ({ id, label, ref: r, art: id })

export const ROOM_GAMES: EtapaRoomGame[] = [
  {
    id: "arca", kind: "arca", etapa: 2, itemId: "noe", mechanic: "escolher", gesture: "tocar",
    title: "Para dentro da arca",
    instruction: "Toque nos pares de animais para levá-los à arca. Objetos de hoje não entram!",
    scoring: "+100 por par · −50 por objeto errado · bônus pelo tempo que sobrar",
    ref: ref("Gen", 7, 8, 9),
    art: "arca", palette: ["#cfe0f0", "#5c7e9c", "#1c2a3a"],
    pairs: 7,
    animals: ["🦁", "🐑", "🐘", "🦒", "🐎", "🐪", "🐄", "🐇", "🐻", "🦌", "🐫", "🦓"],
    wrong: ["📱", "🚗", "🎮", "📺", "💻", "🛴", "🎧", "⌚"],
    finale: { label: "O Senhor fecha a porta da arca", ref: ref("Gen", 7, 16) },
    relic: relic("arco-iris", "O arco-íris", ref("Gen", 9, 13)),
  },
  {
    id: "estrelas", kind: "estrelas", etapa: 3, itemId: "alianca-abraamica", mechanic: "multiplicar", gesture: "tocar",
    // Pedido do autor (26/11/2026): o jogo de Abraão dura só 15 segundos.
    seconds: 15,
    title: "Conte as estrelas",
    instruction: "Toque nas estrelas para contá-las: cada uma revela outras",
    scoring: "+1 por estrela contada · ganha quem contar mais",
    ref: ref("Gen", 15, 5),
    art: "estrelas", palette: ["#3a4a8a", "#141c44", "#05070d"],
    finale: { label: "Uma descendência que não se pode contar", ref: ref("Gen", 15, 5) },
    relic: relic("estrela", "Uma posteridade numerosa", ref("Gen", 15, 5)),
  },
  {
    id: "cesto", kind: "cesto", etapa: 4, itemId: "moises", mechanic: "vedar", gesture: "arrastar",
    title: "O cesto no Nilo",
    instruction: "Passe o dedo nas frestas para vedar o cesto com betume",
    babyHint: "Arraste o menino para dentro do cesto",
    riverHint: "A filha do faraó viu o cesto entre os juncos. Busque o cesto para ela",
    receiver: "A filha do faraó",
    scoring: "Cada parte vale pontos · quanto mais rápido, mais bônus",
    ref: ref("Exod", 2, 3),
    art: "nilo", palette: ["#d8e8c0", "#4f8f8a", "#123a3a"],
    finale: { label: "A filha do faraó encontra o menino", ref: ref("Exod", 2, 5, 6) },
    relic: relic("cesto", "O cesto de junco", ref("Exod", 2, 3)),
  },
  {
    id: "mar", kind: "mar", etapa: 5, itemId: "exodo", mechanic: "abrir-mar", gesture: "arrastar",
    title: "O mar se abre",
    instruction: "Arraste o cajado até o mar; depois leve o povo para o outro lado",
    staffHint: "Arraste o cajado de Moisés até o mar",
    crossHint: "Arraste cada grupo para o outro lado antes do exército chegar",
    lose: "O exército alcançou o povo. Tente de novo!",
    scoring: "+60 por grupo · bônus pelo tempo que sobrar · menos pontos a cada nova tentativa",
    groups: 6, crossSeconds: 25,
    ref: ref("Exod", 14, 16, 22),
    art: "mar-aberto", palette: ["#bfe0f5", "#2f6fa0", "#0a1f3a"],
    finale: { label: "O mar volta e cobre o exército; o Senhor livra Israel", ref: ref("Exod", 14, 28, 30) },
    relic: relic("cajado", "O cajado de Moisés", ref("Exod", 14, 16)),
  },
  {
    id: "mana", kind: "mana", etapa: 6, itemId: "peregrinacao", mechanic: "juntar", gesture: "tocar",
    // Pedido do autor (26/11/2026): maná e codornizes intercalados, em sessões, e 30 segundos.
    title: "O maná e as codornizes",
    instruction: "Pela manhã, junte o maná; à tarde, as codornizes",
    scoring: "+20 por porção · −20 se guardar maná demais · quanto mais rápido, mais dias",
    ref: ref("Exod", 16, 13, 18),
    art: "deserto", palette: ["#f5e2b8", "#c9a066", "#3a2a1a"],
    seconds: 30,
    sessions: [1, 2, 3, 4, 5, 6].flatMap((d) => [
      // No sexto dia, o dobro do maná (Êx 16:22).
      { piece: "mana" as const, count: d === 6 ? 6 : 3, label: `Dia ${d} · manhã` },
      { piece: "codorniz" as const, count: 2, label: `Dia ${d} · tarde` },
    ]),
    announce: {
      mana: { label: "Pela manhã, o maná", ref: ref("Exod", 16, 14, 15) },
      codorniz: { label: "À tarde, as codornizes", ref: ref("Exod", 16, 13) },
    },
    overflow: { label: "Guardado para o dia seguinte, estragou", ref: ref("Exod", 16, 20) },
    finale: { label: "No sétimo dia, descanso", ref: ref("Exod", 16, 26) },
    relic: relic("vaso-mana", "O vaso de maná", ref("Exod", 16, 33)),
  },
  {
    id: "jerico", kind: "jerico", etapa: 7, itemId: "conquista-canaa", mechanic: "circular", gesture: "girar",
    title: "As muralhas de Jericó",
    instruction: "Gire o dedo em volta da cidade: cada volta completa conta",
    scoring: "+100 por volta · bônus pelo tempo que sobrar",
    ref: ref("Josh", 6, 3, 4),
    art: "jerico", palette: ["#f0d8a8", "#b08050", "#3a2414"],
    laps: [1, 1, 1, 1, 1, 1, 7], finalAction: "Tocar as trombetas e gritar",
    finale: { label: "As muralhas caem", ref: ref("Josh", 6, 20) },
    relic: relic("trombeta", "A trombeta", ref("Josh", 6, 4, 5)),
  },
  {
    id: "funda", kind: "funda", etapa: 8, itemId: "davi", mechanic: "funda", gesture: "puxar",
    title: "A funda de Davi",
    instruction: "Puxe e solte para lançar a pedra no gigante antes que ele chegue",
    scoring: "Quanto mais longe o acerto, mais pontos · os pontos somam até o tempo acabar",
    ref: ref("1Sam", 17, 40),
    art: "vale-ela", palette: ["#e8d8b0", "#9a8a5a", "#2a2414"],
    finale: {
      label: "Davi vence com uma funda e uma pedra",
      ref: ref("1Sam", 17, 49, 50),
      note: { label: "A batalha é do Senhor", ref: ref("1Sam", 17, 47) },
    },
    relic: relic("funda", "A funda e a pedra", ref("1Sam", 17, 40)),
  },
  {
    id: "altar", kind: "altar", etapa: 9, itemId: "elias", mechanic: "altar", gesture: "arrastar",
    title: "O altar no Carmelo",
    instruction: "Reconstrua o altar, prepare a oferta e derrame a água",
    scoring: "Cada parte vale pontos · peça fora do lugar perde pontos · bônus pelo tempo",
    stones: 12, jars: [4, 4, 4],
    steps: {
      stones: "Arraste as doze pedras para reconstruir o altar",
      wood: "Coloque a lenha e o novilho sobre o altar",
      water: "Derrame a água: quatro talhas, três vezes",
      pray: "Segure para Elias orar",
      prayer: { label: "Elias ora: que todos saibam que o Senhor é Deus em Israel", ref: ref("1Kgs", 18, 36, 37) },
    },
    ref: ref("1Kgs", 18, 30, 35),
    art: "carmelo", palette: ["#e0c8a0", "#8a6a4a", "#2a1a10"],
    finale: { label: "O fogo do Senhor cai e consome tudo", ref: ref("1Kgs", 18, 38) },
    relic: relic("fogo", "O fogo do altar", ref("1Kgs", 18, 38)),
  },
  {
    id: "ninive", kind: "ninive", etapa: 10, itemId: "jonas", mechanic: "anunciar", gesture: "percorrer",
    title: "A mensagem chega a Nínive",
    instruction: "Leve Jonas a cada canto da cidade para anunciar a mensagem",
    scoring: "+80 por lugar alcançado · bônus pelo tempo que sobrar",
    message: { label: "Daqui a quarenta dias, Nínive será destruída", ref: ref("Jonah", 3, 4) },
    places: [
      { id: "porta", label: "A porta da cidade", x: 16, y: 82 },
      { id: "mercado", label: "O mercado", x: 34, y: 60 },
      { id: "casas", label: "As casas", x: 70, y: 72 },
      { id: "praca", label: "A praça", x: 22, y: 36 },
      { id: "torres", label: "As muralhas", x: 78, y: 42 },
      { id: "palacio", label: "O palácio do rei", x: 50, y: 16 },
    ],
    king: { label: "O rei se veste de pano de saco e manda todos se voltarem para Deus", ref: ref("Jonah", 3, 6, 9) },
    ref: ref("Jonah", 3, 4, 5),
    art: "ninive", palette: ["#f0d8b0", "#a07850", "#2a1a10"],
    finale: { label: "Nínive se arrepende, e Deus tem compaixão", ref: ref("Jonah", 3, 10) },
    relic: relic("planta-jonas", "A planta de Jonas", ref("Jonah", 4, 6, 11)),
  },
  {
    id: "coracao", kind: "coracao", etapa: 11, itemId: "ezequiel", mechanic: "quebrar", gesture: "tocar-rapido",
    title: "Um coração novo",
    instruction: "Toque no coração de pedra até ele se quebrar",
    scoring: "Quanto mais rápido quebrar, mais pontos",
    taps: 36,
    ref: ref("Ezek", 36, 26),
    art: "coracao", palette: ["#ffd8c8", "#c0504a", "#3a1414"],
    finale: { label: "Deus dá um coração novo", ref: ref("Ezek", 36, 26) },
    relic: relic("coracao-novo", "O coração novo", ref("Ezek", 36, 26)),
  },
]

/** Quanto dura o jogo, em segundos. */
export function gameSecondsOf(game: Pick<BaseGame, "seconds"> | undefined): number {
  return game?.seconds ?? GAME_SECONDS
}

export function getRoomGame(id: string): EtapaRoomGame | undefined {
  return ROOM_GAMES.find((g) => g.id === id)
}

/** Maior pontuação que o celular envia: todo jogo das etapas 2–11 vai até 1000 pontos. */
export function gameMax(game: EtapaRoomGame): number {
  return game ? GAME_POINTS : 0
}
