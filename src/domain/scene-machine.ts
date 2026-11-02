import type { Scene, SceneStatus } from "@/content/schema"

export type SceneEvent = "unlock" | "activate" | "await_presenter" | "reveal" | "complete" | "reset"

const TRANSITIONS: Record<SceneStatus, Partial<Record<SceneEvent, SceneStatus>>> = {
  locked: { unlock: "ready" },
  ready: { activate: "active" },
  active: { await_presenter: "awaiting_presenter", reveal: "revealed", complete: "completed" },
  awaiting_presenter: { reveal: "revealed" },
  revealed: { complete: "completed" },
  completed: {},
}

export class InvalidTransition extends Error {
  constructor(from: SceneStatus, event: SceneEvent) {
    super(`Transição inválida: ${from} → ${event}`)
  }
}

export function canTransition(from: SceneStatus, event: SceneEvent): boolean {
  return event === "reset" || TRANSITIONS[from][event] !== undefined
}

export function transition(from: SceneStatus, event: SceneEvent): SceneStatus {
  if (event === "reset") return "locked"
  const to = TRANSITIONS[from][event]
  if (!to) throw new InvalidTransition(from, event)
  return to
}

/**
 * Cenas que exigem uma revelação antes de serem concluídas no modo solo:
 * a escolha precisa ser feita, a enquete respondida, o selo aberto.
 */
export function needsRevealBeforeComplete(scene: Scene): boolean {
  return scene.type === "choice" || scene.type === "evidence_unlock" || scene.poll !== undefined
}

/** Ao vivo, estas cenas ficam aguardando o apresentador. */
export function waitsForPresenter(scene: Scene): boolean {
  return scene.type === "presenter_pause" || scene.type === "evidence_unlock"
}
