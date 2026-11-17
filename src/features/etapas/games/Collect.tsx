"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { CollectGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { manaScore } from "@/domain/score"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale } from "./Finale"
import { GAME_MS, GameHud, Pops, seeded, StepHint, useCountdown, usePops } from "./kit"

interface Flake {
  key: number
  x: number
  size: number
  fall: number
  sway: number
  delay: number
}

const VISIBLE = 6
/** Distância mínima (em % da largura) entre peças que caem juntas: nada de fila. */
const MIN_GAP = 16

/**
 * Maná (Êx 16): a cada manhã, a medida do dia; no sexto, o dobro. O que se
 * junta além da medida estraga (Êx 16:20). As porções caem espalhadas, em
 * tempos e velocidades diferentes.
 */
export function Collect({ game, onProgress, stopped }: { game: CollectGame; onProgress: (value: number, done: boolean) => void; stopped: boolean }) {
  const fx = useFx()
  const stinger = useStinger()
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])
  const rand = useRef(seeded(16))
  const nextKey = useRef(0)
  const totalPortions = game.rounds.reduce((a, b) => a + b, 0)
  const [round, setRound] = useState(0)
  const [got, setGot] = useState(0)
  const [flakes, setFlakes] = useState<Flake[]>([])
  const [between, setBetween] = useState(false)
  const [final, setFinal] = useState<number | null>(null)
  const tally = useRef({ portions: 0, spoiled: 0 })
  const [spoiled, setSpoiled] = useState(0)
  const [portions, setPortions] = useState(0)
  const { pops, add } = usePops()
  const target = game.rounds[round] ?? 0

  const finish = useCallback(
    (finished: boolean, leftMs: number) => {
      setFinal((f) => {
        if (f !== null) return f
        const s = manaScore(tally.current.portions, tally.current.spoiled, finished, leftMs, GAME_MS, totalPortions)
        report.current(s, true)
        return s
      })
    },
    [totalPortions],
  )
  const { left, leftRef } = useCountdown(GAME_MS, final === null && !stopped, () => finish(false, 0))
  useEffect(() => {
    if (stopped) finish(false, 0)
  }, [stopped, finish])
  const score = final ?? manaScore(portions, spoiled, false, 0, GAME_MS, totalPortions)

  // Novas porções: x sorteado, longe das que já estão caindo; tamanho, queda e balanço variados.
  const spawn = useCallback((taken: number[]): Flake => {
    const r = rand.current
    let x = 8 + r() * 84
    for (let i = 0; i < 8 && taken.some((t) => Math.abs(t - x) < MIN_GAP); i++) x = 8 + r() * 84
    return { key: nextKey.current++, x, size: 18 + r() * 14, fall: fx.motion ? 4.2 + r() * 2.6 : 0, sway: 2 + r() * 5, delay: r() * 0.9 }
  }, [fx.motion])

  useEffect(() => {
    if (final !== null || stopped) return
    const t = setInterval(() => {
      setFlakes((fs) => {
        if (fs.length >= VISIBLE) return fs
        return [...fs, spawn(fs.map((f) => f.x))]
      })
    }, 380)
    return () => clearInterval(t)
  }, [final, stopped, spawn])

  const take = (f: Flake, e: React.MouseEvent) => {
    setFlakes((fs) => fs.filter((x) => x.key !== f.key))
    const box = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
    const y = ((e.clientY - box.top) / box.height) * 100
    if (between) {
      // Depois da medida do dia, o que se junta a mais estraga (Êx 16:20).
      tally.current.spoiled += 1
      setSpoiled(tally.current.spoiled)
      add(f.x, y, "−20", false)
      return
    }
    vibrate(HAPTIC.vote)
    stinger("vote")
    add(f.x, y, "+20")
    tally.current.portions += 1
    setPortions(tally.current.portions)
    const nextGot = got + 1
    setGot(nextGot)
    report.current(manaScore(tally.current.portions, tally.current.spoiled, false, 0, GAME_MS, totalPortions), false)
    if (nextGot < target) return
    if (round === game.rounds.length - 1) {
      setFlakes([])
      finish(true, leftRef.current)
      return
    }
    setBetween(true)
    setTimeout(() => {
      setBetween(false)
      setGot(0)
      setRound((r) => r + 1)
    }, 1600)
  }

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <div className="absolute inset-0 bg-black/25" />
      <GameHud left={left} total={GAME_MS} score={score} label={`${game.roundLabel ?? "Rodada"} ${round + 1} de ${game.rounds.length}`} />
      <StepHint>
        {game.instruction}{" · "}<span className="whitespace-nowrap">{formatRef(game.ref, "short")}</span>
      </StepHint>
      <AnimatePresence>
        {flakes.map((f) => (
          <motion.button
            key={f.key}
            type="button"
            aria-label="Juntar o maná"
            onClick={(e) => take(f, e)}
            className="absolute z-10 grid -translate-x-1/2 place-items-center"
            style={{ left: `${f.x}%`, width: Math.max(44, f.size + 20), height: Math.max(44, f.size + 20) }}
            initial={fx.motion ? { top: "-6%", opacity: 0 } : { top: `${30 + (f.key % 5) * 10}%`, opacity: 1 }}
            animate={fx.motion ? { top: "104%", opacity: 1, x: [0, f.sway * 3, -f.sway * 3, 0] } : { opacity: 1 }}
            exit={{ opacity: 0, scale: 1.6 }}
            transition={fx.motion ? { top: { duration: f.fall, ease: "linear", delay: f.delay }, x: { duration: 2.4, repeat: Infinity }, opacity: { duration: 0.3, delay: f.delay } } : { duration: 0 }}
            onAnimationComplete={() => fx.motion && setFlakes((fs) => fs.filter((x) => x.key !== f.key))}
          >
            <span className="block rounded-full bg-[#fffaf0] shadow-[0_0_14px_#ffffff]" style={{ width: f.size, height: f.size * 0.82 }} aria-hidden />
          </motion.button>
        ))}
      </AnimatePresence>
      <Pops items={pops} />
      {/* A medida do dia. */}
      <div className="pointer-events-none absolute inset-x-5 bottom-3 z-10 space-y-1">
        <div className="flex gap-1">
          {Array.from({ length: target }, (_, i) => (
            <motion.span key={`${round}-${i}`} className="h-3 flex-1 rounded-full" animate={{ backgroundColor: i < got ? "#fff6d8" : "rgba(255,255,255,0.18)", boxShadow: i < got ? "0 0 10px #fff6d8" : "0 0 0px #fff6d8" }} />
          ))}
        </div>
        <p className="text-center text-xs font-semibold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
          {between ? "Medida do dia completa: não junte mais!" : `Medida do dia: ${got} de ${target}`}
        </p>
      </div>
      {spoiled > 0 && game.overflow && (
        <p className="absolute inset-x-6 bottom-14 z-10 rounded-xl bg-black/70 px-3 py-2 text-center text-xs text-[#ffb98a]" role="status">
          {game.overflow.label} ({spoiled}) · {formatRef(game.overflow.ref, "short")}
        </p>
      )}
      {final !== null && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} score={final} />}
    </div>
  )
}
