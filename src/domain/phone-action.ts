import type { AudienceView, ProjectorView } from "./projection"

/**
 * Ações do público no celular. Fora delas, o celular fica em repouso ("olhe
 * para o telão") e o telão avisa quando é hora de pegar o celular.
 */
export type PhoneAction = "jogo" | "votar" | "selo" | "luz"

/** O telão avisa "olhe o seu celular" enquanto houver uma destas ações abertas. */
export function stagePhoneAction(view: ProjectorView | null): PhoneAction | null {
  if (!view || view.status !== "running" || view.paused) return null
  if (view.moment?.kind === "luzes") return "luz"
  if (view.moment) return null
  const s = view.scene
  if (!s) return null
  if (s.game && (!s.game.startable || s.game.phase === "on")) return "jogo"
  if (s.poll?.status === "open") return "votar"
  if (s.seal === "liberado") return "selo"
  return null
}

/** O que o celular mostra agora. Tudo `false`: tela de repouso. */
export interface PhoneFocus {
  /** Jogo da cena (ou o pódio dele). */
  game: boolean
  /** Pista desta cena, já liberada pelo apresentador (para quebrar ou ler). */
  clue: boolean
  /** Votação aberta ou resultado revelado. */
  poll: boolean
  /** "Acenda a sua luz". */
  light: boolean
  /** Há algo para a pessoa fazer agora: o celular vibra e destaca. */
  todo: PhoneAction | null
}

export function phoneFocus(view: AudienceView | null, brokenHere: string[] = []): PhoneFocus {
  const none: PhoneFocus = { game: false, clue: false, poll: false, light: false, todo: null }
  if (!view || view.status !== "running" || !view.scene) return none
  const s = view.scene
  const featured = s.clueId ? view.clues.find((c) => c.evidenceId === s.clueId) : undefined
  const game = !!s.game && !(s.game.startable && s.game.phase === "parado")
  const clue = featured?.status === "aberta"
  const poll = !!s.poll && s.poll.status !== "idle"
  const light = view.moment?.kind === "luzes"
  let todo: PhoneAction | null = null
  if (!view.paused) {
    if (light && !view.me?.lit) todo = "luz"
    else if (game && s.game!.phase !== "podio") todo = "jogo"
    else if (poll && s.poll!.status === "open" && !s.poll!.myVote) todo = "votar"
    else if (clue && !featured!.broken && !brokenHere.includes(featured!.evidenceId)) todo = "selo"
  }
  return { game, clue, poll, light, todo }
}
