"use client"

import { Lock } from "lucide-react"
import Link from "next/link"
import { ITEM_COLORS } from "@/components/art/ItemArt"
import { etapas } from "@/content/etapas"
import { RELICS } from "@/content/etapas/etapa-1"
import { ALL_RELICS } from "@/content/etapas/relics"
import { cn } from "@/lib/utils"
import { useInventory } from "@/stores/inventory"
import { RelicIcon } from "./etapa-1/art"
import { RelicBar } from "./etapa-1/AfterFall"

/** Mapa das etapas no modo solo: cada etapa com a sua relíquia (apagada até ser conquistada). */
export function EtapaMap() {
  const [inventory] = useInventory("solo")
  return (
    <section className="space-y-5" aria-labelledby="mapa-etapas">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Jogar por etapas</p>
          <h2 id="mapa-etapas" className="mt-2 font-display text-4xl text-parchment md:text-5xl">
            A história, etapa por etapa
          </h2>
        </div>
        <RelicBar inventory={inventory} className="w-full max-w-md" />
      </div>
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {etapas.map((e) => {
          const pending = e.status === "aguardando_material"
          const relics = ALL_RELICS.filter((r) => r.etapa === e.n)
          const won = relics.length > 0 && relics.every((r) => inventory.relics.includes(r.id))
          const color = ITEM_COLORS[e.color]
          const body = (
            <>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm tabular-nums" style={{ color }}>
                  {String(e.n).padStart(2, "0")}
                </span>
                <span className={cn("grid size-10 place-items-center rounded-xl border", won ? "border-gold/60 bg-gold/15" : "border-dashed border-border")}>
                  {pending ? (
                    <Lock className="size-4 text-mist" aria-hidden />
                  ) : (
                    <RelicIcon id={relics.at(-1)?.art ?? RELICS["arvore-vida"].art} fallback={<span className="text-gold">✦</span>} className={cn("size-8", !won && "opacity-25 grayscale")} />
                  )}
                </span>
              </div>
              <p className="mt-3 hyphens-auto font-display text-xl leading-tight text-parchment [overflow-wrap:anywhere] sm:text-2xl">{e.title}</p>
              <p className="mt-1 text-xs text-mist">{pending ? "em breve" : won ? `Relíquia: ${relics.at(-1)?.label}` : "Jogar"}</p>
            </>
          )
          return (
            <li key={e.n}>
              {pending ? (
                <div className="h-full rounded-2xl border border-border bg-ink/60 p-4 opacity-50">{body}</div>
              ) : (
                <Link href={`/solo/etapa/${e.n}`} className="block h-full rounded-2xl border border-border bg-ink p-4 transition-colors hover:border-gold/50 hover:bg-navy-2" style={{ boxShadow: won ? `inset 0 0 0 1px ${color}55` : undefined }}>
                  {body}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
