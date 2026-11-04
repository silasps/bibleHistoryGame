"use client"

import { useCallback, useSyncExternalStore } from "react"
import { applyInventory, emptyInventory, type Inventory, type InventoryEvent } from "@/domain/relics"

// Inventário salvo no próprio aparelho: um por sala ao vivo e um para o jogo solo.

const listeners = new Set<() => void>()
const cache = new Map<string, { raw: string; inv: Inventory }>()
const storageKey = (scope: string) => `bph-inventario-${scope}`

function read(scope: string): Inventory {
  let raw = ""
  try {
    raw = localStorage.getItem(storageKey(scope)) ?? ""
  } catch {
    // sem armazenamento
  }
  const hit = cache.get(scope)
  if (hit && hit.raw === raw) return hit.inv
  let inv = emptyInventory
  try {
    if (raw) inv = { ...emptyInventory, ...(JSON.parse(raw) as Partial<Inventory>) }
  } catch {
    // valor antigo inválido: começa de novo
  }
  cache.set(scope, { raw, inv })
  return inv
}

function write(scope: string, inv: Inventory) {
  const raw = JSON.stringify(inv)
  cache.set(scope, { raw, inv })
  try {
    localStorage.setItem(storageKey(scope), raw)
  } catch {
    // sem armazenamento: vale só nesta tela
  }
  listeners.forEach((l) => l())
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useInventory(scope: string): [Inventory, (ev: InventoryEvent) => void, () => void] {
  const inv = useSyncExternalStore(subscribe, () => read(scope), () => emptyInventory)
  const dispatch = useCallback((ev: InventoryEvent) => {
    const current = read(scope)
    const next = applyInventory(current, ev)
    if (next !== current) write(scope, next)
  }, [scope])
  const reset = useCallback(() => write(scope, emptyInventory), [scope])
  return [inv, dispatch, reset]
}
