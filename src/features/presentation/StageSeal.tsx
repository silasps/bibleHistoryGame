"use client"

import { AnimatePresence, motion } from "motion/react"
import { TRILHO } from "@/content/overview/trilho"
import type { SealInfo } from "@/domain/projection"
import { GoldThread } from "@/fx/GoldThread"
import { SealBreak } from "@/fx/SealBreak"
import { useFx } from "@/fx/useFx"

interface Props {
  seal: "fechado" | "liberado" | "aberto"
  info?: SealInfo
  /** Só a referência, depois da liberação. Nunca a explicação. */
  refs?: string[]
}

/**
 * Selo da pista no telão. Fechado: selo e dica. Liberado: o público quebra o
 * seu no celular e o selo do telão racha junto. Aberto: só a referência.
 */
export function StageSeal({ seal, info, refs }: Props) {
  const fx = useFx()
  const open = seal === "aberto"
  const share = info && info.players > 0 ? Math.min(1, info.opened / info.players) : 0
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-[6cqw] text-center">
      {open && <GoldThread className="absolute inset-0 h-full w-full" d="M -20 640 C 300 300 520 760 800 450 S 1300 120 1620 300" duration={4} />}
      {info && (
        <p className="relative text-[1.6cqw] font-semibold uppercase tracking-[0.45em] text-gold [text-shadow:0_0_1.5cqw_rgba(0,0,0,0.9)]">{TRILHO.selo(info.trail.n)}</p>
      )}
      <SealBreak
        open={open}
        hint={info?.hint}
        cracks={seal === "liberado" ? share : 0}
        ready={seal === "liberado"}
        sealClassName="size-[19cqw]"
        hintClassName="max-w-[64cqw] text-[2.8cqw] leading-tight [text-shadow:0_0.2cqw_1.5cqw_rgba(0,0,0,0.9)]"
        className="relative mt-[1cqw]"
      >
        {refs && <p className="font-display text-[5cqw] text-gold-bright [text-shadow:0_0_3cqw_rgba(216,169,72,0.6)]">{refs.join(" · ")}</p>}
      </SealBreak>
      <AnimatePresence>
        {seal === "liberado" && info && (
          <motion.div
            key="contagem"
            initial={fx.motion ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative mt-[1.5cqw] w-[38cqw] space-y-[0.8cqw]"
          >
            <p className="font-display text-[2.6cqw] italic text-gold-bright [text-shadow:0_0_2cqw_rgba(0,0,0,0.9)]">{TRILHO.telaoToque}</p>
            <div className="h-[0.7cqw] overflow-hidden rounded-full bg-gold/20">
              <motion.div className="h-full rounded-full bg-gold-bright shadow-[0_0_1cqw_#f4d27a]" initial={false} animate={{ width: `${share * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-[1.6cqw] tabular-nums text-sand">{TRILHO.telaoContagem(info.opened, info.players)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
