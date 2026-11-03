import manifest from "@/content/art-manifest.json"
import type { ItemColor } from "@/content/overview/schema"
import { cn } from "@/lib/utils"
import { ART } from "./registry"

export const ITEM_COLORS: Record<ItemColor, string> = {
  lilas: "#a596ff",
  ceu: "#5cc3f0",
  coral: "#ff8576",
  verde: "#63d891",
  oliva: "#cfc657",
  laranja: "#ffa64d",
  magenta: "#ec78dd",
  carmim: "#ff5a69",
  turquesa: "#45d6bd",
  violeta: "#bb86ff",
  azul: "#5c95ff",
  dourado: "#f4c86a",
}

const ART_FILES = manifest as { items: Record<string, string> }

/**
 * Ilustração de um item. Se o autor colocou uma imagem em
 * public/art/items/<art>.(webp|png|jpg|svg), ela substitui o desenho em SVG.
 */
export function ItemArt({ art, color, title, className }: { art: string; color: ItemColor; title?: string; className?: string }) {
  const file = ART_FILES.items[art]
  if (file) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={file} alt={title ?? ""} className={cn("object-contain", className)} draggable={false} />
  }
  const Draw = ART[art]
  return (
    <svg
      viewBox="0 0 100 100"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("overflow-visible", className)}
      style={{ color: ITEM_COLORS[color] }}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {Draw ? <Draw /> : <circle cx="50" cy="50" r="20" strokeDasharray="4 4" />}
    </svg>
  )
}
