import { itemsOfEtapa, presentableEtapas, prdMoments, type Etapa } from "../etapas"
import { isFilled, reflectionSlots, type ReflectionSlot } from "../reflections"
import { formatRef, formatRefs } from "../refs"
import { FALAS } from "../etapas/falas"
import type { EpisodeInput, EvidenceInput, SceneInput } from "../schema"
import { excerpts, excerptsForItem, getWeek, stageLineForItem, weeks } from "."

// Monta a apresentação "Visão Geral da Bíblia" a partir APENAS do material do
// autor: linha do tempo (ordem e datas) + resumo (linhas e profundidade) +
// versículo da semana + os espaços de reflexão dele. A história corre por
// etapas; o versículo de cada semana entra depois do item em que o texto acontece.

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

function slotScene(slot: ReflectionSlot, week?: number, etapa?: number): SceneInput {
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
    overview: { role, week, etapa, slotId: slot.id, stageLine: slot.pergunta },
    presenterCue: "pausa",
    estimatedSeconds: 30,
  }
}

const slotFor = (pred: (s: ReflectionSlot) => boolean) =>
  reflectionSlots.filter((s) => s.scope !== "jogo" && pred(s))

/** A ordem das pistas no fio do plano (uma por semana, depois do último versículo dela). */
const clueOrder = [...new Set(prdMoments.filter((p) => p.refIndex === getWeek(p.week)!.memoryVerse.length - 1).map((p) => p.week))]
const clueNumber = (week: number) => clueOrder.indexOf(week) + 1

function verseScene(week: number, refIndex: number, etapa: number, knot: number): SceneInput {
  const w = getWeek(week)!
  return {
    id: w.memoryVerse.length > 1 ? `versiculo-${pad(week)}-${refIndex + 1}` : `versiculo-${pad(week)}`,
    type: "presenter_pause",
    title: `Versículo do plano · ${formatRef(w.memoryVerse[refIndex], "long")}`,
    perspective: "investigator",
    visual: "seed-thread",
    fxCue: "seed-thread",
    illumination: 0.25,
    audiencePrompt: "Guarde este versículo.",
    overview: { role: "versiculo", week, refIndex, etapa, knot },
    presenterCue: "conexao",
    estimatedSeconds: 50,
  }
}

function clueScene(week: number, etapa: number): SceneInput {
  return {
    id: `pista-${pad(week)}`,
    type: "evidence_unlock",
    title: `Pista ${clueNumber(week)} do plano`,
    perspective: "investigator",
    visual: "sealed-scroll",
    fxCue: "seal",
    illumination: 0.55,
    stage: { showRefsAfterRelease: true },
    audiencePrompt: "Sua pista será aberta pelo apresentador.",
    releases: weekEvidenceId(week),
    overview: { role: "pista", week, etapa },
    presenterCue: "conexao",
    estimatedSeconds: 25,
  }
}

