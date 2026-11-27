import { guestsOf, presentableEtapas, prdMoments, slideItemsOfEtapa, type Etapa } from "../etapas"
import { beatContent } from "../etapas/beat-content"
import { FALAS } from "../etapas/falas"
import { isFilled, reflectionSlots, type ReflectionSlot } from "../reflections"
import { formatRef, formatRefs } from "../refs"
import type { EpisodeInput, EvidenceInput, SceneInput } from "../schema"
import { excerpts, excerptsForItem, getItem, getWeek, stageLineForItem, weeks, type ResumoExcerpt } from "."
import { aprofundarDe } from "./aprofundar"
import { mapaDoItem } from "./mapas"

// Monta a apresentação "Visão Geral da Bíblia" a partir APENAS do material do
// autor: linha do tempo (ordem e datas) + resumo (linhas e profundidade) +
// versículo da semana + os espaços de reflexão dele. A história corre por
// etapas; o versículo de cada semana entra depois do item em que o texto acontece.

export const OVERVIEW_EPISODE_ID = "visao-geral"
const pad = (n: number) => String(n).padStart(2, "0")
export const weekEvidenceId = (week: number) => `ev-semana-${pad(week)}`

/** Linhas extras do resumo para o apresentador "aprofundar" (até 8). */
function depthSteps(lines: { id: string; stageLine?: string; pendingFact?: string }[]) {
  return lines
    .filter((e) => e.stageLine && !e.pendingFact)
    .slice(0, 8)
    .map((e) => ({ id: e.id, label: "Do resumo", text: e.stageLine! }))
}

/** Linhas de "Aprofundar" escritas a partir do material do autor (rascunhos em aprofundar.ts). */
function extraSteps(itemId: string) {
  return (aprofundarDe(itemId)?.passos ?? []).map((l, i) => ({ id: `${itemId}-ap-${i + 1}`, label: "Aprofundar", text: l.text }))
}

const usable = (id: string) => excerptsForItem(id).filter((e) => e.stageLine && !e.pendingFact)

/**
 * Uma frase diferente por slide, só com trechos do autor. Os itens com menos
 * opções escolhem primeiro; cada um fica com o trecho que já tinha, se ninguém
 * o usou, ou com o mais específico ainda livre. Quem fica sem trecho livre usa a
 * linha principal do "Aprofundar" ou se junta ao vizinho que tem a mesma frase.
 */
function assignLines() {
  const order = presentableEtapas.flatMap((e) => slideItemsOfEtapa(e.n).map((i) => i.id))
  const picked = new Map<string, ResumoExcerpt>()
  const used = new Set<string>()
  const byNeed = [...order].sort((a, b) => usable(a).length - usable(b).length || order.indexOf(a) - order.indexOf(b))
  const homeWeek = (id: string) => getItem(id)?.week
  for (const id of byNeed) {
    const cands = usable(id)
    if (!cands.length || aprofundarDe(id)?.principal && !cands.some((c) => !used.has(c.id))) continue
    const current = stageLineForItem(id)
    const free = cands
      .filter((c) => !used.has(c.id))
      .sort((a, b) => a.itemIds.length - b.itemIds.length || Number(b.week === homeWeek(id)) - Number(a.week === homeWeek(id)))
    const pick = current && !used.has(current.id) ? current : free[0]
    if (!pick) continue
    picked.set(id, pick)
    used.add(pick.id)
  }
  // Sem trecho livre: junta com o vizinho da mesma etapa que tem uma frase em comum.
  const mergeInto = new Map<string, string>()
  for (const e of presentableEtapas) {
    const ids = slideItemsOfEtapa(e.n).map((i) => i.id)
    ids.forEach((id, i) => {
      if (picked.has(id) || aprofundarDe(id)?.principal) return
      const cands = new Set(usable(id).map((c) => c.id))
      const prev = ids[i - 1]
      const next = ids[i + 1]
      if (prev && picked.get(prev) && cands.has(picked.get(prev)!.id) && !mergeInto.has(prev)) mergeInto.set(id, prev)
      else if (next && picked.get(next) && cands.has(picked.get(next)!.id)) {
        mergeInto.set(next, id)
        picked.set(id, picked.get(next)!)
      }
    })
  }
  return { picked, mergeInto }
}

const LINES = assignLines()
/** Trechos que já são a frase principal de algum slide: não se repetem no "Aprofundar" de outro. */
const MAIN_LINES = new Set([...LINES.picked.values()].map((e) => e.id))

/** Frase de palco do slide de um item (a mesma regra da apresentação, também usada no solo). */
export function slideLineFor(itemId: string): string | undefined {
  return LINES.picked.get(itemId)?.stageLine ?? aprofundarDe(itemId)?.principal?.text ?? stageLineForItem(itemId)?.stageLine
}

/** Momento (fala do autor ou rascunho) como linhas do "Aprofundar" do slide do tópico. */
function beatSteps(b: Etapa["beats"][number]) {
  const c = beatContent(b)
  const lines = [c.stageLine, ...c.steps].filter((t): t is string => !!t)
  return lines.map((text, i) => ({ id: `${b.id}-${i + 1}`, label: c.origem === "fala" ? `Da sua fala · ${b.label}` : `Aprofundar · ${b.label}`, text }))
}

