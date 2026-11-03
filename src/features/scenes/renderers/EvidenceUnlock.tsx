"use client"

import { Loader2, Unlock } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { fetchConnectionSynthesis } from "@/app/actions/synthesis"
import { getEvidence } from "@/content"
import { BlockList } from "@/components/story/BlockList"
import { ConnectionChips } from "@/components/story/ConnectionChips"
import { RefList } from "@/components/story/RefList"
import { Button } from "@/components/ui/button"
import { GoldThread } from "@/fx/GoldThread"
import { SealBreak } from "@/fx/SealBreak"
import { useSolo } from "@/stores/solo-store"
import type { RendererProps } from "../types"

export function EvidenceUnlock({ scene }: RendererProps) {
  const ev = getEvidence(scene.releases!)!
  const isOpen = useSolo((s) => !!s.openEvidence[ev.id])
  const synthesis = useSolo((s) => s.syntheses[ev.id])
  const open = useSolo((s) => s.openSeal)
  const [pending, start] = useTransition()
  const [opening, setOpening] = useState(false)

  const onOpen = () =>
    start(async () => {
      setOpening(true)
      const res = await fetchConnectionSynthesis(ev.id)
      if (!res.ok) {
        toast.error("Não foi possível abrir o selo agora.")
        setOpening(false)
        return
      }
      open(scene.id, res.synthesis)
    })

  const revealed = isOpen && synthesis

  return (
    <div className="space-y-5">
      {!revealed && <BlockList blocks={scene.blocks} />}
      <SealBreak open={!!revealed} hint={ev.lockedHint}>
        {revealed && (
          <div className="space-y-5">
            <GoldThread className="h-16 w-full" d="M 0 200 C 250 60 750 340 1000 200" />
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gold">Evidência desbloqueada</p>
              <h2 className="mt-1 font-display text-3xl text-gold-gradient">{ev.title}</h2>
              <RefList refs={ev.refs} className="mt-1 text-sm" />
            </div>
            <BlockList blocks={synthesis.blocks} stagger={0.3} />
            {ev.connection && ev.showClassification && <ConnectionChips primary={ev.connection.primary} secondary={ev.connection.secondary} note={synthesis.classificationNote} />}
          </div>
        )}
      </SealBreak>
      {!revealed && (
        <Button size="lg" onClick={onOpen} disabled={pending || opening} className="h-12 w-full rounded-full text-base">
          {pending ? <Loader2 className="animate-spin" /> : <Unlock />} Abrir o selo
        </Button>
      )}
    </div>
  )
}
