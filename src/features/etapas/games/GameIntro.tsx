"use client"

import { Play } from "lucide-react"
import { motion } from "motion/react"
import type { EtapaRoomGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { useFx } from "@/fx/useFx"
import { Backdrop } from "../etapa-1/art"

/** Antes do jogo: título, instrução curta e o botão de jogar. Nada roda antes do toque. */
export function GameIntro({ game, onStart }: { game: EtapaRoomGame; onStart: () => void }) {
  const fx = useFx()
  return (
    <div className="relative h-full w-full overflow-hidden">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.55),rgba(5,7,13,0.85))]" />
      <div className="relative flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Etapa {game.etapa}</p>
          <h2 className="mt-1 font-display text-4xl leading-tight text-parchment [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]">{game.title}</h2>
          <p className="mt-1 text-sm text-gold-bright">{formatRef(game.ref, "long")}</p>
        </div>
        <motion.button
          type="button"
          onClick={onStart}
          whileTap={{ scale: 0.92 }}
          animate={fx.motion ? { boxShadow: ["0 0 0px rgba(244,210,122,0.5)", "0 0 36px rgba(244,210,122,0.7)", "0 0 0px rgba(244,210,122,0.5)"] } : undefined}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="grid size-24 place-items-center rounded-full border-2 border-gold-bright bg-gold/90 text-night"
          aria-label={`Jogar: ${game.title}`}
        >
          <Play className="ml-1 size-10 fill-current" aria-hidden />
        </motion.button>
        <p className="max-w-xs rounded-2xl border border-gold/30 bg-night/70 px-4 py-3 text-base leading-snug text-parchment">{game.instruction}</p>
      </div>
    </div>
  )
}
