import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Moldura comum das ilustrações: SVG responsivo que preenche o palco. */
export function Scene({
  children,
  className,
  viewBox = "0 0 1600 900",
  align = "xMidYMid",
}: {
  children: ReactNode
  className?: string
  viewBox?: string
  /** Ponto de ancoragem quando o palco corta a ilustração. */
  align?: "xMidYMid" | "xMaxYMid" | "xMinYMid"
}) {
  return (
    <svg viewBox={viewBox} preserveAspectRatio={`${align} slice`} aria-hidden className={cn("absolute inset-0 h-full w-full", className)}>
      <defs>
        <radialGradient id="v-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f4d27a" stopOpacity="0.9" />
          <stop offset="0.4" stopColor="#d8a948" stopOpacity="0.35" />
          <stop offset="1" stopColor="#d8a948" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="v-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1712" />
          <stop offset="1" stopColor="#07080b" />
        </linearGradient>
        <linearGradient id="v-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05070d" />
          <stop offset="0.7" stopColor="#0f182b" />
          <stop offset="1" stopColor="#1f2f4d" />
        </linearGradient>
        <filter id="v-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="v-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {children}
    </svg>
  )
}
