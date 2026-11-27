"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { gameSecondsOf, type CollectGame, type CollectSession } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { manaScore } from "@/domain/score"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale } from "./Finale"
import { GameHud, Pops, seeded, StepHint, useCountdown, usePops } from "./kit"

interface Flake {
  key: number
  piece: CollectSession["piece"]
  x: number
  size: number
  fall: number
  sway: number
  delay: number
}

const VISIBLE = 6
/** Distância mínima (em % da largura) entre peças que caem juntas: nada de fila. */
const MIN_GAP = 16
/** Pausa curta entre as sessões (o jogo inteiro tem 30 s). */
const SWITCH_MS = 650

const PIECE_LABEL: Record<CollectSession["piece"], string> = { mana: "Juntar o maná", codorniz: "Juntar a codorniz" }
const MEASURE: Record<CollectSession["piece"], string> = { mana: "Maná da manhã", codorniz: "Codornizes da tarde" }

/** Codorniz desenhada (corpo marrom pintado, cabeça pequena): cai batendo as asas. */
function Quail({ size, flap }: { size: number; flap: boolean }) {
  return (
    <svg viewBox="0 0 40 32" width={size * 1.3} height={size} aria-hidden className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
      <motion.path
        d="M 14 14 Q 4 4 2 12 Q 8 14 14 18 Z"
        fill="#b08050"
        animate={flap ? { rotate: [0, -25, 0] } : undefined}
        transition={{ duration: 0.35, repeat: Infinity }}
        style={{ originX: "14px", originY: "16px" }}
      />
      <ellipse cx="20" cy="19" rx="13" ry="9" fill="#8a5a2b" />
      <path d="M 12 19 q 3 -2 6 0 M 17 23 q 3 -2 6 0 M 22 17 q 3 -2 6 0" stroke="#f0d8a8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="31" cy="12" r="5.5" fill="#7a4a22" />
      <path d="M 36 12 l 4 1.2 l -4 1.2 Z" fill="#e8b860" />
      <circle cx="32.5" cy="11" r="1.1" fill="#120a04" />
      <path d="M 29 6 q 1 -3 3 -2" stroke="#3a2414" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Maná e codornizes (Êx 16): sessões intercaladas. Pela manhã, o maná, só a
 * medida do dia (o que se junta além dela estraga, Êx 16:20); à tarde, as
 * codornizes (Êx 16:13). Quanto mais rápido a pessoa junta, mais dias avança.
 */
export function Collect({ game, onProgress, stopped }: { game: CollectGame; onProgress: (value: number, done: boolean) => void; stopped: boolean }) {
  const fx = useFx()
  const stinger = useStinger()
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])
  const totalMs = gameSecondsOf(game) * 1000
  const rand = useRef(seeded(16))
  const nextKey = useRef(0)
  const totalPortions = game.sessions.reduce((a, s) => a + s.count, 0)
  const [index, setIndex] = useState(0)
  const [got, setGot] = useState(0)
  const [flakes, setFlakes] = useState<Flake[]>([])
  // Depois da medida do maná, uma janela curta: o que se junta a mais estraga.
  const [between, setBetween] = useState(false)
  const [final, setFinal] = useState<number | null>(null)
  const tally = useRef({ portions: 0, spoiled: 0 })
  const [spoiled, setSpoiled] = useState(0)
  const [portions, setPortions] = useState(0)
  const { pops, add } = usePops()
  const session = game.sessions[index]
  const target = session?.count ?? 0

  const finish = useCallback(
    (finished: boolean, leftMs: number) => {
      setFinal((f) => {
        if (f !== null) return f
        const s = manaScore(tally.current.portions, tally.current.spoiled, finished, leftMs, totalMs, totalPortions)
        report.current(s, true)
        return s
      })
    },
    [totalPortions, totalMs],
  )
  const { left, leftRef } = useCountdown(totalMs, final === null && !stopped, () => finish(false, 0))
  useEffect(() => {
    if (stopped) finish(false, 0)
  }, [stopped, finish])
  const score = final ?? manaScore(portions, spoiled, false, 0, totalMs, totalPortions)

  // Novas peças da sessão: x sorteado, longe das que já estão caindo; tamanho, queda e balanço variados.
  const spawn = useCallback(
    (taken: number[], piece: CollectSession["piece"]): Flake => {
      const r = rand.current
      let x = 8 + r() * 84
      for (let i = 0; i < 8 && taken.some((t) => Math.abs(t - x) < MIN_GAP); i++) x = 8 + r() * 84
      const quail = piece === "codorniz"
      return {
        key: nextKey.current++,
        piece,
        x,
        size: quail ? 30 + r() * 10 : 18 + r() * 14,
        fall: fx.motion ? (quail ? 3.4 + r() * 2 : 4.2 + r() * 2.6) : 0,
        sway: quail ? 5 + r() * 6 : 2 + r() * 5,
        delay: r() * 0.6,
      }
    },
    [fx.motion],
  )

  const piece = session?.piece
  useEffect(() => {
    if (final !== null || stopped || !piece) return
    const t = setInterval(() => {
      setFlakes((fs) => {
        if (fs.length >= VISIBLE) return fs
        return [...fs, spawn(fs.map((f) => f.x), piece)]
      })
    }, 340)
    return () => clearInterval(t)
  }, [final, stopped, spawn, piece])

  const advance = () => {
    if (index === game.sessions.length - 1) {
      setFlakes([])
      finish(true, leftRef.current)
      return
    }
    setTimeout(() => {
      setBetween(false)
      setGot(0)
      setFlakes([])
      setIndex((i) => i + 1)
    }, SWITCH_MS)
  }

  const take = (f: Flake, e: React.MouseEvent) => {
    setFlakes((fs) => fs.filter((x) => x.key !== f.key))
    const box = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
    const y = ((e.clientY - box.top) / box.height) * 100
    if (between || f.piece !== piece) {
      // Maná além da medida do dia estraga (Êx 16:20); peça da sessão anterior não conta.
      if (f.piece === "mana") {
        tally.current.spoiled += 1
        setSpoiled(tally.current.spoiled)
        add(f.x, y, "−20", false)
      }
      return
    }
    vibrate(HAPTIC.vote)
    stinger("vote")
    add(f.x, y, "+20")
    tally.current.portions += 1
    setPortions(tally.current.portions)
    const nextGot = got + 1
    setGot(nextGot)
    report.current(manaScore(tally.current.portions, tally.current.spoiled, false, 0, totalMs, totalPortions), false)
    if (nextGot < target) return
    setBetween(true)
    advance()
  }

  const announce = piece ? game.announce[piece] : undefined
  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <div className="absolute inset-0 bg-black/25" />
      {/* A tarde escurece um pouco o deserto. */}
      <motion.div className="pointer-events-none absolute inset-0 bg-[#2a1640]" animate={{ opacity: piece === "codorniz" ? 0.32 : 0 }} transition={{ duration: 0.5 }} />
      <GameHud left={left} total={totalMs} score={score} label={session?.label ?? ""} />
      <StepHint>
        {game.instruction}
        {" · "}
        <span className="whitespace-nowrap">{formatRef(game.ref, "short")}</span>
      </StepHint>
      <AnimatePresence>
        {announce && final === null && (
          <motion.p
            key={index}
            role="status"
            className="pointer-events-none absolute inset-x-6 top-[38%] z-20 rounded-2xl bg-black/55 px-4 py-3 text-center font-display text-2xl text-[#fff6d8] [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
            transition={{ duration: 1.3, times: [0, 0.15, 0.7, 1] }}
          >
            {announce.label} <span className="text-sm text-gold-bright">· {formatRef(announce.ref, "short")}</span>
          </motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {flakes.map((f) => (
          <motion.button
            key={f.key}
            type="button"
            aria-label={PIECE_LABEL[f.piece]}
            onClick={(e) => take(f, e)}
            className="absolute z-10 grid -translate-x-1/2 place-items-center"
            style={{ left: `${f.x}%`, width: Math.max(44, f.size + 20), height: Math.max(44, f.size + 20) }}
            initial={fx.motion ? { top: "-6%", opacity: 0 } : { top: `${30 + (f.key % 5) * 10}%`, opacity: 1 }}
            animate={fx.motion ? { top: "104%", opacity: 1, x: [0, f.sway * 3, -f.sway * 3, 0] } : { opacity: 1 }}
            exit={{ opacity: 0, scale: 1.6 }}
            transition={fx.motion ? { top: { duration: f.fall, ease: "linear", delay: f.delay }, x: { duration: 2.4, repeat: Infinity }, opacity: { duration: 0.3, delay: f.delay } } : { duration: 0 }}
            onAnimationComplete={() => fx.motion && setFlakes((fs) => fs.filter((x) => x.key !== f.key))}
          >
            {f.piece === "codorniz" ? (
              <Quail size={f.size} flap={fx.motion} />
            ) : (
              <span className="block rounded-full bg-[#fffaf0] shadow-[0_0_14px_#ffffff]" style={{ width: f.size, height: f.size * 0.82 }} aria-hidden />
            )}
          </motion.button>
        ))}
      </AnimatePresence>
      <Pops items={pops} />
      {/* A medida da sessão. */}
      <div className="pointer-events-none absolute inset-x-5 bottom-3 z-10 space-y-1">
        <div className="flex gap-1">
          {Array.from({ length: target }, (_, i) => (
            <motion.span
              key={`${index}-${i}`}
              className="h-3 flex-1 rounded-full"
              animate={{ backgroundColor: i < got ? (piece === "codorniz" ? "#e8b860" : "#fff6d8") : "rgba(255,255,255,0.18)", boxShadow: i < got ? "0 0 10px #fff6d8" : "0 0 0px #fff6d8" }}
            />
          ))}
        </div>
        <p className="text-center text-xs font-semibold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
          {between && piece === "mana" ? "Medida do dia completa: não junte mais!" : piece ? `${MEASURE[piece]}: ${got} de ${target}` : ""}
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
