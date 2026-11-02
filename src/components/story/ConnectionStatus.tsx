import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export type LinkState = "conectado" | "conectando" | "offline"

export function ConnectionStatus({ state, className }: { state: LinkState; className?: string }) {
  const label = { conectado: "Conectado", conectando: "Conectando…", offline: "Sem conexão" }[state]
  const Icon = state === "offline" ? WifiOff : Wifi
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        state === "conectado" && "text-sage",
        state === "conectando" && "text-gold animate-pulse",
        state === "offline" && "text-rose",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden /> {label}
    </span>
  )
}
