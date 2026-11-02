import type { ConnectionType } from "@/content/schema"
import { CONNECTION_LABEL } from "@/content/labels"

export function ConnectionChips({ primary, secondary = [], note }: { primary: ConnectionType; secondary?: ConnectionType[]; note?: string }) {
  return (
    <div className="space-y-2 rounded-xl border border-gold/25 bg-night/50 p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-mist">Tipo de conexão</p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary-foreground" title={CONNECTION_LABEL[primary].hint}>
          {CONNECTION_LABEL[primary].label}
        </span>
        {secondary.map((t) => (
          <span key={t} className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold" title={CONNECTION_LABEL[t].hint}>
            {CONNECTION_LABEL[t].label}
          </span>
        ))}
      </div>
      {note && <p className="text-sm leading-relaxed text-parchment/80">{note}</p>}
    </div>
  )
}
