import { z } from "zod"
import { ACTS } from "./acts"
import { cincoMotoristas } from "./analogies/cinco-motoristas"
import { muroTrem } from "./analogies/muro-trem"
import { getBook } from "./books"
import { genesis13 } from "./episodes/genesis-1-3/episode"
import { scaffolds } from "./scaffolds"
import { Act, Episode, type BibleRef, type Evidence, type Scene } from "./schema"

export const acts: Act[] = z.array(Act).parse(ACTS)
export const episodes: Episode[] = z
  .array(Episode)
  .parse([genesis13, muroTrem, cincoMotoristas, ...scaffolds])
  .sort((a, b) => a.order - b.order)

type SceneEntry = { scene: Scene; episode: Episode; index: number }

const sceneIndex = new Map<string, SceneEntry>()
const evidenceIndex = new Map<string, Evidence>()
for (const episode of episodes) {
  episode.scenes.forEach((scene, index) => sceneIndex.set(scene.id, { scene, episode, index }))
  for (const ev of episode.evidence) evidenceIndex.set(ev.id, ev)
}

export function getAct(id: string): Act | undefined {
  return acts.find((a) => a.id === id)
}

export function getEpisode(id: string): Episode | undefined {
  return episodes.find((e) => e.id === id)
}

export function getSceneEntry(id: string): SceneEntry | undefined {
  return sceneIndex.get(id)
}

export function getEvidence(id: string): Evidence | undefined {
  return evidenceIndex.get(id)
}

export function allEvidence(): Evidence[] {
  return [...evidenceIndex.values()]
}

export function allScenes(): Scene[] {
  return [...sceneIndex.values()].map((e) => e.scene)
}

export function episodesOfAct(actId: string): Episode[] {
  return episodes.filter((e) => e.actId === actId)
}

export function playableEpisodes(): Episode[] {
  return episodes.filter((e) => e.status === "jogavel" && e.scenes.length > 0)
}

export function sceneHref(sceneId: string): string {
  const entry = sceneIndex.get(sceneId)
  if (!entry) throw new Error(`Cena desconhecida: ${sceneId}`)
  return `/solo/${entry.episode.actId}/${sceneId}`
}

// ─── Sequências de apresentação ──────────────────────────────────────────

export type PresentationSequence = { id: string; title: string; description: string; sceneIds: string[] }

const ids = (episodeId: string) => getEpisode(episodeId)?.scenes.map((s) => s.id) ?? []

export const sequences: PresentationSequence[] = [
  {
    id: "genesis",
    title: "Gênesis 1–3",
    description: "O jardim e a promessa · cerca de 40 min",
    sceneIds: ids("genesis-1-3"),
  },
  {
    id: "genesis-analogias",
    title: "Gênesis 1–3 + analogias",
    description: "Inclui o muro e os cinco motoristas · ensaio estendido",
    sceneIds: [...ids("genesis-1-3"), ...ids("analogia-muro-trem"), ...ids("analogia-cinco-motoristas")],
  },
  {
    id: "analogias",
    title: "Só as analogias",
    description: "Muro e trem · cinco motoristas",
    sceneIds: [...ids("analogia-muro-trem"), ...ids("analogia-cinco-motoristas")],
  },
]

export function getSequence(id: string): PresentationSequence | undefined {
  return sequences.find((s) => s.id === id)
}

// ─── Integridade ─────────────────────────────────────────────────────────

function refIssues(r: BibleRef, where: string): string[] {
  const book = getBook(r.book)
  const issues: string[] = []
  if (r.chapter > book.chapters) issues.push(`${where}: ${book.name} não tem capítulo ${r.chapter}`)
  if (r.chapterEnd && r.chapterEnd > book.chapters) issues.push(`${where}: ${book.name} não tem capítulo ${r.chapterEnd}`)
  if (r.verseStart && r.verseEnd && r.verseEnd < r.verseStart) issues.push(`${where}: intervalo de versículos invertido`)
  return issues
}

/** Verificações entre módulos que o Zod sozinho não cobre. */
export function validateNarrative(): string[] {
  const issues: string[] = []
  const seen = new Set<string>()
  const actIds = new Set(acts.map((a) => a.id))

  for (const episode of episodes) {
    if (!actIds.has(episode.actId)) issues.push(`${episode.id}: ato inexistente ${episode.actId}`)
    if (episode.status === "jogavel" && episode.scenes.length === 0) issues.push(`${episode.id}: jogável sem cenas`)
    episode.references.forEach((r) => issues.push(...refIssues(r, episode.id)))

    for (const scene of episode.scenes) {
      if (seen.has(scene.id)) issues.push(`cena duplicada: ${scene.id}`)
      seen.add(scene.id)
      for (const b of scene.blocks) b.refs.forEach((r) => issues.push(...refIssues(r, scene.id)))
      for (const evId of scene.unlocks) if (!evidenceIndex.has(evId)) issues.push(`${scene.id}: desbloqueia evidência inexistente ${evId}`)
      if (scene.releases) {
        const ev = evidenceIndex.get(scene.releases)
        if (!ev) issues.push(`${scene.id}: libera evidência inexistente ${scene.releases}`)
        else if (!ev.connection) issues.push(`${scene.id}: libera evidência que não é conexão`)
      }
      if (scene.hypothetical) {
        const origin = sceneIndex.get(scene.hypothetical.choiceSceneId)?.scene
        if (!origin?.choice) issues.push(`${scene.id}: cena de escolha de origem inválida`)
        else {
          const optionIds = origin.choice.options.map((o) => o.id).sort()
          const covered = Object.keys(scene.hypothetical.byOption).sort()
          if (optionIds.join() !== covered.join()) issues.push(`${scene.id}: consequências não cobrem todas as opções`)
        }
      }
      if (scene.poll?.kind === "quiz") {
        const ok = scene.poll.options.some((o) => o.id === scene.poll?.correctOptionId)
        if (!ok) issues.push(`${scene.id}: quiz sem resposta correta válida`)
      }
    }

    for (const ev of episode.evidence) {
      ev.refs.forEach((r) => issues.push(...refIssues(r, ev.id)))
      ev.connection?.basis.forEach((r) => issues.push(...refIssues(r, ev.id)))
      for (const p of [...ev.prerequisites, ...ev.links]) if (!evidenceIndex.has(p)) issues.push(`${ev.id}: referência a evidência inexistente ${p}`)
      const unlocked = episode.scenes.some((s) => s.unlocks.includes(ev.id) || s.releases === ev.id)
      if (!unlocked) issues.push(`${ev.id}: nenhuma cena desbloqueia esta evidência`)
    }
    for (const evId of episode.connectionEvidence) if (!evidenceIndex.get(evId)?.connection) issues.push(`${episode.id}: conexão inválida ${evId}`)
  }

  for (const seq of sequences) for (const id of seq.sceneIds) if (!sceneIndex.has(id)) issues.push(`sequência ${seq.id}: cena inexistente ${id}`)
  return issues
}
