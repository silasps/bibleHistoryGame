"use client"

import { motion } from "motion/react"
import { useEffect, useMemo } from "react"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useStinger } from "@/fx/useSound"
import { useFx } from "@/fx/useFx"

/** Estrelas acesas pelo público, distribuídas por ângulo áureo. */
export function LightsSky({ count, className = "absolute inset-0" }: { count: number; className?: string }) {
  const fx = useFx()
  const stars = useMemo(
    () =>
      Array.from({ length: Math.min(count, 400) }, (_, i) => {
        const a = i * 2.39996
        const r = Math.sqrt(i + 1) / Math.sqrt(Math.max(count, 30))
        return { x: 50 + Math.cos(a) * r * 46, y: 42 + Math.sin(a) * r * 34, s: 0.35 + ((i * 37) % 10) / 22 }
      }),
    [count],
  )
  return (
    <div className={className} aria-hidden>
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold-bright shadow-[0_0_1.2cqw_0.3cqw_rgba(244,210,122,0.7)]"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}cqw`, height: `${s.s}cqw` }}
          initial={fx.motion ? { scale: 0, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 12 }}
        />
      ))}
    </div>
  )
}

/** "Haja luz" no telão: escurece e surge um ponto dourado que se expande. */
export function HajaLuzStage({ startedAt }: { startedAt: number }) {
  const fx = useFx()
  const stinger = useStinger()
  useEffect(() => {
    const t = setTimeout(() => stinger("reveal"), 1800)
    return () => clearTimeout(t)
  }, [startedAt, stinger])
  return (
    <motion.div className="absolute inset-0 z-30 bg-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-bright"
        style={{ boxShadow: "0 0 8cqw 3cqw rgba(244,210,122,0.7)" }}
        initial={{ width: 0, height: 0 }}
        animate={fx.motion ? { width: ["0cqw", "0.6cqw", "0.6cqw", "160cqw"], height: ["0cqw", "0.6cqw", "0.6cqw", "160cqw"], opacity: [1, 1, 1, 0.08] } : { width: "0.8cqw", height: "0.8cqw" }}
        transition={{ duration: 9, times: [0, 0.2, 0.55, 1], ease: "easeInOut" }}
      />
    </motion.div>
  )
}

/** "Haja luz" no celular: tela preta e depois acende em onda, pela ordem de entrada. */
export function HajaLuzPhone({ startedAt, myOrder, total }: { startedAt: number; myOrder: number; total: number }) {
  const fx = useFx()
  const delay = 2 + (total > 1 ? (myOrder / (total - 1)) * 4 : 0)
  useEffect(() => {
    const t = setTimeout(() => vibrate(HAPTIC.wave), delay * 1000)
    return () => clearTimeout(t)
  }, [startedAt, delay])
  return (
    <motion.div className="fixed inset-0 z-50 bg-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} role="status" aria-label="Momento de luz">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#fff6d8,#f4d27a_30%,#d8a948_55%,#6e5137)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: fx.motion ? [0, 1, 0.85, 1] : 1 }}
        transition={{ delay: fx.motion ? delay : 0, duration: 2.4 }}
      />
    </motion.div>
  )
}

