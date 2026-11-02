"use client"

import { useSyncExternalStore } from "react"
import { usePreferences, type FxLevel } from "@/stores/preferences-store"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false)
}

export interface FxSettings {
  level: FxLevel
  /** Movimento contínuo e transições amplas. */
  motion: boolean
  /** Partículas e brilhos (estáticos quando reduzido). */
  particles: boolean
  /** Tremor de tela e outros efeitos fortes. */
  intense: boolean
}

/** Combina a preferência do app com a do sistema; a mais restritiva vence. */
export function useFx(): FxSettings {
  const pref = usePreferences((s) => s.fx)
  const reduced = usePrefersReducedMotion()
  const level: FxLevel = pref === "desligado" ? "desligado" : reduced ? "reduzido" : pref
  return {
    level,
    motion: level === "completo",
    particles: level !== "desligado",
    intense: level === "completo",
  }
}
