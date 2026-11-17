"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { CaulkGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { stagedScore } from "@/domain/score"
import { Finale } from "./Finale"
import { GAME_MS, GameHud, StepHint, useCountdown } from "./kit"

// Coordenadas no viewBox 100×150 (celular em pé).
const BINS = 8
const GAPS = [
  { y: 76, x1: 22, x2: 42 },
  { y: 82, x1: 55, x2: 77 },
  { y: 90, x1: 19, x2: 39 },
  { y: 96, x1: 47, x2: 69 },
  { y: 103, x1: 31, x2: 53 },
]
const BASKET = "M10 68 C 10 98, 24 112, 50 112 C 76 112, 90 98, 90 68 Z"
const START = { x: 22, y: 122 }
const RECEIVER = { x: 74, y: 70 }
const BABY_START = { x: 22, y: 36 }
const BASKET_MOUTH = { x: 50, y: 74 }
const PARTS = 3

type Phase = "vedar" | "bebe" | "rio" | "entregue"
type Pt = { x: number; y: number }

const sealedCount = (covered: boolean[][]) => covered.filter((g) => g.filter(Boolean).length >= BINS - 1).length

/**
 * Cesto (Êx 2:3–6): vedar as frestas com betume, colocar o menino no cesto e
 * levar o cesto até a filha do faraó. Cada parte vale pontos; terminar rápido dá bônus.
 */
