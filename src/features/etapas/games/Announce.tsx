"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { AnnounceGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { announceScore } from "@/domain/score"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale } from "./Finale"
import { GAME_MS, GameHud, StepHint, useCountdown } from "./kit"

type Phase = "cidade" | "rei" | "fim"

/** Um grupo de moradores: roupas coloridas; depois, pano de saco (Jn 3:5). */
function People({ sackcloth }: { sackcloth: boolean }) {
  return (
    <g>
      {[-5, 0, 5].map((dx, i) => (
        <g key={i} transform={`translate(${dx} ${sackcloth ? 1.6 : 0})`}>
          <circle cx="0" cy="-5.5" r="1.8" fill="#c08a5e" />
          <path d={sackcloth ? "M -2.6 -3.4 L 2.6 -3.4 L 3 2 L -3 2 Z" : "M -2.2 -3.4 L 2.2 -3.4 L 2.8 3.6 L -2.8 3.6 Z"} fill={sackcloth ? "#6a5a44" : ["#c0504a", "#4f8fc9", "#d8a948"][i]} />
        </g>
      ))}
    </g>
  )
}

/**
 * Nínive (Jn 3): Jonas percorre a cidade levando a mensagem; cada lugar
 * alcançado se veste de pano de saco. Por último, o palácio: o rei se senta na
 * cinza e manda todos se voltarem para Deus. E Deus tem compaixão (Jn 3:10).
 */
