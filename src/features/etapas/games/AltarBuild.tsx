"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { AltarGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { stagedScore } from "@/domain/score"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale } from "./Finale"
import { GAME_MS, GameHud, seeded, StepHint, useCountdown } from "./kit"

// viewBox 100×150 (celular em pé). O altar fica no meio, com a valeta em volta.
type Pt = { x: number; y: number }
type Phase = "pedras" | "oferta" | "agua" | "orar" | "fogo" | "fim"
const PARTS = 4
const SLOTS: Pt[] = [100, 91, 82].flatMap((y) => [32, 44, 56, 68].map((x) => ({ x, y })))
const TOP_OF_ALTAR = { x: 50, y: 72 }
const SNAP = 8
const HOLD_MS = 1800

function Stone({ placed }: { placed: boolean }) {
  return <rect x="-5.6" y="-4" width="11.2" height="8" rx="1.6" fill={placed ? "#9a8a6a" : "#b0a080"} stroke="#4a3e2a" strokeWidth="0.7" />
}

/**
 * O altar no Carmelo (1Rs 18:30–38): Elias reconstrói o altar com doze pedras,
 * prepara a lenha e o novilho, derrama a água quatro talhas, três vezes, ora,
 * e o fogo do Senhor consome tudo, até a água da valeta.
 */
