"use client"

import { Eye, Search, Scale, Landmark } from "lucide-react"
import { forwardRef } from "react"
import type { PerspectiveMode, Scene } from "@/content/schema"
import { SplitReveal } from "@/fx/SplitReveal"

const PERSPECTIVE: Record<PerspectiveMode, { label: string; icon: typeof Eye }> = {
  investigator: { label: "Investigador", icon: Search },
  biblical_character: { label: "Perspectiva de personagem", icon: Eye },
  theological_dilemma: { label: "Dilema teológico", icon: Scale },
  historical_observer: { label: "Observador do relato", icon: Landmark },
}

export const SceneHeading = forwardRef<HTMLDivElement, { scene: Scene }>(function SceneHeading({ scene }, ref) {
  const p = PERSPECTIVE[scene.perspective]
  return (
    <div ref={ref} tabIndex={-1} className="space-y-3 outline-none">
      <p className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.3em] text-gold/90">
        <p.icon className="size-3.5" aria-hidden /> {p.label}
      </p>
      <SplitReveal key={scene.id} text={scene.title} as="h1" by="words" className="font-display text-4xl leading-[1.05] text-parchment md:text-5xl" />
      {scene.character && (
        <p className="inline-flex rounded-full border border-rose/30 bg-rose/10 px-3 py-1 text-xs text-rose">
          Você assume: {scene.character}
        </p>
      )}
    </div>
  )
})
