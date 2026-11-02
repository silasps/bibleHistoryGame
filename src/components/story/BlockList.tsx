"use client"

import { motion } from "motion/react"
import type { ContentBlock } from "@/content/schema"
import { blockLabel } from "@/content/refs"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"
import { ContentKindBadge } from "./ContentKindBadge"
import { RefList } from "./RefList"

const TEXT: Record<ContentBlock["kind"], string> = {
  texto_biblico: "font-display text-2xl leading-snug text-parchment",
  parafrase: "font-display text-[1.45rem] leading-snug text-parchment md:text-2xl",
  interpretacao: "text-base leading-relaxed text-parchment/85",
  analogia: "font-display text-[1.35rem] italic leading-snug text-parchment md:text-2xl",
  hipotese_ficcional: "font-display text-[1.35rem] italic leading-snug text-rose/90 md:text-2xl",
  narracao: "text-base leading-relaxed text-mist md:text-lg",
}

/** Lista de blocos editoriais, cada um com seu rótulo de natureza e referências. */
export function BlockList({ blocks, className, stagger = 0.18 }: { blocks: ContentBlock[]; className?: string; stagger?: number }) {
  const fx = useFx()
  return (
    <div className={cn("space-y-6", className)}>
      {blocks.map((b, i) => (
        <motion.div
          key={i}
          initial={fx.motion ? { opacity: 0, y: 14 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 + i * stagger, ease: "easeOut" }}
          className={cn("space-y-2", b.kind === "interpretacao" && "border-l-2 border-sky-300/25 pl-4", b.kind === "hipotese_ficcional" && "border-l-2 border-rose/30 pl-4")}
        >
          <ContentKindBadge kind={b.kind} label={b.label ?? (b.kind !== "parafrase" && b.kind !== "narracao" ? blockLabel(b) : undefined)} />
          <p className={TEXT[b.kind]}>{b.text}</p>
          <RefList refs={b.refs} />
        </motion.div>
      ))}
    </div>
  )
}
