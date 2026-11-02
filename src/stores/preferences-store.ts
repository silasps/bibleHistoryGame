import { create } from "zustand"
import { persist } from "zustand/middleware"
import { safeJSONStorage } from "@/lib/safe-storage"

export type FxLevel = "completo" | "reduzido" | "desligado"

interface PreferencesState {
  fx: FxLevel
  sound: boolean
  volume: number
  textScale: 1 | 1.15 | 1.3
  setFx: (fx: FxLevel) => void
  setSound: (on: boolean) => void
  setVolume: (v: number) => void
  setTextScale: (s: 1 | 1.15 | 1.3) => void
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      fx: "completo",
      sound: false,
      volume: 0.6,
      textScale: 1,
      setFx: (fx) => set({ fx }),
      setSound: (sound) => set({ sound }),
      setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
      setTextScale: (textScale) => set({ textScale }),
    }),
    { name: "bph-preferences-v1", storage: safeJSONStorage(), skipHydration: true },
  ),
)