export function Announce({ game, onProgress, stopped }: { game: AnnounceGame; onProgress: (value: number, done: boolean) => void; stopped: boolean }) {
  const fx = useFx()
  const stinger = useStinger()
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])
  const palace = game.places.at(-1)!
  const start = game.places[0]
  const [jonas, setJonas] = useState({ x: start.x, y: start.y })
  const [visited, setVisited] = useState<string[]>([start.id])
  const [walking, setWalking] = useState(false)
  const [walkMs, setWalkMs] = useState(0)
  const [bubble, setBubble] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>("cidade")
  const [final, setFinal] = useState<number | null>(null)
  const total = game.places.length

  const finish = useCallback((score: number) => {
    setFinal((f) => {
      if (f !== null) return f
      report.current(score, true)
      return score
    })
    setPhase("fim")
  }, [])
  const { left, leftRef } = useCountdown(GAME_MS, final === null && !stopped && phase === "cidade", () => finish(announceScore(visited.length, total, 0, GAME_MS)))
  useEffect(() => {
    if (stopped && final === null) finish(announceScore(visited.length, total, 0, GAME_MS))
  }, [stopped, final, finish, visited.length, total])

  // A primeira mensagem já é dada na porta da cidade (Jn 3:4).
  useEffect(() => {
    const t = setTimeout(() => setBubble(game.message.label), 300)
    const u = setTimeout(() => setBubble(null), 2600)
    return () => {
      clearTimeout(t)
      clearTimeout(u)
    }
  }, [game.message.label])

  const go = (id: string) => {
    if (walking || final !== null || visited.includes(id)) return
    // O palácio só depois do resto da cidade: a notícia chega ao rei (Jn 3:6).
    if (id === palace.id && visited.length < total - 1) {
      setBubble("Primeiro, o resto da cidade!")
      setTimeout(() => setBubble(null), 1400)
      return
    }
    const p = game.places.find((x) => x.id === id)!
    const ms = fx.motion ? Math.max(400, Math.hypot(p.x - jonas.x, p.y - jonas.y) * 14) : 50
    setWalking(true)
    setWalkMs(ms)
    setJonas({ x: p.x, y: p.y })
    setTimeout(() => {
      setWalking(false)
      const next = [...visited, id]
      setVisited(next)
      setBubble(game.message.label)
      setTimeout(() => setBubble(null), 1500)
      vibrate(HAPTIC.vote)
      stinger("tap", next.length / total)
      if (next.length >= total) {
        const score = announceScore(total, total, leftRef.current, GAME_MS)
        report.current(score, false)
        setPhase("rei")
        stinger("reveal")
        setTimeout(() => finish(score), fx.motion ? 3200 : 300)
      } else report.current(announceScore(next.length, total, 0, GAME_MS), false)
    }, ms)
  }

  const nextFree = game.places.find((p) => !visited.includes(p.id) && (p.id !== palace.id || visited.length >= total - 1))

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <motion.div className="absolute inset-0" animate={{ backgroundColor: phase === "cidade" ? `rgba(20,14,8,${0.2 + (visited.length / total) * 0.35})` : "rgba(30,24,16,0.6)" }} />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 top-14 h-[calc(100%-3.5rem)] w-full" aria-hidden>
        <rect x="4" y="6" width="92" height="88" rx="3" fill="none" stroke="#7a5a34" strokeWidth="1.4" strokeDasharray="4 2" />
        {game.places.slice(0, -1).map((p, i) => {
          const q = game.places[i + 1]
          return <line key={p.id} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#e9dcc0" strokeOpacity="0.18" strokeWidth="0.6" />
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 top-14">
        {game.places.map((p) => {
          const done = visited.includes(p.id)
          const locked = p.id === palace.id && visited.length < total - 1
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => go(p.id)}
              disabled={done}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              aria-label={`${p.label}${done ? " (mensagem entregue)" : ""}`}
            >
              <svg viewBox="-9 -10 18 16" className="h-10 w-12" aria-hidden>
                {p.id === palace.id ? <path d="M -8 5 L -8 -3 L 0 -9 L 8 -3 L 8 5 Z" fill={done ? "#6a5a44" : "#c9a06a"} stroke="#4a3018" strokeWidth="0.8" /> : <People sackcloth={done} />}
              </svg>
              <span className={`mt-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${done ? "bg-black/60 text-sand" : locked ? "bg-black/50 text-mist" : "bg-gold/85 text-night"}`}>
                {locked ? "🔒 " : ""}
                {p.label}
              </span>
            </button>
          )
        })}
        {/* Jonas. */}
        <motion.div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[85%]"
          animate={{ left: `${jonas.x}%`, top: `${jonas.y}%` }}
          transition={{ duration: walking ? walkMs / 1000 : 0, ease: "easeInOut" }}
        >
          <svg viewBox="-6 -14 12 20" className="h-12 w-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]" aria-hidden>
            <circle cx="0" cy="-10" r="3" fill="#c08a5e" />
            <path d="M -4 -7 L 4 -7 L 5 6 L -5 6 Z" fill="#e9e1d0" stroke="#8a7a5a" strokeWidth="0.6" />
            <path d="M -3.4 -12 Q 0 -15 3.4 -12" fill="#5a4630" />
          </svg>
        </motion.div>
        <AnimatePresence>
          {bubble && (
            <motion.p
              key={bubble + visited.length}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-6 bottom-14 z-30 rounded-2xl bg-parchment px-3 py-2 text-center text-sm font-semibold leading-snug text-night shadow-lg"
            >
              {bubble}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <GameHud left={left} total={GAME_MS} score={final ?? announceScore(visited.length, total, 0, GAME_MS)} label={`Lugares ${visited.length}/${total}`} />
      <StepHint>
        {game.instruction}{" · "}<span className="whitespace-nowrap">{formatRef(game.message.ref, "short")}</span>
      </StepHint>
      {phase === "cidade" && nextFree && (
        <button type="button" onClick={() => go(nextFree.id)} className="absolute bottom-3 right-3 z-30 rounded-full border border-white/30 bg-black/55 px-3 py-1.5 text-xs text-white">
          Próximo lugar
        </button>
      )}
      <AnimatePresence>
        {phase === "rei" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 grid place-items-center bg-black/70 p-6 text-center" role="status">
            <div className="space-y-3">
              <p className="text-4xl" aria-hidden>
                👑🪨
              </p>
              <p className="font-display text-2xl leading-snug text-parchment">{game.king.label}</p>
              <p className="text-sm text-sand">{formatRef(game.king.ref, "long")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {phase === "fim" && final !== null && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} score={final} />}
    </div>
  )
}
