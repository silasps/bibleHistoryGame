"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { gameSecondsOf, type MultiplyGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { starsScore } from "@/domain/score"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale } from "./Finale"
import { GameHud, seeded, StepHint, useCountdown, useLatest } from "./kit"

interface Star {
  key: number
  x: number
  y: number
  size: number
}

/** Mais estrelas tocáveis que isso deixa o celular pesado: as mais antigas apagam. */
const MAX_STARS = 36

function StarGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} className="drop-shadow-[0_0_10px_#f4d27a]" aria-hidden>
      <path d="M12 2l2.6 6.9L22 9.3l-5.8 4.6L18.2 21 12 17l-6.2 4 2-7.1L2 9.3l7.4-.4z" fill="#fff1c4" />
    </svg>
  )
}

/**
 * Estrelas (Gn 15:5): cada estrela contada se abre em outras, e o céu enche.
 * Ganha quem contar mais estrelas no tempo.
 */
export function Multiply({ game, onProgress, stopped }: { game: MultiplyGame; onProgress: (value: number, done: boolean) => void; stopped: boolean }) {
  const fx = useFx()
  const stinger = useStinger()
  const report = useLatest(onProgress)
  const rand = useRef(seeded(15))
  const nextKey = useRef(1)
  const counted = useRef(0)
  const ended = useRef(false)
  const sky = useRef<HTMLCanvasElement>(null)
  const [stars, setStars] = useState<Star[]>([{ key: 0, x: 50, y: 50, size: 44 }])
  const [count, setCount] = useState(0)
  const [over, setOver] = useState(false)

  const finish = useCallback(() => {
    if (ended.current) return
    ended.current = true
    setOver(true)
    report.current(starsScore(counted.current), true)
  }, [report])
  const totalMs = gameSecondsOf(game) * 1000
  const { left } = useCountdown(totalMs, !over && !stopped, finish)
  useEffect(() => {
    if (stopped) finish()
  }, [stopped, finish])

  // Cada estrela contada deixa um pontinho no céu: o céu vai ficando cheio.
  const dot = (x: number, y: number) => {
    const c = sky.current
    const ctx = c?.getContext("2d")
    if (!c || !ctx) return
    const r = rand.current
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(255,${230 + Math.floor(r() * 25)},${180 + Math.floor(r() * 60)},${0.5 + r() * 0.5})`
      ctx.beginPath()
      ctx.arc(((x + (r() - 0.5) * 30) / 100) * c.width, ((y + (r() - 0.5) * 30) / 100) * c.height, 0.6 + r() * 1.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  useEffect(() => {
    const c = sky.current
    if (!c) return
    c.width = c.offsetWidth * (window.devicePixelRatio || 1)
    c.height = c.offsetHeight * (window.devicePixelRatio || 1)
  }, [])

  const tap = (s: Star) => {
    if (ended.current) return
    vibrate(HAPTIC.vote)
    stinger("vote")
    counted.current += 1
    setCount(counted.current)
    report.current(starsScore(counted.current), false)
    dot(s.x, s.y)
    const r = rand.current
    const born = 2 + Math.floor(r() * 3)
    const kids: Star[] = Array.from({ length: born }, () => {
      const a = r() * Math.PI * 2
      const d = 10 + r() * 18
      return {
        key: nextKey.current++,
        x: Math.max(8, Math.min(92, s.x + Math.cos(a) * d)),
        y: Math.max(20, Math.min(90, s.y + Math.sin(a) * d)),
        size: Math.max(28, s.size * (0.75 + r() * 0.2)),
      }
    })
    setStars((all) => [...all.filter((x) => x.key !== s.key), ...kids].slice(-MAX_STARS))
  }

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <canvas ref={sky} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
      <GameHud left={left} total={totalMs} score={starsScore(count)} label="Conte as estrelas" />
      <StepHint>
        {game.instruction}{" · "}<span className="whitespace-nowrap">{formatRef(game.ref, "short")}</span>
      </StepHint>
      <AnimatePresence>
        {stars.map((s) => (
          <motion.button
            key={s.key}
            type="button"
            onClick={() => tap(s)}
            aria-label="Contar estrela"
            className="absolute z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: Math.max(44, s.size), height: Math.max(44, s.size) }}
            initial={fx.motion ? { opacity: 0, scale: 0.2 } : false}
            animate={fx.motion ? { opacity: 1, scale: [1, 1.12, 1] } : { opacity: 1 }}
            exit={{ opacity: 0, scale: 1.8 }}
            transition={fx.motion ? { scale: { duration: 1.6, repeat: Infinity }, opacity: { duration: 0.3 } } : { duration: 0 }}
          >
            <StarGlyph size={s.size} />
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.p key={count} initial={fx.motion ? { scale: 1.3 } : false} animate={{ scale: 1 }} className="pointer-events-none absolute inset-x-0 bottom-4 z-10 text-center font-display text-5xl tabular-nums text-gold-bright [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
        {count}
      </motion.p>
      {over && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} score={starsScore(count)} />}
    </div>
  )
}