/** Momento com slide próprio (ex.: o arco-íris depois do Dilúvio). */
function beatScene(b: Etapa["beats"][number], extra: Etapa["beats"], week: number, etapaN: number): SceneInput {
  const c = beatContent(b)
  const own = c.steps.map((text, i) => ({ id: `${b.id}-${i + 1}`, label: c.origem === "fala" ? "Da sua fala" : "Aprofundar", text }))
  const steps = [...own, ...extra.flatMap(beatSteps)]
  return {
    id: `momento-${b.id}`,
    type: b.pause ? "presenter_pause" : "historical_context",
    title: b.label,
    perspective: "historical_observer",
    visual: "timeline",
    illumination: b.pause ? 0.35 : 0.55,
    overview: { role: "beat", week, etapa: etapaN, beatId: b.id, stageLine: c.stageLine },
    steps: steps.length ? steps : undefined,
    presenterCue: b.pause ? "pausa" : "historia",
    estimatedSeconds: b.pause ? 45 : 15,
  }
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
    estimatedSeconds: 35,
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
    estimatedSeconds: 20,
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
    // Roteiro de 45 min: a abertura é só a transição de etapa.
    estimatedSeconds: 10,
  }

  const scenes: SceneInput[] = [opening]
  const cluesHere: number[] = []
  const slideItems = slideItemsOfEtapa(etapa.n)
  for (const item of slideItems) {
    // Item que virou parte do slide de um vizinho: os jogos, momentos e versículos dele seguem depois daquele slide.
    const host = LINES.mergeInto.get(item.id)
    const also = slideItems.filter((i) => LINES.mergeInto.get(i.id) === item.id).map((i) => i.id)
    if (!host) {
      // Roteiro de 45 min: os itens fora da lista da escola entram aqui (faixa da linha do tempo + "Aprofundar").
      const guests = [...also, item.id].flatMap((id) => guestsOf(etapa.n, id).map((g) => g.id))
      const group = [item.id, ...also, ...guests]
      // Momentos: viram linhas do tópico, menos os que o autor quer como slide (e os que vêm depois deles, que viram linhas desse slide).
      const itemBeats: Etapa["beats"] = []
      const slideBeats: { beat: Etapa["beats"][number]; extra: Etapa["beats"] }[] = []
      for (const b of etapa.beats.filter((b) => group.includes(b.afterItemId))) {
        if (b.slide) slideBeats.push({ beat: b, extra: [] })
        else (slideBeats.at(-1)?.extra ?? itemBeats).push(b)
      }
      const mainLine = slideLineFor(item.id)
      const mainId = LINES.picked.get(item.id)?.id
      const others = group
        .flatMap((id) => excerptsForItem(id))
        .filter((e, i, all) => e.id !== mainId && !MAIN_LINES.has(e.id) && all.findIndex((x) => x.id === e.id) === i)
      const game = etapa.games.find((g) => group.includes(g.itemId) && g.on === "item")
      const mapa = mapaDoItem(item.id)
      scenes.push({
        id: `item-${item.id}`,
        type: "historical_context",
        title: [item, ...[...also, ...guests].map((id) => getItem(id)!)].map((i) => i.label).join(" · "),
        perspective: "historical_observer",
        visual: "timeline",
        illumination: 0.55,
        overview: { role: "item", week: item.week, etapa: etapa.n, itemId: item.id, alsoItemIds: also.length + guests.length ? [...also, ...guests] : undefined, mapa, stageLine: mainLine },
        // Os momentos (suas falas e os rascunhos) viram linhas do "Aprofundar" do tópico: você toca no assunto se quiser.
        steps: [...depthSteps(others), ...group.flatMap(extraSteps), ...itemBeats.flatMap(beatSteps)],
        game: game && { id: game.id, kind: game.kind, max: game.max, startable: game.aoVivo },
        presenterCue: "historia",
        // Jogo ao vivo: a estimativa só soma quando o apresentador marca "vou jogar ao vivo" (Área de preparação).
        estimatedSeconds: game && !game.aoVivo ? game.seconds : 15,
      })
      for (const { beat, extra } of slideBeats) scenes.push(beatScene(beat, extra, item.week, etapa.n))
    }
    for (const g of etapa.games.filter((g) => g.itemId === item.id && g.on === "depois")) {
      scenes.push({
        id: `jogo-${g.id}`,
        type: "historical_context",
        title: g.title ?? item.label,
        perspective: "historical_observer",
        visual: "timeline",
        illumination: 0.5,
        overview: { role: "jogo", week: item.week, etapa: etapa.n, stageLine: g.fala && FALAS[g.fala].stageLine },
        game: { id: g.id, kind: g.kind, max: g.max, startable: false },
        optional: g.optional,
        presenterCue: "historia",
        estimatedSeconds: g.seconds,
      })
    }
    // O versículo do plano vem logo depois do item (e antes dos momentos).
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
