"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { SeaGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { seaScore } from "@/domain/score"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Finale } from "./Finale"
import { GAME_MS, GameHud, StepHint, useCountdown } from "./kit"

// Celular em pé, viewBox 100×150: margem do Egito embaixo, mar no meio, a outra margem em cima.
const SEA_TOP = 40
const SEA_BOTTOM = 108
const LANE = { x1: 38, x2: 62 }
const STAFF_START = { x: 26, y: 122 }
const SAFE_Y = 30

type Phase = "cajado" | "travessia" | "fechando" | "fim"
type Pt = { x: number; y: number }

const homeOf = (i: number, n: number): Pt => ({ x: 14 + (72 * i) / Math.max(1, n - 1), y: 132 })
const safeOf = (i: number, n: number): Pt => ({ x: 14 + (72 * i) / Math.max(1, n - 1), y: 18 })

function Group({ safe }: { safe: boolean }) {
  return (
    <g>
      {[-4, 0, 4].map((dx, i) => (
        <g key={i} transform={`translate(${dx} ${i === 1 ? -1.5 : 0})`}>
          <circle cx="0" cy="-5" r="1.9" fill={safe ? "#f4d27a" : "#e9dcc0"} />
          <path d="M -2.2 -2.8 L 2.2 -2.8 L 2.8 4 L -2.8 4 Z" fill={safe ? "#d8a948" : "#a58a62"} />
        </g>
      ))}
    </g>
  )
}

function Chariot({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-5" y="-3" width="10" height="5" rx="1" fill="#7a1f25" stroke="#2a0a0c" strokeWidth="0.6" />
      <circle cx="-3.5" cy="3" r="2.2" fill="none" stroke="#2a0a0c" strokeWidth="0.9" />
      <circle cx="3.5" cy="3" r="2.2" fill="none" stroke="#2a0a0c" strokeWidth="0.9" />
      <path d="M -1 -3 L 0 -8 L 1 -3" fill="#c0a050" />
    </g>
  )
}

/**
 * O mar se abre (Êx 14): o cajado toca o mar e as águas se dividem; os grupos
 * atravessam em terra seca antes do exército chegar. Se o tempo acaba, tenta
 * de novo. No fim, o exército entra e o mar volta sobre ele.
 */
