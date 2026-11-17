"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { CircleGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { addAngle, LAP_START, liftFinger, type LapState } from "@/domain/laps"
import { lapsScore } from "@/domain/score"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale } from "./Finale"
import { GAME_MS, GameHud, StepHint, useCountdown } from "./kit"

type Phase = "dias" | "setimo" | "gritar" | "caindo" | "fim"

/** A cidade murada, vista de cima. */
function City({ falling }: { falling: boolean }) {
  const fx = useFx()
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <motion.circle cx="50" cy="50" r="26" fill="#9a7448" stroke="#4a3018" strokeWidth="2" animate={falling && fx.motion ? { r: [26, 28, 30], opacity: [1, 0.7, 0.35] } : undefined} transition={{ duration: 1.2 }} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <motion.rect
            key={i}
            x={50 + Math.cos(a) * 26 - 3}
            y={50 + Math.sin(a) * 26 - 3}
            width="6"
            height="6"
            fill="#c9a06a"
            stroke="#4a3018"
            strokeWidth="1"
            animate={falling && fx.motion ? { x: 50 + Math.cos(a) * 36 - 3, y: 50 + Math.sin(a) * 36 - 3, rotate: 40 + i * 13, opacity: 0.6 } : undefined}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        )
      })}
      <circle cx="50" cy="50" r="14" fill="#b88a58" />
      <rect x="44" y="44" width="12" height="12" fill="#8a643c" />
    </svg>
  )
}

/**
 * Jericó (Js 6:3–5,20): seis dias, uma volta por dia; no sétimo, sete voltas.
 * O dedo gira em volta da cidade; cada volta completa enche a barra. Depois,
 * as trombetas e o grito, e as muralhas caem.
 */
