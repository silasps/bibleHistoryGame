import type { Episode, Evidence, Scene, SceneStatus } from "@/content/schema"
import { canUnlock } from "./evidence"
import { needsRevealBeforeComplete, transition } from "./scene-machine"

export interface Decision {
  episodeId: string
  sceneId: string
  optionId: string
  label: string
  kind: "escolha" | "enquete"
  at: number
}

export interface SoloProgress {
  sceneStatus: Record<string, SceneStatus>
  choices: Record<string, string>
  pollAnswers: Record<string, string>
  /** Evidências alcançadas (podem estar seladas). */
  seenEvidence: Record<string, number>
  /** Evidências abertas. */
  openEvidence: Record<string, number>
  decisions: Decision[]
  notes: Record<string, string>
  completedEpisodes: string[]
  lastScene: Record<string, string>
}

export type EvidenceLookup = (id: string) => Evidence | undefined

export const emptyProgress = (): SoloProgress => ({
  sceneStatus: {},
  choices: {},
  pollAnswers: {},
  seenEvidence: {},
  openEvidence: {},
  decisions: [],
  notes: {},
  completedEpisodes: [],
  lastScene: {},
})

export function statusOf(p: SoloProgress, sceneId: string): SceneStatus {
  return p.sceneStatus[sceneId] ?? "locked"
}

/** Garante que a primeira cena do episódio esteja disponível. */
export function startEpisode(p: SoloProgress, episode: Episode): SoloProgress {
  const first = episode.scenes[0]
  if (!first || statusOf(p, first.id) !== "locked") return p
  return { ...p, sceneStatus: { ...p.sceneStatus, [first.id]: "ready" } }
}

export function canEnter(p: SoloProgress, sceneId: string): boolean {
  return statusOf(p, sceneId) !== "locked"
}

export function enterScene(p: SoloProgress, episode: Episode, scene: Scene, now: number): SoloProgress {
  const status = statusOf(p, scene.id)
  if (status === "locked") return p
  const unchanged = status !== "ready" && p.lastScene[episode.id] === scene.id && (!scene.releases || !!p.seenEvidence[scene.releases])
  if (unchanged) return p
  const next: SoloProgress = { ...p, lastScene: { ...p.lastScene, [episode.id]: scene.id } }
  if (status === "ready") next.sceneStatus = { ...p.sceneStatus, [scene.id]: transition(status, "activate") }
  if (scene.releases && !p.seenEvidence[scene.releases]) {
    next.seenEvidence = { ...p.seenEvidence, [scene.releases]: now }
  }
  return next
}

function reveal(p: SoloProgress, sceneId: string): SoloProgress {
  const status = statusOf(p, sceneId)
  if (status !== "active") return p
  return { ...p, sceneStatus: { ...p.sceneStatus, [sceneId]: transition(status, "reveal") } }
}

export function choose(
  p: SoloProgress,
  episode: Episode,
  scene: Scene,
  optionId: string,
  now: number,
): SoloProgress {
  const option = scene.choice?.options.find((o) => o.id === optionId)
  if (!option || statusOf(p, scene.id) !== "active") return p
  const next = reveal(p, scene.id)
  return {
    ...next,
    choices: { ...next.choices, [scene.id]: optionId },
    decisions: [
      ...next.decisions,
      { episodeId: episode.id, sceneId: scene.id, optionId, label: option.label, kind: "escolha", at: now },
    ],
  }
}

export function answerPoll(
  p: SoloProgress,
  episode: Episode,
  scene: Scene,
  optionId: string,
  now: number,
): SoloProgress {
  const option = scene.poll?.options.find((o) => o.id === optionId)
  if (!option || !scene.poll || statusOf(p, scene.id) !== "active") return p
  const next = reveal(p, scene.id)
  return {
    ...next,
    pollAnswers: { ...next.pollAnswers, [scene.poll.id]: optionId },
    decisions: [
      ...next.decisions,
      { episodeId: episode.id, sceneId: scene.id, optionId, label: option.label, kind: "enquete", at: now },
    ],
  }
}

