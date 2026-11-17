"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { BreakGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { heartScore } from "@/domain/score"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale } from "./Finale"
import { GAME_MS, GameHud, seeded, StepHint, useCountdown } from "./kit"

const HEART = "M50 88 C 18 66, 6 46, 14 28 C 22 10, 44 12, 50 28 C 56 12, 78 10, 86 28 C 94 46, 82 66, 50 88 Z"
/** Rachaduras que aparecem conforme os toques (cada uma num limiar). */
const CRACKS = [
  "M50 30 L 46 40 L 52 46 L 47 56",
  "M30 30 L 36 38 L 33 46",
  "M70 28 L 64 37 L 69 44 L 63 52",
  "M47 56 L 40 62 L 44 70",
  "M47 56 L 56 63 L 52 72 L 54 80",
  "M33 46 L 24 50 L 22 58",
  "M63 52 L 74 56 L 76 62",
  "M20 36 L 28 42",
  "M80 38 L 72 46",
]

interface Chip {
  key: number
  x: number
  y: number
  dx: number
  dy: number
  r: number
}

/**
 * Um coração novo (Ez 36:26): toques repetidos racham o coração de pedra;
 * as lascas caem e aparece um coração vivo. A transformação, não a destruição.
 */
export function HeartBreak({ game, onProgress, stopped }: { game: BreakGame; onProgress: (value: number, done: boolean) => void; stopped: boolean }) {
  const fx = useFx()
  const stinger = useStinger()
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])
  const rand = useRef(seeded(26))
  const nextChip = useRef(0)
  const [taps, setTaps] = useState(0)
  const [chips, setChips] = useState<Chip[]>([])
  const [broken, setBroken] = useState(false)
  const [final, setFinal] = useState<number | null>(null)
  const share = Math.min(1, taps / game.taps)

  const finish = useCallback((score: number) => {
    setFinal((f) => {
      if (f !== null) return f
      report.current(score, true)
      return score
    })
  }, [])
  const { left, leftRef } = useCountdown(GAME_MS, final === null && !broken && !stopped, () => finish(heartScore(taps, game.taps, 0, GAME_MS)))
  useEffect(() => {
    if (stopped && final === null && !broken) finish(heartScore(taps, game.taps, 0, GAME_MS))
  }, [stopped, final, broken, finish, taps, game.taps])

  const hit = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (broken || final !== null) return
    const box = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - box.left) / box.width) * 100
    const y = ((e.clientY - box.top) / box.height) * 100
    const n = taps + 1
    setTaps(n)
    vibrate(HAPTIC.vote)
    stinger("tap", n / game.taps)
    const r = rand.current
    const fresh = Array.from({ length: 3 }, () => ({ key: nextChip.current++, x, y, dx: (r() - 0.5) * 60, dy: 30 + r() * 50, r: (r() - 0.5) * 300 }))
    setChips((c) => [...c.slice(-12), ...fresh])
    if (n >= game.taps) {
      setBroken(true)
      const score = heartScore(n, game.taps, leftRef.current, GAME_MS)
      report.current(score, false)
      stinger("reveal")
      vibrate(HAPTIC.seal)
      setTimeout(() => finish(score), fx.motion ? 2600 : 200)
    } else report.current(heartScore(n, game.taps, 0, GAME_MS), false)
  }

  const shown = Math.floor(share * (CRACKS.length + 1))

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <div className="absolute inset-0 bg-black/40" />
      <GameHud left={left} total={GAME_MS} score={final ?? heartScore(taps, game.taps, 0, GAME_MS)} label={`Toques ${Math.min(taps, game.taps)}/${game.taps}`} />
      <StepHint>
        {game.instruction}{" · "}<span className="whitespace-nowrap">{formatRef(game.ref, "short")}</span>
      </StepHint>
      <motion.button
        type="button"
        onPointerDown={hit}
        whileTap={fx.motion && !broken ? { scale: 0.96 } : undefined}
        className="absolute left-1/2 top-[52%] aspect-square w-[78%] max-w-sm -translate-x-1/2 -translate-y-1/2"
        aria-label={broken ? "Coração novo" : "Tocar no coração de pedra"}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden>
          <defs>
            <radialGradient id="carne" cx="0.45" cy="0.4" r="0.7">
              <stop offset="0" stopColor="#ff8a8a" />
              <stop offset="0.6" stopColor="#d8323c" />
              <stop offset="1" stopColor="#7a1018" />
            </radialGradient>
            <radialGradient id="pedra" cx="0.4" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#b8b2a6" />
              <stop offset="1" stopColor="#5e5a52" />
            </radialGradient>
          </defs>
          {/* O coração de carne, por baixo. */}
          <motion.path
            d={HEART}
            fill="url(#carne)"
            animate={broken && fx.motion ? { scale: [1, 1.08, 1, 1.05, 1] } : undefined}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.2 }}
            style={{ transformOrigin: "50px 52px", filter: broken ? "drop-shadow(0 0 10px rgba(255,90,100,0.8))" : undefined }}
          />
          {/* A pedra, que racha e cai. */}
          <AnimatePresence>
            {!broken && (
              <motion.g key="pedra" exit={fx.motion ? { opacity: 0, scale: 1.25 } : { opacity: 0 }} transition={{ duration: 0.8 }} style={{ transformOrigin: "50px 52px" }}>
                <path d={HEART} fill="url(#pedra)" stroke="#3a3832" strokeWidth="1.2" />
                {/* Por baixo das rachaduras, a cor da carne começa a aparecer. */}
                <path d={HEART} fill="#d8323c" opacity={share * 0.35} />
                {CRACKS.slice(0, shown).map((d) => (
                  <motion.path key={d} d={d} fill="none" stroke="#1e1c18" strokeWidth="1.6" strokeLinecap="round" initial={fx.motion ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.25 }} />
                ))}
                {CRACKS.slice(0, shown).map((d) => (
                  <path key={`luz-${d}`} d={d} fill="none" stroke="#ff6a6a" strokeOpacity={0.5} strokeWidth="0.5" />
                ))}
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </motion.button>
      {/* Lascas que caem a cada toque. */}
      <div className="pointer-events-none absolute left-1/2 top-[52%] aspect-square w-[78%] max-w-sm -translate-x-1/2 -translate-y-1/2">
        <AnimatePresence>
          {chips.map((c) => (
            <motion.span
              key={c.key}
              className="absolute size-2.5 bg-[#8a857a]"
              style={{ left: `${c.x}%`, top: `${c.y}%`, clipPath: "polygon(50% 0, 100% 100%, 0 80%)" }}
              initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              animate={fx.motion ? { opacity: 0, x: c.dx, y: c.dy, rotate: c.r } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
              onAnimationComplete={() => setChips((all) => all.filter((x) => x.key !== c.key))}
            />
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {broken && final === null && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="absolute inset-x-6 bottom-6 z-10 text-center font-display text-2xl text-parchment [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]">
            {game.finale.label} <span className="block text-sm text-sand">{formatRef(game.finale.ref, "long")}</span>
          </motion.p>
        )}
      </AnimatePresence>
      {final !== null && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} score={final} />}
    </div>
  )
}
