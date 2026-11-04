"use client"

import { Maximize, Minimize } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFullscreen } from "./useFullscreen"

/** Botão de tela cheia (atalho F). Não aparece onde o navegador não permite. */
export function FullscreenButton({ className }: { className?: string }) {
  const { active, supported, toggle } = useFullscreen()
  if (!supported) return null
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      title="Tela cheia (F)"
      className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm backdrop-blur", className)}
    >
      {active ? <Minimize className="size-4" aria-hidden /> : <Maximize className="size-4" aria-hidden />}
      {active ? "Sair da tela cheia" : "Tela cheia"}
    </button>
  )
}
