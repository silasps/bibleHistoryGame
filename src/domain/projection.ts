import { formatRef } from "@/content/refs"
import type {
  ConnectionType,
  ContentBlock,
  Evidence,
  FxCue,
  ReleasedSynthesis,
  SceneType,
  VisualId,
} from "@/content/schema"
import { tally, type PollStatus, type TallyRow } from "./poll"
import type { CueKind, MomentKind, SessionNarrative, SessionState } from "./session"

// View-models das superfícies públicas. Os tipos não têm campos editoriais
// privados: telão e celular só conseguem renderizar o que está aqui.

export interface PollView {
  id: string
  question: string
  options: { id: string; label: string }[]
  status: PollStatus
  resultsVisible: boolean
  totalVotes: number
  results?: TallyRow[]
  correctOptionId?: string
  afterResult?: string
}

/** Cena da visão geral no telão/celular: só dados públicos do material do autor. */
export interface OverviewView {
  role: "abertura" | "item" | "versiculo" | "pista" | "reflexao" | "conclusao"
  week?: number
  itemId?: string
  slotId?: string
  stageLine?: string
  /** Linhas de "profundidade" já mostradas pelo apresentador. */
  depth: string[]
  /** Itens da semana já visitados (a linha do tempo vai se revelando). */
  revealedItemIds: string[]
  /** Objeto da skin em destaque (id dentro da ficha do personagem do item). */
  spotlightSkinId?: string
}

export interface ProjectorView {
  roomCode: string
  status: SessionState["status"]
  paused: boolean
  moment: { kind: MomentKind; startedAt: number } | null
  participantCount: number
  lightsCount: number
  scene: null | {
    id: string
    type: SceneType
    title?: string
    caption?: string
    visual: VisualId
    fxCue?: FxCue
    illumination: number
    poll?: PollView
    /** Selo de uma cena evidence_unlock: aberto ou fechado. */
    seal?: "fechado" | "aberto"
    /** Só a referência, depois da liberação. Nunca a explicação. */
    releasedRefs?: string[]
    /** Passos já revelados pelo apresentador (ex.: candidatos). */
    steps?: { id: string; label: string; text: string; value?: number }[]
    totalSteps?: number
    cue: { kind: CueKind; at: number } | null
    overview?: OverviewView
  }
}

export interface ClueView {
  evidenceId: string
  status: "selada" | "aberta" | "futura"
  /** Antes da liberação o título é genérico, para não antecipar a conexão. */
  title: string
  lockedHint: string
  refs?: string[]
  synthesis?: ContentBlock[]
  classification?: { primary: ConnectionType; secondary: ConnectionType[]; note: string }
}

export interface AudienceView {
  roomCode: string
  status: SessionState["status"]
  paused: boolean
  moment: { kind: MomentKind; startedAt: number; myOrder: number; total: number } | null
  me: { id: string; nickname?: string; lit: boolean } | null
  scene: null | {
    id: string
    type: SceneType
    title?: string
    prompt?: string
    poll?: PollView & { myVote?: string }
    overview?: OverviewView
  }
  clues: ClueView[]
}

type EvidenceLookup = (id: string) => Evidence | undefined

function overviewView(state: SessionState, narrative: SessionNarrative): OverviewView | undefined {
  const scene = narrative.scenes[state.index]
  const o = scene?.overview
  if (!o) return undefined
  const revealedItemIds = narrative.scenes
    .slice(0, state.index + 1)
    .flatMap((s) => (s.overview?.role === "item" && s.overview.week === o.week && s.overview.itemId ? [s.overview.itemId] : []))
  return {
    role: o.role,
    week: o.week,
    itemId: o.itemId,
    slotId: o.slotId,
    stageLine: o.stageLine,
    depth: (scene.steps ?? []).slice(0, state.step).map((st) => st.text),
    revealedItemIds,
    spotlightSkinId: state.spotlight ?? undefined,
  }
}

function pollView(state: SessionState, narrative: SessionNarrative, sceneIndex: number): PollView | undefined {
  const def = narrative.scenes[sceneIndex]?.poll
  if (!def) return undefined
  const poll = state.polls[def.id]
  const status = poll?.status ?? "idle"
  const resultsVisible = poll?.resultsVisible ?? false
  const { rows, total } = tally(poll?.votes ?? {}, def)
  return {
    id: def.id,
    question: def.question,
    options: def.options.map((o) => ({ id: o.id, label: o.label })),
    status,
    resultsVisible,
    totalVotes: total,
    results: resultsVisible ? rows : undefined,
    correctOptionId: resultsVisible && def.kind === "quiz" ? def.correctOptionId : undefined,
    afterResult: resultsVisible ? def.afterResult : undefined,
  }
}

