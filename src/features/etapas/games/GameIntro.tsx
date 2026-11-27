"use client"

import { Play } from "lucide-react"
import { motion } from "motion/react"
import type { EtapaRoomGame, Gesture } from "@/content/etapas/jogos"
import { gameSecondsOf } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { useFx } from "@/fx/useFx"
import { Backdrop } from "../etapa-1/art"

/** Um dedinho em SVG (ponta para cima). */
function Finger() {
  return (
    <svg viewBox="0 0 40 56" className="h-14 w-10 drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)]" aria-hidden>
      <path d="M16 4c0-2 1.6-3.5 3.6-3.5S23.2 2 23.2 4v20l6-1.4c2.4-.5 4.6 1.4 4.4 3.8L32.6 44c-.3 4-3.6 7-7.6 7H16c-3 0-5.6-2-6.4-4.8L5.4 31c-.6-2.2.8-4.4 3-4.8l7.6-1.2z" fill="#fff6e6" stroke="#3a2a1a" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

const LOOP = { repeat: Infinity, repeatDelay: 0.4 }

/** A demonstração do gesto do jogo, em loop. */
function GestureDemo({ gesture }: { gesture: Gesture }) {
  const fx = useFx()
  const still = !fx.motion
  const target = <span className="absolute left-1/2 top-[38%] size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold-bright/80 bg-gold/20" />
  let finger: React.ReactNode
  if (gesture === "tocar" || gesture === "tocar-rapido") {
    const fast = gesture === "tocar-rapido"
    finger = (
      <>
        {target}
        <motion.span
          className="absolute left-1/2 top-[38%] size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold-bright"
          animate={still ? undefined : { scale: [1, 1.9], opacity: [0.9, 0] }}
          transition={{ duration: fast ? 0.35 : 0.7, ...LOOP, repeatDelay: fast ? 0.05 : 0.5 }}
        />
        <motion.div className="absolute left-1/2 top-[40%] -translate-x-[30%]" animate={still ? undefined : { y: [14, 0, 14], scale: [1, 0.9, 1] }} transition={{ duration: fast ? 0.4 : 1.2, ...LOOP, repeatDelay: fast ? 0 : 0.4 }}>
          <Finger />
        </motion.div>
      </>
    )
  } else if (gesture === "arrastar") {
    finger = (
      <>
        <span className="absolute left-[18%] right-[18%] top-[45%] border-t-2 border-dashed border-gold/60" />
        <span className="absolute right-[12%] top-[45%] size-8 -translate-y-1/2 rounded-full border-2 border-gold-bright/80" />
        <motion.div className="absolute left-[16%] top-[38%]" animate={still ? undefined : { x: [0, 150, 150], opacity: [1, 1, 0] }} transition={{ duration: 1.8, times: [0, 0.8, 1], ...LOOP }}>
          <span className="block size-7 rounded-full bg-gold-bright shadow-[0_0_12px_#f4d27a]" />
          <div className="-mt-2 ml-2">
            <Finger />
          </div>
        </motion.div>
      </>
    )
  } else if (gesture === "girar") {
    finger = (
      <>
        <span className="absolute left-1/2 top-[42%] size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-gold/60" />
        <span className="absolute left-1/2 top-[42%] size-8 -translate-x-1/2 -translate-y-1/2 rounded-md bg-[#b08050]" />
        <motion.div className="absolute left-1/2 top-[42%] size-24 -translate-x-1/2 -translate-y-1/2" animate={still ? undefined : { rotate: 360 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 -rotate-12">
            <Finger />
          </div>
        </motion.div>
      </>
    )
  } else if (gesture === "puxar") {
    finger = (
      <>
        <motion.span className="absolute left-1/2 top-[14%] size-5 -translate-x-1/2 rounded-full bg-[#d8d0c0]" animate={still ? undefined : { opacity: [0, 0, 1, 0], y: [80, 80, 0, -10] }} transition={{ duration: 2, times: [0, 0.55, 0.75, 1], ...LOOP }} />
        <motion.div className="absolute left-1/2 top-[40%] -translate-x-[30%]" animate={still ? undefined : { y: [0, 50, 50, 0] }} transition={{ duration: 2, times: [0, 0.5, 0.6, 0.7], ...LOOP }}>
          <Finger />
        </motion.div>
        <span className="absolute bottom-[14%] left-1/2 -translate-x-1/2 text-xs text-sand">puxe ↓ e solte</span>
      </>
    )
  } else {
    // percorrer: o dedo vai de ponto em ponto.
    finger = (
      <>
        {[
          [22, 70],
          [50, 40],
          [78, 62],
        ].map(([x, y], i) => (
          <span key={i} className="absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold-bright/80 bg-gold/20" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
        <motion.div className="absolute" animate={still ? undefined : { left: ["18%", "46%", "74%"], top: ["70%", "40%", "62%"] }} transition={{ duration: 2.4, ...LOOP }}>
          <Finger />
        </motion.div>
      </>
    )
  }
  return <div className="relative mx-auto h-40 w-56 overflow-hidden rounded-2xl border border-gold/30 bg-night/70">{finger}</div>
}

/** "Como jogar": título, demonstração do gesto, instrução, pontuação e o botão de começar. */
export function GameIntro({ game, onStart }: { game: EtapaRoomGame; onStart: () => void }) {
  const fx = useFx()
  return (
    <div className="relative h-full w-full overflow-hidden">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.65),rgba(5,7,13,0.9))]" />
      <div className="relative flex h-full flex-col items-center justify-center gap-4 overflow-y-auto px-5 py-4 text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Como jogar</p>
          <h2 className="mt-1 font-display text-3xl leading-tight text-parchment [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]">{game.title}</h2>
          <p className="mt-1 text-sm text-gold-bright">{formatRef(game.ref, "long")}</p>
        </div>
        <GestureDemo gesture={game.gesture} />
        <p className="max-w-xs text-base leading-snug text-parchment">{game.instruction}</p>
        <p className="max-w-xs text-xs leading-snug text-sand">
          {gameSecondsOf(game)} segundos · {game.scoring}
        </p>
        <motion.button
          type="button"
          onClick={onStart}
          whileTap={{ scale: 0.94 }}
          animate={fx.motion ? { boxShadow: ["0 0 0px rgba(244,210,122,0.5)", "0 0 32px rgba(244,210,122,0.7)", "0 0 0px rgba(244,210,122,0.5)"] } : undefined}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="flex h-14 items-center gap-2 rounded-full border-2 border-gold-bright bg-gold/90 px-8 text-lg font-semibold text-night"
          aria-label={`Começar: ${game.title}`}
        >
          <Play className="size-6 fill-current" aria-hidden /> Começar
        </motion.button>
      </div>
    </div>
  )
}
