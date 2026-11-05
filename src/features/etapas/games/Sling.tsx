"use client"

/* eslint-disable @next/next/no-img-element */

import { motion } from "motion/react"
import { useRef, useState } from "react"
import { artFile } from "@/components/art/art-files"
import type { SlingGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale, GameHint } from "./Finale"

/** O gigante: imagem do autor ou silhueta provisória. */
function Giant({ fallen }: { fallen: boolean }) {
  const fx = useFx()
  const file = artFile("personagens", "golias")
  return (
    <motion.div
      className="absolute left-1/2 top-[8%] h-[46%] -translate-x-1/2"
      style={{ transformOrigin: "50% 100%" }}
      animate={fallen ? { rotate: -82, y: "18%", opacity: 0.9 } : { rotate: 0 }}
      transition={{ duration: fx.motion ? 1.1 : 0, ease: "easeIn" }}
    >
      {file ? (
        <img src={file} alt="Golias" className="h-full w-auto" draggable={false} />
      ) : (
        <svg viewBox="0 0 80 200" className="h-full w-auto" role="img" aria-label="Golias">
          <circle cx="40" cy="22" r="16" fill="#2a2016" stroke="#c8a070" strokeWidth="2" />
          <path d="M40 40 C14 44 8 80 10 120 L16 196 L32 196 L40 140 L48 196 L64 196 L70 120 C72 80 66 44 40 40 Z" fill="#2a2016" stroke="#c8a070" strokeWidth="2" />
          <path d="M66 70 L78 20" stroke="#c8a070" strokeWidth="4" />
        </svg>
      )}
    </motion.div>
  )
}

/** A funda de Davi: puxar e soltar. A pedra sempre encontra o alvo (1Sm 17:49). */
export function Sling({ game, onProgress }: { game: SlingGame; onProgress: (value: number, done: boolean) => void }) {
  const fx = useFx()
  const stinger = useStinger()
  const area = useRef<HTMLDivElement>(null)
  const [pull, setPull] = useState<number | null>(null)
  const [flying, setFlying] = useState(false)
  const [hit, setHit] = useState(false)
  const [done, setDone] = useState(false)

  const release = () => {
    if (flying || hit) return
    setPull(null)
    setFlying(true)
    stinger("whoosh")
    setTimeout(
      () => {
        setFlying(false)
        setHit(true)
        vibrate(HAPTIC.seal)
        stinger("heartbeat")
        onProgress(1, true)
        setTimeout(() => setDone(true), fx.motion ? 1300 : 0)
      },
      fx.motion ? 650 : 0,
    )
  }

  const drag = (e: React.PointerEvent) => {
    if (flying || hit || (e.pointerType === "mouse" && e.buttons === 0)) return
    const r = area.current!.getBoundingClientRect()
    setPull(Math.max(0, Math.min(1, ((e.clientY - r.top) / r.height - 0.7) / 0.22)))
  }

  return (
    <div
      ref={area}
      className="relative h-full w-full touch-none overflow-hidden select-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        drag(e)
      }}
      onPointerMove={drag}
      onPointerUp={() => (pull !== null && pull > 0.15 ? release() : setPull(null))}
    >
      <Backdrop name={game.art} portrait palette={game.palette} />
      <GameHint>
        {game.instruction} · {formatRef(game.ref, "short")}
      </GameHint>
      <Giant fallen={hit} />
      {/* Funda e pedra. */}
      <svg viewBox="0 0 100 40" className="absolute inset-x-0 bottom-[10%] mx-auto h-[18%] w-1/2 overflow-visible" aria-hidden>
        <path d={`M 20 4 Q 50 ${8 + (pull ?? 0) * 30} 80 4`} fill="none" stroke="#8a6a44" strokeWidth="2.5" />
      </svg>
      {!hit && (
        <motion.span
          className="absolute left-1/2 size-5 -translate-x-1/2 rounded-full bg-[#d8d0c0] shadow-[0_0_8px_rgba(0,0,0,0.5)]"
          initial={false}
          animate={flying ? { top: "16%", scale: 0.5 } : { top: `${80 + (pull ?? 0) * 8}%`, scale: 1 }}
          transition={{ duration: flying ? 0.6 : 0.05 }}
        />
      )}
      {!hit && !flying && (
        <button type="button" onClick={release} className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-black/50 px-4 py-2 text-sm text-white">
          Lançar
        </button>
      )}
      {done && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} />}
    </div>
  )
}
