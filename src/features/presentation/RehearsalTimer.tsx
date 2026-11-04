"use client"

import { useEffect, useState } from "react"
import { getSceneEntry } from "@/content"
import { getEtapa } from "@/content/etapas"
import type { Scene } from "@/content/schema"
import type { SessionState } from "@/domain/session"
import { formatDuration, timingReport } from "@/domain/timing"
import { cn } from "@/lib/utils"

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [active])
  return now
}

const groupOf = (scene: Scene) => {
  const etapa = scene.overview?.etapa
  if (scene.overview) return etapa ? { key: `etapa-${etapa}`, label: `Etapa ${etapa} · ${getEtapa(etapa)?.title}` } : { key: "abertura-conclusao", label: "Abertura e conclusão" }
  const ep = getSceneEntry(scene.id)?.episode
  return { key: ep?.id ?? "?", label: ep?.title ?? "?" }
}

/** Cronômetro de ensaio/apresentação: total, cena atual e real × estimado por episódio. */
export function RehearsalTimer({ state, scenes, compact = false }: { state: SessionState; scenes: Scene[]; compact?: boolean }) {
  const now = useNow(state.status === "running")
  const report = timingReport(state, scenes, groupOf, now)
  const current = scenes[state.index]
  const over = current && report.currentSceneMs > current.estimatedSeconds * 1000

  if (compact) {
    return (
      <div className="flex items-center gap-4 font-mono text-sm tabular-nums" aria-label="Cronômetro">
        <span title="Tempo total">
          <span className="text-mist">Total </span>
          <span className="text-parchment">{formatDuration(report.totalMs)}</span>
          <span className="text-mist"> / {formatDuration(report.estimatedTotalMs)}</span>
        </span>
        <span title="Cena atual" className={over ? "text-ember" : "text-gold-bright"}>
          Cena {formatDuration(report.currentSceneMs)}
          {current && <span className="text-mist"> / {formatDuration(current.estimatedSeconds * 1000)}</span>}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-[0.3em] text-mist">Tempo por bloco</h3>
      <ul className="space-y-2">
        {report.groups.map((g) => {
          const pct = Math.min(100, (g.actualMs / Math.max(1, g.estimatedMs)) * 100)
          const late = g.actualMs > g.estimatedMs
          return (
            <li key={g.key} className="space-y-1">
              <div className="flex justify-between gap-2 text-xs">
                <span className="truncate text-parchment/90">{g.label}</span>
                <span className={cn("font-mono tabular-nums", late ? "text-ember" : "text-mist")}>
                  {formatDuration(g.actualMs)} / {formatDuration(g.estimatedMs)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-navy-3">
                <div className={cn("h-full rounded-full", late ? "bg-ember" : "bg-gold")} style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