/** Abre o selo de uma cena evidence_unlock. */
export function openSeal(p: SoloProgress, scene: Scene, lookup: EvidenceLookup, now: number): SoloProgress {
  if (!scene.releases || statusOf(p, scene.id) !== "active") return p
  const ev = lookup(scene.releases)
  const unlocked = new Set(Object.keys(p.openEvidence))
  if (!ev || !canUnlock(ev, unlocked)) return p
  const next = reveal(p, scene.id)
  return { ...next, openEvidence: { ...next.openEvidence, [ev.id]: now } }
}

export function canComplete(p: SoloProgress, scene: Scene): boolean {
  const status = statusOf(p, scene.id)
  if (status === "revealed") return true
  return status === "active" && !needsRevealBeforeComplete(scene)
}

export function completeScene(
  p: SoloProgress,
  episode: Episode,
  scene: Scene,
  lookup: EvidenceLookup,
  now: number,
): SoloProgress {
  if (!canComplete(p, scene)) return p
  const sceneStatus = { ...p.sceneStatus, [scene.id]: transition(statusOf(p, scene.id), "complete") }
  const openEvidence = { ...p.openEvidence }
  const seenEvidence = { ...p.seenEvidence }

  for (const evId of scene.unlocks) {
    const ev = lookup(evId)
    if (!ev) continue
    seenEvidence[evId] ??= now
    if (canUnlock(ev, new Set(Object.keys(openEvidence)))) openEvidence[evId] ??= now
  }

  const index = episode.scenes.findIndex((s) => s.id === scene.id)
  const following = episode.scenes[index + 1]
  if (following && (sceneStatus[following.id] ?? "locked") === "locked") sceneStatus[following.id] = "ready"

  const completedEpisodes =
    !following && !p.completedEpisodes.includes(episode.id) ? [...p.completedEpisodes, episode.id] : p.completedEpisodes

  return { ...p, sceneStatus, openEvidence, seenEvidence, completedEpisodes }
}

export function nextSceneId(episode: Episode, sceneId: string): string | undefined {
  const index = episode.scenes.findIndex((s) => s.id === sceneId)
  return episode.scenes[index + 1]?.id
}

export function previousSceneId(episode: Episode, sceneId: string): string | undefined {
  const index = episode.scenes.findIndex((s) => s.id === sceneId)
  return index > 0 ? episode.scenes[index - 1]?.id : undefined
}

/** Cena onde o jogador deve retomar o episódio. */
export function resumeSceneId(p: SoloProgress, episode: Episode): string {
  const last = p.lastScene[episode.id]
  if (last && canEnter(p, last)) return last
  const firstOpen = episode.scenes.find((s) => statusOf(p, s.id) !== "completed" && canEnter(p, s.id))
  return firstOpen?.id ?? episode.scenes[0].id
}

export function episodeProgress(p: SoloProgress, episode: Episode): { done: number; total: number } {
  const done = episode.scenes.filter((s) => statusOf(p, s.id) === "completed").length
  return { done, total: episode.scenes.length }
}

/** Replay: apaga o progresso do episódio, mantendo os outros. */
export function resetEpisode(p: SoloProgress, episode: Episode): SoloProgress {
  const sceneIds = new Set(episode.scenes.map((s) => s.id))
  const evidenceIds = new Set(episode.evidence.map((e) => e.id))
  const pollIds = new Set(episode.scenes.flatMap((s) => (s.poll ? [s.poll.id] : [])))
  const omit = <T,>(rec: Record<string, T>, keys: Set<string>) =>
    Object.fromEntries(Object.entries(rec).filter(([k]) => !keys.has(k)))
  const lastScene = { ...p.lastScene }
  delete lastScene[episode.id]
  return {
    ...p,
    sceneStatus: omit(p.sceneStatus, sceneIds),
    choices: omit(p.choices, sceneIds),
    pollAnswers: omit(p.pollAnswers, pollIds),
    seenEvidence: omit(p.seenEvidence, evidenceIds),
    openEvidence: omit(p.openEvidence, evidenceIds),
    notes: omit(p.notes, sceneIds),
    decisions: p.decisions.filter((d) => d.episodeId !== episode.id),
    completedEpisodes: p.completedEpisodes.filter((id) => id !== episode.id),
    lastScene,
  }
}
