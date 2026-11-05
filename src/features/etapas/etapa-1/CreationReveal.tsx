"use client"

import { motion } from "motion/react"
import { useCallback, useState } from "react"
import { CREATION, ETAPA1_LABELS, type CreationReveal as Reveal } from "@/content/etapas/etapa-1"
import { formatRef } from "@/content/refs"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { ScratchLayer } from "../games/ScratchLayer"
import { Backdrop } from "./art"

interface Props {
  /** Quantas revelações já foram feitas (0 = ainda escuro). */
  onProgress: (value: number, done: boolean) => void
  onConquest: (id: string) => void
}

/**
 * Criação no celular: um toque para a luz e depois raspar o escuro para
 * revelar cada dia. Cada revelação é uma conquista.
 */
export function CreationReveal({ onProgress, onConquest }: Props) {
  const [step, setStep] = useState(0)
  const [burst, setBurst] = useState(false)
  const stinger = useStinger()
  const fx = useFx()

  const advance = useCallback(
    (reveal: Reveal, index: number) => {
      onConquest(reveal.id)
      onProgress(index + 1, index + 1 === CREATION.length)
      setStep(index + 1)
    },
    [onConquest, onProgress],
  )

  const sayLight = () => {
    if (burst) return
    setBurst(true)
    vibrate(HAPTIC.light)
    stinger("reveal")
    setTimeout(() => advance(CREATION[0], 0), fx.motion ? 1600 : 0)
  }

  if (step === 0) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-black">
        {burst && (
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff,#fff6d8_30%,#f4d27a_60%,transparent_75%)]"
            initial={{ width: 0, height: 0 }}
            animate={{ width: "260vmax", height: "260vmax" }}
            transition={{ duration: fx.motion ? 1.6 : 0, ease: "easeIn" }}
          />
        )}
        {!burst && (
          <button onClick={sayLight} className="absolute inset-0 grid place-items-center text-center">
            <span className="space-y-4">
              <motion.span
                className="mx-auto block size-4 rounded-full bg-gold-bright shadow-[0_0_30px_10px_rgba(244,210,122,0.6)]"
                animate={fx.motion ? { scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] } : undefined}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="block font-display text-3xl text-parchment">{ETAPA1_LABELS.hajaLuz}</span>
              <span className="block text-sm text-mist">{formatRef(CREATION[0].ref, "long")}</span>
            </span>
          </button>
        )}
      </div>
    )
  }

  if (step >= CREATION.length) return <CreationDone />

  const reveal = CREATION[step]
  return <ScratchDay key={reveal.id} reveal={reveal} index={step} total={CREATION.length} onCleared={() => advance(reveal, step)} />
}

function ScratchDay({ reveal, index, total, onCleared }: { reveal: Reveal; index: number; total: number; onCleared: () => void }) {
  const [cleared, setCleared] = useState(false)
  const stinger = useStinger()
  const fx = useFx()

  const finish = useCallback(() => {
    if (cleared) return
    setCleared(true)
    vibrate(HAPTIC.light)
    stinger("light")
    setTimeout(onCleared, fx.motion ? 1600 : 400)
  }, [cleared, fx.motion, onCleared, stinger])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Backdrop name={reveal.art} portrait palette={reveal.palette}>
        <div className="absolute inset-x-0 bottom-[12%] text-center [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]">
          <p className="font-display text-4xl text-white">{reveal.label}</p>
          <p className="text-sm text-white/80">{formatRef(reveal.ref, "long")}</p>
        </div>
      </Backdrop>
      <ScratchLayer cover="escuro" cleared={cleared} onCleared={finish} hint={ETAPA1_LABELS.scratch} label={reveal.label} />
      {cleared && (
        <motion.p
          initial={fx.motion ? { opacity: 0, scale: 0.8 } : false}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute left-1/2 top-[8%] -translate-x-1/2 rounded-full border border-gold/60 bg-night/80 px-4 py-2 text-sm font-semibold text-gold-bright shadow-[0_0_24px_rgba(244,210,122,0.5)]"
          role="status"
        >
          ✦ Conquista: {reveal.label}
        </motion.p>
      )}
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-4 text-xs text-white/80">
        <span>
          {index + 1} de {total}
        </span>
        {!cleared && (
          <button onClick={finish} className="rounded-full border border-white/30 bg-black/40 px-3 py-1.5 text-white">
            Revelar
          </button>
        )}
      </div>
    </div>
  )
}

function CreationDone() {
  return (
    <div className="grid h-full w-full grid-cols-2 gap-2 overflow-y-auto bg-night p-3">
      {CREATION.map((r) => (
        <div key={r.id} className="relative aspect-[3/4] overflow-hidden rounded-xl">
          <Backdrop name={r.art} portrait palette={r.palette} />
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-2 text-center text-sm text-white">{r.label}</p>
        </div>
      ))}
    </div>
  )
}
