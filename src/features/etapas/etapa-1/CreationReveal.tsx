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

/** Tudo revelado: a Criação inteira em ordem, dia por dia, com rolagem dentro do jogo. */
function CreationDone() {
  const fx = useFx()
  return (
    <div className="absolute inset-0 overflow-y-auto bg-night px-4 pb-4 pt-5">
      <div className="mb-4 text-center">
        <p className="font-display text-3xl text-gold-bright">{ETAPA1_LABELS.creationDone}</p>
        <p className="text-sm text-mist">{formatRef(ETAPA1_LABELS.creationDoneRef, "long")}</p>
      </div>
      <ol className="mx-auto max-w-xl space-y-2.5">
        {CREATION.map((r, i) => (
          <motion.li
            key={r.id}
            initial={fx.motion ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-ink/80 p-2"
          >
            <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl sm:w-36">
              <Backdrop name={r.art} portrait={false} palette={r.palette} />
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gold">Dia {r.day}</p>
              <p className="font-display text-xl leading-tight text-parchment">{r.label}</p>
              <p className="text-xs text-mist">{formatRef(r.ref, "long")}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
