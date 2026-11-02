"use client"

import { motion } from "motion/react"
import { GoldThread } from "@/fx/GoldThread"
import { useFx } from "@/fx/useFx"
import { Scene } from "./Backdrop"

export function Crossroads() {
  return (
    <Scene>
      <rect width="1600" height="900" fill="url(#v-sky)" />
      <path d="M0 560 L1600 560 L1600 900 L0 900 Z" fill="#0c0f16" />
      {[-520, -180, 180, 520].map((dx, i) => (
        <path key={dx} d={`M 800 900 C 800 760 ${800 + dx * 0.5} 640 ${800 + dx} 560`} fill="none" stroke="#d9c7a7" strokeOpacity={0.12 + i * 0.04} strokeWidth="26" strokeLinecap="round" />
      ))}
      <circle cx="800" cy="860" r="140" fill="url(#v-glow)" opacity="0.35" className="animate-glow" />
    </Scene>
  )
}

/** Uma semente cai na terra escura e um fio dourado começa. Fica em loop silencioso. */
export function SeedThread() {
  const fx = useFx()
  return (
    <div className="absolute inset-0">
      <Scene>
        <rect width="1600" height="900" fill="#030408" />
        <path d="M0 640 C 400 620 1200 620 1600 640 L1600 900 L0 900 Z" fill="#0d0a08" />
        <path d="M0 640 C 400 620 1200 620 1600 640" fill="none" stroke="#6e5137" strokeOpacity="0.5" strokeWidth="2" />
        <circle cx="800" cy="640" r="220" fill="url(#v-glow)" opacity="0.18" className="animate-glow" />
      </Scene>
      <motion.div
        className="absolute left-1/2 top-0 h-4 w-3 -translate-x-1/2 rounded-full bg-gradient-to-b from-gold-bright to-clay shadow-[0_0_24px_rgba(244,210,122,0.8)]"
        initial={fx.motion ? { top: "-5%", opacity: 0 } : { top: "70%", opacity: 1 }}
        animate={{ top: "70%", opacity: 1 }}
        transition={{ duration: 2.4, ease: [0.4, 0, 0.9, 0.6] }}
      />
      <GoldThread
        className="absolute inset-x-0 bottom-[8%] h-[40%] w-full"
        d="M 500 140 C 520 220 620 300 700 260 S 860 120 960 200 S 1100 330 1300 240"
        delay={fx.motion ? 2.6 : 0}
        duration={5}
      />
    </div>
  )
}

export function SealedScroll() {
  return (
    <Scene>
      <rect width="1600" height="900" fill="#05070d" />
      <circle cx="800" cy="450" r="420" fill="url(#v-glow)" opacity="0.22" className="animate-glow" />
      <rect x="560" y="280" width="480" height="340" rx="18" fill="#2a2018" stroke="#6e5137" strokeWidth="3" />
      <rect x="540" y="262" width="520" height="36" rx="18" fill="#3a2c20" />
      <rect x="540" y="602" width="520" height="36" rx="18" fill="#3a2c20" />
      {[340, 380, 420, 460, 500, 540].map((y) => (
        <line key={y} x1="620" x2="980" y1={y} y2={y} stroke="#d9c7a7" strokeOpacity="0.12" strokeWidth="6" strokeLinecap="round" />
      ))}
    </Scene>
  )
}
