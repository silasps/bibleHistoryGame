"use client"

/* eslint-disable @next/next/no-img-element */
import { Lock } from "lucide-react"
import { motion } from "motion/react"
import { artFile, sceneFile } from "@/components/art/art-files"
import { CREATION, ETAPA1_LABELS, GARDEN_TARGETS, RELICS } from "@/content/etapas/etapa-1"
import { ALL_RELICS } from "@/content/etapas/relics"
import { formatRef } from "@/content/refs"
import type { Inventory } from "@/domain/relics"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"
import { RelicIcon, Tree } from "./art"

// Depois do fruto: a escuridão (Gn 3:6–8), Deus veste o homem (Gn 3:21) e
// fora do jardim (Gn 3:22–24). Mesmas peças no celular, no telão e no solo.

export type AfterFallKind = "queda" | "vestes" | "fora"

/** Túnica de pele: imagem do autor ou desenho provisório. */
function Garment({ className }: { className?: string }) {
  const file = artFile("reliquias", "vestes")
  if (file) return <img src={file} alt={RELICS.vestes.label} className={cn("object-contain", className)} draggable={false} />
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={RELICS.vestes.label}>
      <path d="M30 14 L50 22 L70 14 L88 32 L76 42 L76 90 L24 90 L24 42 L12 32 Z" fill="#8a6a44" stroke="#f4d27a" strokeWidth={2} strokeLinejoin="round" />
      <path d="M40 18 L50 30 L60 18" fill="none" stroke="#5a3a22" strokeWidth={2} />
    </svg>
  )
}

/** Espada flamejante entre querubins (provisório até a imagem do autor). */
function FlamingSword({ className }: { className?: string }) {
  const fx = useFx()
  return (
    <motion.svg viewBox="0 0 100 100" className={className} aria-hidden animate={fx.motion ? { rotate: 360 } : undefined} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
      <defs>
        <linearGradient id="fogo" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.5" stopColor="#ff9a3a" />
          <stop offset="1" stopColor="#c8302a" />
        </linearGradient>
      </defs>
      <path d="M50 4 L55 50 L50 96 L45 50 Z" fill="url(#fogo)" />
      <path d="M4 50 L50 45 L96 50 L50 55 Z" fill="url(#fogo)" opacity={0.7} />
    </motion.svg>
  )
}

/** Celular e solo: o momento escuro, com o inventário apagando. */
export function AfterFallPhone({ kind, line, inventory }: { kind: AfterFallKind; line?: string; inventory: Inventory }) {
  const fx = useFx()
  const portraitScene = kind === "fora" ? sceneFile("querubins", true) : kind === "vestes" ? sceneFile("vestes", true) : undefined
  return (
    <motion.div
      className="relative flex min-h-[70dvh] flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl bg-black p-6 text-center"
      initial={fx.motion ? { backgroundColor: "#16223a" } : false}
      animate={{ backgroundColor: "#000000" }}
      transition={{ duration: 2.4 }}
      role="status"
    >
      {portraitScene && <img src={portraitScene} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
      {kind === "vestes" && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(244,210,122,0.55),transparent)]"
          initial={fx.motion ? { opacity: 0, y: -60 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 3 }}
        />
      )}
      <div className="relative space-y-4">
        {kind === "queda" && <p className="font-display text-3xl text-mist">{ETAPA1_LABELS.darkness}</p>}
        {kind === "vestes" && (
          <motion.div initial={fx.motion ? { opacity: 0, scale: 0.8 } : false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5, duration: 1 }} className="space-y-2">
            {!portraitScene && <Garment className="mx-auto size-28" />}
            <p className="rounded-full border border-gold/60 bg-night/80 px-4 py-2 text-sm font-semibold text-gold-bright">
              ✦ Relíquia: {RELICS.vestes.label} · <span className="whitespace-nowrap">{formatRef(RELICS.vestes.ref, "long")}</span>
            </p>
          </motion.div>
        )}
        {kind === "fora" && (
          <>
            {!portraitScene && <FlamingSword className="mx-auto size-32" />}
            <p className="font-display text-3xl text-[#ffb98a]">{ETAPA1_LABELS.fallTitle}</p>
            <p className="text-sm text-sand">{formatRef(ETAPA1_LABELS.fallRef, "long")}</p>
          </>
        )}
        {line && <p className="font-display text-2xl leading-snug text-parchment [text-shadow:0_2px_14px_rgba(0,0,0,0.95)]">{line}</p>}
      </div>
      <RelicBar inventory={inventory} className="relative w-full" />
    </motion.div>
  )
}

