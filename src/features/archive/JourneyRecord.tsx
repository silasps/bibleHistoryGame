"use client"

import { Check, Lock, ScrollText } from "lucide-react"
import Link from "next/link"
import { ITEM_COLORS, ItemArt } from "@/components/art/ItemArt"
import { BlockList } from "@/components/story/BlockList"
import { getItem, itemsOfWeek, weeks } from "@/content/overview"
import { weekEvidenceId } from "@/content/overview/sequence"
import type { ReleasedSynthesis } from "@/content/schema"
import { cn } from "@/lib/utils"
import { journeyHref } from "../journey/JourneyItem"

/** Linha do tempo do jogador: semanas, itens visitados e pistas abertas. */
export function JourneyTimeline({ visited, openEvidence }: { visited: Record<string, number>; openEvidence: Record<string, number> }) {
  return (
    <ol className="space-y-6">
      {weeks.map((w) => {
        const list = itemsOfWeek(w.week)
        const pending = w.status === "aguardando_material"
        const seen = list.filter((i) => visited[i.id]).length
        const sealed = !openEvidence[weekEvidenceId(w.week)]
        const color = ITEM_COLORS[w.color]
        return (
          <li key={w.week} className={cn("rounded-2xl border border-border bg-ink/70 p-4", pending && "opacity-40")}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-2xl text-parchment">
                <span className="mr-2 font-sans text-xs uppercase tracking-[0.3em]" style={{ color }}>
                  Semana {w.week}
                </span>
                {w.title}
              </h3>
              {pending ? (
                <span className="text-xs uppercase tracking-widest text-mist">em breve</span>
              ) : (
                <span className="flex items-center gap-3 text-sm tabular-nums text-mist">
                  {seen} de {list.length} itens
                  {sealed ? <Lock className="size-4" aria-label="pista selada" /> : <Check className="size-4 text-gold" aria-label="pista aberta" />}
                  <Link href={`/solo?semana=${w.week}`} className="text-gold underline">
                    abrir
                  </Link>
                </span>
              )}
            </div>
            {!pending && seen > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {list
                  .filter((i) => visited[i.id])
                  .map((i) => (
                    <li key={i.id}>
                      <Link href={journeyHref(w.week, i.id)} title={i.label} className="block rounded-xl bg-night/80 p-1.5 hover:bg-navy-2">
                        <ItemArt art={i.art} color={i.color} title={i.label} className="size-12" />
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Documentos que o jogador já abriu: pistas das semanas e dossiês dos itens. */
export function JourneyDocuments({ openedDocs, syntheses }: { openedDocs: Record<string, number>; syntheses: Record<string, ReleasedSynthesis> }) {
  const seals = weeks.filter((w) => syntheses[weekEvidenceId(w.week)])
  const dossiers = [...new Set(Object.keys(openedDocs).map((k) => k.split(":")[0]))].map((id) => getItem(id)).filter((i) => !!i)

  if (!seals.length && !dossiers.length) return <p className="text-mist">Os dossiês e as pistas que você abrir na linha do tempo aparecem aqui.</p>

  return (
    <div className="space-y-10">
      {seals.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs uppercase tracking-[0.35em] text-gold">Pistas das semanas</h3>
          {seals.map((w) => (
            <details key={w.week} className="group rounded-2xl border border-gold/30 bg-ink/80 p-4">
              <summary className="cursor-pointer font-display text-xl text-parchment">
                Semana {w.week} · {w.title}
              </summary>
              <BlockList blocks={syntheses[weekEvidenceId(w.week)].blocks} stagger={0} className="mt-4" />
            </details>
          ))}
        </section>
      )}
      {dossiers.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs uppercase tracking-[0.35em] text-gold">Dossiês consultados</h3>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {dossiers.map((i) => (
              <li key={i.id}>
                <Link href={journeyHref(i.week, i.id)} className="flex items-center gap-3 rounded-2xl border border-border bg-ink p-3 hover:bg-navy-2">
                  <ItemArt art={i.art} color={i.color} className="size-12 shrink-0" />
                  <span>
                    <span className="block text-parchment">{i.label}</span>
                    <span className="flex items-center gap-1 text-xs text-mist">
                      <ScrollText className="size-3" aria-hidden /> Semana {i.week}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
