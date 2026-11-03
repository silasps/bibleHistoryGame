"use client"

import { motion } from "motion/react"
import { useFx } from "@/fx/useFx"
import { Scene } from "./Backdrop"

/** "A chave de casa": porta acesa à noite, duas silhuetas e a chave brilhando na mão. */
export function HouseKey() {
  const fx = useFx()
  return (
    <div className="absolute inset-0">
      <Scene>
        <rect width="1600" height="900" fill="url(#v-sky)" />
        {/* prédios ao fundo */}
        {[
          [60, 380, 170],
          [250, 300, 140],
          [1230, 330, 160],
          [1410, 260, 150],
        ].map(([x, y, w]) => (
          <g key={x}>
            <rect x={x} y={y} width={w} height={900 - y} fill="#0a0e18" />
            {Array.from({ length: 5 }, (_, r) =>
              Array.from({ length: 3 }, (_, c) => (
                <rect key={`${r}-${c}`} x={x + 22 + c * 44} y={y + 30 + r * 70} width="18" height="26" fill="#f4d27a" opacity={(r + c + x) % 3 === 0 ? 0.35 : 0.06} />
              )),
            )}
          </g>
        ))}
        {/* casa */}
        <path d="M 520 420 L 800 230 L 1080 420 Z" fill="#141a26" stroke="#2a3346" strokeWidth="4" />
        <rect x="560" y="420" width="480" height="300" fill="#101521" stroke="#2a3346" strokeWidth="4" />
        <rect x="610" y="470" width="110" height="90" fill="#f4d27a" opacity="0.12" />
        <rect x="880" y="470" width="110" height="90" fill="#f4d27a" opacity="0.08" />
        {/* porta entreaberta com luz */}
        <rect x="755" y="520" width="90" height="200" fill="#f4d27a" opacity="0.85" />
        <path d="M 755 520 L 790 532 L 790 708 L 755 720 Z" fill="#3a2c20" />
        <path d="M 680 900 L 755 720 L 845 720 L 980 900 Z" fill="#f4d27a" opacity="0.1" />
        <circle cx="800" cy="620" r="240" fill="url(#v-glow)" opacity="0.18" className="animate-glow" />
        {/* chão */}
        <rect x="0" y="720" width="1600" height="180" fill="url(#v-ground)" />
        {/* duas silhuetas: Bia (com a chave) e Rafa (com o celular) */}
        <g fill="#05070d">
          <circle cx="560" cy="610" r="30" />
          <path d="M 515 900 C 515 760 525 660 560 650 C 595 660 605 760 605 900 Z" />
          <circle cx="1030" cy="620" r="28" />
          <path d="M 988 900 C 990 770 1000 668 1030 660 C 1062 668 1070 770 1072 900 Z" />
        </g>
        <rect x="984" y="690" width="22" height="36" rx="4" fill="#9ad7ff" opacity="0.8" />
        <circle cx="995" cy="708" r="60" fill="#9ad7ff" opacity="0.12" filter="url(#v-blur)" />
      </Scene>
      {/* a chave */}
      <motion.svg
        viewBox="0 0 120 60"
        aria-hidden
        className="absolute left-[33%] top-[66%] w-[7%] min-w-12 drop-shadow-[0_0_18px_rgba(244,210,122,0.85)]"
        initial={fx.motion ? { rotate: -20, opacity: 0, y: 20 } : false}
        animate={{ rotate: 0, opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
      >
        <circle cx="22" cy="30" r="17" fill="none" stroke="#f4d27a" strokeWidth="7" />
        <path d="M 39 30 L 112 30 M 92 30 L 92 46 M 104 30 L 104 42" stroke="#f4d27a" strokeWidth="7" strokeLinecap="round" fill="none" />
      </motion.svg>
    </div>
  )
}
