"use client"

import { Smartphone } from "lucide-react"
import { motion } from "motion/react"
import type { PhoneAction } from "@/domain/phone-action"
import { useFx } from "@/fx/useFx"

const WHAT: Record<PhoneAction, string> = {
  jogo: "Hora do jogo",
  votar: "Hora de votar",
  selo: "Quebre o selo",
  luz: "Acenda a sua luz",
}

/**
 * Telão: "olhe o seu celular" enquanto o público tem algo para fazer no
 * celular. Fora disso o celular fica em repouso, e o telão não mostra nada.
 */
export function PhoneCue({ action, extra }: { action: PhoneAction; extra?: string }) {
  const fx = useFx()
  return (
    <motion.div
      key={action}
      role="status"
      initial={fx.motion ? { opacity: 0, y: "-2cqh", scale: 0.9 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none absolute inset-x-0 top-[6.5cqh] z-20 flex flex-col items-center gap-[0.5cqw]"
    >
      <motion.p
        animate={fx.motion ? { boxShadow: ["0 0 0cqw rgba(244,210,122,0)", "0 0 3cqw rgba(244,210,122,0.55)", "0 0 0cqw rgba(244,210,122,0)"] } : undefined}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="flex max-w-[70cqw] items-center gap-[1cqw] whitespace-nowrap rounded-full border border-gold/70 bg-night/90 px-[2.2cqw] py-[0.9cqw] font-display text-[2.3cqw] text-gold-bright backdrop-blur"
      >
        <motion.span
          className="inline-flex"
          animate={fx.motion ? { rotate: [0, -12, 12, -8, 0] } : undefined}
          transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 1.6 }}
        >
          <Smartphone className="size-[2.6cqw]" aria-hidden />
        </motion.span>
        Olhe o seu celular
        <span className="text-parchment/90">· {WHAT[action]}</span>
      </motion.p>
      {extra && <p className="text-[1.6cqw] tabular-nums text-sand [text-shadow:0_0_1.5cqw_rgba(0,0,0,0.9)]">{extra}</p>}
    </motion.div>
  )
}
