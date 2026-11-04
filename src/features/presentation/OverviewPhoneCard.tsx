"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { getCharacter } from "@/content/characters"
import { CharacterCard } from "../characters/CharacterCard"
import { ITEM_COLORS, ItemArt } from "@/components/art/ItemArt"
import { getEtapa, prdMoments } from "@/content/etapas"
import { RELICS } from "@/content/etapas/etapa-1"
import { formatSpan, getItem, getWeek } from "@/content/overview"
import { formatRef } from "@/content/refs"
import type { OverviewView } from "@/domain/projection"
import { useFx } from "@/fx/useFx"
import { EtapaStrip } from "../timeline/BibleTimeline"
import { BeatPhone } from "./BeatCard"
import { PlanThread } from "./PlanThread"

/** O item da linha do tempo no celular: a mesma imagem do telão, com a linha do resumo. */
export function OverviewPhoneCard({ overview }: { overview: OverviewView }) {
  const fx = useFx()
  const item = overview.itemId ? getItem(overview.itemId) : undefined
  const week = overview.week ? getWeek(overview.week) : undefined
  const etapa = overview.etapa ? getEtapa(overview.etapa) : undefined
  const character = item?.characterId ? getCharacter(item.characterId) : undefined
  const [showCard, setShowCard] = useState(false)
  return (
    <div className="space-y-4">
      <div className="h-8 [container-type:size]">
        <EtapaStrip current={overview.etapa} className="h-full" />
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
          {character && (showCard || overview.spotlightSkinId) ? (
            <div className="mt-4 border-t border-border pt-4 text-left">
              <CharacterCard character={character} highlight={overview.spotlightSkinId} />
            </div>
          ) : (
            character && (
              <button onClick={() => setShowCard(true)} className="mt-4 rounded-full border border-gold/40 px-4 py-2 text-sm text-gold">
                Ver a ficha de {character.name}
              </button>
            )
          )}
        </motion.article>
      ) : overview.role === "beat" && overview.beatId ? (
        <BeatPhone beatId={overview.beatId} line={overview.depth.at(-1) ?? overview.stageLine} />
      ) : week && overview.role === "versiculo" ? (
        <PhoneVerse overview={overview} />
      ) : etapa && overview.role === "abertura" ? (
        <div className="glass rounded-3xl p-5 text-center">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: ITEM_COLORS[etapa.color] }}>
            Etapa {etapa.n}
          </p>
          <h2 className="mt-1 font-display text-3xl text-parchment">{etapa.title}</h2>
          {overview.stageLine && <p className="mt-2 text-mist">{overview.stageLine}</p>}
        </div>
      ) : overview.stageLine ? (
        <p className="glass rounded-3xl p-5 text-center font-display text-2xl text-gold-bright">{overview.stageLine}</p>
      ) : null}
    </div>
  )
}

/** Momento do PRD no celular: o versículo inteiro, marcado, e o nó no fio do plano. */
export function PhoneVerse({ overview }: { overview: OverviewView }) {
  const fx = useFx()
  const week = getWeek(overview.week!)!
  const i = overview.refIndex ?? 0
  const text = week.memoryVerseText?.[i]
  return (
    <motion.div
      initial={fx.motion ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      className="glass space-y-5 rounded-3xl border border-gold/40 p-5 text-center shadow-[0_0_40px_rgba(216,169,72,0.18)]"
    >
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-bright">
        <span className="size-2 rounded-full bg-gold-bright shadow-[0_0_10px_#f4d27a]" aria-hidden /> PRD · Plano Redentor de Deus
      </p>
      <figure>
        {text && <blockquote className="font-display text-2xl leading-snug text-parchment">“{text}”</blockquote>}
        <figcaption className="mt-2 text-sm text-gold">
          {formatRef(week.memoryVerse[i], "long")} <span className="text-mist">(NAA)</span>
        </figcaption>
      </figure>
      {overview.knot && (
        <div className="space-y-2">
          <PlanThread current={overview.knot} total={prdMoments.length} className="w-full" />
          <p className="text-sm text-sand">O plano, lembrado pela {overview.knot}ª vez</p>
        </div>
      )}
      {overview.knot === 1 && (
        <p className="inline-block rounded-full border border-gold/60 bg-night/80 px-4 py-2 text-sm font-semibold text-gold-bright">
          ✦ Relíquia: {RELICS.semente.label} · {formatRef(RELICS.semente.ref, "long")}
        </p>
      )}
    </motion.div>
  )
}
