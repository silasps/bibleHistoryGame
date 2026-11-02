import { Layers, Lock, Play } from "lucide-react"
import Link from "next/link"
import { acts, episodesOfAct } from "@/content"
import { getBook } from "@/content/books"
import type { Act } from "@/content/schema"
import { cn } from "@/lib/utils"

const STATUS: Record<Act["status"], { label: string; detail?: string; className: string }> = {
  jogavel: { label: "Jogável", className: "border-gold/60 bg-gold/15 text-gold-bright" },
  esboco_editorial: { label: "Em desenvolvimento", detail: "esboço editorial", className: "border-mist/30 bg-navy-2 text-mist" },
  fontes_pendentes: { label: "Em desenvolvimento", detail: "fontes pendentes", className: "border-mist/20 bg-navy text-mist/80" },
}

/** Os 11 atos com status, período (com incertezas) e sobreposições entre livros. */
export function ActsTimeline({ compact = false }: { compact?: boolean }) {
  return (
    <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Linha do tempo dos 11 atos">
      {acts.map((act) => {
        const status = STATUS[act.status]
        const playable = episodesOfAct(act.id).filter((e) => e.status === "jogavel")
        return (
          <li
            key={act.id}
            className={cn(
              "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-5 transition-colors",
              act.status === "jogavel" ? "border-gold/40 bg-gradient-to-b from-navy-2 to-ink" : "border-border bg-ink/80",
            )}
          >
            {act.status === "jogavel" && <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold/15 blur-3xl" />}
            <div className="flex items-start justify-between gap-2">
              <span className="font-display text-4xl leading-none text-gold/80">{String(act.number).padStart(2, "0")}</span>
              <span className={cn("rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider", status.className)}>
                {status.label}
                {status.detail && <span className="font-normal normal-case tracking-normal"> · {status.detail}</span>}
              </span>
            </div>
            <div>
              <h3 className="font-display text-2xl leading-tight text-parchment">{act.title}</h3>
              <p className="mt-1 text-xs text-sand/80">
                {act.period.label}
                {act.period.approximate && <span title="Data aproximada"> · aprox.</span>}
                {act.period.debated && <span title="Datação debatida"> · debatido</span>}
              </p>
            </div>
            {!compact && <p className="text-sm leading-relaxed text-mist">{act.themes.join(" · ")}</p>}
            <p className="text-xs text-mist/70">{act.books.map((b) => getBook(b).abbr).join(", ")}</p>
            {!compact && act.overlaps.length > 0 && (
              <ul className="space-y-1.5 border-t border-border pt-3">
                {act.overlaps.map((o, i) => (
                  <li key={i} className="flex gap-2 text-xs text-sand/75">
                    <Layers className="mt-0.5 size-3.5 shrink-0 text-gold/70" aria-hidden />
                    <span>
                      <span className="sr-only">Sobreposição: </span>
                      <strong className="font-medium text-sand">{o.books.map((b) => getBook(b).name).join(", ")}</strong> — {o.note}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              {playable.map((e) => (
                <Link
                  key={e.id}
                  href={e.kind === "analogia" ? "/catalog" : `/solo/${act.id}/${e.scenes[0]?.id ?? ""}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold/90 px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-gold-bright"
                >
                  <Play className="size-3" aria-hidden /> {e.kind === "analogia" ? e.title : "Jogar " + e.title.split("·")[0].trim()}
                </Link>
              ))}
              {playable.length === 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs text-mist/70">
                  <Lock className="size-3" aria-hidden /> Ainda não jogável
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
