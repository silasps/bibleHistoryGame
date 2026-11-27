"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { GAME_SECONDS } from "@/content/etapas/jogos"
import { cn } from "@/lib/utils"

export const GAME_MS = GAME_SECONDS * 1000

/** Mantém a função de progresso mais recente sem refazer efeitos. */
export function useLatest<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}

/**
 * Relógio regressivo do jogo. Para quando `running` fica falso e chama
 * `onEnd` uma vez ao zerar.
 */
export function useCountdown(totalMs: number, running: boolean, onEnd?: () => void) {
  const [left, setLeft] = useState(totalMs)
  const leftRef = useRef(totalMs)
  const end = useLatest(onEnd)
  useEffect(() => {
    if (!running) return
    let prev = performance.now()
    const t = setInterval(() => {
      const now = performance.now()
      const next = Math.max(0, leftRef.current - (now - prev))
      prev = now
      leftRef.current = next
      setLeft(next)
      if (next <= 0) {
        clearInterval(t)
        end.current?.()
      }
    }, 100)
    return () => clearInterval(t)
  }, [running, end])
  const reset = (ms = totalMs) => {
    leftRef.current = ms
    setLeft(ms)
  }
  return { left, leftRef, reset }
}

/** Barra do topo: tempo que sobra, pontos e um rótulo curto (ex.: "Pares 3/7"). */
export function GameHud({ left, total, score, label, className }: { left: number; total: number; score: number; label?: string; className?: string }) {
  const share = Math.max(0, Math.min(1, left / total))
  const low = left < Math.min(10_000, total / 3)
  return (
    <div className={cn("pointer-events-none absolute inset-x-0 top-0 z-20 space-y-1 bg-gradient-to-b from-black/70 to-transparent px-3 pb-4 pt-2", className)}>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Tempo" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share * 100)}>
        <div className={cn("h-full rounded-full transition-[width] duration-100", low ? "bg-[#ff8576]" : "bg-gold-bright")} style={{ width: `${share * 100}%` }} />
      </div>
      <div className="flex items-center justify-between gap-2 text-sm font-semibold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
        <span className="tabular-nums">{Math.ceil(left / 1000)}s</span>
        {label && <span className="min-w-0 truncate text-center text-xs font-normal text-sand">{label}</span>}
        <span className="tabular-nums text-gold-bright">{score} pts</span>
      </div>
    </div>
  )
}

/** Faixa de instrução logo abaixo da barra. */
export function StepHint({ children }: { children: React.ReactNode }) {
  return <p className="pointer-events-none absolute inset-x-0 top-12 z-10 px-4 text-center text-sm leading-snug text-parchment [text-shadow:0_1px_8px_rgba(0,0,0,0.95)]">{children}</p>
}

export interface PopItem {
  key: number
  x: number
  y: number
  text: string
  good: boolean
}

/** "+100" / "✕" que sobem e somem onde o dedo tocou. */
export function Pops({ items }: { items: PopItem[] }) {
  return (
    <AnimatePresence>
      {items.map((p) => (
        <motion.span
          key={p.key}
          className={cn("pointer-events-none absolute z-20 -translate-x-1/2 font-display text-2xl font-bold [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]", p.good ? "text-gold-bright" : "text-[#ff8576]")}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -40 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          {p.text}
        </motion.span>
      ))}
    </AnimatePresence>
  )
}

/** Lista de pops com limpeza automática. */
export function usePops() {
  const [pops, setPops] = useState<PopItem[]>([])
  const next = useRef(0)
  const add = (x: number, y: number, text: string, good = true) => {
    const key = next.current++
    setPops((p) => [...p.slice(-6), { key, x, y, text, good }])
    setTimeout(() => setPops((p) => p.filter((i) => i.key !== key)), 950)
  }
  return { pops, add }
}

/** Gerador pseudoaleatório com semente (posições que não mudam a cada render). */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}