export function toProjectorView(
  state: SessionState,
  narrative: SessionNarrative,
  lookup: EvidenceLookup,
): ProjectorView {
  const base = {
    roomCode: state.roomCode,
    status: state.status,
    paused: state.paused,
    moment: state.moment,
    participantCount: Object.keys(state.participants).length,
    lightsCount: Object.keys(state.lights).length,
  }
  const scene = state.status === "running" ? narrative.scenes[state.index] : undefined
  if (!scene) return { ...base, scene: null }

  // No momento de conexão o telão mostra só a imagem: nada de título nem legenda.
  // Na visão geral, a própria cena desenha rótulos; título/legenda genéricos ficam de fora.
  const overview = overviewView(state, narrative)
  const silent = scene.type === "presenter_pause" || (!!overview && overview.role !== "pista")
  const released = scene.releases ? state.released.includes(scene.releases) : false
  const ev = scene.releases ? lookup(scene.releases) : undefined

  return {
    ...base,
    scene: {
      id: scene.id,
      type: scene.type,
      title: silent ? undefined : scene.title,
      caption: silent ? undefined : scene.stage.caption,
      visual: scene.visual,
      fxCue: scene.fxCue,
      illumination: scene.illumination,
      poll: pollView(state, narrative, state.index),
      seal: scene.releases ? (released ? "aberto" : "fechado") : undefined,
      releasedRefs:
        released && ev && scene.stage.showRefsAfterRelease ? ev.refs.map((r) => formatRef(r)) : undefined,
      steps: overview ? undefined : scene.steps?.slice(0, state.step).map((s) => ({ id: s.id, label: s.label, text: s.text, value: s.value })),
      totalSteps: scene.steps?.length,
      cue: state.cue,
      overview,
    },
  }
}

/**
 * `syntheses` pode conter mais do que o liberado (ex.: cache do host);
 * esta função só inclui o que está em `state.released`.
 */
export function toAudienceView(
  state: SessionState,
  narrative: SessionNarrative,
  lookup: EvidenceLookup,
  participantId: string | null,
  syntheses: Record<string, ReleasedSynthesis>,
): AudienceView {
  const participant = participantId ? state.participants[participantId] : undefined
  const scene = state.status === "running" ? narrative.scenes[state.index] : undefined

  const clueIds: string[] = []
  narrative.scenes.slice(0, state.status === "lobby" ? 0 : state.index + 1).forEach((s) => {
    for (const id of [s.releases, ...s.unlocks]) {
      const ev = id ? lookup(id) : undefined
      if (ev?.connection && !clueIds.includes(ev.id)) clueIds.push(ev.id)
    }
  })

  const clues: ClueView[] = clueIds.flatMap((id): ClueView[] => {
    const ev = lookup(id)
    if (!ev?.connection) return []
    const isReleased = state.released.includes(id)
    const synthesis = isReleased ? syntheses[id] : undefined
    if (isReleased && synthesis) {
      return [
        {
          evidenceId: id,
          status: "aberta" as const,
          title: ev.title,
          lockedHint: ev.lockedHint,
          refs: ev.refs.map((r) => formatRef(r)),
          synthesis: synthesis.blocks,
          classification: ev.showClassification
            ? { primary: ev.connection.primary, secondary: ev.connection.secondary, note: synthesis.classificationNote ?? "" }
            : undefined,
        },
      ]
    }
    return [
      {
        evidenceId: id,
        status: ev.availability === "futura" ? ("futura" as const) : ("selada" as const),
        title: "Pista selada",
        lockedHint: ev.lockedHint,
      },
    ]
  })

  const poll = scene ? pollView(state, narrative, state.index) : undefined
  const myVote = poll && participantId ? state.polls[poll.id]?.votes[participantId] : undefined
  const total = Object.keys(state.participants).length

  return {
    roomCode: state.roomCode,
    status: state.status,
    paused: state.paused,
    moment: state.moment ? { ...state.moment, myOrder: participant?.order ?? 0, total } : null,
    me: participant ? { id: participant.id, nickname: participant.nickname, lit: !!state.lights[participant.id] } : null,
    scene: scene
      ? {
          id: scene.id,
          type: scene.type,
          title: scene.type === "presenter_pause" || (scene.overview && scene.overview.role !== "abertura") ? undefined : scene.title,
          prompt: scene.audiencePrompt,
          poll: poll ? { ...poll, myVote } : undefined,
          overview: overviewView(state, narrative),
        }
      : null,
    clues,
  }
}
