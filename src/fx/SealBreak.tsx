"use client"

import { AnimatePresence, motion, useAnimate } from "motion/react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { HAPTIC, vibrate } from "./haptics"
import { ParticleField } from "./ParticleField"
import { useStinger } from "./useSound"
import { useFx } from "./useFx"

const SHARDS = [
  { clip: "polygon(50% 50%, 0 0, 55% 0)", x: -70, y: -90, r: -40 },
  { clip: "polygon(50% 50%, 55% 0, 100% 0, 100% 35%)", x: 80, y: -80, r: 35 },
  { clip: "polygon(50% 50%, 100% 35%, 100% 100%, 70% 100%)", x: 95, y: 60, r: 50 },
  { clip: "polygon(50% 50%, 70% 100%, 15% 100%)", x: -10, y: 110, r: -25 },
  { clip: "polygon(50% 50%, 15% 100%, 0 100%, 0 0)", x: -95, y: 40, r: -55 },
]

/** Rachaduras que aparecem no selo, do centro para fora (viewBox 100×100). */
const CRACKS = [
  "M50 50 L44 41 L46 32 L37 21",
  "M50 50 L60 45 L67 47 L79 37",
  "M50 50 L56 60 L54 70 L63 82",
  "M50 50 L40 55 L33 53 L19 62",
  "M50 50 L53 37 L59 28 L57 14",
  "M50 50 L43 63 L45 74 L36 87",
]

interface Props {
  open: boolean
  /** Texto curto mostrado sob o selo fechado. */
  hint?: string
  children: ReactNode
  className?: string
  /** Tamanho do selo (padrão: size-36). */
  sealClassName?: string
  hintClassName?: string
  /** Quanto o selo já rachou (0 a 1). */
  cracks?: number
  /** Brilho pulsando em volta: o selo está pronto para ser quebrado. */
  ready?: boolean
  /** Torna o selo tocável. */
  onTap?: () => void
  tapLabel?: string
  /** Muda a cada toque aceito (o selo pula). */
  bumpKey?: number
  /** Muda a cada toque recusado (o selo balança: "ainda não"). */
  shakeKey?: number
}

/** Selo de cera que racha ao abrir: partículas, vibração e som. */
export function SealBreak({
  open,
  hint,
  children,
  className,
  sealClassName = "size-36",
  hintClassName = "max-w-xs text-xl",
  cracks = 0,
  ready = false,
  onTap,
  tapLabel,
  bumpKey,
  shakeKey,
}: Props) {
  const fx = useFx()
  const stinger = useStinger()
  const [burst, setBurst] = useState<number | undefined>()
  const wasOpen = useRef(open)
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const crackCount = cracks <= 0 ? 0 : Math.max(1, Math.round(Math.min(1, cracks) * CRACKS.length))

  useEffect(() => {
    if (!bumpKey || !fx.motion || !scope.current) return
    void animate(scope.current, { scale: [1, 0.9, 1.05, 1], rotate: [0, -4, 3, 0] }, { duration: 0.28 })
  }, [bumpKey, fx.motion, animate, scope])

  useEffect(() => {
    if (!shakeKey || !fx.motion || !scope.current) return
    void animate(scope.current, { x: [0, -10, 10, -6, 6, 0] }, { duration: 0.4 })
  }, [shakeKey, fx.motion, animate, scope])

  useEffect(() => {
    if (open && !wasOpen.current) {
      setBurst(Date.now())
      vibrate(HAPTIC.seal)
      stinger("seal")
      setTimeout(() => stinger("reveal"), 350)
    }
    wasOpen.current = open
  }, [open, stinger])

  return (
    <div className={cn("relative isolate", className)}>
      <ParticleField preset="dust" density={0} intensity={1} burstKey={burst} className="z-20" />
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="sealed"
            className="flex flex-col items-center gap-4 py-6"
            exit={fx.motion ? { opacity: 0, transition: { duration: 0.6, delay: 0.4 } } : { opacity: 0 }}
          >
            <div className={cn("relative", sealClassName)}>
              {ready && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -inset-[9%] rounded-full border-2 border-gold-bright/70 shadow-[0_0_30px_rgba(244,210,122,0.45)]"
                  animate={fx.motion ? { scale: [1, 1.1, 1], opacity: [0.9, 0.25, 0.9] } : undefined}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <div ref={scope} className="absolute inset-0" aria-hidden>
                {SHARDS.map((s, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0"
                    style={{ clipPath: s.clip }}
                    exit={fx.motion ? { x: s.x, y: s.y, rotate: s.r, opacity: 0, transition: { duration: 0.8, ease: "easeOut" } } : undefined}
                  >
                    <WaxSeal cracks={crackCount} animated={fx.motion} />
                  </motion.div>
                ))}
              </div>
              {onTap && (
                <button
                  type="button"
                  onClick={onTap}
                  aria-label={tapLabel}
                  className="absolute inset-0 touch-manipulation rounded-full outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-gold-bright"
                />
              )}
            </div>
            {hint && <p className={cn("text-center font-display italic text-sand", hintClassName)}>{hint}</p>}
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={fx.motion ? { opacity: 0, y: 24, filter: "blur(10px)" } : { opacity: 0 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: "easeOut", delay: fx.motion ? 0.5 : 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function WaxSeal({ cracks = 0, animated = true }: { cracks?: number; animated?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="size-full drop-shadow-[0_6px_18px_rgba(200,100,59,0.45)]">
      <defs>
        <radialGradient id="wax" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#e2895d" />
          <stop offset="0.55" stopColor="#a8432a" />
          <stop offset="1" stopColor="#5e1f14" />
        </radialGradient>
      </defs>
      <path
        d="M50 4 C62 6 66 2 74 9 C82 15 90 16 93 27 C97 37 95 44 96 52 C97 63 92 70 86 78 C80 86 72 90 62 94 C52 98 44 96 35 93 C25 90 17 86 11 77 C5 68 3 60 4 50 C5 39 6 31 12 23 C19 14 27 10 37 6 C42 4 46 4 50 4 Z"
        fill="url(#wax)"
      />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#f4b48a" strokeOpacity="0.35" strokeWidth="1.5" />
      {/* Semente/broto: símbolo da descendência, sem texto */}
      <path d="M50 66 C50 56 50 48 50 40" stroke="#ffd9b8" strokeOpacity="0.8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M50 48 C42 46 38 40 38 34 C45 34 50 40 50 48 Z" fill="#ffd9b8" fillOpacity="0.7" />
      <path d="M50 44 C58 42 62 36 62 30 C55 30 50 36 50 44 Z" fill="#ffd9b8" fillOpacity="0.7" />
      <ellipse cx="50" cy="68" rx="7" ry="3" fill="#ffd9b8" fillOpacity="0.45" />
      {CRACKS.slice(0, cracks).map((d) => (
        <g key={d} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d={d} stroke="#2a0d07" strokeWidth="2" initial={animated ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.22 }} />
          <motion.path d={d} stroke="#ffd9b8" strokeOpacity="0.4" strokeWidth="0.7" transform="translate(0.7 0.5)" initial={animated ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.22 }} />
        </g>
      ))}
    </svg>
  )
}
