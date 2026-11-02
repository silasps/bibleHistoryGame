"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect } from "react"
import { useFx } from "./useFx"

/**
 * Efeito de "rebobinar" ao sair de uma simulação e voltar ao relato canônico.
 * É a marca visual de que a alternativa não era o texto bíblico.
 * Controlado pelo pai: `play` liga; `onDone` avisa o fim.
 */
export function RewindGlitch({ play, label = "Voltando ao relato", onDone }: { play: boolean; label?: string; onDone?: () => void }) {
  const fx = useFx()
  const visible = play && fx.motion

  useEffect(() => {
    if (!play) return
    const t = setTimeout(() => onDone?.(), fx.motion ? 1400 : 0)
    return () => clearTimeout(t)
    // onDone muda a cada render do pai; só o gatilho importa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, fx.motion])
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-night/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          role="status"
          aria-live="polite"
        >
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, rgba(241,232,214,0.06) 0 1px, transparent 1px 4px)",
            }}
            animate={{ y: [0, -40, 0, -20] }}
            transition={{ duration: 1.2, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-parchment/10 to-transparent"
            initial={{ top: "110%" }}
            animate={{ top: "-20%" }}
            transition={{ duration: 0.9, ease: "easeIn", repeat: 1 }}
          />
          <motion.div
            className="relative flex items-center gap-3 font-display text-3xl tracking-wide text-parchment md:text-5xl"
            animate={{ x: [0, -6, 4, -2, 0], textShadow: ["2px 0 #e0715c, -2px 0 #7fae8b", "-3px 0 #e0715c, 3px 0 #7fae8b", "0 0 transparent"] }}
            transition={{ duration: 1.1 }}
          >
            <span aria-hidden className="text-gold">◀◀</span>
            {label}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
