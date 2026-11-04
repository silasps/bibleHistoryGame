"use client"

import { useCallback, useSyncExternalStore } from "react"

const subscribe = (cb: () => void) => {
  document.addEventListener("fullscreenchange", cb)
  return () => document.removeEventListener("fullscreenchange", cb)
}

/** Tela cheia da página inteira (some a barra do navegador). Celulares iOS não têm. */
export function useFullscreen() {
  const active = useSyncExternalStore(subscribe, () => !!document.fullscreenElement, () => false)
  const supported = useSyncExternalStore(subscribe, () => typeof document.documentElement.requestFullscreen === "function", () => false)
  const toggle = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen?.()
    else void document.documentElement.requestFullscreen?.().catch(() => {})
  }, [])
  return { active, supported, toggle }
}
