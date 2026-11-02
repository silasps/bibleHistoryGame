import { FlaskConical } from "lucide-react"
import { cn } from "@/lib/utils"

/** Selo obrigatório quando a sala roda sem backend realtime. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-ember/50 bg-ember/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f2a27e]",
        className,
      )}
      title="Sem backend realtime: participantes e votos são simulados neste navegador."
    >
      <FlaskConical className="size-3.5" aria-hidden /> Demonstração local
    </span>
  )
}
