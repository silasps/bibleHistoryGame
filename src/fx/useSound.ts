"use client"

import { useCallback, useEffect } from "react"
import { usePreferences } from "@/stores/preferences-store"
import { playStinger, setAmbience, setVolume, type Ambience, type Stinger } from "./sound"

/** Toca efeitos só se o som estiver ligado. */
export function useStinger() {
  const sound = usePreferences((s) => s.sound)
  return useCallback((kind: Stinger) => {
    if (sound) void playStinger(kind)
  }, [sound])
}

export function useAmbience(kind: Ambience) {
  const sound = usePreferences((s) => s.sound)
  const volume = usePreferences((s) => s.volume)
  useEffect(() => {
    if (!sound) return
    void setAmbience(kind)
    return () => void setAmbience(null)
  }, [kind, sound])
  useEffect(() => setVolume(volume), [volume])
}
