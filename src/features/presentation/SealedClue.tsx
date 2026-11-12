"use client"

import { Lock, Sparkles } from "lucide-react"
import { useState } from "react"
import { BlockList } from "@/components/story/BlockList"
import { ConnectionChips } from "@/components/story/ConnectionChips"
import { TRILHO } from "@/content/overview/trilho"
import type { ClueView } from "@/domain/projection"
import { SEAL_TAPS } from "@/domain/session"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { SealBreak } from "@/fx/SealBreak"
import { useStinger } from "@/fx/useSound"
import { cn } from "@/lib/utils"

interface Props {
  clue: ClueView
  /** Esta pessoa já quebrou o selo (no servidor ou neste aparelho). */
  broken: boolean
  onBroken: () => void
  /** Em destaque na cena da pista (maior, com o aviso da recompensa). */
  featured?: boolean
}

/**
 * Pista no celular. Chega selada; depois que o apresentador libera, a pessoa
 * quebra o selo com alguns toques e só então lê a pista.
 */
export function SealedClue({ clue, broken, onBroken, featured = false }: Props) {
  const stinger = useStinger()
  const [taps, setTaps] = useState(0)
  const [bump, setBump] = useState<number>()
  const [shake, setShake] = useState<number>()
  const [nudged, setNudged] = useState(false)
  const released = clue.status === "aberta"
  const open = released && broken
  const { n, total } = clue.trail

  const tap = () => {
    if (!released) {
      setShake(Date.now())
      setNudged(true)
      vibrate(HAPTIC.no)
      return
    }
    const next = Math.min(SEAL_TAPS, taps + 1)
    setTaps(next)
    setBump(Date.now())
    // O último toque quebra: o selo cuida do estalo, da vibração e do brilho.
    if (next >= SEAL_TAPS) onBroken()
    else {
      vibrate(HAPTIC.tap)
      stinger("tap", next / SEAL_TAPS)
    }
  }

  const status = released ? (taps > 0 ? TRILHO.faltam(SEAL_TAPS - taps) : TRILHO.toque) : nudged ? TRILHO.aindaNao : TRILHO.espere
  const label = open ? "Pista aberta" : clue.status === "futura" ? "Conexão futura" : TRILHO.selo(n)

  return (
    <article
      className={cn(
        "border",
        featured ? "rounded-3xl p-5" : "rounded-2xl p-4",
        open
          ? "border-gold/60 bg-[linear-gradient(180deg,rgb(216_169_72/0.14),transparent),var(--ink)]"
          : released
            ? "border-gold/60 bg-night shadow-[0_0_40px_rgba(216,169,72,0.15)]"
            : "border-dashed border-gold/40 bg-night",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-gold">
          {open ? <Sparkles className="size-3.5 shrink-0" aria-hidden /> : <Lock className="size-3.5 shrink-0" aria-hidden />}
          <span className="truncate">{label}</span>
        </p>
        {n > 0 && clue.status !== "futura" && <p className="shrink-0 text-xs tabular-nums text-mist">{TRILHO.posicao(n, total)}</p>}
      </div>

      {featured && !open && clue.status !== "futura" && <p className="mt-4 text-center font-display text-2xl leading-tight text-gold-bright">{TRILHO.recebeu(n)}</p>}

      <SealBreak
        open={open}
        hint={clue.lockedHint}
        hintClassName={featured ? "max-w-xs text-lg" : "max-w-xs text-base"}
        sealClassName={featured ? "size-44" : "size-32"}
        cracks={released ? taps / SEAL_TAPS : 0}
        ready={released && !open}
        onTap={open ? undefined : tap}
        tapLabel={released ? `Quebrar o selo. ${TRILHO.faltam(SEAL_TAPS - taps)}.` : TRILHO.espere}
        bumpKey={bump}
        shakeKey={shake}
      >
        {open && (
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="font-display text-2xl text-gold-bright">{clue.title}</h3>
              <p className="text-sm text-sand">
                {clue.refs?.join(" · ")} <span className="text-mist">(NAA)</span>
              </p>
            </div>
            {clue.synthesis && <BlockList blocks={clue.synthesis} stagger={0.25} />}
            {clue.classification && <ConnectionChips primary={clue.classification.primary} secondary={clue.classification.secondary} note={clue.classification.note} />}
          </div>
        )}
      </SealBreak>

      {!open && (
        <div className="space-y-2 text-center" aria-live="polite">
          <p className={cn("text-sm", released ? "font-semibold text-gold-bright" : "text-mist")}>{status}</p>
          {released && (
            <div className="flex justify-center gap-1.5" aria-hidden>
              {Array.from({ length: SEAL_TAPS }, (_, i) => (
                <span key={i} className={cn("size-2 rounded-full transition-colors", i < taps ? "bg-gold-bright shadow-[0_0_8px_#f4d27a]" : "bg-gold/25")} />
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
