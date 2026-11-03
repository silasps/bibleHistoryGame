"use client"

import { motion } from "motion/react"
import { ITEM_COLORS, ItemArt } from "@/components/art/ItemArt"
import { formatSpan, getItem, getWeek } from "@/content/overview"
import type { OverviewView } from "@/domain/projection"
import { useFx } from "@/fx/useFx"
import { WeekStrip } from "../timeline/BibleTimeline"

/** O item da linha do tempo no celular: a mesma imagem do telão, com a linha do resumo. */
export function OverviewPhoneCard({ overview }: { overview: OverviewView }) {
  const fx = useFx()
  const item = overview.itemId ? getItem(overview.itemId) : undefined
  const week = overview.week ? getWeek(overview.week) : undefined
  return (
    <div className="space-y-4">
      <div className="h-8 [container-type:size]">
        <WeekStrip current={overview.week} className="h-full" />
      </div>
      {item ? (
        <motion.article
          key={item.id}
          initial={fx.motion ? { opacity: 0, y: 16, scale: 0.97 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass overflow-hidden rounded-3xl p-5 text-center"
        >
          <ItemArt art={item.art} color={item.color} title={item.label} className="mx-auto aspect-square w-3/5" />
          <h2 className="mt-3 font-display text-3xl" style={{ color: ITEM_COLORS[item.color] }}>
            {item.label}
          </h2>
          <p className="text-sm text-mist">{[item.sub, formatSpan(item)].filter(Boolean).join(" · ")}</p>
          {overview.stageLine && <p className="mt-3 font-display text-xl leading-snug text-parchment">{overview.stageLine}</p>}
          {overview.depth.map((d) => (
            <motion.p key={d} initial={fx.motion ? { opacity: 0 } : false} animate={{ opacity: 1 }} className="mt-2 text-base text-sand">
              {d}
            </motion.p>
          ))}
        </motion.article>
      ) : week ? (
        <div className="glass rounded-3xl p-5 text-center">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: ITEM_COLORS[week.color] }}>
            Semana {week.week}
          </p>
          <h2 className="mt-1 font-display text-3xl text-parchment">{week.title}</h2>
          {overview.stageLine && <p className="mt-2 text-mist">{overview.stageLine}</p>}
        </div>
      ) : overview.stageLine ? (
        <p className="glass rounded-3xl p-5 text-center font-display text-2xl text-gold-bright">{overview.stageLine}</p>
      ) : null}
    </div>
  )
}
