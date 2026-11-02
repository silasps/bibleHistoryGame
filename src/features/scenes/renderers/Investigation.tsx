"use client"

import { motion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { BlockList } from "@/components/story/BlockList"
import { useStinger } from "@/fx/useSound"
import { useFx } from "@/fx/useFx"
import { useSolo } from "@/stores/solo-store"
import type { RendererProps } from "../types"
import { SoloPoll } from "./SoloPoll"

/** Revela passos um a um (ex.: os candidatos a motorista) antes da enquete. */
export function Investigation({ scene, setVisual }: RendererProps) {
  const steps = useMemo(() => scene.steps ?? [], [scene.steps])
  const answered = useSolo((s) => (scene.poll ? !!s.pollAnswers[scene.poll.id] : false))
  const [shown, setShown] = useState(answered ? steps.length : 0)
  const stinger = useStinger()
  const fx = useFx()

  useEffect(() => {
    const step = steps[shown - 1]
    setVisual({ edgeCm: step?.value, safe: false })
  }, [shown, steps, setVisual])

  return (
    <div className="space-y-5">
      <BlockList blocks={scene.blocks} />
      <ol className="space-y-3">
        {steps.slice(0, shown).map((s, i) => (
          <motion.li
            key={s.id}
            initial={fx.motion ? { opacity: 0, x: 30 } : false}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-border bg-navy/60 p-4"
          >
            <p className="text-xs uppercase tracking-widest text-gold">{s.label}</p>
            <p className="mt-1 font-display text-2xl italic text-parchment">“{s.text}”</p>
            {i === shown - 1 && s.value !== undefined && (
              <p className="mt-2 text-xs text-ember">Distância da borda: {s.value >= 100 ? `${s.value / 100} m` : `${s.value} cm`}</p>
            )}
          </motion.li>
        ))}
      </ol>
      {shown < steps.length ? (
        <Button
          size="lg"
          className="h-12 w-full rounded-full text-base"
          onClick={() => {
            setShown((n) => n + 1)
            stinger("whoosh")
          }}
        >
          {shown === 0 ? "Ouvir o primeiro candidato" : "Próximo candidato"}
        </Button>
      ) : (
        scene.poll && <SoloPoll scene={scene} />
      )}
    </div>
  )
}
