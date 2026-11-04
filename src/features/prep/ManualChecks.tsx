"use client"

import { useSyncExternalStore } from "react"

const KEY = "bph-prep-checks"
const listeners = new Set<() => void>()

function snapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? "{}"
  } catch {
    return "{}"
  }
}

function save(value: Record<string, boolean>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // Sem armazenamento: a marcação não fica salva.
  }
  listeners.forEach((l) => l())
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** Marcações que só o autor sabe (convidados, ensaio). Ficam salvas neste aparelho. */
export function ManualChecks({ items }: { items: { id: string; label: string }[] }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "{}")
  const checked = JSON.parse(raw) as Record<string, boolean>

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-xs uppercase tracking-[0.25em] text-mist">Só você sabe (salvo neste aparelho)</legend>
      {items.map((i) => (
        <label key={i.id} className="flex cursor-pointer items-center gap-3 text-parchment">
          <input id={`check-${i.id}`} type="checkbox" className="size-5 accent-[#d8a948]" checked={!!checked[i.id]} onChange={() => save({ ...checked, [i.id]: !checked[i.id] })} />
          {i.label}
        </label>
      ))}
    </fieldset>
  )
}
