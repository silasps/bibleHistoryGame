"use client"

import { motion } from "motion/react"
import { useEffect } from "react"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { cn } from "@/lib/utils"
import { useSolo } from "@/stores/solo-store"
import type { RendererProps } from "../types"

/** Escolha hipotética. Registrada no Arquivo; não muda o relato. */
export function ChoicePanel({ scene, setVisual }: RendererProps) {
  const choice = scene.choice!
  const chosen = useSolo((s) => s.choices[scene.id])
  const choose = useSolo((s) => s.choose)
  const stinger = useStinger()
  const fx = useFx()

  // Batida de coração enquanto a decisão está em aberto.
  useEffect(() => {
    if (chosen || scene.fxCue !== "heartbeat") return
    stinger("heartbeat")
    const t = setInterval(() => stinger("heartbeat"), 2400)
    return () => clearInterval(t)
  }, [chosen, scene.fxCue, stinger])

  useEffect(() => {
    if (scene.visual === "yard-train") setVisual({ wall: 0, kids: "quintal" })
  }, [scene.visual, setVisual])

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-rose/30 bg-rose/10 px-4 py-2 text-sm text-rose">
        Simulação reflexiva: sua escolha muda a sua reflexão, nunca o relato bíblico.
      </p>
      <p className="font-display text-2xl text-parchment">{choice.prompt}</p>
      <div className="grid gap-3" role="group" aria-label={choice.prompt}>
        {choice.options.map((o, i) => {
          const isChosen = chosen === o.id
          return (
            <motion.button
              key={o.id}
              initial={fx.motion ? { opacity: 0, x: 24 } : false}
              animate={{ opacity: chosen && !isChosen ? 0.4 : 1, x: 0, scale: isChosen && fx.motion ? 1.02 : 1 }}
              transition={{ delay: chosen ? 0 : 0.4 + i * 0.12 }}
              whileHover={chosen || !fx.motion ? undefined : { x: 6 }}
              disabled={!!chosen}
              aria-pressed={isChosen}
              onClick={() => {
                choose(scene.id, o.id)
                vibrate(HAPTIC.vote)
                stinger("whoosh")
              }}
              className={cn(
                "group flex min-h-14 items-center gap-4 rounded-2xl border px-5 py-4 text-left text-lg transition-colors",
                !chosen && "border-border bg-navy/70 hover:border-gold/70 hover:bg-navy-2",
                isChosen && "border-gold bg-gold/15 shadow-[0_0_30px_rgba(216,169,72,0.25)]",
              )}
            >
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border font-display text-lg", isChosen ? "border-gold bg-gold text-primary-foreground" : "border-gold/40 text-gold")}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-parchment">{o.label}</span>
            </motion.button>
          )
        })}
      </div>
      {chosen && (
        <p role="status" className="text-sm text-mist">
          Escolha registrada. Continue para ver a simulação.
        </p>
      )}
    </div>
  )
}
