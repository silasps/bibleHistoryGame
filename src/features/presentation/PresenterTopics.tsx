"use client"

import { ListChecks } from "lucide-react"
import { topicosDaCena } from "@/content/overview/topicos"
import type { Scene } from "@/content/schema"

/**
 * Tópicos para falar: os pontos do resumo do autor para o slide atual. Só no
 * painel do apresentador (o telão mostra só o tópico).
 */
export function PresenterTopics({ scene }: { scene: Scene }) {
  const { linhas, proprios } = topicosDaCena(scene)
  if (!linhas.length) return null
  return (
    <section className="rounded-2xl border border-gold/30 bg-ink p-4" aria-label="Tópicos para falar">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
        <ListChecks className="size-4" aria-hidden /> Tópicos para falar · só você vê
      </p>
      <ul className="mt-3 space-y-2">
        {linhas.map((l) => (
          <li key={l} className="flex gap-2 text-base leading-snug text-parchment/95">
            <span className="text-gold" aria-hidden>
              •
            </span>
            <span>{l}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-mist">{proprios ? "Pontos do seu resumo." : "Frases do seu resumo (as mesmas do telão e do Aprofundar)."}</p>
    </section>
  )
}
