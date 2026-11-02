import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getEpisode, getEvidence, getSceneEntry } from "@/content"
import type { ReleasedSynthesis } from "@/content/schema"
import {
  answerPoll,
  choose,
  completeScene,
  emptyProgress,
  enterScene,
  openSeal,
  resetEpisode,
  startEpisode,
  type SoloProgress,
} from "@/domain/solo-progress"
import { safeJSONStorage } from "@/lib/safe-storage"

interface SoloState extends SoloProgress {
  /** Sínteses recebidas do servidor ao abrir selos (cache local). */
  syntheses: Record<string, ReleasedSynthesis>
  start: (episodeId: string) => void
  enter: (sceneId: string) => void
  choose: (sceneId: string, optionId: string) => void
  answer: (sceneId: string, optionId: string) => void
  openSeal: (sceneId: string, synthesis: ReleasedSynthesis) => void
  complete: (sceneId: string) => void
  setNote: (sceneId: string, text: string) => void
  reset: (episodeId: string) => void
  resetAll: () => void
}

const progressOf = (s: SoloState): SoloProgress => s

export const useSolo = create<SoloState>()(
  persist(
    (set, get) => {
      const withScene = (sceneId: string, fn: (p: SoloProgress, e: NonNullable<ReturnType<typeof getSceneEntry>>) => SoloProgress) => {
        const entry = getSceneEntry(sceneId)
        if (!entry) return
        const prev = progressOf(get())
        const next = fn(prev, entry)
        if (next !== prev) set(next)
      }
      return {
        ...emptyProgress(),
        syntheses: {},
        start: (episodeId) => {
          const episode = getEpisode(episodeId)
          if (!episode) return
          const prev = progressOf(get())
          const next = startEpisode(prev, episode)
          if (next !== prev) set(next)
        },
        enter: (sceneId) => withScene(sceneId, (p, { episode, scene }) => enterScene(p, episode, scene, Date.now())),
        choose: (sceneId, optionId) =>
          withScene(sceneId, (p, { episode, scene }) => choose(p, episode, scene, optionId, Date.now())),
        answer: (sceneId, optionId) =>
          withScene(sceneId, (p, { episode, scene }) => answerPoll(p, episode, scene, optionId, Date.now())),
        openSeal: (sceneId, synthesis) => {
          withScene(sceneId, (p, { scene }) => openSeal(p, scene, getEvidence, Date.now()))
          set({ syntheses: { ...get().syntheses, [synthesis.evidenceId]: synthesis } })
        },
        complete: (sceneId) =>
          withScene(sceneId, (p, { episode, scene }) => completeScene(p, episode, scene, getEvidence, Date.now())),
        setNote: (sceneId, text) => set({ notes: { ...get().notes, [sceneId]: text.slice(0, 2000) } }),
        reset: (episodeId) => {
          const episode = getEpisode(episodeId)
          if (!episode) return
          const next = resetEpisode(progressOf(get()), episode)
          const evIds = new Set(episode.evidence.map((e) => e.id))
          const syntheses = Object.fromEntries(Object.entries(get().syntheses).filter(([k]) => !evIds.has(k)))
          set({ ...next, syntheses })
          set(startEpisode(progressOf(get()), episode))
        },
        resetAll: () => set({ ...emptyProgress(), syntheses: {} }),
      }
    },
    {
      name: "bph-solo-v1",
      version: 1,
      storage: safeJSONStorage(),
      skipHydration: true,
      partialize: ({ sceneStatus, choices, pollAnswers, seenEvidence, openEvidence, decisions, notes, completedEpisodes, lastScene, syntheses }) => ({
        sceneStatus,
        choices,
        pollAnswers,
        seenEvidence,
        openEvidence,
        decisions,
        notes,
        completedEpisodes,
        lastScene,
        syntheses,
      }),
    },
  ),
)
