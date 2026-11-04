import type { LinkState } from "@/components/story/ConnectionStatus"
import type { AudienceView, ProjectorView } from "@/domain/projection"
import type { HostCommand, SessionState } from "@/domain/session"

// Contratos entre a UI e o transporte da sala. A UI não sabe se está falando
// com a demonstração local (BroadcastChannel, mesmo navegador) ou com o
// Supabase (servidor + realtime): as duas implementações seguem estas portas.

export type RoomMode = "demo" | "live"

export interface HostRoomApi {
  mode: RoomMode
  state: SessionState | null
  link: LinkState
  /** Devolve uma mensagem de erro, se o comando for recusado. */
  command: (cmd: HostCommand) => Promise<string | undefined>
  /** Só na demonstração local: participantes e votos simulados. */
  simulation?: {
    addParticipants: (n: number) => void
    voteRandomly: () => void
    lightAll: () => void
  }
}

/** Comandos que o telão repassa (passador de slides com o foco na janela do telão). */
export type ProjectorControl = "next" | "prev" | "pause" | "resume"

export interface ProjectorRoomApi {
  view: ProjectorView | null
  link: LinkState
  joinUrl: string
  /** Devolve erro quando este telão não pode controlar a sala (ex.: aberto em outro aparelho). */
  control: (cmd: ProjectorControl) => Promise<string | undefined>
}

export interface AudienceRoomApi {
  view: AudienceView | null
  link: LinkState
  joined: boolean
  join: (nickname?: string) => Promise<string | undefined>
  vote: (pollId: string, optionId: string) => Promise<string | undefined>
  light: () => Promise<void>
  /** Resultado no minijogo da cena atual (o progresso nunca anda para trás). */
  play: (gameId: string, value: number, done: boolean) => Promise<void>
}

export function joinUrlFor(code: string, mode: RoomMode, origin: string): string {
  const base = `${origin.replace(/\/$/, "")}/join/${code}`
  return mode === "demo" ? `${base}?modo=demo` : base
}

export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured
  return typeof window === "undefined" ? "" : window.location.origin
}
