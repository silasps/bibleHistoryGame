"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { ChooseGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { arcaScore } from "@/domain/score"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale } from "./Finale"
import { GAME_MS, GameHud, Pops, seeded, StepHint, useCountdown, useLatest, usePops } from "./kit"

interface Piece {
  key: number
  glyph: string
  good: boolean
  x: number
  y: number
  born: number
}

const VISIBLE = 6
const LIFE_MS = 4200

/** A arca, desenhada no pé da tela. */
function Ark({ glow }: { glow: boolean }) {
  return (
    <svg viewBox="0 0 200 70" className="absolute inset-x-[8%] bottom-[2%] w-[84%]" aria-hidden>
      <path d="M8 34 H192 L172 64 H28 Z" fill="#6b4a2a" stroke="#2a1a0c" strokeWidth="3" />
      <rect x="54" y="12" width="92" height="24" rx="3" fill="#7d5834" stroke="#2a1a0c" strokeWidth="3" />
      <path d="M48 14 L100 2 L152 14" fill="none" stroke="#2a1a0c" strokeWidth="3" />
      <rect x="90" y="18" width="20" height="18" fill={glow ? "#f4d27a" : "#3a2414"} />
    </svg>
  )
}

/**
 * Arca (Gn 7:8–9): animais aos pares entram; objetos de hoje, não (brincadeira
 * do jogo, escolha do autor). Erro custa pontos e trava o toque por 1 segundo.
 */
export function Choose({ game, onProgress, stopped }: { game: ChooseGame; onProgress: (value: number, done: boolean) => void; stopped: boolean }) {
  const fx = useFx()
  const stinger = useStinger()
  const report = useLatest(onProgress)
  const rand = useRef(seeded(7))
  const nextKey = useRef(0)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [pairs, setPairs] = useState(0)
  const [errors, setErrors] = useState(0)
  const [locked, setLocked] = useState(false)
  const [over, setOver] = useState(false)
  const [final, setFinal] = useState(0)
  const [lastIn, setLastIn] = useState<string | null>(null)
  const { pops, add } = usePops()
  const tally = useRef({ pairs: 0, errors: 0, done: false })

  const finish = useCallback(
    (leftMs: number) => {
      if (tally.current.done) return
      tally.current.done = true
      const s = arcaScore(tally.current.pairs, tally.current.errors, game.pairs, leftMs, GAME_MS)
      setFinal(s)
      setOver(true)
      report.current(s, true)
    },
    [game.pairs, report],
  )
  const { left, leftRef } = useCountdown(GAME_MS, !over && !stopped, () => finish(0))
  const score = over ? final : arcaScore(pairs, errors, game.pairs, left, GAME_MS)

  useEffect(() => {
    if (stopped) finish(0)
  }, [stopped, finish])

  const spawn = useCallback(
    (taken: Piece[]): Piece => {
      const r = rand.current
      const key = nextKey.current++
      // Mais ou menos dois animais para cada objeto errado.
      const good = r() < 0.64
      const list = good ? game.animals : game.wrong
      // Longe das outras peças (em % da caixa): nada encavalado.
      let x = 18 + r() * 64
      let y = 24 + r() * 44
      for (let i = 0; i < 12 && taken.some((t) => Math.abs(t.x - x) < 26 && Math.abs(t.y - y) < 11); i++) {
        x = 18 + r() * 64
        y = 24 + r() * 44
      }
      return { key, glyph: list[Math.floor(r() * list.length)], good, x, y, born: performance.now() }
    },
    [game.animals, game.wrong],
  )

  // Peças aparecem e somem sozinhas: a tela está sempre mudando.
  useEffect(() => {
    if (over || stopped) return
    const t = setInterval(() => {
      const now = performance.now()
      setPieces((ps) => {
        const alive = ps.filter((p) => now - p.born < LIFE_MS)
        while (alive.length < VISIBLE) alive.push(spawn(alive))
        return alive
      })
    }, 350)
    return () => clearInterval(t)
  }, [over, stopped, spawn])

  const tap = (p: Piece) => {
    if (over || stopped || locked) return
    setPieces((ps) => ps.filter((x) => x.key !== p.key))
    if (p.good) {
      vibrate(HAPTIC.vote)
      stinger("vote")
      add(p.x, p.y, "+100")
      setLastIn(p.glyph)
      tally.current.pairs += 1
      setPairs(tally.current.pairs)
      if (tally.current.pairs >= game.pairs) finish(leftRef.current)
      else report.current(arcaScore(tally.current.pairs, tally.current.errors, game.pairs, leftRef.current, GAME_MS), false)
    } else {
      vibrate(HAPTIC.light)
      add(p.x, p.y, "−50", false)
      tally.current.errors += 1
      setErrors(tally.current.errors)
      setLocked(true)
      setTimeout(() => setLocked(false), 1000)
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <div className="absolute inset-0 bg-black/25" />
      <GameHud left={left} total={GAME_MS} score={score} label={`Pares ${pairs}/${game.pairs}`} />
      <StepHint>
        {game.instruction}{" · "}<span className="whitespace-nowrap">{formatRef(game.ref, "short")}</span>
      </StepHint>
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.button
            key={p.key}
            type="button"
            onClick={() => tap(p)}
            aria-label={p.good ? "Par de animais" : "Objeto de hoje"}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            initial={fx.motion ? { opacity: 0, scale: 0.3 } : false}
            animate={{ opacity: 1, scale: 1 }}
            exit={p.good && fx.motion ? { left: "50%", top: "88%", scale: 0.3, opacity: 0 } : { opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35 }}
          >
            <span className="whitespace-nowrap text-4xl leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">{p.good ? `${p.glyph}${p.glyph}` : p.glyph}</span>
          </motion.button>
        ))}
      </AnimatePresence>
      <Ark glow={!!lastIn} />
      <Pops items={pops} />
      {locked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={fx.motion ? { opacity: 1, x: [0, -8, 8, -6, 6, 0] } : { opacity: 1 }}
          className="absolute inset-x-6 top-[42%] z-20 rounded-xl bg-black/75 px-3 py-2 text-center text-sm font-semibold text-[#ffb98a]"
          role="status"
        >
          Isso não é do tempo de Noé!
        </motion.p>
      )}
      {over && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} score={final} />}
    </div>
  )
}
