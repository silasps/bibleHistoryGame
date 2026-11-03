"use client"

import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { ITEM_COLORS, ItemArt } from "@/components/art/ItemArt"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { characters, getCharacter, type Relation } from "@/content/characters"
import { getWeek } from "@/content/overview"
import { cn } from "@/lib/utils"
import { CharacterCard, RELATION_LABEL } from "./CharacterCard"

const EDGE: Record<Relation, { color: string; dash?: string }> = {
  genealogia: { color: "#d8a948" },
  familia: { color: "#d8a948", dash: "6 5" },
  sucessao: { color: "#5cc3f0" },
  uncao: { color: "#f4d27a", dash: "2 6" },
  promessa: { color: "#f4d27a" },
  profecia: { color: "#bb86ff", dash: "6 5" },
  confronto: { color: "#ff5a69", dash: "3 5" },
}

type Point = { x: number; y: number }

/** Rede de personagens: retratos por semana, ligados por fios (genealogia, sucessão, unção…). */
export function CharacterWeb({ seen }: { seen?: ReadonlySet<string> }) {
  const weeksWith = [...new Set(characters.map((c) => c.week))].sort((a, b) => a - b)
  const container = useRef<HTMLDivElement>(null)
  const nodes = useRef(new Map<string, HTMLButtonElement>())
  const [pos, setPos] = useState<Record<string, Point>>({})
  const [open, setOpen] = useState<string | null>(null)

  const measure = useCallback(() => {
    const root = container.current?.getBoundingClientRect()
    if (!root) return
    const next: Record<string, Point> = {}
    nodes.current.forEach((el, id) => {
      const r = el.getBoundingClientRect()
      next[id] = { x: r.left - root.left + r.width / 2, y: r.top - root.top + 36 }
    })
    setPos(next)
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (container.current) ro.observe(container.current)
    return () => ro.disconnect()
  }, [measure])

  const current = open ? getCharacter(open) : undefined

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-3 text-xs text-mist" aria-label="Legenda das ligações">
        {(Object.keys(EDGE) as Relation[]).map((r) => (
          <li key={r} className="flex items-center gap-1.5">
            <svg width="26" height="6" aria-hidden>
              <line x1="0" y1="3" x2="26" y2="3" stroke={EDGE[r].color} strokeWidth="2" strokeDasharray={EDGE[r].dash} />
            </svg>
            {RELATION_LABEL[r]}
          </li>
        ))}
      </ul>
      <div className="overflow-x-auto pb-4">
        <div ref={container} className="relative min-w-[960px]">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            {characters.flatMap((c) =>
              c.connections.map((k) => {
                const a = pos[c.id]
                const b = pos[k.to]
                if (!a || !b) return null
                const mx = (a.x + b.x) / 2
                // Na mesma coluna, a linha faz uma curva para o lado em vez de passar por trás dos cartões.
                const sameColumn = Math.abs(a.x - b.x) < 20
                const gap = Math.abs(a.y - b.y)
                const bulge = sameColumn && gap > 130 ? 64 + Math.min(40, gap / 20) : 0
                const d = bulge
                  ? `M ${a.x + 30} ${a.y} C ${a.x + bulge + 30} ${a.y}, ${b.x + bulge + 30} ${b.y}, ${b.x + 30} ${b.y}`
                  : `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
                return (
                  <path
                    key={`${c.id}-${k.to}`}
                    d={d}
                    fill="none"
                    stroke={EDGE[k.relation].color}
                    strokeOpacity={0.75}
                    strokeWidth={1.8}
                    strokeDasharray={EDGE[k.relation].dash}
                  />
                )
              }),
            )}
          </svg>
          <div className="relative grid gap-4" style={{ gridTemplateColumns: `repeat(${weeksWith.length}, minmax(0, 1fr))` }}>
            {weeksWith.map((w) => (
              <section key={w}>
                <p className="mb-3 text-center text-[0.65rem] uppercase tracking-[0.3em]" style={{ color: ITEM_COLORS[getWeek(w)!.color] }}>
                  Semana {w}
                </p>
                <div className="flex flex-col items-center gap-5">
                  {characters
                    .filter((c) => c.week === w)
                    .map((c) => {
                      const locked = seen && !seen.has(c.id)
                      return (
                        <button
                          key={c.id}
                          ref={(el) => {
                            if (el) nodes.current.set(c.id, el)
                            else nodes.current.delete(c.id)
                          }}
                          onClick={() => setOpen(c.id)}
                          className={cn("group flex w-28 flex-col items-center rounded-2xl bg-night/90 p-2 text-center transition hover:bg-navy-2", locked && "opacity-40")}
                          aria-label={`Abrir a ficha de ${c.name}`}
                        >
                          <ItemArt art={c.art} color={c.color} className="size-16" />
                          <span className="mt-1 text-sm font-medium leading-tight" style={{ color: ITEM_COLORS[c.color] }}>
                            {c.name}
                          </span>
                        </button>
                      )
                    })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
      <Dialog open={!!current} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto border-border bg-ink p-6 sm:max-w-2xl">
          <DialogTitle className="sr-only">{current?.name}</DialogTitle>
          {current && <CharacterCard character={current} onOpen={setOpen} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
