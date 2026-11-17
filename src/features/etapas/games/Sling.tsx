"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { SlingGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { POINTS_MAX, slingHitPoints } from "@/domain/score"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Finale } from "./Finale"
import { GAME_MS, GameHud, seeded, StepHint, useCountdown } from "./kit"

// Mundo visto de cima, viewBox 100×150: o gigante entra no alto e desce até Davi.
const TOP = 12
const BOTTOM = 112
const ORIGIN = { x: 50, y: 128 }
const HIT_R = 9
const MAX_PULL = 34
const STONE_SPEED = 190

interface Giant {
  id: number
  cx: number
  amp: number
  freq: number
  phase: number
  speed: number
  y: number
  x: number
  hit?: number
  passed?: boolean
}
interface Stone {
  x: number
  y: number
  vx: number
  vy: number
}
interface World {
  giant: Giant
  stone: Stone | null
  t: number
}

/** O gigante visto de cima: capacete, ombros largos e a lança. */
function GiantTop({ fallen }: { fallen: boolean }) {
  return (
    <g opacity={fallen ? 0.55 : 1}>
      <ellipse cx="0" cy="2" rx="9" ry="5.5" fill="#5a4630" stroke="#2a1d10" strokeWidth="0.8" />
      <circle cx="0" cy="0" r="4.6" fill="#8a8f96" stroke="#3a3d42" strokeWidth="0.8" />
      <path d="M -1.5 -4.2 L 0 -6.4 L 1.5 -4.2" fill="#b8bcc2" />
      <path d="M 7 -8 L 9 8" stroke="#6b4a2a" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 6.4 -9.6 L 7.6 -7.4 L 6 -7.6 Z" fill="#c8ccd2" />
    </g>
  )
}

/**
 * A funda de Davi (1Sm 17), vista de cima: os gigantes descem a tela mudando de
 * lugar. Puxe e solte para lançar a pedra; quanto mais longe acertar, mais
 * pontos. Os pontos somam até o tempo acabar ou o apresentador mostrar o pódio.
 */