export function AltarBuild({ game, onProgress, stopped }: { game: AltarGame; onProgress: (value: number, done: boolean) => void; stopped: boolean }) {
  const fx = useFx()
  const stinger = useStinger()
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])
  const svg = useRef<SVGSVGElement>(null)
  const [stones, setStones] = useState<{ at: Pt; slot: number | null }[]>(() => {
    // Espalhadas pelo chão, em grade com um pouco de desordem: nenhuma por cima da outra.
    const r = seeded(18)
    return Array.from({ length: game.stones }, (_, i) => ({ at: { x: 14 + (i % 4) * 24 + (r() - 0.5) * 6, y: 32 + Math.floor(i / 4) * 12 + (r() - 0.5) * 4 }, slot: null }))
  })
  const [phase, setPhase] = useState<Phase>("pedras")
  const [wood, setWood] = useState<Pt>({ x: 20, y: 44 })
  const [bull, setBull] = useState<Pt>({ x: 80, y: 44 })
  const [woodOn, setWoodOn] = useState(false)
  const [bullOn, setBullOn] = useState(false)
  const [pours, setPours] = useState(0)
  const [holding, setHolding] = useState(false)
  const [prayed, setPrayed] = useState(0)
  const [errors, setErrors] = useState(0)
  const [drag, setDrag] = useState<{ kind: "stone"; i: number } | { kind: "wood" | "bull" } | null>(null)
  const [final, setFinal] = useState<number | null>(null)
  const totalPours = game.jars.reduce((a, b) => a + b, 0)
  const placed = stones.filter((s) => s.slot !== null).length

  const partsDone = (p: Phase) =>
    p === "pedras" ? placed / game.stones : p === "oferta" ? 1 + (Number(woodOn) + Number(bullOn)) / 2 : p === "agua" ? 2 + pours / totalPours : p === "orar" ? 3 + prayed : 4
  const scoreNow = (leftMs = 0, p: Phase = phase) => stagedScore(partsDone(p), PARTS, leftMs, GAME_MS, errors * 10)

  const finish = useCallback((score: number) => {
    setFinal((f) => {
      if (f !== null) return f
      report.current(score, true)
      return score
    })
    setPhase("fim")
  }, [])
  const { left, leftRef } = useCountdown(GAME_MS, final === null && !stopped && phase !== "fogo", () => finish(scoreNow(0)))
  useEffect(() => {
    if (stopped && final === null) finish(scoreNow(0))
    // scoreNow lê o estado atual; o efeito só precisa reagir ao "parar".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopped, final, finish])

  const progress = (p: Phase) => report.current(scoreNow(0, p), false)

  const toSvg = (e: React.PointerEvent): Pt | null => {
    const m = svg.current?.getScreenCTM()
    if (!m) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return { x: p.x, y: p.y }
  }

  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = toSvg(e)
    if (!p || final !== null) return
    e.currentTarget.setPointerCapture(e.pointerId)
    if (phase === "pedras") {
      const i = stones.findIndex((s) => s.slot === null && Math.hypot(s.at.x - p.x, s.at.y - p.y) < 8)
      if (i >= 0) setDrag({ kind: "stone", i })
    } else if (phase === "oferta") {
      if (!woodOn && Math.hypot(wood.x - p.x, wood.y - p.y) < 10) setDrag({ kind: "wood" })
      else if (woodOn && !bullOn && Math.hypot(bull.x - p.x, bull.y - p.y) < 10) setDrag({ kind: "bull" })
    }
  }
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag || (e.pointerType === "mouse" && e.buttons === 0)) return
    const p = toSvg(e)
    if (!p) return
    if (drag.kind === "stone") setStones((all) => all.map((s, j) => (j === drag.i ? { ...s, at: p } : s)))
    else if (drag.kind === "wood") setWood(p)
    else setBull(p)
  }
  const up = () => {
    if (!drag) return
    if (drag.kind === "stone") {
      const s = stones[drag.i]
      const free = SLOTS.map((slot, k) => ({ slot, k })).filter(({ k }) => !stones.some((x) => x.slot === k))
      const near = free.sort((a, b) => Math.hypot(a.slot.x - s.at.x, a.slot.y - s.at.y) - Math.hypot(b.slot.x - s.at.x, b.slot.y - s.at.y))[0]
      if (near && Math.hypot(near.slot.x - s.at.x, near.slot.y - s.at.y) < SNAP) {
        const next = stones.map((x, j) => (j === drag.i ? { at: near.slot, slot: near.k } : x))
        setStones(next)
        vibrate(HAPTIC.vote)
        stinger("tap", next.filter((x) => x.slot !== null).length / game.stones)
        if (next.every((x) => x.slot !== null)) {
          setPhase("oferta")
          progress("oferta")
        } else report.current(stagedScore(next.filter((x) => x.slot !== null).length / game.stones, PARTS, 0, GAME_MS, errors * 10), false)
      } else if (s.at.y > 70) {
        // Largou perto do altar, mas fora do lugar: perde pontos.
        setErrors((n) => n + 1)
      }
    } else {
      const at = drag.kind === "wood" ? wood : bull
      if (Math.hypot(at.x - TOP_OF_ALTAR.x, at.y - TOP_OF_ALTAR.y) < 12) {
        vibrate(HAPTIC.vote)
        stinger("tap", 0.6)
        if (drag.kind === "wood") {
          setWood(TOP_OF_ALTAR)
          setWoodOn(true)
        } else {
          setBull({ x: TOP_OF_ALTAR.x, y: TOP_OF_ALTAR.y - 5 })
          setBullOn(true)
          setPhase("agua")
          progress("agua")
        }
      } else {
        setErrors((n) => n + 1)
        if (drag.kind === "wood") setWood({ x: 20, y: 44 })
        else setBull({ x: 80, y: 44 })
      }
    }
    setDrag(null)
  }

  const pour = () => {
    if (phase !== "agua") return
    const n = pours + 1
    setPours(n)
    vibrate(HAPTIC.vote)
    stinger("tap", n / totalPours)
    if (n >= totalPours) {
      setPhase("orar")
      report.current(stagedScore(3, PARTS, 0, GAME_MS, errors * 10), false)
    }
  }

  // Orar: segurar o botão; o fogo cai quando a oração termina (1Rs 18:36–38).
  useEffect(() => {
    if (phase !== "orar" || !holding) return
    const start = performance.now() - prayed * HOLD_MS
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / HOLD_MS)
      setPrayed(k)
      if (k >= 1) {
        const score = stagedScore(4, PARTS, leftRef.current, GAME_MS, errors * 10)
        setPhase("fogo")
        vibrate(HAPTIC.seal)
        stinger("reveal")
        setTimeout(() => finish(score), fx.motion ? 2400 : 150)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // `prayed` só serve para retomar de onde parou.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, holding])

  const hint =
    phase === "pedras" ? `${game.steps.stones} (${placed}/${game.stones})` : phase === "oferta" ? game.steps.wood : phase === "agua" ? `${game.steps.water} (${pours}/${totalPours})` : phase === "orar" ? game.steps.pray : ""
  const water = Math.min(1, pours / totalPours)
  const burning = phase === "fogo" || phase === "fim"

  return (
    <div className="relative h-full w-full touch-none overflow-hidden select-none">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <div className="absolute inset-0 bg-black/30" />
      <svg ref={svg} viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} role="img" aria-label={hint}>
        {/* A valeta em volta do altar (1Rs 18:32), que vai enchendo de água. */}
        <ellipse cx="50" cy="104" rx="34" ry="9" fill="#3a2a1a" stroke="#2a1d10" strokeWidth="0.8" />
        <motion.ellipse cx="50" cy="104" rx="32" ry="7.5" fill="#3f8ac0" animate={{ opacity: burning ? 0 : water * 0.85 }} transition={{ duration: burning && fx.motion ? 1.6 : 0.3, delay: burning && fx.motion ? 0.9 : 0 }} />
        {/* Lugares das pedras. */}
        {phase === "pedras" && SLOTS.map((s, k) => !stones.some((x) => x.slot === k) && <rect key={k} x={s.x - 5.6} y={s.y - 4} width="11.2" height="8" rx="1.6" fill="none" stroke="#f4d27a" strokeOpacity="0.55" strokeDasharray="1.6 1.6" strokeWidth="0.5" />)}
        {stones.map((s, i) => (
          <motion.g key={i} animate={{ x: s.at.x, y: s.at.y }} transition={drag?.kind === "stone" && drag.i === i ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 20 }}>
            <Stone placed={s.slot !== null} />
          </motion.g>
        ))}
        {/* Lenha e novilho. */}
        {phase !== "pedras" && (
          <>
            {woodOn ? null : <circle cx={TOP_OF_ALTAR.x} cy={TOP_OF_ALTAR.y} r="10" fill="none" stroke="#f4d27a" strokeOpacity="0.6" strokeDasharray="2 2" strokeWidth="0.6" />}
            <motion.g animate={{ x: wood.x, y: wood.y }} transition={drag?.kind === "wood" ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 18 }} opacity={burning ? 0.35 : 1}>
              {[-4, 0, 4].map((dy) => (
                <rect key={dy} x="-13" y={dy - 1.4} width="26" height="2.8" rx="1.2" fill="#7a5530" stroke="#3a2414" strokeWidth="0.4" />
              ))}
            </motion.g>
            <motion.g animate={{ x: bull.x, y: bull.y }} transition={drag?.kind === "bull" ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 18 }} opacity={burning ? 0.3 : 1}>
              <ellipse cx="0" cy="0" rx="9" ry="4.5" fill="#9a4a32" stroke="#4a1a0e" strokeWidth="0.6" />
              <ellipse cx="-4" cy="0" rx="2" ry="1.6" fill="#e8d0b8" opacity="0.6" />
            </motion.g>
          </>
        )}
        {/* O fogo do Senhor (1Rs 18:38). */}
        <AnimatePresence>
          {burning && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.rect x="46" y="-10" width="8" height="80" fill="#ffd27a" initial={{ scaleY: 0 }} animate={{ scaleY: fx.motion ? [0, 1, 1, 0] : 0 }} transition={{ duration: 1.2 }} style={{ transformOrigin: "50px -10px" }} />
              {[-14, -6, 2, 10].map((dx, i) => (
                <motion.path
                  key={dx}
                  d={`M ${50 + dx} 78 q 3 -10 0 -18 q 6 6 4 18 Z`}
                  fill={i % 2 ? "#ff8a3a" : "#ffd27a"}
                  animate={fx.motion ? { scaleY: [0.6, 1.2, 0.8, 1.1], opacity: [0.8, 1, 0.9, 1] } : undefined}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  style={{ transformOrigin: `${50 + dx}px 78px` }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      <GameHud left={left} total={GAME_MS} score={final ?? scoreNow(0)} label={phase === "pedras" ? "1 · as pedras" : phase === "oferta" ? "2 · a oferta" : phase === "agua" ? "3 · a água" : "4 · a oração"} />
      <StepHint>
        {hint || game.finale.label}{" · "}<span className="whitespace-nowrap">{formatRef(phase === "orar" ? game.steps.prayer.ref : game.ref, "short")}</span>
      </StepHint>
      {errors > 0 && phase !== "fim" && <p className="pointer-events-none absolute right-3 top-[4.6rem] z-10 rounded-full bg-black/60 px-2 py-0.5 text-xs text-[#ffb98a]">fora do lugar: −{errors * 10}</p>}

      {phase === "agua" && (
        <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={pour} className="absolute bottom-6 right-5 z-10 grid size-20 place-items-center rounded-full border-2 border-sky-200/70 bg-sky-900/70 text-4xl" aria-label="Derramar uma talha de água">
          🏺
        </motion.button>
      )}
      {phase === "orar" && (
        <div className="absolute inset-x-5 bottom-5 z-10 space-y-2 text-center">
          <p className="rounded-xl bg-black/65 px-3 py-2 font-display text-lg leading-snug text-parchment">
            {game.steps.prayer.label} <span className="text-xs text-sand">· {formatRef(game.steps.prayer.ref, "short")}</span>
          </p>
          <button
            type="button"
            onPointerDown={() => setHolding(true)}
            onPointerUp={() => setHolding(false)}
            onPointerLeave={() => setHolding(false)}
            onClick={() => setHolding(true)}
            className="relative w-full overflow-hidden rounded-full border-2 border-gold-bright bg-night/80 py-3 text-lg font-semibold text-gold-bright"
          >
            <span className="absolute inset-y-0 left-0 bg-gold/40" style={{ width: `${prayed * 100}%` }} />
            <span className="relative">🙏 Segure para orar</span>
          </button>
        </div>
      )}
      {phase === "pedras" && (
        <button
          type="button"
          onClick={() => {
            const i = stones.findIndex((s) => s.slot === null)
            const k = SLOTS.findIndex((_, k) => !stones.some((x) => x.slot === k))
            if (i < 0 || k < 0) return
            const next = stones.map((x, j) => (j === i ? { at: SLOTS[k], slot: k } : x))
            setStones(next)
            if (next.every((x) => x.slot !== null)) {
              setPhase("oferta")
              progress("oferta")
            }
          }}
          className="absolute bottom-3 right-3 z-10 rounded-full border border-white/30 bg-black/55 px-3 py-1.5 text-xs text-white"
        >
          Colocar pedra
        </button>
      )}
      {phase === "oferta" && (
        <button
          type="button"
          onClick={() => {
            if (!woodOn) {
              setWood(TOP_OF_ALTAR)
              setWoodOn(true)
            } else {
              setBull({ x: TOP_OF_ALTAR.x, y: TOP_OF_ALTAR.y - 5 })
              setBullOn(true)
              setPhase("agua")
              progress("agua")
            }
          }}
          className="absolute bottom-3 right-3 z-10 rounded-full border border-white/30 bg-black/55 px-3 py-1.5 text-xs text-white"
        >
          {woodOn ? "Colocar o novilho" : "Colocar a lenha"}
        </button>
      )}
      {phase === "fim" && final !== null && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} score={final} />}
    </div>
  )
}