export function Caulk({ game, onProgress, stopped }: { game: CaulkGame; onProgress: (value: number, done: boolean) => void; stopped: boolean }) {
  const fx = useFx()
  const stinger = useStinger()
  const svg = useRef<SVGSVGElement>(null)
  const [phase, setPhase] = useState<Phase>("vedar")
  const [covered, setCovered] = useState(() => GAPS.map(() => Array<boolean>(BINS).fill(false)))
  const [brush, setBrush] = useState<Pt | null>(null)
  const [basket, setBasket] = useState<Pt>(START)
  const [finale, setFinale] = useState(false)
  const last = useRef<Pt | null>(null)
  const dragging = useRef(false)
  const [held, setHeld] = useState(false)
  const [baby, setBaby] = useState<Pt>(BABY_START)
  const [babyIn, setBabyIn] = useState(false)
  const [final, setFinal] = useState<number | null>(null)
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])

  const sealed = sealedCount(covered)
  const parts = (p: Phase, sealedNow: number, inBasket: boolean) => (p === "vedar" ? sealedNow / GAPS.length : p === "entregue" ? 3 : 1 + (inBasket ? 1 : 0))

  const finish = useCallback(
    (score: number) => {
      setFinal((f) => {
        if (f !== null) return f
        report.current(score, true)
        return score
      })
      setFinale(true)
    },
    [],
  )
  const { left, leftRef } = useCountdown(GAME_MS, final === null && !stopped, () => finish(stagedScore(parts(phase, sealed, babyIn), PARTS, 0, GAME_MS)))
  const score = final ?? stagedScore(parts(phase, sealed, babyIn), PARTS, left, GAME_MS)
  useEffect(() => {
    if (stopped && final === null) finish(stagedScore(parts(phase, sealed, babyIn), PARTS, 0, GAME_MS))
  }, [stopped, final, finish, phase, sealed, babyIn])

  // Todas vedadas: o menino entra no cesto.
  useEffect(() => {
    if (phase !== "vedar" || sealed < GAPS.length) return
    const t = setTimeout(() => setPhase("bebe"), 900)
    return () => clearTimeout(t)
  }, [phase, sealed])

  // Menino no cesto: o cesto desce ao rio, entre os juncos.
  useEffect(() => {
    if (phase !== "bebe" || !babyIn) return
    const t = setTimeout(() => setPhase("rio"), fx.motion ? 1100 : 300)
    return () => clearTimeout(t)
  }, [phase, babyIn, fx.motion])

  useEffect(() => {
    if (phase !== "entregue") return
    const t = setTimeout(() => setFinale(true), fx.motion ? 1400 : 0)
    return () => clearTimeout(t)
  }, [phase, fx.motion])

  const toSvg = (e: React.PointerEvent): Pt | null => {
    const el = svg.current
    const m = el?.getScreenCTM()
    if (!el || !m) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return { x: p.x, y: p.y }
  }

  /** Passa betume no caminho do dedo (interpolado, para deslizes rápidos). */
  const paint = (from: Pt, to: Pt) => {
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y)))
    let changed = false
    const next = covered.map((g) => [...g])
    for (let s = 0; s <= steps; s++) {
      const x = from.x + ((to.x - from.x) * s) / steps
      const y = from.y + ((to.y - from.y) * s) / steps
      GAPS.forEach((g, i) => {
        if (Math.abs(y - g.y) > 4.5 || x < g.x1 - 1.5 || x > g.x2 + 1.5) return
        const bin = Math.min(BINS - 1, Math.max(0, Math.floor(((x - g.x1) / (g.x2 - g.x1)) * BINS)))
        if (!next[i][bin]) {
          next[i][bin] = true
          changed = true
        }
      })
    }
    if (!changed) return
    const before = sealedCount(covered)
    const after = sealedCount(next)
    setCovered(next)
    if (after > before) {
      vibrate(HAPTIC.vote)
      stinger("tap", after / GAPS.length)
      report.current(stagedScore(after / GAPS.length, PARTS, 0, GAME_MS), false)
    }
  }

  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = toSvg(e)
    if (!p) return
    e.currentTarget.setPointerCapture(e.pointerId)
    if (phase === "vedar") {
      last.current = p
      setBrush(p)
      paint(p, p)
    } else if (phase === "bebe" && !babyIn && Math.hypot(p.x - baby.x, p.y - baby.y) < 18) {
      dragging.current = true
      setHeld(true)
      setBaby(p)
    } else if (phase === "rio" && Math.hypot(p.x - basket.x, p.y - basket.y) < 16) {
      dragging.current = true
      setHeld(true)
      setBasket(p)
    }
  }

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === "mouse" && e.buttons === 0) return
    const p = toSvg(e)
    if (!p) return
    if (phase === "vedar" && last.current) {
      paint(last.current, p)
      last.current = p
      setBrush(p)
    } else if (phase === "bebe" && dragging.current) {
      setBaby({ x: Math.max(8, Math.min(92, p.x)), y: Math.max(14, Math.min(130, p.y)) })
    } else if (phase === "rio" && dragging.current) {
      setBasket({ x: Math.max(6, Math.min(94, p.x)), y: Math.max(40, Math.min(144, p.y)) })
    }
  }

  const up = () => {
    last.current = null
    setBrush(null)
    if (phase === "bebe" && dragging.current) {
      dragging.current = false
      setHeld(false)
      if (Math.hypot(baby.x - BASKET_MOUTH.x, baby.y - BASKET_MOUTH.y) < 22) {
        setBaby(BASKET_MOUTH)
        setBabyIn(true)
        vibrate(HAPTIC.vote)
        stinger("reveal")
        report.current(stagedScore(2, PARTS, 0, GAME_MS), false)
      } else setBaby(BABY_START)
      return
    }
    if (phase !== "rio" || !dragging.current) return
    dragging.current = false
    setHeld(false)
    if (Math.hypot(basket.x - RECEIVER.x, basket.y - RECEIVER.y) < 16) {
      setBasket({ x: RECEIVER.x - 1, y: RECEIVER.y - 12 })
      setPhase("entregue")
      vibrate(HAPTIC.seal)
      stinger("reveal")
      finish(stagedScore(3, PARTS, leftRef.current, GAME_MS))
    }
  }

  const inRiver = phase === "rio" || phase === "entregue"
  const hint = phase === "vedar" ? game.instruction : phase === "bebe" ? game.babyHint : game.riverHint

  return (
    <div className="relative h-full w-full touch-none overflow-hidden select-none">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <div className="absolute inset-0 bg-black/30" />
      <svg
        ref={svg}
        viewBox="0 0 100 150"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full overflow-visible"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="img"
        aria-label={hint}
      >
        <defs>
          <clipPath id="cesto-corpo">
            <path d={BASKET} />
          </clipPath>
          <linearGradient id="rio" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3f8a8f" />
            <stop offset="1" stopColor="#0f3438" />
          </linearGradient>
        </defs>

        <AnimatePresence mode="wait">
          {phase === "bebe" ? (
            <motion.g key="bebe" initial={fx.motion ? { opacity: 0 } : false} animate={{ opacity: 1 }}>
              <WovenBasket sealed />
              {!babyIn && (
                <motion.ellipse cx={BASKET_MOUTH.x} cy={BASKET_MOUTH.y} rx="20" ry="6" fill="none" stroke="#f4d27a" strokeWidth="0.8" strokeDasharray="2 2" animate={fx.motion ? { opacity: [0.9, 0.3, 0.9] } : undefined} transition={{ duration: 1.4, repeat: Infinity }} />
              )}
              <motion.g animate={{ x: baby.x - 50, y: baby.y - 74 }} transition={held ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 18 }}>
                <Baby />
              </motion.g>
              {babyIn && <path d="M 22 72 Q 50 80 78 72 L 78 76 Q 50 84 22 76 Z" fill="#6b4824" />}
            </motion.g>
          ) : !inRiver ? (
            <motion.g key="vedar" exit={fx.motion ? { opacity: 0, scale: 0.6 } : { opacity: 0 }} style={{ transformOrigin: "50px 90px" }}>
              <WovenBasket />
              {GAPS.map((g, i) => {
                const w = (g.x2 - g.x1) / BINS
                const done = covered[i].filter(Boolean).length >= BINS - 1
                return (
                  <g key={i}>
                    {!done && <Slit gap={g} />}
                    {!done && fx.motion && <Drip x={(g.x1 + g.x2) / 2} y={g.y} delay={i * 0.35} />}
                    {done ? (
                      <line x1={g.x1 - 1} x2={g.x2 + 1} y1={g.y} y2={g.y} stroke="#140d06" strokeWidth="4.6" strokeLinecap="round" />
                    ) : (
                      covered[i].map((c, b) =>
                        c ? <line key={b} x1={g.x1 + b * w} x2={g.x1 + (b + 1) * w} y1={g.y} y2={g.y} stroke="#140d06" strokeWidth="4.6" strokeLinecap="round" /> : null,
                      )
                    )}
                    {done && <line x1={g.x1 + 1} x2={g.x2 - 2} y1={g.y - 1} y2={g.y - 1} stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.7" strokeLinecap="round" />}
                  </g>
                )
              })}
              {brush && <circle cx={brush.x} cy={brush.y} r="4" fill="#140d06" fillOpacity="0.85" stroke="#d8a948" strokeOpacity="0.6" strokeWidth="0.6" />}
            </motion.g>
          ) : (
            <motion.g key="rio" initial={fx.motion ? { opacity: 0 } : false} animate={{ opacity: 1 }}>
              <rect x="-60" y="78" width="220" height="140" fill="url(#rio)" />
              <rect x="-60" y="-80" width="220" height="158" fill="#4a3f26" fillOpacity="0.6" />
              {[90, 102, 114, 126, 138].map((y, i) => (
                <motion.path
                  key={y}
                  d={`M -10 ${y} q 10 -2 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0`}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.12"
                  strokeWidth="0.8"
                  animate={fx.motion ? { x: [0, -8, 0] } : undefined}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
              <Reeds />
              <Princess />
              {phase === "rio" && (
                <motion.circle
                  cx={RECEIVER.x}
                  cy={RECEIVER.y}
                  r="10"
                  fill="none"
                  stroke="#f4d27a"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                  animate={fx.motion ? { opacity: [0.9, 0.3, 0.9] } : undefined}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              )}
              <motion.g animate={{ x: basket.x - 50, y: basket.y - 90 }} transition={held ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 18 }}>
                <g transform="translate(50 90) scale(0.2) translate(-50 -90)">
                  <WovenBasket sealed />
                  <g transform="translate(0 -4)">
                    <Baby />
                  </g>
                  <path d="M 22 72 Q 50 80 78 72 L 78 76 Q 50 84 22 76 Z" fill="#6b4824" />
                </g>
              </motion.g>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      <GameHud left={left} total={GAME_MS} score={score} label={phase === "vedar" ? "1 · vedar" : phase === "bebe" ? "2 · o menino" : "3 · a margem"} />
      <StepHint>
        {hint}{" · "}<span className="whitespace-nowrap">{formatRef(inRiver ? game.finale.ref : game.ref, "short")}</span>
      </StepHint>
      {phase === "vedar" && (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-sm font-semibold tabular-nums text-gold-bright [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
          Frestas vedadas {sealed}/{GAPS.length}
        </p>
      )}
      {/* Alternativas sem arrastar. */}
      {!finale && phase !== "entregue" && (
        <button
          type="button"
          onClick={() => {
            if (phase === "vedar") {
              const i = covered.findIndex((g) => g.filter(Boolean).length < BINS - 1)
              if (i >= 0) paint({ x: GAPS[i].x1, y: GAPS[i].y }, { x: GAPS[i].x2, y: GAPS[i].y })
            } else if (phase === "bebe" && !babyIn) {
              setBaby(BASKET_MOUTH)
              setBabyIn(true)
              report.current(stagedScore(2, PARTS, 0, GAME_MS), false)
            } else if (phase === "rio") {
              setBasket({ x: RECEIVER.x - 1, y: RECEIVER.y - 12 })
              setPhase("entregue")
              finish(stagedScore(3, PARTS, leftRef.current, GAME_MS))
            }
          }}
          className="absolute bottom-10 right-3 z-10 rounded-full border border-white/30 bg-black/55 px-3 py-1.5 text-xs text-white"
        >
          {phase === "vedar" ? "Vedar uma fresta" : phase === "bebe" ? "Colocar o menino" : "Levar o cesto"}
        </button>
      )}
      {finale && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} score={final ?? score} />}
    </div>
  )
}

/** O menino enrolado em panos, desenhado em volta do ponto (50, 74). */
function Baby() {
  return (
    <g>
      <ellipse cx="50" cy="76" rx="15" ry="7.5" fill="#efe6d2" stroke="#b9ab8c" strokeWidth="0.8" />
      <path d="M 40 74 Q 50 79 60 74" fill="none" stroke="#c9b994" strokeWidth="0.8" />
      <circle cx="36" cy="72.5" r="5.4" fill="#c08a5e" stroke="#8a5e3c" strokeWidth="0.6" />
      <path d="M 31.5 70 Q 36 66 40.5 70" fill="#3a2414" />
    </g>
  )
}

function WovenBasket({ sealed = false }: { sealed?: boolean }) {
  return (
    <g>
      <path d={BASKET} fill={sealed ? "#5a3d1e" : "#a77b45"} stroke="#4a3018" strokeWidth="1.2" />
      <g clipPath="url(#cesto-corpo)" stroke="#6e4a22" strokeOpacity="0.8" strokeWidth="0.9">
        {[74, 80, 86, 92, 98, 104, 110].map((y) => (
          <path key={y} d={`M 8 ${y} Q 50 ${y + 4} 92 ${y}`} fill="none" />
        ))}
        {[18, 26, 34, 42, 50, 58, 66, 74, 82].map((x) => (
          <line key={x} x1={x} x2={x + (x - 50) * 0.12} y1="68" y2="114" />
        ))}
      </g>
      {sealed && <path d={BASKET} fill="#140d06" fillOpacity="0.35" />}
      <ellipse cx="50" cy="68" rx="40" ry="8" fill={sealed ? "#6b4824" : "#bf9258"} stroke="#4a3018" strokeWidth="1.2" />
      <ellipse cx="50" cy="68" rx="33" ry="5" fill="#2a1a0c" fillOpacity="0.55" />
    </g>
  )
}

function Slit({ gap }: { gap: { y: number; x1: number; x2: number } }) {
  const n = 6
  const d = Array.from({ length: n + 1 }, (_, i) => {
    const x = gap.x1 + ((gap.x2 - gap.x1) * i) / n
    const y = gap.y + (i % 2 === 0 ? -0.9 : 0.9)
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(" ")
  return (
    <g>
      <path d={d} fill="none" stroke="#bfe6ff" strokeOpacity="0.35" strokeWidth="3.4" strokeLinecap="round" />
      <path d={d} fill="none" stroke="#e8f7ff" strokeWidth="1.3" strokeLinecap="round" />
    </g>
  )
}

function Drip({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.circle
      cx={x}
      r="1"
      fill="#bfe6ff"
      initial={{ cy: y + 1, opacity: 0 }}
      animate={{ cy: [y + 1, y + 26], opacity: [0.9, 0] }}
      transition={{ duration: 1.3, repeat: Infinity, delay, ease: "easeIn" }}
    />
  )
}

function Reeds() {
  const stems = [4, 9, 13, 18, 30, 35, 39, 44]
  return (
    <g stroke="#5f8f3e" strokeWidth="1.3" strokeLinecap="round">
      {stems.map((x, i) => (
        <g key={x}>
          <path d={`M ${x} 146 Q ${x + (i % 2 ? 2 : -2)} 124 ${x + (i % 2 ? 3 : -1)} ${100 + (i % 3) * 4}`} fill="none" />
          <ellipse cx={x + (i % 2 ? 3 : -1)} cy={98 + (i % 3) * 4} rx="1.4" ry="3.6" fill="#8a6a3a" stroke="none" />
        </g>
      ))}
    </g>
  )
}

/** A filha do faraó na margem: silhueta simples (linho, peruca e colar). */
function Princess() {
  return (
    <g transform="translate(74 22)">
      <path d="M -9 50 L -6 20 Q 0 16 6 20 L 9 50 Z" fill="#efe6d2" stroke="#b9ab8c" strokeWidth="0.5" />
      <path d="M -5.5 21 Q 0 25 5.5 21 L 5 18 Q 0 21 -5 18 Z" fill="#d8a948" />
      <path d="M -6 22 Q -11 32 -5 38" fill="none" stroke="#b07a52" strokeWidth="2" strokeLinecap="round" />
      <path d="M 6 22 Q 11 32 5 38" fill="none" stroke="#b07a52" strokeWidth="2" strokeLinecap="round" />
      <rect x="-1.4" y="13" width="2.8" height="4" fill="#b07a52" />
      <circle cx="0" cy="10" r="4.2" fill="#b07a52" />
      <path d="M -5 7 Q 0 1 5 7 L 5.5 17 L 2.5 15 L 2.5 9 Q 0 7 -2.5 9 L -2.5 15 L -5.5 17 Z" fill="#1b1410" />
      <path d="M -4.6 6.6 Q 0 3.6 4.6 6.6" fill="none" stroke="#d8a948" strokeWidth="0.8" />
    </g>
  )
}