/** Inventário: árvore da vida (no jardim ou trancada), conquistas da Etapa 1 e as relíquias de todas as etapas. */
export function RelicBar({ inventory, className }: { inventory: Inventory; className?: string }) {
  const creation = CREATION.filter((c) => inventory.conquests.includes(c.id)).length
  const garden = GARDEN_TARGETS.filter((t) => inventory.conquests.includes(t.id)).length
  const locked = inventory.fallen
  const owned = ALL_RELICS.filter((r) => inventory.relics.includes(r.id))
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border border-border bg-night/80 p-3 text-left", className)} aria-label="Inventário">
      <div className={cn("relative grid size-12 shrink-0 place-items-center rounded-xl border", locked ? "border-border bg-black/40" : "border-gold/60 bg-gold/10")} title={RELICS["arvore-vida"].label}>
        <RelicIcon id="arvore-vida" fallback={<Tree kind="vida" className="h-10 w-auto" />} className={cn("size-10", locked && "opacity-30 grayscale")} />
        {locked && <Lock className="absolute size-4 text-mist" aria-label={ETAPA1_LABELS.lockedTree} />}
      </div>
      <div className="min-w-0 flex-1 text-xs">
        {creation + garden > 0 && (
          <p className={cn("text-sand", locked && "text-mist line-through decoration-mist/60")}>
            Criação {creation}/{CREATION.length} · Jardim {garden}/{GARDEN_TARGETS.length}
          </p>
        )}
        <p className="text-mist">
          Relíquias {owned.length}/{ALL_RELICS.length}
          {locked ? ` · ${ETAPA1_LABELS.lockedTree}` : ""}
        </p>
      </div>
      <div className="flex max-w-[45%] flex-wrap justify-end gap-1">
        {owned.length === 0 && <span className="grid size-9 place-items-center rounded-lg border border-dashed border-border text-transparent">✦</span>}
        {owned.slice(-4).map((r) => (
          <span key={r.id} title={r.label} className="grid size-9 place-items-center rounded-lg border border-gold/60 bg-gold/15 text-base text-gold-bright">
            <RelicIcon id={r.art} fallback="✦" className="size-8" />
            <span className="sr-only">{r.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/** Telão: o mesmo momento, grande, com a linha do autor. */
export function AfterFallStage({ kind, line }: { kind: AfterFallKind; line?: string }) {
  const fx = useFx()
  const scene = kind === "fora" ? sceneFile("querubins", false) : kind === "vestes" ? sceneFile("vestes", false) : undefined
  return (
    <motion.div className="absolute inset-0 bg-black" initial={fx.motion ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
      {scene && <img src={scene} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />}
      {kind === "vestes" && (
        <motion.div className="absolute inset-x-0 top-0 h-3/4 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(244,210,122,0.5),transparent)]" initial={fx.motion ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 3 }} />
      )}
      <div className="absolute inset-x-[8cqw] bottom-[10cqh] top-[12cqh] flex flex-col items-center justify-center gap-[3cqh] text-center">
        {kind === "vestes" && !scene && <Garment className="h-[28cqh] w-auto" />}
        {kind === "fora" && !scene && <FlamingSword className="h-[30cqh] w-auto" />}
        {kind === "fora" && <p className="font-display text-[4.4cqw] text-[#ffb98a]">{ETAPA1_LABELS.fallTitle}</p>}
        {line && (
          <motion.p initial={fx.motion ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="max-w-[70cqw] font-display text-[3.2cqw] leading-snug text-parchment [text-shadow:0_2px_18px_rgba(0,0,0,0.95),0_0_6px_rgba(0,0,0,0.8)]">
            {line}
          </motion.p>
        )}
        <p className="text-[1.6cqw] text-gold">{formatRef(kind === "vestes" ? RELICS.vestes.ref : kind === "fora" ? ETAPA1_LABELS.fallRef : ETAPA1_LABELS.darknessRef, "long")}</p>
      </div>
    </motion.div>
  )
}
