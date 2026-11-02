import type { Scene } from "@/content/schema"
import type { SessionState } from "./session"

export interface ActTiming {
  key: string
  label: string
  estimatedMs: number
  actualMs: number
}

export interface TimingReport {
  totalMs: number
  currentSceneMs: number
  estimatedTotalMs: number
  perScene: Record<string, number>
  groups: ActTiming[]
}

/** Tempo real por cena (somando a cena em andamento) e estimativa por grupo. */
export function timingReport(
  state: SessionState,
  scenes: Scene[],
  groupOf: (scene: Scene) => { key: string; label: string },
  now: number,
): TimingReport {
  const t = state.timing
  const currentId = state.sceneIds[state.index]
  const live = t.sceneEnteredAt !== undefined && state.status === "running" ? now - t.sceneEnteredAt : 0
  const perScene = { ...t.sceneMs }
  if (currentId && live > 0) perScene[currentId] = (perScene[currentId] ?? 0) + live

  const pausedNow = t.pausedAt !== undefined ? now - t.pausedAt : 0
  const totalMs = t.startedAt !== undefined ? Math.max(0, now - t.startedAt - t.pausedMs - pausedNow) : 0

  const groups = new Map<string, ActTiming>()
  for (const scene of scenes) {
    const g = groupOf(scene)
    const row = groups.get(g.key) ?? { key: g.key, label: g.label, estimatedMs: 0, actualMs: 0 }
    row.estimatedMs += scene.estimatedSeconds * 1000
    row.actualMs += perScene[scene.id] ?? 0
    groups.set(g.key, row)
  }

  return {
    totalMs: state.status === "ended" ? Object.values(perScene).reduce((a, b) => a + b, 0) : totalMs,
    currentSceneMs: currentId ? (perScene[currentId] ?? 0) : 0,
    estimatedTotalMs: scenes.reduce((sum, s) => sum + s.estimatedSeconds * 1000, 0),
    perScene,
    groups: [...groups.values()],
  }
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}
