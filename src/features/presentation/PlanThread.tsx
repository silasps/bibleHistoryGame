"use client"

import { motion } from "motion/react"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"

/**
 * O fio do plano: um fio dourado com um nó por versículo já lembrado na
 * história. O nó atual brilha; os seguintes ficam apagados.
 */
export function PlanThread({ current, total, className }: { current: number; total: number; className?: string }) {
  const fx = useFx()
  const x = (k: number) => (total > 1 ? 4 + ((k - 1) / (total - 1)) * 92 : 50)
  return (
    <svg viewBox="0 0 100 10" className={cn("overflow-visible", className)} role="img" aria-label={`O plano, lembrado pela ${current}ª vez de ${total}`}>
      <line x1="2" y1="5" x2="98" y2="5" stroke="#d8a948" strokeOpacity={0.22} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
      <motion.line
        x1="2"
        y1="5"
        y2="5"
        stroke="#f4d27a"
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={fx.motion ? { x2: x(Math.max(1, current - 1)) } : false}
        animate={{ x2: x(current) }}
        transition={{ duration: 1.6, delay: 0.6, ease: "easeInOut" }}
      />
      {Array.from({ length: total }, (_, i) => i + 1).map((k) => (
        <motion.circle
          key={k}
          cx={x(k)}
          cy={5}
          r={k === current ? 2.2 : 1.3}
          fill={k <= current ? "#f4d27a" : "#0a0f1c"}
          stroke={k <= current ? "#f4d27a" : "#6b7387"}
          strokeWidth={0.5}
          vectorEffect="non-scaling-stroke"
          style={k === current ? { filter: "drop-shadow(0 0 1.2px #f4d27a)" } : undefined}
          initial={fx.motion && k === current ? { scale: 0, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: "spring", stiffness: 220, damping: 12 }}
        />
      ))}
    </svg>
  )
}