export function Circle({ game, onProgress, stopped }: { game: CircleGame; onProgress: (value: number, done: boolean) => void; stopped: boolean }) {
  const fx = useFx()
  const stinger = useStinger()
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])
  const box = useRef<HTMLDivElement>(null)
  const goal = game.laps.at(-1) ?? 7
  const before = game.laps.length - 1
  const [phase, setPhase] = useState<Phase>("dias")
  const [day, setDay] = useState(0)
  const [laps, setLaps] = useState(0)
  const [final, setFinal] = useState<number | null>(null)
  const track = useRef<LapState>(LAP_START)
  const [trail, setTrail] = useState<{ x: number; y: number } | null>(null)

  const finish = useCallback((score: number) => {
    setFinal((f) => {
      if (f !== null) return f
      report.current(score, true)
      return score
    })
    setPhase("fim")
  }, [])
  const running = phase !== "dias" && final === null && !stopped
  const { left, leftRef } = useCountdown(GAME_MS, running, () => finish(lapsScore(track.current.laps, goal, 0, GAME_MS)))
  useEffect(() => {
    if (stopped && final === null) finish(lapsScore(track.current.laps, goal, 0, GAME_MS))
  }, [stopped, final, finish, goal])

  // Os seis primeiros dias passam rápido: uma volta por dia (Js 6:3,14).
  useEffect(() => {
    if (phase !== "dias") return
    if (day >= before) {
      const t = setTimeout(() => setPhase("setimo"), fx.motion ? 600 : 0)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setDay((d) => d + 1), fx.motion ? 650 : 50)
    return () => clearTimeout(t)
  }, [phase, day, before, fx.motion])

  const lapDone = (n: number) => {
    setLaps(n)
    vibrate(HAPTIC.vote)
    stinger("tap", n / goal)
    report.current(lapsScore(n, goal, 0, GAME_MS), false)
    if (n >= goal) {
      setPhase("gritar")
      report.current(lapsScore(goal, goal, leftRef.current, GAME_MS), false)
    }
  }

  const point = (e: React.PointerEvent) => {
    if (phase !== "setimo" || (e.pointerType === "mouse" && e.buttons === 0)) return
    const r = box.current!.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    // Perto demais do centro não conta (o dedo precisa dar a volta na cidade).
    if (Math.hypot(dx, dy) < Math.min(r.width, r.height) * 0.16) return
    setTrail({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
    const next = addAngle(track.current, Math.atan2(dy, dx))
    const gained = next.laps > track.current.laps
    track.current = next
    if (gained) lapDone(Math.min(goal, next.laps))
  }

  const oneLap = () => {
    if (phase !== "setimo") return
    track.current = { ...track.current, laps: track.current.laps + 1, acc: (track.current.laps + 1) * 2 * Math.PI }
    lapDone(Math.min(goal, track.current.laps))
  }

  const shout = () => {
    if (phase !== "gritar") return
    vibrate(HAPTIC.seal)
    stinger("reveal")
    setPhase("caindo")
    const score = lapsScore(goal, goal, leftRef.current, GAME_MS)
    setTimeout(() => finish(score), fx.motion ? 1600 : 100)
  }

  return (
    <div className="relative h-full w-full touch-none overflow-hidden select-none">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <div className="absolute inset-0 bg-black/30" />
      <GameHud left={left} total={GAME_MS} score={final ?? lapsScore(laps, goal, 0, GAME_MS)} label={phase === "dias" ? `Dia ${Math.min(day + 1, before)} · uma volta` : `Sétimo dia · ${laps}/${goal}`} />
      <StepHint>
        {phase === "dias" ? `Seis dias, uma volta por dia · ${formatRef(game.ref, "short")}` : phase === "setimo" ? `${game.instruction} · Js 6:4` : phase === "gritar" ? "Sete voltas! Agora, as trombetas e o grito · Js 6:5" : ""}
      </StepHint>
      <div
        ref={box}
        className="absolute inset-x-0 bottom-20 top-20 mx-auto aspect-square max-h-[60%] max-w-[92%]"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          track.current = liftFinger(track.current)
          point(e)
        }}
        onPointerMove={point}
        onPointerUp={() => {
          track.current = liftFinger(track.current)
          setTrail(null)
        }}
      >
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <circle cx="50" cy="50" r="42" fill="none" stroke="#f4d27a" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="3 3" />
          {phase === "dias" && (
            <motion.circle key={day} r="3" fill="#f4d27a" initial={{ cx: 92, cy: 50 }} animate={fx.motion ? { cx: [92, 50, 8, 50, 92], cy: [50, 92, 50, 8, 50] } : undefined} transition={{ duration: 0.6 }} />
          )}
        </svg>
        <div className="pointer-events-none absolute inset-[18%]">
          <City falling={phase === "caindo" || phase === "fim"} />
        </div>
        {trail && <span className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-bright/70 shadow-[0_0_16px_#f4d27a]" style={{ left: `${trail.x}%`, top: `${trail.y}%` }} />}
      </div>
      {/* Seis dias + as sete voltas do sétimo dia. */}
      <div className="absolute inset-x-5 bottom-3 z-10 space-y-1">
        <div className="flex items-center gap-1">
          {Array.from({ length: before }, (_, i) => (
            <span key={`d${i}`} className={`h-2 w-3 rounded-full ${i < day || phase !== "dias" ? "bg-sand" : "bg-white/20"}`} title={`Dia ${i + 1}`} />
          ))}
          <span className="mx-1 text-[0.6rem] text-sand">7º</span>
          {Array.from({ length: goal }, (_, i) => (
            <motion.span key={`v${i}`} className="h-3 flex-1 rounded-full" animate={{ backgroundColor: i < laps ? "#f4d27a" : "rgba(255,255,255,0.18)" }} />
          ))}
        </div>
        {phase === "setimo" && (
          <button type="button" onClick={oneLap} className="mx-auto block rounded-full border border-white/30 bg-black/55 px-4 py-1.5 text-xs text-white">
            Dar uma volta
          </button>
        )}
      </div>
      <AnimatePresence>
        {phase === "gritar" && (
          <motion.button
            type="button"
            onClick={shout}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-8 top-[44%] z-20 rounded-full border-2 border-gold-bright bg-gold/90 px-4 py-4 text-lg font-semibold text-night shadow-[0_0_30px_rgba(244,210,122,0.6)]"
          >
            📯 {game.finalAction}
          </motion.button>
        )}
      </AnimatePresence>
      {phase === "fim" && final !== null && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} score={final} />}
    </div>
  )
}
