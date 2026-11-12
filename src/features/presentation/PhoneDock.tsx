"use client"

import { ScrollText, Trophy, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type { ReactNode } from "react"
import { ALL_RELICS } from "@/content/etapas/relics"
import { formatRef } from "@/content/refs"
import type { Inventory } from "@/domain/relics"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"
import { RelicBar } from "../etapas/etapa-1/AfterFall"
import { RelicIcon } from "../etapas/etapa-1/art"

export type DockPanel = "conquistas" | "arquivo"

/** Barra de ícones no pé do celular, como num app de jogo. */
export function PhoneDock({
  relics,
  clues,
  fresh,
  onOpen,
}: {
  relics: number
  clues: number
  /** Há pista liberada esperando ser quebrada no Arquivo. */
  fresh: boolean
  onOpen: (panel: DockPanel) => void
}) {
  return (
    <nav aria-label="Seus itens" className="relative z-20 shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-full border border-gold/25 bg-night/85 p-1.5 backdrop-blur">
        <DockButton icon={<Trophy className="size-5" aria-hidden />} label="Conquistas" count={relics} onClick={() => onOpen("conquistas")} />
        <DockButton icon={<ScrollText className="size-5" aria-hidden />} label="Arquivo" count={clues} dot={fresh} onClick={() => onOpen("arquivo")} />
      </div>
    </nav>
  )
}

function DockButton({ icon, label, count, dot, onClick }: { icon: ReactNode; label: string; count: number; dot?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="relative flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-parchment active:bg-gold/15">
      <span className="text-gold">{icon}</span>
      {label}
      {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold/90 px-1.5 text-[0.7rem] tabular-nums text-night">{count}</span>}
      {dot && <span className="absolute right-3 top-1.5 size-2.5 animate-pulse rounded-full bg-gold-bright shadow-[0_0_10px_#f4d27a]" aria-label="Pista nova" />}
    </button>
  )
}

/** Gaveta que sobe do pé da tela. */
export function PhoneSheet({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  const fx = useFx()
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="sheet" className="fixed inset-0 z-50 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Fechar" className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.section
            role="dialog"
            aria-label={title}
            initial={fx.motion ? { y: "100%" } : false}
            animate={{ y: 0 }}
            exit={fx.motion ? { y: "100%" } : undefined}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative mx-auto flex max-h-[82dvh] w-full max-w-md flex-col rounded-t-3xl border border-b-0 border-gold/25 bg-navy pb-[env(safe-area-inset-bottom)]"
          >
            <header className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
              <h2 className="text-xs uppercase tracking-[0.35em] text-gold">{title}</h2>
              <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full text-mist active:bg-white/10" aria-label="Fechar">
                <X className="size-5" />
              </button>
            </header>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-5">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Conquistas: o inventário e todas as relíquias (as que faltam aparecem apagadas). */
export function Achievements({ inventory }: { inventory: Inventory }) {
  return (
    <>
      <RelicBar inventory={inventory} />
      <ul className="grid grid-cols-3 gap-2">
        {ALL_RELICS.map((r) => {
          const owned = inventory.relics.includes(r.id)
          return (
            <li key={r.id} className={cn("flex flex-col items-center gap-1 rounded-2xl border p-2 text-center", owned ? "border-gold/50 bg-gold/10" : "border-border bg-night/60")}>
              <RelicIcon id={r.art} fallback={<span className="text-xl text-gold">✦</span>} className={cn("size-12", !owned && "opacity-25 grayscale")} />
              <p className={cn("line-clamp-2 text-[0.7rem] leading-tight", owned ? "text-parchment" : "text-mist")}>{owned ? r.label : `Etapa ${r.etapa}`}</p>
              {owned && <p className="text-[0.65rem] text-gold">{formatRef(r.ref, "short")}</p>}
            </li>
          )
        })}
      </ul>
    </>
  )
}
