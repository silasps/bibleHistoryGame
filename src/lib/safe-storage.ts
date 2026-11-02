import { createJSONStorage, type StateStorage } from "zustand/middleware"

const memory = new Map<string, string>()

// localStorage pode lançar exceção (modo privado, cota, bloqueio) ou não
// existir (SSR). Nesses casos o estado vive só na memória da aba.
const safe: StateStorage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return memory.get(key) ?? null
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      memory.set(key, value)
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      memory.delete(key)
    }
  },
}

export const safeJSONStorage = () => createJSONStorage(() => safe)
