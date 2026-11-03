import { isFilled, reflectionSlots, type ReflectionSlot } from "../reflections"
import type { EpisodeInput, EvidenceInput, SceneInput } from "../schema"
import { excerptsForItem, itemsOfWeek, stageLineForItem, weekIntroExcerpts, weeks } from "."

// Monta a apresentação "Visão Geral da Bíblia" a partir APENAS do material do
// autor: linha do tempo (ordem e datas) + resumo (linhas e profundidade) +
// versículo da semana + os espaços de reflexão dele.

export const OVERVIEW_EPISODE_ID = "visao-geral"
const pad = (n: number) => String(n).padStart(2, "0")
export const weekEvidenceId = (week: number) => `ev-semana-${pad(week)}`

/** Linhas extras do resumo para o apresentador "aprofundar" (até 4). */
function depthSteps(lines: { id: string; stageLine?: string; pendingFact?: string }[]) {
  return lines
    .filter((e) => e.stageLine && !e.pendingFact)
    .slice(0, 4)
    .map((e) => ({ id: e.id, label: "Do resumo", text: e.stageLine! }))
}

function slotScene(slot: ReflectionSlot, week?: number): SceneInput {
  const filled = isFilled(slot)
  const role = slot.position.kind === "abertura" ? "abertura" : slot.position.kind === "conclusao" ? "conclusao" : "reflexao"
  return {
    id: `pausa-${slot.id}`,
    type: "reflection",
    title: slot.label,
    perspective: "investigator",
    visual: "timeline",
    fxCue: "embers",
    illumination: 0.5,
    audiencePrompt: filled ? slot.pergunta : undefined,
    reflection: { prompts: [slot.pergunta ?? "Pausa"] },
    overview: { role, week, slotId: slot.id, stageLine: slot.pergunta },
    presenterCue: "pausa",
    estimatedSeconds: 30,
  }
}

const slotFor = (pred: (s: ReflectionSlot) => boolean) =>
  reflectionSlots.filter((s) => s.scope !== "jogo" && pred(s))

function weekScenes(week: number, title: string): SceneInput[] {
  const intro = weekIntroExcerpts(week).filter((e) => !e.pendingFact)
  const opening: SceneInput = {
    id: `semana-${pad(week)}`,
    type: "cinematic_intro",
    title: `Semana ${week} · ${title}`,
    perspective: "historical_observer",
    visual: "timeline",
    fxCue: "stars",
    illumination: 0.4,
    audiencePrompt: `Semana ${week}: ${title}`,
    overview: { role: "abertura", week, stageLine: intro.find((e) => e.stageLine)?.stageLine },
    steps: depthSteps(intro.slice(1)),
    presenterCue: "historia",
    estimatedSeconds: 30,
  }

  const itemScenes: SceneInput[] = itemsOfWeek(week).map((item) => {
    const main = stageLineForItem(item.id)
    const others = excerptsForItem(item.id).filter((e) => e.id !== main?.id)
    return {
      id: `item-${item.id}`,
      type: "historical_context",
      title: item.label,
      perspective: "historical_observer",
      visual: "timeline",
      illumination: 0.55,
      overview: { role: "item", week, itemId: item.id, stageLine: main?.stageLine },
      steps: depthSteps(others),
      presenterCue: "historia",
      estimatedSeconds: 15,
    }
  })

  const verse: SceneInput = {
    id: `versiculo-${pad(week)}`,
    type: "presenter_pause",
    title: `Semana ${week} · versículo para memorizar`,
    perspective: "investigator",
    visual: "seed-thread",
    fxCue: "seed-thread",
    illumination: 0.25,
    audiencePrompt: "Guarde este versículo. A pista da semana chega em seguida.",
    overview: { role: "versiculo", week },
    presenterCue: "conexao",
    estimatedSeconds: 60,
  }

  const clue: SceneInput = {
    id: `pista-${pad(week)}`,
    type: "evidence_unlock",
    title: `Semana ${week} · a pista`,
    perspective: "investigator",
    visual: "sealed-scroll",
    fxCue: "seal",
    illumination: 0.55,
    stage: { showRefsAfterRelease: true },
    audiencePrompt: "Sua pista será aberta pelo apresentador.",
    releases: weekEvidenceId(week),
    overview: { role: "pista", week },
    presenterCue: "conexao",
    estimatedSeconds: 25,
  }

  const pauses = slotFor((s) => s.position.kind === "semana" && s.position.week === week).map((s) => slotScene(s, week))
  return [opening, ...itemScenes, verse, clue, ...pauses]
}

const presentableWeeks = weeks.filter((w) => w.status === "com_material")

const scenes: SceneInput[] = [
  ...slotFor((s) => s.position.kind === "abertura").map((s) => slotScene(s)),
  ...presentableWeeks.flatMap((w) => weekScenes(w.week, w.title)),
  ...slotFor((s) => s.position.kind === "conclusao").map((s) => slotScene(s)),
]

const evidence: EvidenceInput[] = presentableWeeks.map((w) => ({
  id: weekEvidenceId(w.week),
  title: `Semana ${w.week} · ${w.title}`,
  category: "promessa",
  actId: w.actId,
  refs: w.memoryVerse,
  lockedHint: `O versículo da semana ${w.week}`,
  connection: { primary: "tema_redentivo", basis: w.memoryVerse },
  showClassification: false,
}))

export const overviewEpisode: EpisodeInput = {
  id: OVERVIEW_EPISODE_ID,
  actId: "ato-01",
  kind: "visao_geral",
  status: "esboco_editorial",
  order: 0,
  title: "Visão Geral da Bíblia",
  subtitle: "A partir dos resumos e linhas do tempo do autor",
  period: { label: "± 4000 a.C. em diante", approximate: false, debated: false },
  references: presentableWeeks.flatMap((w) => w.memoryVerse),
  theme: "Visão geral das semanas da DBS",
  humanQuestion: `Semanas ${presentableWeeks[0]?.week}–${presentableWeeks.at(-1)?.week}`,
  authorSummary: { status: "em_revisao", source: "content/sources/dbs-2026 (resumos e linhas do tempo)" },
  manualRequirement: { status: "em_revisao", note: "Apresentação Visão Geral da Bíblia (Manual 11S): 30–45 min." },
  reviewStatus: "em_revisao",
  scenes,
  evidence,
}
