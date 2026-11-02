"use client"

import { motion } from "motion/react"
import { useFx } from "@/fx/useFx"
import { Scene } from "./Backdrop"

const KIDS = [
  { x: 520, y: 700, c: "#e0715c" },
  { x: 760, y: 740, c: "#7fae8b" },
  { x: 1000, y: 690, c: "#f4d27a" },
]

interface Props {
  /** 0..1: quanto do muro já foi levantado. */
  wall?: number
  /** Mude para o trem passar. */
  trainKey?: number
  /** Crianças longe do fundo (proibir) ou espalhadas pelo quintal. */
  kids?: "casa" | "quintal" | "fundo"
}

export function YardTrain({ wall = 0, trainKey, kids = "quintal" }: Props) {
  const fx = useFx()
  const kidY = kids === "casa" ? -170 : kids === "fundo" ? -260 : 0
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Scene>
        <rect width="1600" height="900" fill="url(#v-sky)" />
        {/* trilhos */}
        <rect y="300" width="1600" height="70" fill="#14110d" />
        <line x1="0" x2="1600" y1="318" y2="318" stroke="#7a6a5a" strokeWidth="4" />
        <line x1="0" x2="1600" y1="352" y2="352" stroke="#7a6a5a" strokeWidth="4" />
        {Array.from({ length: 40 }, (_, i) => (
          <rect key={i} x={i * 42} y="312" width="12" height="46" fill="#3a2c20" />
        ))}
        {/* quintal */}
        <path d="M0 380 L1600 380 L1600 900 L0 900 Z" fill="#17301f" />
        <path d="M0 380 L1600 380" stroke="#27503c" strokeWidth="3" />
        {/* casa */}
        <g transform="translate(160 640)">
          <rect x="0" y="0" width="200" height="150" fill="#2b2016" stroke="#6e5137" strokeWidth="3" />
          <path d="M -20 0 L 100 -90 L 220 0 Z" fill="#3a2c20" stroke="#6e5137" strokeWidth="3" />
          <rect x="80" y="70" width="44" height="80" fill="#f4d27a" opacity="0.7" />
        </g>
        {/* muro */}
        {Array.from({ length: 16 }, (_, i) => (
          <rect
            key={i}
            x={i * 100}
            y={380 - 80}
            width="96"
            height="80"
            fill="#6e5137"
            stroke="#a47551"
            strokeWidth="2"
            opacity={i / 16 < wall ? 1 : 0}
            style={{ transition: "opacity 0.3s", transitionDelay: `${i * 40}ms` }}
          />
        ))}
        {KIDS.map((k, i) => (
          <g key={i} transform={`translate(${k.x} ${k.y + kidY})`} style={{ transition: "transform 1s ease" }}>
            <circle r="16" cy="-46" fill={k.c} />
            <path d="M -14 0 C -14 -24 -8 -30 0 -30 C 8 -30 14 -24 14 0 Z" fill={k.c} opacity="0.85" />
          </g>
        ))}
      </Scene>
      {trainKey !== undefined && (
        <motion.div
          key={trainKey}
          aria-hidden
          className="absolute top-[30%] flex h-[9%] items-end"
          style={{ zIndex: wall >= 1 ? 0 : 1 }}
          initial={{ left: "-60%" }}
          animate={{ left: "120%" }}
          transition={{ duration: fx.motion ? 2.2 : 0.01, ease: "easeIn" }}
        >
          <div className="flex h-full gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-full w-40 rounded-t-md border border-rose/40 bg-gradient-to-b from-rose to-ember" />
            ))}
            <div className="h-full w-44 rounded-r-[40%] rounded-tl-md bg-gradient-to-b from-sand to-clay shadow-[30px_0_60px_rgba(244,210,122,0.6)]" />
          </div>
        </motion.div>
      )}
    </div>
  )
}
