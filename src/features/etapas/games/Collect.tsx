"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { CollectGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale, GameHint } from "./Finale"

interface Piece {
  key: number
  x: number
  y: number
  glyph: string
}

const MAX_VISIBLE = 5

function Glyph({ glyph, pair }: { glyph: string; pair: boolean }) {
  if (glyph === "estrela") {
    return (
      <svg viewBox="0 0 24 24" className="size-10 drop-shadow-[0_0_10px_#f4d27a]" aria-hidden>
        <path d="M12 2l2.6 6.9L22 9.3l-5.8 4.6L18.2 21 12 17l-6.2 4 2-7.1L2 9.3l7.4-.4z" fill="#fff1c4" />
      </svg>
    )
  }
  if (glyph === "mana") return <span className="block size-6 rounded-full bg-[#fffaf0] shadow-[0_0_12px_#ffffff]" aria-hidden />
  return <span className="text-4xl leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" aria-hidden>{pair ? `${glyph}${glyph}` : glyph}</span>
}

/**
 * Tocar para juntar: cada rodada tem uma meta. Arca (pares de animais),
 * estrelas, maná (por dia; tocar além da meta estraga) e as talhas do altar.
 */
export function Collect({ game, onProgress }: { game: CollectGame; onProgress: (value: number, done: boolean) => void }) {
  const fx = useFx()
  const stinger = useStinger()
  const [round, setRound] = useState(0)
  const [got, setGot] = useState(0)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [spoiled, setSpoiled] = useState(0)
  const [between, setBetween] = useState(false)
  const [done, setDone] = useState(false)
  const nextKey = useRef(0)
  const target = game.rounds[round] ?? 0
  const multi = game.rounds.length > 1

  const spawn = useCallback((): Piece => {
    const key = nextKey.current++
    return {
      key,
      x: 10 + ((key * 37) % 80),
      // Com movimento reduzido, nada cai: as peças aparecem paradas.
      y: game.spawn === "cair" && fx.motion ? -8 : 18 + ((key * 53) % 60),
      glyph: game.pieces[key % game.pieces.length],
    }
  }, [game.pieces, game.spawn, fx.motion])

  // Mantém algumas peças na tela enquanto a meta da rodada não foi atingida.
  useEffect(() => {
    if (done || between) return
    const missing = Math.min(MAX_VISIBLE, target - got) - pieces.length
    if (missing <= 0) return
    const t = setTimeout(() => setPieces((p) => [...p, ...Array.from({ length: missing }, spawn)]), game.spawn === "cair" ? 450 : 120)
    return () => clearTimeout(t)
  }, [pieces.length, got, target, done, between, spawn, game.spawn])

  const take = (key: number) => {
    setPieces((p) => p.filter((x) => x.key !== key))
    if (between) {
      // Depois da meta do dia, o que se junta a mais estraga (Êx 16:20).
      if (game.overflow) setSpoiled((n) => n + 1)
      return
    }
    vibrate(HAPTIC.vote)
    stinger("vote")
    const nextGot = got + 1
    setGot(nextGot)
    if (!multi) onProgress(nextGot, nextGot >= target)
    if (nextGot < target) return
    const last = round === game.rounds.length - 1
    if (multi) onProgress(round + 1, last)
    if (last) {
      setPieces([])
      setDone(true)
      return
    }
    setBetween(true)
    setTimeout(() => {
      setBetween(false)
      setPieces([])
      setGot(0)
      setRound((r) => r + 1)
    }, game.overflow ? 1600 : 700)
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <div className="absolute inset-0 bg-black/25" />
      <GameHint>
        {game.instruction} · {formatRef(game.ref, "short")}
      </GameHint>
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.button
            key={p.key}
            type="button"
            aria-label="Juntar"
            onClick={() => take(p.key)}
            className="absolute -translate-x-1/2 -translate-y-1/2 p-2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            initial={fx.motion ? { opacity: 0, scale: 0.4 } : false}
            animate={game.spawn === "cair" && fx.motion ? { opacity: 1, scale: 1, top: "108%" } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={game.spawn === "cair" ? { top: { duration: 5, ease: "linear" }, default: { duration: 0.25 } } : { duration: 0.25 }}
            // Só sai da tela quem caiu de verdade (com movimento reduzido nada cai).
            onAnimationComplete={() => game.spawn === "cair" && fx.motion && setPieces((ps) => ps.filter((x) => x.key !== p.key))}
          >
            <Glyph glyph={p.glyph} pair={game.id === "arca"} />
          </motion.button>
        ))}
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-4 text-sm text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
        <span>{multi ? `${game.roundLabel ?? "Rodada"} ${round + 1} de ${game.rounds.length}` : ""}</span>
        <span className="tabular-nums">
          {got} / {target}
        </span>
      </div>
      {spoiled > 0 && game.overflow && (
        <p className="absolute inset-x-6 bottom-12 rounded-xl bg-black/70 px-3 py-2 text-center text-xs text-[#ffb98a]" role="status">
          {game.overflow.label} ({spoiled}) · {formatRef(game.overflow.ref, "short")}
        </p>
      )}
      {done && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} />}
    </div>
  )
}
