"use client"

import { useSyncExternalStore } from "react"
import { GAME_LIVE_SECONDS } from "@/content/etapas"
import { ROOM_GAMES } from "@/content/etapas/jogos"
import { cn } from "@/lib/utils"

const KEY = "bph-prep-jogos-ao-vivo"
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
    // Sem armazenamento: a escolha não fica salva.
  }
  listeners.forEach((l) => l())
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/**
 * Quais jogos você pretende rodar ao vivo (salvo neste aparelho). Cada um soma
 * cerca de 75 s ao tópico em que entra; a estimativa total aparece aqui embaixo.
 */
export function LiveGamesPicker({ baseSeconds, maxMinutes }: { baseSeconds: number; maxMinutes: number }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "{}")
  const picked = JSON.parse(raw) as Record<string, boolean>
  const count = ROOM_GAMES.filter((g) => picked[g.id]).length
  const total = Math.round((baseSeconds + count * GAME_LIVE_SECONDS) / 60)
  return (
    <fieldset className="space-y-3 rounded-xl border border-border p-4">
      <legend className="px-1 text-xs uppercase tracking-[0.25em] text-mist">Jogos que você vai rodar ao vivo (salvo neste aparelho)</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {ROOM_GAMES.map((g) => (
          <label key={g.id} className="flex cursor-pointer items-center gap-3 text-sm text-parchment">
            <input type="checkbox" className="size-5 accent-[#d8a948]" checked={!!picked[g.id]} onChange={() => save({ ...picked, [g.id]: !picked[g.id] })} />
            <span>
              Etapa {g.etapa} · {g.title}
            </span>
          </label>
        ))}
      </div>
      <p className={cn("text-sm", total > maxMinutes ? "text-[#f6c3ad]" : "text-sage")} role="status">
        Com {count} {count === 1 ? "jogo" : "jogos"} ao vivo: cerca de {total} min (sem jogos: {Math.round(baseSeconds / 60)} min · limite {maxMinutes} min).
      </p>
    </fieldset>
  )
}
