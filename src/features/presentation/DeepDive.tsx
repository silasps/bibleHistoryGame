"use client"

import { BookOpenText, X } from "lucide-react"
import { getBeat } from "@/content/etapas"
import { beatContent } from "@/content/etapas/beat-content"
import { MOMENTOS } from "@/content/etapas/momentos"
import { contextForItem, excerptsForItem, getItem } from "@/content/overview"
import { aprofundarDe, type Linha } from "@/content/overview/aprofundar"
import { formatRefs } from "@/content/refs"
import type { Scene } from "@/content/schema"

const KIND_LABEL: Record<string, string> = { contexto: "Contexto histórico", interpretacao: "Interpretação", parafrase: "Paráfrase", narracao: "Narração" }

function Lines({ title, lines }: { title: string; lines: Linha[] }) {
  if (!lines.length) return null
  return (
    <section className="space-y-2">
      <h3 className="text-xs uppercase tracking-[0.25em] text-gold">{title}</h3>
      {lines.map((l, i) => (
        <div key={i} className="rounded-xl border border-border bg-night/50 p-3 text-sm">
          <p className="text-parchment/95">{l.text}</p>
          <p className="mt-1 text-xs text-mist">
            {[l.refs.length ? formatRefs(l.refs, "long") : "", KIND_LABEL[l.kind] ?? l.kind, l.fonte].filter(Boolean).join(" · ")}
          </p>
        </div>
      ))}
    </section>
  )
}

/**
 * "Aprofundar mais": material de estudo da cena, SÓ no painel (nunca vai ao
 * telão). Os textos completos do resumo do autor, as notas de contexto e as
 * linhas de aprofundamento com a fonte. Não traz PRD nem notas privadas.
 */
export function DeepDive({ scene, onClose }: { scene: Scene; onClose: () => void }) {
  const o = scene.overview
  const itemIds = o?.itemId ? [o.itemId, ...(o.alsoItemIds ?? [])] : []
  const beat = o?.beatId ? getBeat(o.beatId) : undefined
  const content = beat ? beatContent(beat) : undefined
  const momento = beat?.momento ? MOMENTOS[beat.momento] : undefined
  const empty = !itemIds.length && !beat
  return (
    <div className="space-y-5 rounded-2xl border border-gold/40 bg-ink p-4" role="region" aria-label="Aprofundar mais">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
          <BookOpenText className="size-4" aria-hidden /> Aprofundar mais · só você vê
        </p>
        <button type="button" onClick={onClose} className="rounded-full p-1 text-mist hover:text-parchment" aria-label="Fechar o aprofundamento">
          <X className="size-5" />
        </button>
      </div>
      {empty && <p className="text-sm text-mist">Esta cena não tem material extra.</p>}
      {itemIds.map((id) => {
        const item = getItem(id)
        const ap = aprofundarDe(id)
        return (
          <div key={id} className="space-y-4">
            <h2 className="font-display text-2xl text-parchment">
              {item?.label} {item?.refs.length ? <span className="text-sm text-mist">· {formatRefs(item.refs, "long")}</span> : null}
            </h2>
            {excerptsForItem(id).length > 0 && (
              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.25em] text-gold">Do seu resumo</h3>
                {excerptsForItem(id).map((e) => (
                  <p key={e.id} className="rounded-xl border border-border bg-night/50 p-3 text-sm text-parchment/95">
                    {e.text}
                    {e.refs.length > 0 && <span className="mt-1 block text-xs text-mist">{formatRefs(e.refs, "long")}</span>}
                  </p>
                ))}
              </section>
            )}
            {contextForItem(id).length > 0 && (
              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.25em] text-gold">Contexto (Task 4)</h3>
                {contextForItem(id).map((n) => (
                  <p key={n.id} className="rounded-xl border border-border bg-night/50 p-3 text-sm text-parchment/95">
                    {n.text}
                  </p>
                ))}
              </section>
            )}
            <Lines title="Aprofundar (com a fonte)" lines={[...(ap?.principal ? [ap.principal] : []), ...(ap?.passos ?? [])]} />
          </div>
        )
      })}
      {beat && content && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-parchment">{beat.label}</h2>
          {content.origem === "fala" && content.text && (
            <section className="space-y-2">
              <h3 className="text-xs uppercase tracking-[0.25em] text-gold">Sua fala completa</h3>
              <p className="rounded-xl border border-border bg-night/50 p-3 text-sm text-parchment/95">{content.text}</p>
            </section>
          )}
          {momento && <Lines title="Este momento (com a fonte)" lines={[...(momento.principal ? [momento.principal] : []), ...momento.passos]} />}
          {momento && !momento.principal && <p className="text-sm text-mist">Aguardando o seu texto: por enquanto o slide mostra só a imagem.</p>}
        </div>
      )}
    </div>
  )
}
