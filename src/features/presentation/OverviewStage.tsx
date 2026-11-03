"use client"

import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import { useMemo } from "react"
import { ITEM_COLORS, ItemArt } from "@/components/art/ItemArt"
import { getCharacter } from "@/content/characters"
import { formatSpan, getItem, getWeek } from "@/content/overview"
import type { TimelineWeek } from "@/content/overview/schema"
import { formatRef, formatRefs } from "@/content/refs"
import type { OverviewView } from "@/domain/projection"
import { ParticleField } from "@/fx/ParticleField"
import { SplitReveal } from "@/fx/SplitReveal"
import { useFx } from "@/fx/useFx"
import { BibleTimeline, WeekStrip } from "../timeline/BibleTimeline"

/**
 * Telão da Visão Geral: a linha do tempo é o palco. Em cada item, a
 * ilustração sai do cartão e ganha destaque com uma linha do resumo do autor.
 */
export function OverviewStage({ overview }: { overview: OverviewView }) {
  const fx = useFx()
  const revealed = useMemo(() => new Set(overview.revealedItemIds), [overview.revealedItemIds])
  const week = overview.week ? getWeek(overview.week) : undefined
  const item = overview.itemId ? getItem(overview.itemId) : undefined
  const line = overview.depth.at(-1) ?? overview.stageLine
  const skin = item?.characterId && overview.spotlightSkinId ? getCharacter(item.characterId)?.skin.find((s) => s.id === overview.spotlightSkinId) : undefined

  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      <div className="stage-glow absolute inset-0" style={{ ["--illumination" as string]: item ? 0.45 : 0.3 }} />
      <ParticleField preset="stars" density={0.5} intensity={0.35} />

      <LayoutGroup>
        {week && (overview.role === "abertura" || overview.role === "item") && (
          <motion.div
            className="absolute inset-x-0 bottom-0 top-[6cqh]"
            animate={{ opacity: item ? 0.32 : 1, filter: item ? "blur(1.5px)" : "blur(0px)" }}
            transition={{ duration: fx.motion ? 0.8 : 0 }}
          >
            <BibleTimeline week={week.week} revealed={revealed} focusId={item?.id} spotlightId={item?.id} showTitle={!item} />
          </motion.div>
        )}

        <div className="absolute inset-x-[3cqw] top-[1.6cqh]">
          <WeekStrip current={overview.week} />
        </div>

        <AnimatePresence mode="popLayout">
          {item && (
            <motion.div
              key={item.id}
              className="absolute inset-x-[6cqw] top-[12cqh] grid h-[64cqh] grid-cols-[46cqh_1fr] items-center gap-[4cqw]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: fx.motion ? 0.5 : 0 }}
            >
              <motion.div
                layoutId={`art-${item.id}`}
                className="aspect-square w-full"
                style={{ filter: `drop-shadow(0 0 3cqh ${ITEM_COLORS[item.color]}66)` }}
                transition={{ duration: fx.motion ? 0.8 : 0, ease: [0.3, 0.7, 0.2, 1] }}
              >
                <ItemArt art={item.art} color={item.color} title={item.label} className="h-full w-full" />
              </motion.div>
              <div className="space-y-[2cqh]">
                <SplitReveal key={item.id} text={item.label} as="h2" by="words" className="font-display text-[6cqw] leading-[1.02]" />
                <p className="text-[2.6cqw] font-semibold tabular-nums" style={{ color: ITEM_COLORS[item.color] }}>
                  {[item.sub, formatSpan(item)].filter(Boolean).join(" · ")}
                </p>
                <AnimatePresence mode="wait">
                  {line && (
                    <motion.p
                      key={line}
                      initial={fx.motion ? { opacity: 0, y: 12 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.5, delay: overview.depth.length ? 0 : 0.6 }}
                      className="max-w-[46cqw] font-display text-[2.9cqw] leading-snug text-parchment/95"
                    >
                      {line}
                    </motion.p>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {skin && (
                    <motion.p
                      key={skin.id}
                      initial={fx.motion ? { opacity: 0, scale: 0.9 } : false}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-[1cqw] rounded-full border border-gold/60 bg-gold/15 px-[1.6cqw] py-[0.8cqh] text-[2cqw] text-gold-bright shadow-[0_0_3cqw_rgba(216,169,72,0.35)]"
                    >
                      ✦ {skin.label}
                      {skin.refs.length > 0 && <span className="text-[1.5cqw] text-sand">{formatRefs(skin.refs)}</span>}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>

      {overview.role === "abertura" && week && (
        <motion.div
          className="absolute inset-x-0 bottom-[3cqh] mx-auto max-w-[70cqw] rounded-[2cqw] bg-night/70 px-[3cqw] py-[1.6cqh] text-center backdrop-blur"
          initial={fx.motion ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-[1.6cqw] uppercase tracking-[0.4em]" style={{ color: ITEM_COLORS[week.color] }}>
            Semana {week.week}
          </p>
          {line && <p className="mt-[0.6cqh] font-display text-[2.6cqw] leading-snug text-parchment">{line}</p>}
        </motion.div>
      )}

      {overview.role === "abertura" && !week && (
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[1.4cqw] uppercase tracking-[0.5em] text-gold">Visão Geral da Bíblia</p>
            <SplitReveal text="Bíblia" as="h1" className="mt-[1cqh] font-display text-[9cqw] font-semibold uppercase tracking-[0.2em] text-gold-bright [text-shadow:0_0_4cqw_rgba(216,169,72,0.4)]" />
            <p className="font-display text-[3.2cqw] italic text-parchment">Por trás da história</p>
            {line && <p className="mx-auto mt-[3cqh] max-w-[60cqw] font-display text-[2.8cqw] text-sand">{line}</p>}
          </div>
        </div>
      )}

      {overview.role === "versiculo" && week && <StageVerse week={week} />}

      {(overview.role === "reflexao" || overview.role === "conclusao") && (
        <div className="absolute inset-0 grid place-items-center px-[10cqw] text-center">
          {line ? (
            <SplitReveal key={line} text={line} as="p" by="words" className="font-display text-[4cqw] leading-tight text-gold-bright [text-shadow:0_0_3cqw_rgba(0,0,0,0.8)]" />
          ) : (
            <span className="block size-[1.2cqw] animate-glow rounded-full bg-gold-bright shadow-[0_0_4cqw_1cqw_rgba(244,210,122,0.5)]" aria-hidden />
          )}
        </div>
      )}
    </div>
  )
}

/** Versículo para memorizar (NAA conferida): texto grande e referência. Nunca o PRD. */
function StageVerse({ week }: { week: TimelineWeek }) {
  const fx = useFx()
  const length = (week.memoryVerseText ?? []).join(" ").length
  const size = length > 260 ? "text-[2.4cqw]" : length > 160 ? "text-[3cqw]" : "text-[3.6cqw]"
  return (
    <div className="absolute inset-x-[8cqw] bottom-[6cqh] top-[10cqh] flex flex-col items-center justify-center gap-[3cqh] text-center">
      <p className="text-[1.6cqw] uppercase tracking-[0.4em]" style={{ color: ITEM_COLORS[week.color] }}>
        Semana {week.week} · versículo para memorizar
      </p>
      {week.memoryVerse.map((r, i) => (
        <motion.figure
          key={i}
          initial={fx.motion ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 + i * 0.6 }}
        >
          {week.memoryVerseText?.[i] && <blockquote className={`font-display leading-snug text-parchment ${size}`}>“{week.memoryVerseText[i]}”</blockquote>}
          <figcaption className="mt-[1.4cqh] text-[2.2cqw] text-gold-bright">
            {formatRef(r, "long")} <span className="text-mist">(NAA)</span>
          </figcaption>
        </motion.figure>
      ))}
    </div>
  )
}
