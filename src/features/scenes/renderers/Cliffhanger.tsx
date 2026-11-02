"use client"

import { Lock, RotateCcw } from "lucide-react"
import Link from "next/link"
import { getEvidence } from "@/content"
import { BlockList } from "@/components/story/BlockList"
import { GoldThread } from "@/fx/GoldThread"
import { useSolo } from "@/stores/solo-store"
import type { RendererProps } from "../types"

export function Cliffhanger({ scene, episode }: RendererProps) {
  const reset = useSolo((s) => s.reset)
  const future = scene.unlocks.map((id) => getEvidence(id)).filter((e) => e?.availability === "futura")
  return (
    <div className="space-y-6">
      <BlockList blocks={scene.blocks} stagger={0.4} />
      {future.map((ev) => (
        <div key={ev!.id} className="relative overflow-hidden rounded-2xl border border-dashed border-gold/50 bg-night/60 p-5">
          <GoldThread className="absolute inset-0 h-full w-full opacity-40" d="M 0 300 C 300 300 500 100 1000 120" />
          <div className="relative flex items-start gap-3">
            <Lock className="mt-1 size-5 text-gold" aria-hidden />
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gold">Conexão futura · selada</p>
              <p className="mt-1 font-display text-2xl text-parchment">Pista selada</p>
              <p className="text-sm text-mist">{ev!.lockedHint}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/10 to-transparent p-5 text-center">
        <p className="font-display text-3xl text-gold-gradient">Fim do capítulo</p>
        <p className="mt-1 text-sm text-mist">O próximo episódio — Abraão — está em desenvolvimento.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/archive" className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-gold-bright">
            Abrir meu Arquivo
          </Link>
          <Link href="/catalog" className="rounded-full border border-gold/40 px-5 py-2.5 text-sm text-parchment hover:bg-gold/10">
            Jogar as analogias
          </Link>
          <Link
            href={`/solo/${episode.actId}/${episode.scenes[0].id}`}
            onClick={() => reset(episode.id)}
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm text-mist hover:text-parchment"
          >
            <RotateCcw className="size-4" aria-hidden /> Jogar de novo
          </Link>
        </div>
      </div>
    </div>
  )
}
