"use client"

import { Lock, Sparkles } from "lucide-react"
import { motion } from "motion/react"
import { forwardRef } from "react"
import type { Evidence, ReleasedSynthesis } from "@/content/schema"
import { CATEGORY_LABEL } from "@/content/labels"
import { BlockList } from "@/components/story/BlockList"
import { ConnectionChips } from "@/components/story/ConnectionChips"
import { RefList } from "@/components/story/RefList"
import type { BoardNodeStatus } from "@/domain/evidence"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"

interface Props {
  evidence: Evidence
  status: BoardNodeStatus
  synthesis?: ReleasedSynthesis
  expanded?: boolean
  onToggle?: () => void
}

export const EvidenceCard = forwardRef<HTMLDivElement, Props>(function EvidenceCard({ evidence: ev, status, synthesis, expanded, onToggle }, ref) {
  const fx = useFx()
  const open = status === "aberta"
  return (
    <motion.div
      ref={ref}
      layout={fx.motion}
      initial={fx.motion ? { opacity: 0, rotateX: -60 } : false}
      animate={{ opacity: 1, rotateX: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "relative rounded-2xl border p-4 text-left [transform-style:preserve-3d]",
        open && ev.connection && "border-gold/70 bg-[linear-gradient(180deg,rgb(216_169_72/0.16),transparent),var(--ink)] shadow-[0_0_40px_rgba(216,169,72,0.18)]",
        open && !ev.connection && "border-sand/30 bg-ink",
        status === "selada" && "border-gold/30 bg-night",
        status === "futura" && "border-dashed border-gold/40 bg-night",
      )}
    >
      <button onClick={onToggle} disabled={!open} aria-expanded={open ? !!expanded : undefined} className="w-full text-left disabled:cursor-default">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-mist">{open ? CATEGORY_LABEL[ev.category] : status === "futura" ? "Conexão futura" : "Selada"}</span>
          {open ? ev.connection && <Sparkles className="size-4 text-gold" aria-label="Conexão" /> : <Lock className="size-4 text-gold/70" aria-hidden />}
        </div>
        <p className={cn("mt-2 font-display text-xl leading-tight", open ? "text-parchment" : "text-sand/80")}>{open ? ev.title : "Pista selada"}</p>
        {open ? <RefList refs={ev.refs} className="mt-1" /> : <p className="mt-1 text-sm italic text-mist">{ev.lockedHint}</p>}
      </button>
      {open && expanded && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          {ev.summary && <BlockList blocks={[ev.summary]} stagger={0} />}
          {synthesis && <BlockList blocks={synthesis.blocks} stagger={0.05} />}
          {ev.connection && ev.showClassification && <ConnectionChips primary={ev.connection.primary} secondary={ev.connection.secondary} note={synthesis?.classificationNote} />}
        </div>
      )}
    </motion.div>
  )
})
