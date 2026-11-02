"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ParticleField } from "@/fx/ParticleField"
import { SplitReveal } from "@/fx/SplitReveal"
import { useFx } from "@/fx/useFx"
import { useHydrated } from "@/stores/hydration"
import { useSolo } from "@/stores/solo-store"

export function HeroStage() {
  const fx = useFx()
  const hydrated = useHydrated()
  const hasProgress = useSolo((s) => Object.keys(s.sceneStatus).length > 0)

  const fade = (delay: number) => ({
    initial: fx.motion ? { opacity: 0, y: 16 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay, ease: "easeOut" as const },
  })

  return (
    <section className="stage-glow grain relative isolate flex min-h-[88dvh] flex-col items-center justify-center overflow-hidden px-4 text-center" style={{ ["--illumination" as string]: 0.35 }}>
      <ParticleField preset="stars" intensity={0.7} />
      <motion.p {...fade(0.2)} className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
        Uma investigação interativa
      </motion.p>
      <SplitReveal
        text="Bíblia"
        as="h1"
        className="font-display text-7xl font-semibold uppercase tracking-[0.2em] text-gold-bright [text-shadow:0_0_40px_rgba(216,169,72,0.45)] sm:text-8xl md:text-9xl"
        delay={0.4}
      />
      <SplitReveal text="Por trás da história" as="p" by="words" className="mt-2 font-display text-3xl italic text-parchment md:text-5xl" delay={1.1} />
      <motion.p {...fade(1.8)} className="mt-6 max-w-xl text-base text-mist md:text-lg">
        Uma história. Muitas escolhas. Investigue os relatos, enfrente dilemas e descubra os fios que atravessam a Escritura.
      </motion.p>
      <motion.div {...fade(2.2)} className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/solo"
          className="group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full bg-gold px-8 text-base font-semibold text-primary-foreground shadow-[0_0_40px_rgba(216,169,72,0.35)] transition hover:bg-gold-bright"
        >
          {hydrated && hasProgress ? "Continuar a investigação" : "Começar a investigação"}
        </Link>
        <Link href="/presenter" className="inline-flex min-h-12 items-center rounded-full border border-gold/40 px-6 text-sm text-parchment transition hover:border-gold hover:bg-gold/10">
          Apresentar ao vivo
        </Link>
        <Link href="/join" className="inline-flex min-h-12 items-center rounded-full px-6 text-sm text-mist transition hover:text-parchment">
          Entrar em uma sala
        </Link>
      </motion.div>
    </section>
  )
}
