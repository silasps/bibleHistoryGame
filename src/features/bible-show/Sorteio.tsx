"use client"

import { motion } from "motion/react"
import { useEffect, useState } from "react"
import type { Estilo } from "@/domain/bible-show"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { cn } from "@/lib/utils"
import { ESTILO } from "./Trilha"

// Roleta (o jeito de jogar) e sorteio de casas. O resultado já vem do estado;
// a animação só mostra o caminho até ele, uma vez por rodada em cada aparelho.

const vistos = new Set<string>()

/** Anima só na primeira vez que este aparelho vê o resultado `chave`. */
function usePrimeiraVez(chave: string | null) {
  const fx = useFx()
  const [animar] = useState(() => !!chave && fx.motion && !vistos.has(chave))
  useEffect(() => {
    if (chave) vistos.add(chave)
  }, [chave])
  return animar
}

const COR_ESTILO: Record<Estilo, string> = { mimica: "#d8a948", perguntas: "#b18ad8", letras: "#5fb3c9" }
const FATIAS = 6

export function Roleta({ opcoes, resultado, chave, onFim }: { opcoes: Estilo[]; resultado: Estilo; chave: string; onFim?: () => void }) {
  const stinger = useStinger()
  const animar = usePrimeiraVez(chave)
  const fatias = Array.from({ length: FATIAS }, (_, i) => opcoes[i % opcoes.length])
  const passo = 360 / FATIAS
  const alvo = fatias.indexOf(resultado)
  // A fatia sorteada para no ponteiro, lá em cima.
  const final = 360 * 5 - (alvo + 0.5) * passo
  const [parou, setParou] = useState(!animar)
  useEffect(() => {
    if (parou) onFim?.()
  }, [parou, onFim])
  const fatia = (i: number) => {
    const a0 = ((i * passo - 90) * Math.PI) / 180
    const a1 = (((i + 1) * passo - 90) * Math.PI) / 180
    return `M50 50 L${50 + 48 * Math.cos(a0)} ${50 + 48 * Math.sin(a0)} A48 48 0 0 1 ${50 + 48 * Math.cos(a1)} ${50 + 48 * Math.sin(a1)} Z`
  }
  const Icone = ESTILO[resultado].icone
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative aspect-square w-[min(58vw,30dvh)]">
        <span aria-hidden className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2 border-x-[10px] border-t-[16px] border-x-transparent border-t-parchment drop-shadow" />
        <motion.div
          className="absolute inset-0"
          initial={{ rotate: animar ? 0 : final }}
          animate={{ rotate: final }}
          transition={{ duration: animar ? 3.2 : 0, ease: [0.12, 0.65, 0.2, 1] }}
          onAnimationComplete={() => {
            if (parou) return
            stinger("reveal")
            vibrate(HAPTIC.light)
            setParou(true)
          }}
        >
          <svg viewBox="0 0 100 100" className="size-full drop-shadow-[0_0_24px_rgba(216,169,72,0.25)]" aria-hidden>
            {fatias.map((e, i) => (
              <path key={i} d={fatia(i)} fill={`${COR_ESTILO[e]}${i % 2 ? "cc" : "99"}`} stroke="#0b0f19" strokeWidth="0.8" />
            ))}
            <circle cx="50" cy="50" r="9" fill="#0b0f19" stroke="#d8a948" strokeWidth="1.5" />
          </svg>
          {fatias.map((e, i) => {
            const I = ESTILO[e].icone
            return (
              <span key={i} className="absolute inset-0" style={{ transform: `rotate(${(i + 0.5) * passo}deg)` }} aria-hidden>
                <I className="absolute left-1/2 top-[11%] size-7 -translate-x-1/2 text-night" strokeWidth={2.4} />
              </span>
            )
          })}
        </motion.div>
      </div>
      <p className={cn("inline-flex min-h-9 items-center gap-2 rounded-full border px-4 font-display text-xl transition-opacity", parou ? "opacity-100" : "opacity-0")} style={{ borderColor: COR_ESTILO[resultado], color: COR_ESTILO[resultado] }} aria-live="polite">
        <Icone className="size-5" aria-hidden /> {parou ? ESTILO[resultado].nome : ""}
      </p>
    </div>
  )
}

const PONTOS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [30, 30],
    [70, 70],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
}

/** Dado de 1 a 3 casas. */
export function Dado({ valor, chave }: { valor: number | null; chave: string | null }) {
  const stinger = useStinger()
  const animar = usePrimeiraVez(valor ? chave : null)
  const [mostrado, setMostrado] = useState<number | null>(animar ? 1 : valor)
  const [rolando, setRolando] = useState(false)
  useEffect(() => {
    if (!valor) return
    if (!animar) {
      const t = setTimeout(() => setMostrado(valor), 0)
      return () => clearTimeout(t)
    }
    let n = 0
    const t0 = setTimeout(() => setRolando(true), 0)
    const id = setInterval(() => {
      n++
      if (n >= 10) {
        clearInterval(id)
        setMostrado(valor)
        setRolando(false)
        stinger("reveal")
        vibrate(HAPTIC.light)
        return
      }
      setMostrado((m) => ((m ?? 1) % 3) + 1)
      stinger("tap", n / 12)
    }, 90)
    return () => {
      clearTimeout(t0)
      clearInterval(id)
    }
  }, [valor, animar, stinger])
  const v = mostrado ?? null
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        animate={rolando ? { rotate: [0, -14, 12, -8, 0], y: [0, -8, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.35, repeat: rolando ? Infinity : 0 }}
        className={cn("relative grid size-24 place-items-center rounded-3xl border-2 bg-parchment shadow-[0_8px_24px_rgba(0,0,0,0.5)]", v ? "border-gold" : "border-dashed border-gold/50 bg-night")}
      >
        {v ? (
          <svg viewBox="0 0 100 100" className="size-full" aria-label={`${v} ${v === 1 ? "casa" : "casas"}`}>
            {PONTOS[v].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="10" fill="#0b0f19" />
            ))}
          </svg>
        ) : (
          <span className="font-display text-5xl text-gold">?</span>
        )}
      </motion.div>
      <p className="text-sm text-sand">{v && !rolando ? `Vale ${v} ${v === 1 ? "casa" : "casas"}` : "Quantas casas vale?"}</p>
    </div>
  )
}
