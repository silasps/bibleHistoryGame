"use client"

/* eslint-disable @next/next/no-img-element */
import { useId } from "react"
import { artFile, sceneFile } from "@/components/art/art-files"
import { cn } from "@/lib/utils"

// Peças visuais da Etapa 1. Cada uma usa a imagem do autor quando existe
// (public/art/...) e, sem ela, um desenho provisório no mesmo espírito.
// Deus nunca é desenhado como pessoa: é uma figura de luz, sem rosto.

const BODY = "M30 32 C15 34 11 58 13 88 L17 152 L27 152 L30 104 L33 152 L43 152 L47 88 C49 58 45 34 30 32 Z"

/** Figura de luz (Deus caminhando no jardim): silhueta luminosa, sem rosto. */
export function LightFigure({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 60 160" className={cn("overflow-visible", className)} role="img" aria-label="Figura de luz">
      <defs>
        <radialGradient id={`${id}-g`} cx="50%" cy="35%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#fff1c4" />
          <stop offset="1" stopColor="#f4d27a" stopOpacity="0.2" />
        </radialGradient>
        <filter id={`${id}-b`} x="-80%" y="-40%" width="260%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <g filter={`url(#${id}-b)`} fill="#f4d27a" opacity={0.85}>
        <circle cx="30" cy="18" r="13" />
        <path d={BODY} />
      </g>
      <g fill={`url(#${id}-g)`} opacity={0.95}>
        <circle cx="30" cy="18" r="11" />
        <path d={BODY} />
      </g>
    </svg>
  )
}

/** Adão ou Eva: imagem do autor ou silhueta escura com contorno de luz. */
export function Person({ who, className }: { who: "adao" | "eva"; className?: string }) {
  const file = artFile("personagens", who)
  if (file) return <img src={file} alt={who === "adao" ? "Adão" : "Eva"} className={cn("object-contain", className)} draggable={false} />
  return (
    <svg viewBox="0 0 60 160" className={cn("overflow-visible", className)} role="img" aria-label={who === "adao" ? "Adão" : "Eva"}>
      {who === "eva" && <path d="M19 14 C17 34 15 50 20 62 L40 62 C45 50 43 34 41 14 Z" fill="#0b0f1a" stroke="#d8a948" strokeWidth={1.2} />}
      <circle cx="30" cy="18" r="11" fill="#0b0f1a" stroke="#f4d27a" strokeWidth={1.4} />
      <path d={BODY} fill="#0b0f1a" stroke="#f4d27a" strokeWidth={1.4} />
    </svg>
  )
}