export function SeaCrossing({ game, onProgress, stopped }: { game: SeaGame; onProgress: (value: number, done: boolean) => void; stopped: boolean }) {
  const fx = useFx()
  const stinger = useStinger()
  const svg = useRef<SVGSVGElement>(null)
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])
  const crossMs = game.crossSeconds * 1000
  const [phase, setPhase] = useState<Phase>("cajado")
  const [staff, setStaff] = useState<Pt>(STAFF_START)
  const [crossed, setCrossed] = useState<boolean[]>(() => Array(game.groups).fill(false))
  const [drag, setDrag] = useState<{ i: number; p: Pt } | null>(null)
  const [attempt, setAttempt] = useState(1)
  const [lost, setLost] = useState(false)
  const [final, setFinal] = useState<number | null>(null)
  const draggingStaff = useRef(false)
  const [staffHeld, setStaffHeld] = useState(false)
  const nCrossed = crossed.filter(Boolean).length

  const finish = useCallback((score: number) => {
    setFinal((f) => {
      if (f !== null) return f
      report.current(score, true)
      return score
    })
    setPhase("fim")
  }, [])

  const game_ = useCountdown(GAME_MS, final === null && !stopped, () => finish(seaScore(nCrossed, game.groups, false, 0, crossMs, attempt)))
  const cross = useCountdown(crossMs, phase === "travessia" && !lost && final === null && !stopped, () => {
    setLost(true)
    vibrate(HAPTIC.light)
  })
  const score = final ?? seaScore(nCrossed, game.groups, false, 0, crossMs, attempt)

  useEffect(() => {
    if (stopped && final === null) finish(seaScore(nCrossed, game.groups, false, 0, crossMs, attempt))
  }, [stopped, final, finish, nCrossed, game.groups, crossMs, attempt])


  const toSvg = (e: React.PointerEvent): Pt | null => {
    const m = svg.current?.getScreenCTM()
    if (!m) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return { x: p.x, y: p.y }
  }

  const openSea = () => {
    if (phase !== "cajado") return
    vibrate(HAPTIC.seal)
    stinger("whoosh")
    setStaff({ x: 50, y: SEA_BOTTOM - 4 })
    setPhase("travessia")
    report.current(seaScore(0, game.groups, false, 0, crossMs, 1), false)
  }

  const land = (i: number) => {
    if (i < 0 || crossed[i] || phase !== "travessia") return
    const next = crossed.map((v, j) => v || j === i)
    const n = next.filter(Boolean).length
    setCrossed(next)
    vibrate(HAPTIC.vote)
    stinger("vote")
    if (n < game.groups) {
      report.current(seaScore(n, game.groups, false, 0, crossMs, attempt), false)
      return
    }
    // Todos do outro lado: o exército entra no mar, e o mar volta (Êx 14:23,28).
    const won = seaScore(game.groups, game.groups, true, cross.leftRef.current, crossMs, attempt)
    setPhase("fechando")
    stinger("reveal")
    setTimeout(() => finish(won), fx.motion ? 2600 : 200)
  }

  const retry = () => {
    setCrossed(Array(game.groups).fill(false))
    setAttempt((a) => a + 1)
    setLost(false)
    cross.reset()
  }

  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = toSvg(e)
    if (!p || final !== null) return
    e.currentTarget.setPointerCapture(e.pointerId)
    if (phase === "cajado" && Math.hypot(p.x - staff.x, p.y - staff.y) < 16) {
      draggingStaff.current = true
      setStaffHeld(true)
      setStaff(p)
    } else if (phase === "travessia" && !lost) {
      const i = crossed.findIndex((c, j) => !c && Math.hypot(p.x - homeOf(j, game.groups).x, p.y - homeOf(j, game.groups).y) < 9)
      if (i >= 0) setDrag({ i, p })
    }
  }
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === "mouse" && e.buttons === 0) return
    const p = toSvg(e)
    if (!p) return
    if (draggingStaff.current) {
      setStaff(p)
      if (p.y < SEA_BOTTOM && p.y > SEA_TOP - 10) {
        draggingStaff.current = false
        setStaffHeld(false)
        openSea()
      }
    } else if (drag) setDrag({ i: drag.i, p: { x: Math.max(4, Math.min(96, p.x)), y: Math.max(8, Math.min(144, p.y)) } })
  }
  const up = () => {
    if (draggingStaff.current) {
      draggingStaff.current = false
      setStaffHeld(false)
      setStaff(STAFF_START)
    }
    if (!drag) return
    // Precisa passar pelo caminho seco e chegar à outra margem.
    if (drag.p.y < SAFE_Y) land(drag.i)
    setDrag(null)
  }

  const open = phase === "travessia" || phase === "fechando"
  const closing = phase === "fechando" || (phase === "fim" && nCrossed === game.groups)
  // O exército avança de baixo para cima conforme o tempo da travessia passa.
  const armyY = phase === "travessia" ? 150 - (1 - cross.left / crossMs) * 18 : closing ? 70 : 152
  const wallGap = open && !closing ? 1 : 0

  return (
    <div className="relative h-full w-full touch-none overflow-hidden select-none bg-[#c9b58a]">
      <svg
        ref={svg}
        viewBox="0 0 100 150"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="img"
        aria-label={phase === "cajado" ? game.staffHint : game.crossHint}
      >
        <rect x="0" y="0" width="100" height={SEA_TOP} fill="#b9a275" />
        <rect x="0" y={SEA_BOTTOM} width="100" height={150 - SEA_BOTTOM} fill="#c9b58a" />
        {/* Caminho seco (Êx 14:22) e as duas muralhas de água. */}
        <rect x={LANE.x1} y={SEA_TOP} width={LANE.x2 - LANE.x1} height={SEA_BOTTOM - SEA_TOP} fill="#a88f62" />
        <motion.rect y={SEA_TOP} height={SEA_BOTTOM - SEA_TOP} fill="#1f5f8f" animate={{ x: 0, width: wallGap ? LANE.x1 : 50.5 }} transition={{ duration: fx.motion ? 1.4 : 0, ease: "easeInOut" }} />
        <motion.rect y={SEA_TOP} height={SEA_BOTTOM - SEA_TOP} fill="#1f5f8f" animate={{ x: wallGap ? LANE.x2 : 49.5, width: wallGap ? 100 - LANE.x2 : 50.5 }} transition={{ duration: fx.motion ? 1.4 : 0, ease: "easeInOut" }} />
        {[52, 64, 76, 88, 100].map((y) => (
          <path key={y} d={`M 0 ${y} q 6 -2 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0`} fill="none" stroke="#ffffff" strokeOpacity={open && !closing ? 0.08 : 0.18} strokeWidth="0.7" />
        ))}
        {/* Moisés na margem. */}
        <g transform="translate(18 120)">
          <circle cx="0" cy="-8" r="2.6" fill="#c08a5e" />
          <path d="M -4 -5 L 4 -5 L 5 8 L -5 8 Z" fill="#8a6a3a" />
          <path d="M -3 -10 Q 0 -14 3 -10" fill="#e9e1d0" />
        </g>
        {/* Cajado. */}
        <motion.g animate={{ x: staff.x, y: staff.y }} transition={staffHeld ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 16 }}>
          <path d="M 0 -12 L 0 10" stroke="#6b4a2a" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 0 -12 q 4 -2 3 3" fill="none" stroke="#6b4a2a" strokeWidth="1.8" strokeLinecap="round" />
          {phase === "cajado" && <motion.circle r="9" fill="none" stroke="#f4d27a" strokeWidth="0.7" strokeDasharray="2 2" animate={fx.motion ? { opacity: [0.9, 0.2, 0.9] } : undefined} transition={{ duration: 1.3, repeat: Infinity }} />}
        </motion.g>
        {/* O povo. */}
        {crossed.map((c, i) => {
          const at = drag?.i === i ? drag.p : c ? safeOf(i, game.groups) : homeOf(i, game.groups)
          return (
            <motion.g key={i} animate={{ x: at.x, y: at.y }} transition={drag?.i === i ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 18 }} opacity={phase === "cajado" ? 0.6 : 1}>
              <Group safe={c} />
            </motion.g>
          )
        })}
        {/* O exército de faraó. */}
        {[30, 50, 70].map((x, i) => (
          <motion.g key={x} animate={{ y: armyY - 150 + (i === 1 ? -3 : 0) }} transition={{ duration: closing ? (fx.motion ? 1.6 : 0) : 0.2 }}>
            <Chariot x={x} y={150} />
          </motion.g>
        ))}
        {closing && fx.motion && <motion.rect x="0" y={SEA_TOP} width="100" height={SEA_BOTTOM - SEA_TOP} fill="#1f5f8f" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1] }} transition={{ duration: 2.4, times: [0, 0.6, 1] }} />}
        {open && !closing && <rect x="0" y="4" width="100" height={SAFE_Y - 4} fill="#f4d27a" fillOpacity="0.08" stroke="#f4d27a" strokeOpacity="0.4" strokeDasharray="2 2" strokeWidth="0.5" />}
      </svg>

      <GameHud left={game_.left} total={GAME_MS} score={score} label={phase === "travessia" ? `Do outro lado ${nCrossed}/${game.groups}` : undefined} />
      <StepHint>
        {phase === "cajado" ? game.staffHint : game.crossHint}{" · "}<span className="whitespace-nowrap">{formatRef(game.ref, "short")}</span>
      </StepHint>
      {phase === "travessia" && !lost && (
        <div className="pointer-events-none absolute inset-x-6 bottom-3 z-10">
          <div className="h-2 overflow-hidden rounded-full bg-black/40" role="progressbar" aria-label="Tempo da travessia" aria-valuenow={Math.round((cross.left / crossMs) * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-[#ff5a69]" style={{ width: `${(cross.left / crossMs) * 100}%` }} />
          </div>
          <p className="mt-1 text-center text-xs font-semibold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">O exército chega em {Math.ceil(cross.left / 1000)}s</p>
        </div>
      )}
      {/* Alternativas sem arrastar. */}
      {phase === "cajado" && (
        <button type="button" onClick={openSea} className="absolute bottom-3 right-3 z-10 rounded-full border border-white/30 bg-black/55 px-4 py-2 text-sm text-white">
          Estender o cajado
        </button>
      )}
      {phase === "travessia" && !lost && (
        <button type="button" onClick={() => land(crossed.findIndex((c) => !c))} className="absolute bottom-10 right-3 z-10 rounded-full border border-white/30 bg-black/55 px-3 py-1.5 text-xs text-white" aria-label="Atravessar um grupo">
          Atravessar grupo
        </button>
      )}
      <AnimatePresence>
        {lost && final === null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 grid place-items-center bg-black/70 p-6 text-center" role="alert">
            <div className="space-y-4">
              <p className="font-display text-2xl text-[#ffb98a]">{game.lose}</p>
              <button type="button" onClick={retry} className="rounded-full border-2 border-gold-bright bg-gold/90 px-6 py-3 text-lg font-semibold text-night">
                Tentar de novo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {phase === "fim" && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} score={final ?? score} />}
    </div>
  )
}
