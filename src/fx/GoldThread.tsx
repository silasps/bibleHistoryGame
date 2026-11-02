"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import { gsap, useGSAP } from "./gsap"
import { useFx } from "./useFx"

interface Props {
  /** Caminho SVG no viewBox 0 0 1000 400. */
  d?: string
  active?: boolean
  duration?: number
  delay?: number
  className?: string
  strokeWidth?: number
}

const DEFAULT_PATH = "M -20 300 C 150 120, 300 360, 480 220 S 760 60, 1020 180"

/** Fio dourado que se desenha pela tela — a assinatura visual das conexões. */
export function GoldThread({ d = DEFAULT_PATH, active = true, duration = 3.2, delay = 0, className, strokeWidth = 2.5 }: Props) {
  const root = useRef<SVGSVGElement>(null)
  const fx = useFx()

  useGSAP(
    () => {
      if (!active) return
      const paths = root.current?.querySelectorAll("[data-thread]")
      if (!paths?.length) return
      if (!fx.motion) {
        gsap.set(paths, { drawSVG: "100%" })
        return
      }
      gsap.fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration, delay, ease: "power2.inOut" })
      gsap.fromTo(
        root.current!.querySelector("[data-spark]"),
        { motionPath: { path: d, start: 0, end: 0 }, opacity: 0 },
        { motionPath: { path: d, start: 0, end: 1 }, opacity: 1, duration, delay, ease: "power2.inOut" },
      )
    },
    { scope: root, dependencies: [active, d, fx.motion] },
  )

  return (
    <svg ref={root} viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden className={cn("pointer-events-none", className)}>
      <defs>
        <linearGradient id="thread-gradient" x1="0" x2="1">
          <stop offset="0" stopColor="#a47551" stopOpacity="0" />
          <stop offset="0.2" stopColor="#d8a948" />
          <stop offset="0.8" stopColor="#f4d27a" />
          <stop offset="1" stopColor="#f4d27a" stopOpacity="0.2" />
        </linearGradient>
        <filter id="thread-glow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path data-thread d={d} fill="none" stroke="url(#thread-gradient)" strokeWidth={strokeWidth * 4} strokeLinecap="round" opacity={0.25} filter="url(#thread-glow)" style={{ visibility: active ? "visible" : "hidden" }} />
      <path data-thread d={d} fill="none" stroke="url(#thread-gradient)" strokeWidth={strokeWidth} strokeLinecap="round" style={{ visibility: active ? "visible" : "hidden" }} />
      <circle data-spark r={5} fill="#fff6d8" filter="url(#thread-glow)" opacity={0} />
    </svg>
  )
}
