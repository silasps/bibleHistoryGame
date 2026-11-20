"use client"

import { useCallback, useSyncExternalStore } from "react"
import { estadoInicial, reduceShow, type ShowAction, type ShowState } from "@/domain/bible-show"

// Partida do Bible Show salva no próprio aparelho: recarregar a página não perde o jogo.

const KEY = "bph-bible-show"
const listeners = new Set<() => void>()
let cache: { raw: string; state: ShowState } | null = null

function read(): ShowState {
  let raw = ""
  try {
    raw = localStorage.getItem(KEY) ?? ""
  } catch {
    // sem armazenamento
  }
  if (cache && cache.raw === raw) return cache.state
  let state = estadoInicial
  try {
    const parsed = raw ? (JSON.parse(raw) as ShowState) : null
    if (parsed?.v === 2) state = parsed
  } catch {
    // valor inválido: começa de novo
  }
  cache = { raw, state }
  return state
}

function write(state: ShowState) {
  const raw = JSON.stringify(state)
  cache = { raw, state }
  try {
    localStorage.setItem(KEY, raw)
  } catch {
    // sem armazenamento: vale só nesta aba
  }
  listeners.forEach((l) => l())
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** `null` no servidor e antes de ler o aparelho. */
export function useBibleShow(): [ShowState | null, (a: ShowAction) => void] {
  const state = useSyncExternalStore(subscribe, read, () => null)
  const dispatch = useCallback((a: ShowAction) => {
    const current = read()
    const next = reduceShow(current, a)
    if (next !== current) write(next)
  }, [])
  return [state, dispatch]
}
