"use client"

import { motion } from "motion/react"
import { useEffect } from "react"
import type { EtapaRelic } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { RelicIcon } from "../etapa-1/art"

type Ref = Parameters<typeof formatRef>[0]

/** Fim do minijogo: o desfecho do relato e a relíquia da etapa. */
export function Finale({ label, refs, relic, note, score }: { label: string; refs: Ref; relic: EtapaRelic; note?: { label: string; ref: Ref }; score?: number }) {
  const fx = useFx()
  const stinger = useStinger()
  useEffect(() => {
    vibrate(HAPTIC.seal)
    stinger("reveal")
  }, [stinger])
  return (
    <motion.div
      initial={fx.motion ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 grid place-items-center bg-black/65 p-6 text-center"
      role="status"
    >
      <div className="space-y-4">
        <p className="font-display text-3xl leading-tight text-parchment [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]">{label}</p>
        <p className="text-sm text-sand">{formatRef(refs, "long")}</p>
        {note && (
          <p className="font-display text-xl text-gold-bright [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]">
            {note.label} <span className="text-xs text-sand">· {formatRef(note.ref, "long")}</span>
          </p>
        )}
        {score !== undefined && <p className="text-base font-semibold tabular-nums text-parchment">Você fez {score.toLocaleString("pt-BR")} pontos</p>}
        <motion.p
          initial={fx.motion ? { opacity: 0, scale: 0.85 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/60 bg-night/85 px-4 py-2 text-sm font-semibold text-gold-bright"
        >
          <RelicIcon id={relic.art} fallback="✦" className="size-7" /> Relíquia: {relic.label}
        </motion.p>
      </div>
    </motion.div>
  )
}
