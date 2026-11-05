"use client"

import { useEffect, useRef, useState } from "react"
import type { HoldGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { Backdrop } from "../etapa-1/art"
import { Finale, GameHint } from "./Finale"

/** Segurar: enquanto o dedo fica na tela, o vento sopra e o mar se abre (Êx 14:21). */
export function Hold({ game, onProgress }: { game: HoldGame; onProgress: (value: number, done: boolean) => void }) {
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const done = progress >= 100
  const current = useRef(0)
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])

  // Segurando, abre; soltando, as águas voltam devagar.
  useEffect(() => {
    if (done) return
    let raf = 0
    let prev = performance.now()
    const tick = (now: number) => {
      const dt = (now - prev) / 1000
      prev = now
      const before = current.current
      const next = Math.max(0, Math.min(100, before + (holding ? 100 / game.seconds : -12) * dt))
      current.current = next
      setProgress(next)
      // Avisa a sala a cada 10% e no fim.
      if (Math.floor(next / 10) !== Math.floor(before / 10) || next >= 100) report.current(Math.round(next), next >= 100)
      if (next < 100) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [holding, done, game.seconds])

  useEffect(() => {
    if (holding) vibrate(HAPTIC.light)
  }, [holding])

  const wall = `${Math.max(0, 50 - progress * 0.36)}%`
  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <Backdrop name={game.art} portrait palette={game.palette} />
      {/* As muralhas de água se afastam conforme o vento sopra. */}
      <div className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#062a4a,#1f6fa8_70%,#7fc4ef)] shadow-[8px_0_30px_rgba(127,196,239,0.6)] transition-[width] duration-75" style={{ width: wall }} />
      <div className="absolute inset-y-0 right-0 bg-[linear-gradient(270deg,#062a4a,#1f6fa8_70%,#7fc4ef)] shadow-[-8px_0_30px_rgba(127,196,239,0.6)] transition-[width] duration-75" style={{ width: wall }} />
      <GameHint>
        {game.instruction} · {formatRef(game.ref, "short")}
      </GameHint>
      {!done && (
        <button
          type="button"
          className={`absolute inset-x-6 bottom-6 h-20 rounded-full border text-lg font-semibold ${holding ? "border-gold bg-gold/30 text-gold-bright" : "border-white/40 bg-black/50 text-white"}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setHolding(true)
          }}
          onPointerUp={() => setHolding(false)}
          onPointerCancel={() => setHolding(false)}
          onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setHolding(true)}
          onKeyUp={() => setHolding(false)}
        >
          {holding ? "Soprando…" : "Segure aqui"} · {Math.round(progress)}%
        </button>
      )}
      {done && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} />}
    </div>
  )
}