function etapaScenes(etapa: Etapa): SceneInput[] {
  // Linha de abertura: trechos sem item do resumo. Frases que falam em "semana" ficam de fora da tela.
  const intro = etapa.intros
    .map((id) => excerpts.find((e) => e.id === id)!)
    .filter((e) => !e.pendingFact && !/semana/i.test(e.stageLine ?? ""))
  const lead = intro.find((e) => e.stageLine)
  const opening: SceneInput = {
    id: `etapa-${pad(etapa.n)}`,
    type: "cinematic_intro",
    title: `Etapa ${etapa.n} · ${etapa.title}`,
    perspective: "historical_observer",
    visual: "timeline",
    fxCue: "stars",
    illumination: 0.4,
    audiencePrompt: `Etapa ${etapa.n}: ${etapa.title}`,
    overview: { role: "abertura", etapa: etapa.n, stageLine: lead?.stageLine },
    steps: depthSteps(intro.filter((e) => e !== lead)),
    presenterCue: "historia",
    estimatedSeconds: 25,
  }

  const scenes: SceneInput[] = [opening]
  const cluesHere: number[] = []
  for (const item of itemsOfEtapa(etapa.n)) {
    const main = stageLineForItem(item.id)
    const others = excerptsForItem(item.id).filter((e) => e.id !== main?.id)
    const game = etapa.games.find((g) => g.itemId === item.id && g.on === "item")
    scenes.push({
      id: `item-${item.id}`,
      type: "historical_context",
      title: item.label,
      perspective: "historical_observer",
      visual: "timeline",
      illumination: 0.55,
      overview: { role: "item", week: item.week, etapa: etapa.n, itemId: item.id, stageLine: main?.stageLine },
      steps: depthSteps(others),
      game: game && { id: game.id, kind: game.kind, max: game.max },
      presenterCue: "historia",
      estimatedSeconds: game?.seconds ?? 15,
    })
    for (const g of etapa.games.filter((g) => g.itemId === item.id && g.on === "depois")) {
      scenes.push({
        id: `jogo-${g.id}`,
        type: "historical_context",
        title: g.title ?? item.label,
        perspective: "historical_observer",
        visual: "timeline",
        illumination: 0.5,
        overview: { role: "jogo", week: item.week, etapa: etapa.n, stageLine: g.fala && FALAS[g.fala].stageLine },
        game: { id: g.id, kind: g.kind, max: g.max },
        presenterCue: "historia",
        estimatedSeconds: g.seconds,
      })
    }
    for (const b of etapa.beats.filter((b) => b.afterItemId === item.id)) {
      const fala = FALAS[b.fala]
      scenes.push({
        id: `momento-${b.id}`,
        type: b.pause ? "presenter_pause" : "historical_context",
        title: b.label,
        perspective: "historical_observer",
        visual: "timeline",
        illumination: b.pause ? 0.35 : 0.55,
        overview: { role: "beat", week: item.week, etapa: etapa.n, beatId: b.id, stageLine: fala.stageLine },
        steps: "steps" in fala ? fala.steps.map((text, i) => ({ id: `${b.id}-${i + 1}`, label: "Da sua fala", text })) : undefined,
        presenterCue: b.pause ? "pausa" : "historia",
        estimatedSeconds: b.pause ? 45 : 15,
      })
    }
    for (const p of prdMoments.filter((m) => m.etapa === etapa.n && m.afterItemId === item.id)) {
      scenes.push(verseScene(p.week, p.refIndex, etapa.n, p.knot))
      if (p.refIndex === getWeek(p.week)!.memoryVerse.length - 1) {
        scenes.push(clueScene(p.week, etapa.n))
        cluesHere.push(p.week)
      }
    }
  }
  // Espaços do autor (C&N e revelação pessoal) das semanas cuja pista abriu nesta etapa.
  const pauses = cluesHere.flatMap((week) => slotFor((s) => s.position.kind === "semana" && s.position.week === week).map((s) => slotScene(s, week, etapa.n)))
  return [...scenes, ...pauses]
}

const scenes: SceneInput[] = [
  ...slotFor((s) => s.position.kind === "abertura").map((s) => slotScene(s)),
  ...presentableEtapas.flatMap(etapaScenes),
  ...slotFor((s) => s.position.kind === "conclusao").map((s) => slotScene(s)),
]

const presentableWeeks = weeks.filter((w) => w.status === "com_material")

const evidence: EvidenceInput[] = clueOrder.map((week) => {
  const w = getWeek(week)!
  return {
    id: weekEvidenceId(week),
    title: `Pista ${clueNumber(week)} do plano`,
    category: "promessa",
    actId: w.actId,
    refs: w.memoryVerse,
    lockedHint: `Abre depois do versículo ${formatRefs(w.memoryVerse, "long")}`,
    connection: { primary: "tema_redentivo", basis: w.memoryVerse },
    showClassification: false,
  }
})

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
  theme: "A história da Bíblia contada por etapas",
  humanQuestion: `Etapas ${presentableEtapas[0]?.n}–${presentableEtapas.at(-1)?.n}`,
  authorSummary: { status: "em_revisao", source: "content/sources/dbs-2026 (resumos e linhas do tempo)" },
  manualRequirement: { status: "em_revisao", note: "Apresentação Visão Geral da Bíblia (Manual 11S): 30–45 min." },
  reviewStatus: "em_revisao",
  scenes,
  evidence,
}
