"use client"

import { motion } from "motion/react"
import { artFile } from "@/components/art/art-files"
import { ITEM_COLORS, ItemArt } from "@/components/art/ItemArt"
import { getBeat, getEtapa } from "@/content/etapas"
import { FALAS } from "@/content/etapas/falas"
import { formatRefs } from "@/content/refs"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"

/** Selo do Caráter e Natureza de Deus que o autor destaca no momento. */
export function CnSeal({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold/15 font-semibold uppercase tracking-[0.2em] text-gold-bright", className)}>
      ✦ Caráter de Deus · {text}
    </span>
  )
}

/** Momento da fala do autor no telão: ilustração, rótulo, referência e a linha dele. */
export function BeatStage({ beatId, line }: { beatId: string; line?: string }) {
  const fx = useFx()
  const beat = getBeat(beatId)
  if (!beat) return null
  const fala = FALAS[beat.fala]
  const color = ITEM_COLORS[getEtapa(beat.etapa)!.color]
  const art = artFile("items", beat.id) ? beat.id : beat.art
  const cn = "cn" in fala ? fala.cn : undefined

  if (beat.pause) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-black/60 px-[10cqw] text-center">
        <div className="space-y-[2.4cqh]">
          <p className="text-[1.5cqw] uppercase tracking-[0.4em]" style={{ color }}>
            Para refletir · {beat.label}
          </p>
          <motion.p key={line} initial={fx.motion ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} className="font-display text-[3.8cqw] leading-tight text-gold-bright">
            {line}
          </motion.p>
          <p className="text-[1.6cqw] text-sand">{formatRefs(fala.refs, "long")}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      key={beat.id}
      className="absolute inset-x-[6cqw] top-[12cqh] grid h-[64cqh] grid-cols-[40cqh_1fr] items-center gap-[4cqw]"
      initial={fx.motion ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="aspect-square w-full" style={{ filter: `drop-shadow(0 0 3cqh ${color}55)` }}>
        <ItemArt art={art} color={getEtapa(beat.etapa)!.color} title={beat.label} className="h-full w-full" />
      </div>
      <div className="space-y-[2cqh]">
        <h2 className="font-display text-[4.6cqw] leading-[1.05]">{beat.label}</h2>
        <p className="text-[2cqw] font-semibold" style={{ color }}>
          {formatRefs(fala.refs, "long")}
        </p>
        {line && (
          <motion.p key={line} initial={fx.motion ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-[48cqw] font-display text-[2.8cqw] leading-snug text-parchment/95">
            {line}
          </motion.p>
        )}
        {cn && <CnSeal text={cn} className="px-[1.6cqw] py-[0.8cqh] text-[1.3cqw]" />}
      </div>
    </motion.div>
  )
}

/** Momento da fala do autor no celular. */
export function BeatPhone({ beatId, line }: { beatId: string; line?: string }) {
  const fx = useFx()
  const beat = getBeat(beatId)
  if (!beat) return null
  const fala = FALAS[beat.fala]
  const color = ITEM_COLORS[getEtapa(beat.etapa)!.color]
  const art = artFile("items", beat.id) ? beat.id : beat.art
  const cn = "cn" in fala ? fala.cn : undefined
  return (
    <motion.article key={beat.id} initial={fx.motion ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }} className="glass space-y-3 overflow-hidden rounded-3xl p-5 text-center">
      {beat.pause ? (
        <p className="text-xs uppercase tracking-[0.35em]" style={{ color }}>
          Para refletir
        </p>
      ) : (
        <ItemArt art={art} color={getEtapa(beat.etapa)!.color} title={beat.label} className="mx-auto aspect-square w-1/2" />
      )}
      <h2 className="font-display text-3xl" style={{ color: beat.pause ? undefined : color }}>
        {beat.label}
      </h2>
      <p className="text-sm text-mist">{formatRefs(fala.refs, "long")} (NAA)</p>
      {line && <p className="font-display text-xl leading-snug text-parchment">{line}</p>}
      {cn && <CnSeal text={cn} className="px-3 py-1.5 text-[0.65rem]" />}
    </motion.article>
  )
}