export function Sling({ game, onProgress, stopped }: { game: SlingGame; onProgress: (value: number, done: boolean) => void; stopped: boolean }) {
  const fx = useFx()
  const stinger = useStinger()
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])
  const svg = useRef<SVGSVGElement>(null)
  const rand = useRef(seeded(17))
  const nextId = useRef(1)
  const newGiant = useCallback((): Giant => {
    const r = rand.current
    const cx = 26 + r() * 48
    return { id: nextId.current++, cx, amp: 8 + r() * 16, freq: 0.8 + r() * 1.3, phase: r() * Math.PI * 2, speed: (fx.motion ? 11 : 0) + r() * 6, y: TOP, x: cx }
  }, [fx.motion])
  const START: World = { giant: { id: 0, cx: 50, amp: 12, freq: 1, phase: 0, speed: 12, y: TOP, x: 50 }, stone: null, t: 0 }
  const world = useRef<World>(START)
  const [frame, setFrame] = useState<World>(START)
  const [pull, setPull] = useState<{ x: number; y: number } | null>(null)
  const [points, setPoints] = useState(0)
  const [hits, setHits] = useState(0)
  const [flash, setFlash] = useState<{ key: number; text: string; good: boolean; x: number; y: number } | null>(null)
  const [final, setFinal] = useState<number | null>(null)
  const total = useRef(0)

  const finish = useCallback(() => {
    setFinal((f) => {
      if (f !== null) return f
      report.current(total.current, true)
      return total.current
    })
  }, [])
  const { left } = useCountdown(GAME_MS, final === null && !stopped, finish)
  useEffect(() => {
    if (stopped) finish()
  }, [stopped, finish])

  // O laço do jogo: o gigante desce e balança; a pedra voa; acerto ou passagem.
  useEffect(() => {
    if (final !== null || stopped) return
    let raf = 0
    let prev = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      const w = world.current
      w.t += dt
      const g = w.giant
      if (g.hit === undefined && !g.passed) {
        g.y += g.speed * dt
        g.x = g.cx + g.amp * Math.sin(g.freq * w.t + g.phase)
        if (g.y >= BOTTOM) {
          g.passed = true
          setFlash({ key: g.id, text: "O gigante passou!", good: false, x: g.x, y: BOTTOM })
          setTimeout(() => (world.current.giant = newGiant()), 700)
        }
      }
      const s = w.stone
      if (s) {
        s.x += s.vx * dt
        s.y += s.vy * dt
        if (g.hit === undefined && !g.passed && Math.hypot(s.x - g.x, s.y - g.y) < HIT_R) {
          const height = 1 - (g.y - TOP) / (BOTTOM - TOP)
          const got = slingHitPoints(height)
          g.hit = got
          w.stone = null
          total.current = Math.min(POINTS_MAX, total.current + got)
          setPoints(total.current)
          setHits((h) => h + 1)
          setFlash({ key: g.id, text: `+${got}`, good: true, x: g.x, y: g.y })
          vibrate(HAPTIC.seal)
          stinger("heartbeat")
          report.current(total.current, false)
          setTimeout(() => (world.current.giant = newGiant()), fx.motion ? 900 : 200)
        } else if (s.y < -10 || s.x < -10 || s.x > 110 || s.y > 160) w.stone = null
      }
      setFrame({ giant: { ...w.giant }, stone: w.stone && { ...w.stone }, t: w.t })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [final, stopped, newGiant, stinger, fx.motion])

  const toSvg = (e: React.PointerEvent) => {
    const m = svg.current?.getScreenCTM()
    if (!m) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return { x: p.x, y: p.y }
  }

  const launch = (vx: number, vy: number) => {
    if (world.current.stone || final !== null) return
    world.current.stone = { x: ORIGIN.x, y: ORIGIN.y, vx, vy }
    stinger("whoosh")
  }

  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = toSvg(e)
    if (!p || final !== null) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setPull({ x: 0, y: 0 })
  }
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!pull) return
    const p = toSvg(e)
    if (!p) return
    // Puxar para trás (para baixo): a pedra sai para o lado oposto.
    let dx = p.x - ORIGIN.x
    let dy = p.y - ORIGIN.y
    const len = Math.hypot(dx, dy)
    if (len > MAX_PULL) {
      dx = (dx / len) * MAX_PULL
      dy = (dy / len) * MAX_PULL
    }
    setPull({ x: dx, y: Math.max(-4, dy) })
  }
  const up = () => {
    if (!pull) return
    const len = Math.hypot(pull.x, pull.y)
    setPull(null)
    if (len < 6) return
    const power = Math.min(1, len / MAX_PULL)
    launch((-pull.x / len) * STONE_SPEED * (0.6 + 0.4 * power), (-pull.y / len) * STONE_SPEED * (0.6 + 0.4 * power))
  }

  // Alternativa sem gesto: mira direto no gigante.
  const autoShot = () => {
    const g = world.current.giant
    const dx = g.x - ORIGIN.x
    const dy = g.y + g.speed * 0.4 - ORIGIN.y
    const len = Math.hypot(dx, dy)
    launch((dx / len) * STONE_SPEED, (dy / len) * STONE_SPEED)
  }

  const g = frame.giant
  return (
    <div className="relative h-full w-full touch-none overflow-hidden select-none bg-[#b8a87c]">
      <svg
        ref={svg}
        viewBox="0 0 100 150"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => setPull(null)}
        role="img"
        aria-label={game.instruction}
      >
        {/* O vale de Elá visto de cima: o riacho (1Sm 17:40) e as encostas. */}
        <rect x="0" y="0" width="100" height="150" fill="#b8a87c" />
        <path d="M 0 60 C 30 52, 60 74, 100 64" fill="none" stroke="#6f9fb0" strokeWidth="3" strokeOpacity="0.7" />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={(i * 37) % 100} cy={20 + ((i * 53) % 110)} r={1 + (i % 3)} fill="#8a7a54" opacity="0.5" />
        ))}
        <line x1="0" x2="100" y1={BOTTOM + 6} y2={BOTTOM + 6} stroke="#ff8576" strokeOpacity="0.45" strokeDasharray="2 2" strokeWidth="0.6" />
        {/* O gigante. */}
        <motion.g animate={{ x: g.x, y: g.y, rotate: g.hit !== undefined ? 90 : 0, scale: g.hit !== undefined ? 0.85 : 1 }} transition={{ duration: g.hit !== undefined && fx.motion ? 0.5 : 0 }}>
          <GiantTop fallen={g.hit !== undefined} />
        </motion.g>
        {/* Pedra em voo. */}
        {frame.stone && <circle cx={frame.stone.x} cy={frame.stone.y} r="1.8" fill="#e8e0d0" stroke="#5a5040" strokeWidth="0.4" />}
        {/* Davi e a funda. */}
        <g transform={`translate(${ORIGIN.x} ${ORIGIN.y + 10})`}>
          <circle cx="0" cy="0" r="3.4" fill="#c08a5e" stroke="#6b4a2a" strokeWidth="0.6" />
          <ellipse cx="0" cy="3" rx="5" ry="2.6" fill="#8a6a3a" />
        </g>
        {pull && (
          <g>
            <line x1={ORIGIN.x} y1={ORIGIN.y} x2={ORIGIN.x + pull.x} y2={ORIGIN.y + pull.y} stroke="#6b4a2a" strokeWidth="1.2" />
            <circle cx={ORIGIN.x + pull.x} cy={ORIGIN.y + pull.y} r="2" fill="#e8e0d0" />
            <line x1={ORIGIN.x} y1={ORIGIN.y} x2={ORIGIN.x - pull.x * 2.4} y2={ORIGIN.y - pull.y * 2.4} stroke="#f4d27a" strokeWidth="0.6" strokeDasharray="2 2" />
          </g>
        )}
        {!pull && !frame.stone && <circle cx={ORIGIN.x} cy={ORIGIN.y} r="2" fill="#e8e0d0" stroke="#5a5040" strokeWidth="0.4" />}
      </svg>
      <GameHud left={left} total={GAME_MS} score={final ?? points} label={`Acertos ${hits}`} />
      <StepHint>
        {game.instruction}{" · "}<span className="whitespace-nowrap">{formatRef(game.ref, "short")}</span>
      </StepHint>
      <AnimatePresence>
        {flash && (
          <motion.p
            key={flash.key + flash.text}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            transition={{ duration: 1 }}
            className={`pointer-events-none absolute z-20 -translate-x-1/2 font-display text-2xl font-bold [text-shadow:0_2px_10px_rgba(0,0,0,0.9)] ${flash.good ? "text-gold-bright" : "text-[#ff8576]"}`}
            style={{ left: `${flash.x}%`, top: `${(flash.y / 150) * 100}%` }}
          >
            {flash.text}
          </motion.p>
        )}
      </AnimatePresence>
      {final === null && (
        <button type="button" onClick={autoShot} className="absolute bottom-3 right-3 z-10 rounded-full border border-white/30 bg-black/55 px-4 py-2 text-sm text-white">
          Lançar
        </button>
      )}
      {final !== null && <Finale label={game.finale.label} refs={game.finale.ref} note={game.finale.note} relic={game.relic} score={final} />}
    </div>
  )
}
