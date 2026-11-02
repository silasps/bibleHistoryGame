"use client"

import { motion, useAnimationControls } from "motion/react"
import { useEffect, type ReactNode } from "react"
import { useFx } from "./useFx"

/** Tremor curto (ex.: trem passando). Desligado com movimento reduzido. */
export function ScreenShake({ trigger, children, className }: { trigger: unknown; children: ReactNode; className?: string }) {
  const controls = useAnimationControls()
  const fx = useFx()
  useEffect(() => {
    if (!trigger || !fx.intense) return
    void controls.start({ x: [0, -5, 6, -4, 3, -2, 0], y: [0, 2, -3, 2, -1, 0], transition: { duration: 0.6 } })
  }, [trigger, fx.intense, controls])
  return (
    <motion.div animate={controls} className={className}>
      {children}
    </motion.div>
  )
}
