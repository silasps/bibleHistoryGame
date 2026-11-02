"use client"

import { motion } from "motion/react"
import { useFx } from "@/fx/useFx"
import { Scene } from "./Backdrop"

interface Props {
  /** Distância da borda em cm (200 → 10). Indefinido = carro fora de cena. */
  edgeCm?: number
  /** Revelação do 5º motorista: a câmera se afasta e mostra a estrada segura. */
  safe?: boolean
}

// Posição horizontal do carro: borda em x=1180; estrada segura começa em x=380.
function carX(edgeCm: number | undefined, safe: boolean) {
  if (safe) return 520
  if (edgeCm === undefined) return -400
  return 1180 - 120 - edgeCm * 1.6
}

export function CliffRoad({ edgeCm, safe = false }: Props) {
  const fx = useFx()
  const danger = !safe && edgeCm !== undefined ? Math.max(0, 1 - edgeCm / 200) : 0
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      animate={{ scale: safe ? 1 : 1 + danger * 0.18, x: safe ? 0 : `${-danger * 6}%` }}
      transition={{ duration: fx.motion ? 1.6 : 0, ease: "easeInOut" }}
    >
      <Scene>
        <rect width="1600" height="900" fill="url(#v-sky)" />
        {/* abismo */}
        <rect x="1180" y="0" width="420" height="900" fill="#020306" />
        <path d="M1180 520 L 1220 900 L 1600 900 L1600 520 Z" fill="#000" />
        <circle cx="1400" cy="760" r="300" fill="#c8643b" opacity={0.08 + danger * 0.18} filter="url(#v-blur)" />
        {/* estrada */}
        <path d="M 200 520 L 1180 520 L 1180 600 L 200 600 Z" fill="#2a2620" />
        <path d="M 1180 520 L 1196 900" stroke="#6e5137" strokeWidth="6" />
        <line x1="260" x2="1120" y1="560" y2="560" stroke="#d9c7a7" strokeOpacity="0.4" strokeWidth="4" strokeDasharray="30 30" />
        <path d="M 0 600 L 1180 600 L 1196 900 L 0 900 Z" fill="#14110d" />
        {safe && <path d="M 200 520 L 0 440" stroke="#7fae8b" strokeWidth="10" strokeOpacity="0.5" strokeDasharray="20 20" />}
        <g transform={`translate(${carX(edgeCm, safe)} 470)`} style={{ transition: fx.motion ? "transform 1.4s cubic-bezier(.3,.7,.3,1)" : undefined }}>
          <rect x="0" y="20" width="200" height="50" rx="14" fill={safe ? "#7fae8b" : "#d8a948"} />
          <path d="M 40 22 L 70 -10 L 150 -10 L 175 22 Z" fill={safe ? "#5d8a69" : "#a47551"} />
          <circle cx="45" cy="74" r="18" fill="#111" stroke="#555" strokeWidth="4" />
          <circle cx="160" cy="74" r="18" fill="#111" stroke="#555" strokeWidth="4" />
          <circle cx="198" cy="40" r="7" fill="#fff6d8" />
        </g>
      </Scene>
    </motion.div>
  )
}
