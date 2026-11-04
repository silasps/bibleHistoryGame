"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { ETAPA1_LABELS } from "@/content/etapas/etapa-1"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"
import { GardenLayers, LightFigure, Person, Tree } from "./art"

// O jardim: a figura de luz caminha com Adão (Gn 3:8). Depois a figura de luz
// se afasta (licença artística, para a cena seguinte), Eva se junta a Adão e os
// dois param diante das árvores. Automático no telão; no jogo solo, o
// jogador anda, com paredes invisíveis nas pontas.

const START_X = 0.08
const END_X = 0.56
const SECONDS = { walk: 9, leave: 3, eve: 3 }
type Phase = "walk" | "leave" | "eve" | "done"

interface Props {
  /** Solo: o jogador conduz Adão; senão a cena anda sozinha. */
  interactive?: boolean
  onDone?: () => void
  className?: string
}

export function GardenWalk({ interactive = false, onDone, className }: Props) {
  const fx = useFx()
  const [x, setX] = useState(START_X)
  const [phase, setPhase] = useState<Phase>("walk")
  const holding = useRef(0)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  // Automático: a caminhada leva alguns segundos e então a cena segue sozinha.
  useEffect(() => {
    if (interactive || phase !== "walk") return
    const t = setTimeout(() => setPhase("leave"), fx.motion ? SECONDS.walk * 1000 : 0)
    return () => clearTimeout(t)
  }, [interactive, phase, fx.motion])

  // Interativo: as pontas do caminho são paredes invisíveis; chegar ao fim faz a cena seguir.
  const xRef = useRef(START_X)
  const move = useCallback((delta: number) => {
    const next = Math.min(END_X, Math.max(START_X, xRef.current + delta))
    xRef.current = next
    setX(next)
    if (next >= END_X) setPhase((p) => (p === "walk" ? "leave" : p))
  }, [])

  useEffect(() => {
    if (phase === "walk" || phase === "done") return
    const next: Phase = phase === "leave" ? "eve" : "done"
    const t = setTimeout(() => setPhase(next), fx.motion ? SECONDS[phase] * 1000 : 0)
    return () => clearTimeout(t)
  }, [phase, fx.motion])

  useEffect(() => {
    if (phase === "done") onDoneRef.current?.()
  }, [phase])

  // Setas do teclado.
  useEffect(() => {
    if (!interactive) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") move(0.03)
      if (e.key === "ArrowLeft") move(-0.03)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [interactive, move])

  const hold = (dir: 1 | -1) => {
    clearInterval(holding.current)
    holding.current = window.setInterval(() => move(dir * 0.012), 40)
  }
  const release = () => clearInterval(holding.current)
  useEffect(() => () => clearInterval(holding.current), [])

  const walking = phase === "walk"
  const adamX = interactive ? x : END_X
  const walkTransition = { duration: interactive || !fx.motion ? 0.25 : SECONDS.walk, ease: "linear" as const }
  const showEve = phase === "eve" || phase === "done"

  return (
    <div className={cn("relative h-full w-full overflow-hidden [container-type:size]", className)}>
      <GardenLayers shift={adamX * 10} />
      <div className="absolute bottom-[5%] right-0 flex h-[52%] items-end">
        <Tree kind="vida" className="h-[85%] w-auto max-w-[42cqw] object-contain object-bottom" />
        <Tree kind="conhecimento" className="h-full w-auto max-w-[48cqw] object-contain object-bottom" />
      </div>

      {/* Figura de luz: caminha ao lado de Adão e depois se afasta. */}
      <motion.div
        className="absolute aspect-[3/8] h-[44%]"
        initial={{ left: `${(START_X - 0.08) * 100}%`, bottom: "8%", opacity: 0 }}
        animate={walking ? { left: `${(adamX - 0.08) * 100}%`, bottom: "8%", opacity: 1 } : { left: `${(adamX - 0.03) * 100}%`, bottom: "34%", opacity: 0 }}
        transition={walking ? { ...walkTransition, opacity: { duration: 1 } } : { duration: fx.motion ? SECONDS.leave : 0, ease: "easeIn" }}
      >
        <LightFigure className="h-full w-full" />
      </motion.div>

      <motion.div
        className="absolute bottom-[8%] aspect-[2/3] h-[38%]"
        initial={{ left: `${START_X * 100}%` }}
        animate={{ left: `${adamX * 100}%` }}
        transition={walkTransition}
      >
        <motion.div className="h-full w-full" animate={fx.motion && walking ? { y: [0, -4, 0] } : { y: 0 }} transition={{ duration: 0.6, repeat: walking ? Infinity : 0 }}>
          <Person who="adao" className="h-full w-full" />
        </motion.div>
      </motion.div>

      {showEve && (
        <motion.div
          className="absolute bottom-[8%] aspect-[2/3] h-[36%]"
          initial={{ left: "90%", opacity: 0 }}
          animate={{ left: `${(adamX + 0.08) * 100}%`, opacity: 1 }}
          transition={{ duration: fx.motion ? SECONDS.eve : 0 }}
        >
          <Person who="eva" className="h-full w-full" />
        </motion.div>
      )}

      <p className="pointer-events-none absolute inset-x-0 top-[4%] text-center font-display text-[6cqmin] text-night/80">{ETAPA1_LABELS.garden}</p>

      {interactive && walking && (
        <div className="absolute inset-x-0 bottom-3 flex justify-between px-4">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              aria-label={dir < 0 ? "Andar para trás" : "Andar para frente"}
              className="grid size-14 place-items-center rounded-full border border-white/40 bg-black/40 text-white"
              onPointerDown={() => hold(dir)}
              onPointerUp={release}
              onPointerLeave={release}
              onPointerCancel={release}
              onClick={() => move(dir * 0.04)}
            >
              {dir < 0 ? <ChevronLeft className="size-7" /> : <ChevronRight className="size-7" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
