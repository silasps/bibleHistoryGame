"use client"

/* eslint-disable @next/next/no-img-element */

import { motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { artFile } from "@/components/art/art-files"
import type { SteerGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { Backdrop } from "../etapa-1/art"
import { Finale, GameHint } from "./Finale"

interface Obstacle {
  key: number
  x: number
  y: number
}

/**
 * Guiar: o rio corre e o dedo leva o cesto entre os juncos (Êx 2:3). Esbarrar
 * só balança o cesto; ele sempre chega (Êx 2:5–6).
 */
export function Steer({ game, onProgress }: { game: SteerGame; onProgress: (value: number, done: boolean) => void }) {
  const fx = useFx()
  const area = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(50)
  const [elapsed, setElapsed] = useState(0)
  const [reeds, setReeds] = useState<Obstacle[]>([])
  const [bump, setBump] = useState(0)
  const xRef = useRef(50)
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])
  const done = elapsed >= game.seconds
  const basket = artFile("objetos", "cesto")

  // O rio corre: juncos descem; o tempo leva o cesto até a filha do faraó.
  const reedsRef = useRef<Obstacle[]>([])
  const elapsedRef = useRef(0)
  useEffect(() => {
    if (done) return
    let raf = 0
    let prev = performance.now()
    let key = 0
    let spawnIn = 0
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      spawnIn -= dt
      let next = reedsRef.current.map((r) => ({ ...r, y: r.y + dt * 28 })).filter((r) => r.y < 110)
      if (spawnIn <= 0) {
        spawnIn = 0.9
        next.push({ key: key++, x: 8 + Math.random() * 84, y: -6 })
      }
      // Esbarrou num junco: o cesto balança e o junco some.
      const hit = next.find((r) => Math.abs(r.y - 80) < 5 && Math.abs(r.x - xRef.current) < 9)
      if (hit) {
        vibrate(HAPTIC.vote)
        setBump((b) => b + 1)
        next = next.filter((r) => r !== hit)
      }
      reedsRef.current = next
      setReeds(next)
      const before = elapsedRef.current
      const t = Math.min(game.seconds, before + dt)
      elapsedRef.current = t
      setElapsed(t)
      const tenth = (v: number) => Math.floor((v / game.seconds) * 10)
      if (tenth(t) !== tenth(before) || t >= game.seconds) report.current(Math.round((t / game.seconds) * 100), t >= game.seconds)
      if (t < game.seconds) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [done, game.seconds])

  const steer = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.buttons === 0) return
    const r = area.current!.getBoundingClientRect()
    const next = Math.max(6, Math.min(94, ((e.clientX - r.left) / r.width) * 100))
    xRef.current = next
    setX(next)
  }

  return (
    <div ref={area} className="relative h-full w-full touch-none overflow-hidden select-none" onPointerDown={steer} onPointerMove={steer}>
      <Backdrop name={game.art} portrait palette={game.palette} />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0,transparent_40px,rgba(255,255,255,0.06)_40px,rgba(255,255,255,0.06)_42px)]" />
      <GameHint>
        {game.instruction} · {formatRef(game.ref, "short")}
      </GameHint>
      {reeds.map((r) => (
        <span key={r.key} className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl" style={{ left: `${r.x}%`, top: `${r.y}%` }} aria-hidden>
          🌾
        </span>
      ))}
      <div className="absolute top-[80%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%` }} role="img" aria-label="O cesto">
        <motion.div key={bump} animate={fx.motion && bump ? { x: [0, -8, 8, -4, 0] } : undefined} transition={{ duration: 0.4 }}>
          {basket ? <img src={basket} alt="" className="h-16 w-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" draggable={false} /> : <span className="text-5xl">🧺</span>}
        </motion.div>
      </div>
      <div className="absolute inset-x-4 bottom-3 h-1.5 overflow-hidden rounded-full bg-black/40">
        <div className="h-full rounded-full bg-gold" style={{ width: `${(elapsed / game.seconds) * 100}%` }} />
      </div>
      {done && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} />}
    </div>
  )
}
