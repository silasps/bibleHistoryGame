"use client"

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react"
import { usePreferences } from "@/stores/preferences-store"
import { soundEngine, type EngineState, type Mood, type Stinger } from "./sound"

export function useSoundState(): EngineState {
  return useSyncExternalStore(soundEngine.subscribe, soundEngine.getState, () => "off")
}

/** Prévias (ex.: telão em miniatura no painel) não tocam efeitos. */
export const SilentSound = createContext(false)

/** Toca efeitos só se o som estiver ligado e o motor pronto. */
export function useStinger() {
  const sound = usePreferences((s) => s.sound)
  const silent = useContext(SilentSound)
  return useCallback(
    (kind: Stinger, level?: number) => {
      if (sound && !silent) soundEngine.stinger(kind, level)
    },
    [sound, silent],
  )
}

/** Define o clima musical enquanto o componente estiver montado. */
export function useMood(mood: Mood | null) {
  const sound = usePreferences((s) => s.sound)
  const silent = useContext(SilentSound)
  const state = useSoundState()
  useEffect(() => {
    if (!sound || silent || state !== "ready") return
    soundEngine.setMood(mood)
  }, [mood, sound, silent, state])
}

/**
 * Liga o motor quando a preferência está ativa: o navegador só permite
 * iniciar áudio depois de um gesto, então espera o primeiro toque ou tecla.
 */
export function SoundBootstrap() {
  const sound = usePreferences((s) => s.sound)
  const volume = usePreferences((s) => s.volume)
  const state = useSoundState()

  useEffect(() => {
    if (!sound || state !== "off") return
    const kick = () => void soundEngine.start()
    window.addEventListener("pointerdown", kick, { once: true })
    window.addEventListener("keydown", kick, { once: true })
    return () => {
      window.removeEventListener("pointerdown", kick)
      window.removeEventListener("keydown", kick)
    }
  }, [sound, state])

  useEffect(() => {
    soundEngine.setMuted(!sound)
    if (!sound) soundEngine.setMood(null)
  }, [sound])

  useEffect(() => soundEngine.setVolume(volume), [volume])
  return null
}
