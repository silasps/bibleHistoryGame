"use client"

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { Evidence, ReleasedSynthesis } from "@/content/schema"
import { buildBoard } from "@/domain/evidence"
import { cn } from "@/lib/utils"
import { EvidenceCard } from "./EvidenceCard"

type Center = { x: number; y: number }

/** Quadro de detetive: cartas de evidência ligadas por fios (dourados quando abertos). */
export function InvestigationBoard({
  evidence,
  seen,
  open,
  syntheses,
}: {
  evidence: Evidence[]
  seen: Set<string>
  open: Set<string>
  syntheses: Record<string, ReleasedSynthesis>
}) {
  const board = useMemo(() => buildBoard(evidence, seen, open), [evidence, seen, open])
  const visible = board.nodes.filter((n) => n.status !== "oculta")
  const container = useRef<HTMLDivElement>(null)
  const refs = useRef(new Map<string, HTMLDivElement>())
  const [centers, setCenters] = useState<Record<string, Center>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  const measure = useCallback(() => {
    const root = container.current?.getBoundingClientRect()
    if (!root) return
    const next: Record<string, Center> = {}
    refs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect()
      next[id] = { x: r.left - root.left + r.width / 2, y: r.top - root.top + Math.min(r.height / 2, 48) }
    })
    setCenters(next)
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (container.current) ro.observe(container.current)
    return () => ro.disconnect()
  }, [measure, visible.length, expanded])

  if (!visible.length) {
    return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-mist">Nenhuma evidência ainda. Comece a investigação no modo solo.</p>
  }

  return (
    <div ref={container} className="relative">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {board.edges.map((e) => {
          const a = centers[e.from]
          const b = centers[e.to]
          if (!a || !b) return null
          const mx = (a.x + b.x) / 2
          return (
            <path
              key={`${e.from}-${e.to}`}
              d={`M ${a.x} ${a.y} C ${mx} ${a.y + 40}, ${mx} ${b.y - 40}, ${b.x} ${b.y}`}
              fill="none"
              stroke={e.lit ? "#d8a948" : "#6e5137"}
              strokeWidth={e.lit ? 2.5 : 1.5}
              strokeDasharray={e.lit ? undefined : "4 8"}
              className={cn(e.lit && "drop-shadow-[0_0_6px_rgba(216,169,72,0.8)]")}
            />
          )
        })}
      </svg>
      <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((n) => {
          const ev = evidence.find((e) => e.id === n.id)!
          return (
            <EvidenceCard
              key={n.id}
              ref={(el) => {
                if (el) refs.current.set(n.id, el)
                else refs.current.delete(n.id)
              }}
              evidence={ev}
              status={n.status}
              synthesis={syntheses[n.id]}
              expanded={expanded === n.id}
              onToggle={() => setExpanded((x) => (x === n.id ? null : n.id))}
            />
          )
        })}
      </div>
    </div>
  )
}