/** Árvore da vida (luminosa) ou do conhecimento (fruto que brilha). */
export function Tree({ kind, fruitGlow = 1, className }: { kind: "vida" | "conhecimento"; fruitGlow?: number; className?: string }) {
  const id = useId()
  const file = artFile("objetos", kind === "vida" ? "arvore-vida" : "arvore-conhecimento")
  if (file) return <img src={file} alt={kind === "vida" ? "Árvore da vida" : "Árvore do conhecimento do bem e do mal"} className={cn("object-contain", className)} draggable={false} />
  const crown = kind === "vida" ? "#f4d27a" : "#2f5a3a"
  return (
    <svg viewBox="0 0 120 160" className={cn("overflow-visible", className)} role="img" aria-label={kind === "vida" ? "Árvore da vida" : "Árvore do conhecimento do bem e do mal"}>
      <defs>
        <radialGradient id={`${id}-c`} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor={kind === "vida" ? "#fff6d8" : "#4f8a58"} />
          <stop offset="1" stopColor={crown} stopOpacity={kind === "vida" ? 0.55 : 0.95} />
        </radialGradient>
        <filter id={`${id}-b`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <path d="M54 160 C56 130 52 110 58 92 L62 92 C68 110 64 130 66 160 Z" fill="#3a2a1c" />
      {kind === "vida" && <ellipse cx="60" cy="56" rx="54" ry="48" fill="#f4d27a" opacity={0.35} filter={`url(#${id}-b)`} />}
      <ellipse cx="60" cy="56" rx="48" ry="42" fill={`url(#${id}-c)`} />
      {kind === "conhecimento" && (
        <g>
          <circle cx="76" cy="70" r={9 + 5 * fruitGlow} fill="#ff9a5a" opacity={0.35 * fruitGlow} filter={`url(#${id}-b)`} />
          <circle cx="76" cy="70" r="7" fill="#e0533a" stroke="#ffd27a" strokeWidth={1.5} />
        </g>
      )}
    </svg>
  )
}

/** O fruto brilhando (minijogo da árvore). */
export function Fruit({ glow = 1, className }: { glow?: number; className?: string }) {
  const id = useId()
  const file = artFile("objetos", "fruto")
  if (file) return <img src={file} alt="O fruto" className={cn("object-contain", className)} style={{ filter: `drop-shadow(0 0 ${12 * glow}px #ffb070)` }} draggable={false} />
  return (
    <svg viewBox="0 0 100 100" className={cn("overflow-visible", className)} role="img" aria-label="O fruto">
      <defs>
        <radialGradient id={`${id}-f`} cx="40%" cy="35%" r="65%">
          <stop offset="0" stopColor="#ffd9a0" />
          <stop offset="0.5" stopColor="#e0533a" />
          <stop offset="1" stopColor="#7a1f1a" />
        </radialGradient>
        <filter id={`${id}-b`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <circle cx="50" cy="54" r={30 + 10 * glow} fill="#ff9a5a" opacity={0.45 * glow} filter={`url(#${id}-b)`} />
      <path d="M50 26 C68 22 82 38 80 58 C78 78 62 86 50 84 C38 86 22 78 20 58 C18 38 32 22 50 26 Z" fill={`url(#${id}-f)`} stroke="#ffd27a" strokeWidth={1.5} />
      <path d="M50 26 C50 18 54 12 60 10" fill="none" stroke="#5a3a22" strokeWidth={3} strokeLinecap="round" />
    </svg>
  )
}

/** Fundo de cena: imagem do autor (versão em pé no celular) ou gradiente provisório. */
export function Backdrop({ name, portrait, palette, className, children }: { name: string; portrait: boolean; palette: [string, string, string]; className?: string; children?: React.ReactNode }) {
  const file = sceneFile(name, portrait)
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} style={{ background: `radial-gradient(120% 90% at 50% 25%, ${palette[0]} 0%, ${palette[1]} 45%, ${palette[2]} 100%)` }}>
      {file && <img src={file} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />}
      {children}
    </div>
  )
}

/** Jardim em camadas (fundo, meio, frente) para a paralaxe. */
export function GardenLayers({ shift = 0, className }: { shift?: number; className?: string }) {
  const back = artFile("cenas", "eden-fundo")
  const mid = artFile("cenas", "eden-meio")
  const front = artFile("cenas", "eden-frente")
  const layer = "absolute inset-y-0 left-[-10%] h-full w-[120%] max-w-none object-cover"
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,#f6dca0_0%,#9cc59a_55%,#2f5a3a_100%)]", className)}>
      {back ? <img src={back} alt="" className={layer} style={{ transform: `translateX(${-shift * 2}%)` }} /> : <Hills shift={shift} />}
      {mid && <img src={mid} alt="" className={layer} style={{ transform: `translateX(${-shift * 5}%)` }} />}
      {front && <img src={front} alt="" className={layer} style={{ transform: `translateX(${-shift * 9}%)` }} />}
    </div>
  )
}

function Hills({ shift }: { shift: number }) {
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
      <g transform={`translate(${-shift * 6} 0)`}>
        <path d="M-40 120 C40 80 90 100 150 90 S260 70 320 95 S420 90 460 100 L460 200 L-40 200 Z" fill="#7fae7a" opacity={0.7} />
        <path d="M-40 150 C50 120 120 140 190 128 S300 115 360 135 S440 130 460 140 L460 200 L-40 200 Z" fill="#4f8a58" />
        <path d="M-40 175 C60 160 140 172 220 165 S340 158 460 170 L460 200 L-40 200 Z" fill="#2f5a3a" />
      </g>
    </svg>
  )
}
