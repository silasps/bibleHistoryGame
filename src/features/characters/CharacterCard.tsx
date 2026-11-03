"use client"

import { ExternalLink } from "lucide-react"
import { ITEM_COLORS, ItemArt } from "@/components/art/ItemArt"
import { RefList } from "@/components/story/RefList"
import { getCharacter, type Character, type Relation, type SkinItem } from "@/content/characters"
import { cn } from "@/lib/utils"

const BASIS: Record<SkinItem["basis"], { label: string; className: string }> = {
  texto: { label: "Texto bíblico", className: "border-gold/50 bg-gold/10 text-gold-bright" },
  contexto: { label: "Contexto", className: "border-sky-300/40 bg-sky-300/10 text-sky-200" },
  licenca_artistica: { label: "Licença artística", className: "border-rose/40 bg-rose/10 text-rose" },
}

export const RELATION_LABEL: Record<Relation, string> = {
  genealogia: "Genealogia",
  familia: "Família",
  sucessao: "Sucessão",
  uncao: "Unção",
  promessa: "Promessa",
  profecia: "Profeta no reinado",
  confronto: "Confronto",
}

/** Ficha do personagem: a "skin" explicada item a item, com a base de cada objeto. */
export function CharacterCard({ character: c, onOpen, highlight }: { character: Character; onOpen?: (id: string) => void; highlight?: string }) {
  const color = ITEM_COLORS[c.color]
  return (
    <article className="space-y-5">
      <header className="flex items-center gap-4">
        <ItemArt art={c.art} color={c.color} title={c.name} className="size-28 shrink-0" />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mist">Semana {c.week} · {c.role}</p>
          <h3 className="font-display text-4xl" style={{ color }}>
            {c.name}
          </h3>
          <p className="mt-1 text-sm text-parchment/90">
            <span className="text-mist">Nome:</span> {c.nameMeaning.text}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-mist">
            <a href={c.nameMeaning.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gold underline">
              {c.nameMeaning.source} <ExternalLink className="size-3" aria-hidden />
            </a>
            {c.nameMeaning.refs.length > 0 && <RefList refs={c.nameMeaning.refs} />}
          </p>
        </div>
      </header>

      {c.skin.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs uppercase tracking-[0.3em] text-gold">A skin, item a item</h4>
          <ul className="space-y-2">
            {c.skin.map((s) => (
              <li key={s.id} className={cn("rounded-xl border bg-night/50 p-3 transition-colors", highlight === s.id ? "border-gold shadow-[0_0_24px_rgba(216,169,72,0.25)]" : "border-border")}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-parchment">{s.label}</span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[0.65rem] uppercase tracking-wider", BASIS[s.basis].className)}>{BASIS[s.basis].label}</span>
                </div>
                <p className="mt-1 text-sm text-parchment/85">{s.meaning}</p>
                <RefList refs={s.refs} className="mt-1" />
                {s.source && <p className="mt-1 text-xs text-mist">Fonte: {s.source}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {c.connections.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs uppercase tracking-[0.3em] text-gold">Ligações</h4>
          <ul className="space-y-1.5 text-sm">
            {c.connections.map((k) => {
              const other = getCharacter(k.to)
              return (
                <li key={k.to} className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs uppercase tracking-wider text-mist">{RELATION_LABEL[k.relation]}</span>
                  {other && onOpen ? (
                    <button className="font-medium underline decoration-dotted" style={{ color: ITEM_COLORS[other.color] }} onClick={() => onOpen(other.id)}>
                      {other.name}
                    </button>
                  ) : (
                    <span className="font-medium text-parchment">{other?.name}</span>
                  )}
                  <span className="text-parchment/80">— {k.note}</span>
                  <RefList refs={k.refs} />
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </article>
  )
}
