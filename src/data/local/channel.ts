import type { AudienceView, ProjectorView } from "@/domain/projection"
import type { AudienceCommand } from "@/domain/session"

// Mensagens da sala na demonstração local (abas do mesmo navegador).
export type LocalMessage =
  | { t: "projector-view"; view: ProjectorView }
  | { t: "audience-view"; participantId: string | null; view: AudienceView }
  | { t: "audience-cmd"; cmd: AudienceCommand }
  | { t: "hello"; role: "projector" | "audience"; participantId?: string }

export interface LocalChannel {
  post: (msg: LocalMessage) => void
  close: () => void
}

/** BroadcastChannel quando existe; senão, eventos de `storage` como fallback. */
export function openLocalChannel(code: string, onMessage: (msg: LocalMessage) => void): LocalChannel {
  const name = `bph-room-${code}`
  if (typeof BroadcastChannel !== "undefined") {
    const bc = new BroadcastChannel(name)
    bc.onmessage = (e) => onMessage(e.data as LocalMessage)
    return { post: (msg) => bc.postMessage(msg), close: () => bc.close() }
  }
  const key = `${name}-msg`
  const onStorage = (e: StorageEvent) => {
    if (e.key === key && e.newValue) onMessage(JSON.parse(e.newValue).msg as LocalMessage)
  }
  window.addEventListener("storage", onStorage)
  return {
    post: (msg) => {
      try {
        localStorage.setItem(key, JSON.stringify({ msg, n: Math.random() }))
      } catch {
        // sem armazenamento: a demo fica restrita a esta aba
      }
    },
    close: () => window.removeEventListener("storage", onStorage),
  }
}

export const hostStateKey = (code: string) => `bph-room-${code}-host`
export const projectorCacheKey = (code: string) => `bph-room-${code}-projector`

export function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignorado
  }
}
