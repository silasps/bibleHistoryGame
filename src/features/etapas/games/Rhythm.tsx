"use client"

import { motion } from "motion/react"
import { useState } from "react"
import type { RhythmGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale, GameHint } from "./Finale"

/** Ritmo: cada toque é uma volta; seis dias com uma volta, o sétimo com sete; depois, as trombetas (Js 6). */
export function Rhythm({ game, onProgress }: { game: RhythmGame; onProgress: (value: number, done: boolean) => void }) {
  const fx = useFx()
  const stinger = useStinger()
  const total = game.laps.reduce((a, b) => a + b, 0)
  const [laps, setLaps] = useState(0)
  const [fallen, setFallen] = useState(false)
  let day = 0
  let lapsBefore = 0
  while (day < game.laps.length - 1 && laps >= lapsBefore + game.laps[day]) lapsBefore += game.laps[day++]
  const lapInDay = laps - lapsBefore
  const ready = laps >= total

  const lap = () => {
    if (ready) return
    vibrate(HAPTIC.vote)
    stinger("vote")
    const next = laps + 1
    setLaps(next)
    onProgress(next, false)
  }

  const blow = () => {
    vibrate(HAPTIC.seal)
    stinger("train")
    setFallen(true)
    onProgress(total, true)
  }

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <GameHint>
        {game.instruction} · {formatRef(game.ref, "short")}
      </GameHint>
      {/* A cidade no centro e o caminho das voltas ao redor. */}
      <div className="absolute left-1/2 top-[44%] size-56 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-dashed border-gold/60"
          animate={fx.motion && !ready ? { rotate: 360 } : undefined}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute -top-3 left-1/2 size-6 -translate-x-1/2 rounded-full bg-gold-bright shadow-[0_0_14px_#f4d27a]" />
        </motion.div>
        <motion.div
          className="absolute inset-10 grid place-items-center rounded-xl border-4 border-[#8a6a44] bg-[#c8a070]/80 font-display text-xl text-night"
          animate={fallen ? { scaleY: 0.2, y: 60, opacity: 0.4 } : { scaleY: 1 }}
          transition={{ duration: fx.motion ? 1.2 : 0 }}
        >
          Jericó
        </motion.div>
      </div>
      {!fallen && (
        <div className="absolute inset-x-6 bottom-6 space-y-2 text-center">
          <p className="text-sm text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            {ready ? "Sétimo dia: as sete voltas foram dadas" : `Dia ${day + 1} de ${game.laps.length} · volta ${lapInDay + 1} de ${game.laps[day]}`}
          </p>
          {ready ? (
            <button type="button" onClick={blow} className="h-16 w-full rounded-full bg-gold text-lg font-semibold text-primary-foreground">
              {game.finalAction}
            </button>
          ) : (
            <button type="button" onClick={lap} className="h-16 w-full rounded-full border border-gold/60 bg-black/50 text-lg font-semibold text-gold-bright">
              Dar uma volta
            </button>
          )}
        </div>
      )}
      {fallen && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} />}
    </div>
  )
}
