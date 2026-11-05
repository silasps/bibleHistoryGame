"use client"

import { motion } from "motion/react"
import type { EtapaRoomGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import type { GameView } from "@/domain/projection"
import { useFx } from "@/fx/useFx"
import { Backdrop, RelicIcon } from "../etapa-1/art"

/** Telão durante um minijogo das etapas 2–11: a cena, a instrução e a sala jogando. */
export function RoomGameStage({ game, view }: { game: EtapaRoomGame; view: GameView }) {
  const fx = useFx()
  const share = view.players > 0 ? Math.min(1, view.total / (view.players * view.max)) : 0
  const finished = view.players > 0 && view.done >= Math.ceil(view.players / 2)
  return (
    <div className="absolute inset-0">
      <Backdrop name={game.art} portrait={false} palette={game.palette} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.55),transparent_35%,transparent_60%,rgba(5,7,13,0.85))]" />
      <div className="absolute inset-x-[6cqw] top-[9cqh] text-center">
        <h2 className="font-display text-[5cqw] leading-none text-parchment [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">{game.title}</h2>
        <p className="mt-[1.4cqh] text-[1.8cqw] text-gold-bright">{formatRef(game.ref, "long")}</p>
      </div>
      <div className="absolute inset-x-[10cqw] bottom-[6cqh] space-y-[1.6cqh] text-center">
        {finished ? (
          <motion.div initial={fx.motion ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} className="space-y-[1.2cqh]">
            <p className="font-display text-[3.4cqw] text-parchment [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]">{game.finale.label}</p>
            <p className="text-[1.6cqw] text-sand">{formatRef(game.finale.ref, "long")}</p>
            <p className="inline-flex items-center gap-[1cqw] rounded-full border border-gold/60 bg-night/80 px-[1.6cqw] py-[0.8cqh] text-[1.5cqw] font-semibold text-gold-bright">
              <RelicIcon id={game.relic.art} fallback="✦" className="size-[3cqw]" /> {game.relic.label}
            </p>
          </motion.div>
        ) : (
          <p className="font-display text-[2.6cqw] text-parchment [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]">{game.instruction}</p>
        )}
        {view.players > 0 && (
          <div className="mx-auto max-w-[50cqw] space-y-[0.8cqh]">
            <div className="h-[1.2cqh] overflow-hidden rounded-full bg-black/50">
              <motion.div className="h-full rounded-full bg-gold" animate={{ width: `${share * 100}%` }} transition={{ duration: 0.6 }} />
            </div>
            <p className="text-[1.5cqw] tabular-nums text-sand">
              {view.players} {view.players === 1 ? "pessoa jogando" : "pessoas jogando"} · {view.done} terminaram
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
