"use client"

import { useEffect, useSyncExternalStore } from "react"
import { usePreferences } from "./preferences-store"
import { useSolo } from "./solo-store"

let hydrated = false
const listeners = new Set<() => void>()

/** Reidrata os stores persistidos depois da hidratação do React (evita divergência com o SSR). */
export function StoreHydrator() {
  useEffect(() => {
    if (hydrated) return
    Promise.all([usePreferences.persist.rehydrate(), useSolo.persist.rehydrate()]).finally(() => {
      hydrated = true
      listeners.forEach((l) => l())
    })
  }, [])
  return null
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => hydrated,
    () => false,
  )
}
