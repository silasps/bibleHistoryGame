import type { ReactNode } from "react"

// Motivos em traço (estilo gravura simplificada) para compor as ilustrações
// dos itens da linha do tempo. Coordenadas no viewBox 0 0 100 100.
// `currentColor` = cor do item; GOLD = realce dourado.

export const GOLD = "var(--art-accent, #f4d27a)"
const soft = { fill: "currentColor", fillOpacity: 0.14 } as const

type Head = "none" | "crown" | "turban" | "mitre" | "veil" | "hair-long" | "helmet"
type Arm = "down" | "hold" | "up" | "pray" | "open"

/** Figura humana em traço. (x, y) = cintura. `hand` recebe a posição da mão direita. */
export function Person({
  x = 50,
  y = 60,
  s = 1,
  head = "none",
  beard = true,
  arm = "down",
  flip = false,
  robe = true,
  children,
}: {
  x?: number
  y?: number
  s?: number
  head?: Head
  beard?: boolean
  arm?: Arm
  flip?: boolean
  robe?: boolean
  children?: ReactNode
}) {
  const right =
    arm === "hold" ? "M 9 -17 Q 18 -12 23 -7" : arm === "up" ? "M 9 -17 Q 16 -30 18 -42" : arm === "pray" ? "M 9 -17 Q 6 -8 1 -10" : arm === "open" ? "M 9 -17 Q 20 -20 26 -26" : "M 9 -17 Q 14 -3 12 8"
  const left = arm === "pray" ? "M -9 -17 Q -6 -8 -1 -10" : arm === "open" ? "M -9 -17 Q -20 -20 -26 -26" : "M -9 -17 Q -14 -3 -12 8"
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {robe ? (
        <path d="M -9 -19 C -11 -4 -15 10 -16 26 L 16 26 C 15 10 11 -4 9 -19 Q 0 -23 -9 -19 Z" {...soft} />
      ) : (
        <path d="M -8 -19 L -8 4 L -6 26 M 8 -19 L 8 4 L 6 26 M -8 -19 Q 0 -23 8 -19 M -8 4 L 8 4" />
      )}
      {robe && <path d="M -10 -1 Q 0 2 10 -1" />}
      <path d={left} />
      <path d={right} />
      <circle cx="0" cy="-28" r="6.5" {...soft} />
      {beard && <path d="M -5 -26 Q -4 -17 0 -16 Q 4 -17 5 -26" />}
      {head === "crown" && <path d="M -7 -34 L -7 -40 L -3.5 -36.5 L 0 -42 L 3.5 -36.5 L 7 -40 L 7 -34 Z" stroke={GOLD} fill={GOLD} fillOpacity={0.25} />}
      {head === "turban" && <path d="M -7.5 -31 Q -8 -38 0 -38.5 Q 8 -38 7.5 -31 M -7 -33 Q 0 -30 7 -33" />}
      {head === "mitre" && (
        <>
          <path d="M -6.5 -32 L -6 -42 Q 0 -46 6 -42 L 6.5 -32" />
          <rect x="-3.5" y="-37" width="7" height="3" stroke={GOLD} fill={GOLD} fillOpacity={0.4} />
        </>
      )}
      {head === "veil" && <path d="M -8 -30 Q -9 -38 0 -38 Q 9 -38 8 -30 L 11 -14 M -8 -30 L -11 -14" />}
      {head === "hair-long" && <path d="M -6 -32 Q -11 -24 -9 -12 M 6 -32 Q 11 -24 9 -12 M -3 -34 Q -6 -22 -5 -13 M 3 -34 Q 6 -22 5 -13" />}
      {head === "helmet" && <path d="M -7 -30 Q -7 -38 0 -38 Q 7 -38 7 -30 Z M 0 -38 L 0 -42" />}
      {children}
    </g>
  )
}

/** Posições da mão direita (no sistema local da Person) para encaixar objetos. */
export const HAND = { hold: [23, -7], up: [18, -42], open: [26, -26], down: [12, 8] } as const

export function Staff({ x, y, h = 52, crook = true }: { x: number; y: number; h?: number; crook?: boolean }) {
  return <path d={`M ${x} ${y + h * 0.6} L ${x} ${y - h * 0.4} ${crook ? `Q ${x} ${y - h * 0.4 - 7} ${x - 5} ${y - h * 0.4 - 6}` : ""}`} />
}

export function Scroll({ x, y, w = 14, open = false }: { x: number; y: number; w?: number; open?: boolean }) {
  return open ? (
    <g>
      <rect x={x - w / 2} y={y - 6} width={w} height={12} {...soft} />
      <path d={`M ${x - w / 2} ${y - 7} L ${x - w / 2} ${y + 7} M ${x + w / 2} ${y - 7} L ${x + w / 2} ${y + 7} M ${x - w / 2 + 3} ${y - 2} L ${x + w / 2 - 3} ${y - 2} M ${x - w / 2 + 3} ${y + 2} L ${x + w / 2 - 3} ${y + 2}`} />
    </g>
  ) : (
    <g>
      <rect x={x - 3} y={y - w / 2} width={6} height={w} rx={2} {...soft} />
      <path d={`M ${x - 4} ${y - w / 2} L ${x + 4} ${y - w / 2} M ${x - 4} ${y + w / 2} L ${x + 4} ${y + w / 2}`} />
    </g>
  )
}

export function Tablets({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -11 10 L -11 -4 Q -11 -11 -5.5 -11 Q 0 -11 0 -4 L 0 10 Z M 0 10 L 0 -4 Q 0 -11 5.5 -11 Q 11 -11 11 -4 L 11 10 Z" {...soft} />
      <path d="M -8 -3 L -3 -3 M -8 1 L -3 1 M -8 5 L -3 5 M 3 -3 L 8 -3 M 3 1 L 8 1 M 3 5 L 8 5" stroke={GOLD} />
    </g>
  )
}

export function Crown({ x, y, s = 1, broken = false }: { x: number; y: number; s?: number; broken?: boolean }) {
  const d = "M -16 8 L -16 -8 L -8 0 L 0 -12 L 8 0 L 16 -8 L 16 8 Z"
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={GOLD}>
      {broken ? (
        <>
          <g transform="translate(-4 2) rotate(-12)">
            <path d="M -16 8 L -16 -8 L -8 0 L 0 -12 L 1 8 Z" fill={GOLD} fillOpacity={0.2} />
          </g>
          <g transform="translate(5 -1) rotate(14)">
            <path d="M 1 8 L 0 -12 L 8 0 L 16 -8 L 16 8 Z" fill={GOLD} fillOpacity={0.2} />
          </g>
          <path d="M -1 -14 L 2 -6 L -1 0 L 2 8" stroke="currentColor" />
        </>
      ) : (
        <path d={d} fill={GOLD} fillOpacity={0.2} />
      )}
      {!broken && <circle cx="0" cy="-12" r="2" fill={GOLD} />}
    </g>
  )
}

export function Stars({ x, y, n = 5, r = 16 }: { x: number; y: number; n?: number; r?: number }) {
  const pts = Array.from({ length: n }, (_, i) => [x + Math.cos(i * 2.4) * r * ((i % 3) / 3 + 0.5), y + Math.sin(i * 2.4) * r * 0.6])
  return (
    <g stroke={GOLD}>
      {pts.map(([px, py], i) => (
        <path key={i} d={`M ${px - 2.5} ${py} L ${px + 2.5} ${py} M ${px} ${py - 2.5} L ${px} ${py + 2.5}`} />
      ))}
    </g>
  )
}

export function Tent({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -22 12 L 0 -14 L 22 12 Z" {...soft} />
      <path d="M 0 -14 L 0 12 M -6 12 L 0 0 L 6 12" />
    </g>
  )
}

export function Ground({ y = 86, x1 = 10, x2 = 90 }: { y?: number; x1?: number; x2?: number }) {
  return <path d={`M ${x1} ${y} Q 50 ${y - 3} ${x2} ${y}`} strokeOpacity={0.5} />
}

export function Flame({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={GOLD}>
      <path d="M 0 10 Q -9 2 -4 -6 Q -3 -1 0 0 Q -2 -9 5 -14 Q 4 -6 8 -2 Q 10 6 0 10 Z" fill={GOLD} fillOpacity={0.25} />
    </g>
  )
}

export function Lion({ x, y, s = 1, wings = false }: { x: number; y: number; s?: number; wings?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {wings && <path d="M -6 -6 Q -4 -24 14 -26 Q 6 -18 10 -14 Q 2 -14 4 -8" stroke={GOLD} />}
      <path d="M -18 4 Q -16 -6 -6 -6 L 10 -6 Q 16 -6 18 2 L 18 12 M -16 12 L -16 4 M -10 12 L -10 2 M 8 12 L 8 2 M 14 12 L 14 4" {...soft} />
      <circle cx="-18" cy="-6" r="7" />
      <path d="M -24 -10 Q -26 -2 -22 2 M -12 -12 Q -10 -4 -14 0" />
      <path d="M 18 -2 Q 24 -6 26 -12" />
    </g>
  )
}

export function Wheel({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} />
      <circle cx={x} cy={y} r={r * 0.55} stroke={GOLD} />
      {[0, 60, 120].map((a) => (
        <path key={a} d={`M ${x + Math.cos((a * Math.PI) / 180) * r} ${y + Math.sin((a * Math.PI) / 180) * r} L ${x - Math.cos((a * Math.PI) / 180) * r} ${y - Math.sin((a * Math.PI) / 180) * r}`} />
      ))}
      {[30, 150, 270].map((a) => (
        <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * r * 0.78} cy={y + Math.sin((a * Math.PI) / 180) * r * 0.78} r={1.3} fill={GOLD} stroke="none" />
      ))}
    </g>
  )
}

export function Walls({ x, y, w = 50, h = 22, broken = false, towers = 2 }: { x: number; y: number; w?: number; h?: number; broken?: boolean; towers?: number }) {
  const left = x - w / 2
  const crenel = Array.from({ length: Math.floor(w / 6) }, (_, i) => `M ${left + i * 6 + 1} ${y - h} l 0 -3 l 3 0 l 0 3`).join(" ")
  return (
    <g>
      <rect x={left} y={y - h} width={w} height={h} {...soft} />
      <path d={crenel} />
      {Array.from({ length: towers }, (_, i) => {
        const tx = left + (i + 0.5) * (w / towers) - 5
        return <rect key={i} x={tx} y={y - h - 8} width={10} height={h + 8} {...soft} />
      })}
      <path d={`M ${x - 5} ${y} L ${x - 5} ${y - 9} Q ${x} ${y - 14} ${x + 5} ${y - 9} L ${x + 5} ${y}`} />
      {broken && <path d={`M ${left + w * 0.62} ${y - h - 4} L ${left + w * 0.7} ${y - h * 0.5} L ${left + w * 0.64} ${y - h * 0.2} L ${left + w * 0.74} ${y} M ${left + w * 0.8} ${y + 2} l 4 -3 l 3 3 M ${left + w * 0.2} ${y + 2} l 3 -2 l 3 2`} stroke={GOLD} />}
    </g>
  )
}

export function Temple({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -26 -10 L 0 -24 L 26 -10 Z" stroke={GOLD} fill={GOLD} fillOpacity={0.15} />
      <rect x="-24" y="-10" width="48" height="26" {...soft} />
      <path d="M -18 -10 L -18 16 M -10 -10 L -10 16 M 10 -10 L 10 16 M 18 -10 L 18 16" />
      <path d="M -5 16 L -5 2 L 5 2 L 5 16" stroke={GOLD} />
      <path d="M -30 16 L 30 16 M -28 20 L 28 20" />
    </g>
  )
}

export function Waves({ x, y, w = 70, n = 3 }: { x: number; y: number; w?: number; n?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M ${x - w / 2} ${y + i * 6} q ${w / 8} -5 ${w / 4} 0 t ${w / 4} 0 t ${w / 4} 0 t ${w / 4} 0`} strokeOpacity={1 - i * 0.25} />
      ))}
    </g>
  )
}

export function Mountain({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -36 18 L -10 -18 L 0 -6 L 10 -22 L 36 18 Z" {...soft} />
      <path d="M 10 -22 L 4 -12 L 12 -14 M -10 -18 L -14 -10" />
    </g>
  )
}

export function Sheaf({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={GOLD}>
      <path d="M 0 14 L 0 -6 M 0 14 L -6 -4 M 0 14 L 6 -4 M -4 6 L 4 6" />
      {[-6, 0, 6].map((dx) => (
        <path key={dx} d={`M ${dx} -4 Q ${dx - 3} -10 ${dx} -16 Q ${dx + 3} -10 ${dx} -4`} fill={GOLD} fillOpacity={0.2} />
      ))}
    </g>
  )
}

export function Horn({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -10 6 Q -4 -2 6 -4 Q 12 -6 12 -12 Q 16 -2 8 2 Q 0 6 -8 10 Z" stroke={GOLD} fill={GOLD} fillOpacity={0.2} />
    </g>
  )
}

export function Ark({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -26 0 L 26 0 L 20 10 L -20 10 Z" {...soft} />
      <rect x="-16" y="-10" width="32" height="10" {...soft} />
      <path d="M -18 -10 L 0 -18 L 18 -10 M -8 -6 l 0 4 M 0 -6 l 0 4 M 8 -6 l 0 4" />
    </g>
  )
}

export function Dove({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={GOLD}>
      <path d="M -8 2 Q -2 -2 4 0 Q 8 -2 10 -4 Q 8 2 4 3 Q 0 5 -8 2 Z M -2 0 Q -4 -8 2 -10 Q 2 -4 2 -1" fill={GOLD} fillOpacity={0.2} />
      <path d="M 10 -4 l 4 1 M 13 -3 q 2 2 0 4" />
    </g>
  )
}

export function Ram({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -14 4 Q -14 -6 -2 -6 L 8 -6 Q 14 -6 14 2 L 14 4 Q 8 8 -8 8 Z M -10 8 l 0 6 M -2 8 l 0 6 M 6 8 l 0 6 M 12 6 l 0 8" {...soft} />
      <circle cx="16" cy="-8" r="4.5" />
      <path d="M 14 -11 Q 9 -16 12 -20 Q 16 -18 15 -13" stroke={GOLD} />
    </g>
  )
}

export function Camel({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -14 4 Q -14 -8 -6 -8 Q -2 -16 4 -8 Q 8 -8 10 -4 L 14 -14 L 18 -14 L 16 -2 Q 12 6 6 6 L -10 6 Z" {...soft} />
      <path d="M -10 6 l -1 10 M -4 6 l 0 10 M 6 6 l 1 10 M 11 4 l 1 12" />
    </g>
  )
}

export function Pyramid({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -24 14 L 0 -16 L 24 14 Z" {...soft} />
      <path d="M 0 -16 L 6 14 M -14 2 L 14 2 M -19 8 L 19 8 M -8 -5 L 8 -5" strokeOpacity={0.6} />
    </g>
  )
}

export function Tree({ x, y, s = 1, fruit = false }: { x: number; y: number; s?: number; fruit?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -3 20 L -2 -2 Q -10 -6 -14 -14 M 2 20 L 2 -2 Q 10 -6 13 -15" />
      <path d="M -18 -10 Q -24 -26 -8 -30 Q 0 -40 10 -30 Q 26 -28 20 -12 Q 14 -2 0 -6 Q -12 -2 -18 -10 Z" {...soft} />
      {fruit && <circle cx="9" cy="-14" r="3.5" stroke={GOLD} fill={GOLD} fillOpacity={0.5} />}
    </g>
  )
}

export function Serpent({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -18 16 Q -6 10 -12 2 Q -18 -6 -6 -10 Q 6 -14 2 -22 Q 0 -28 8 -30" strokeWidth={3.4} />
      <circle cx="9" cy="-31" r="2.6" {...soft} />
      <path d="M 11 -31 l 4 -1 M 14 -32 l 1.5 -1.5 M 14 -32 l 1.5 1" stroke={GOLD} strokeWidth={1.4} />
    </g>
  )
}

export function Altar({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-14" y="-6" width="28" height="16" {...soft} />
      <path d="M -14 -1 L 14 -1 M -14 4 L 14 4 M -4 -6 L -4 10 M 6 -6 L 6 10" strokeOpacity={0.6} />
      <path d="M -10 -6 L 10 -6 M -12 -9 L 12 -9" />
    </g>
  )
}

export function Grapes({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const g = [
    [0, 0], [-5, 0], [5, 0], [-2.5, 5], [2.5, 5], [0, 10], [-7, -5], [0, -5], [7, -5],
  ]
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 -10 Q 2 -16 8 -16" stroke={GOLD} />
      {g.map(([gx, gy], i) => (
        <circle key={i} cx={gx} cy={gy} r={3} {...soft} />
      ))}
    </g>
  )
}

export function Yoke({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -20 -2 Q 0 -8 20 -2" strokeWidth={4} />
      <path d="M -12 -4 Q -14 6 -8 8 Q -2 6 -4 -6 M 4 -6 Q 2 6 8 8 Q 14 6 12 -4" />
    </g>
  )
}

export function Calf({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={GOLD}>
      <path d="M -14 2 Q -14 -6 -4 -6 L 8 -6 Q 12 -6 14 -2 L 14 6 M -12 2 l 0 10 M -6 4 l 0 8 M 8 6 l 0 6 M 13 6 l 0 6 M -14 2 Q -14 8 -8 6 L 12 6" fill={GOLD} fillOpacity={0.2} />
      <circle cx="16" cy="-8" r="4" fill={GOLD} fillOpacity={0.2} />
      <path d="M 14 -12 q -2 -4 -5 -4 M 18 -12 q 2 -4 5 -4" />
      <rect x="-18" y="12" width="36" height="5" stroke="currentColor" />
    </g>
  )
}

export function Fish({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -26 0 Q -8 -16 16 -4 L 26 -12 L 24 0 L 26 12 L 16 4 Q -8 16 -26 0 Z" {...soft} />
      <circle cx="-16" cy="-2" r="1.6" fill="currentColor" />
      <path d="M -6 -6 Q -2 0 -6 6" strokeOpacity={0.6} />
    </g>
  )
}

export function Locust({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -12 0 Q 0 -5 12 0 Q 0 5 -12 0 Z" {...soft} />
      <circle cx="13" cy="-1" r="2.5" />
      <path d="M -4 -2 Q 2 -12 10 -10 M 2 2 L -4 10 M 6 2 L 10 10 M -2 2 L -10 8 M 15 -3 Q 20 -10 24 -10" />
    </g>
  )
}

export function Lamp({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -10 2 Q -10 -4 0 -4 Q 10 -4 12 0 L 16 -2 Q 12 6 0 6 Q -8 6 -10 2 Z" {...soft} />
      <Flame x={16} y={-7} s={0.5} />
      <path d="M -10 1 Q -16 0 -14 -4" />
    </g>
  )
}

export function Tower({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -10 24 L -8 -10 L 8 -10 L 10 24 Z" {...soft} />
      <path d="M -12 -10 L 12 -10 M -10 -10 l 0 -4 l 4 0 l 0 4 M -2 -10 l 0 -4 l 4 0 l 0 4 M 6 -10 l 0 -4 l 4 0 l 0 4 M -3 4 L -3 -2 L 3 -2 L 3 4 M -9 10 L 9 10" />
    </g>
  )
}

export function Plumb({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={GOLD}>
      <path d="M 0 -20 L 0 10" />
      <path d="M -4 10 L 4 10 L 0 20 Z" fill={GOLD} fillOpacity={0.4} />
      <rect x="-6" y="-24" width="12" height="4" />
    </g>
  )
}

export function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 30 Q 2 10 0 -14" />
      <path d="M 0 -14 Q -14 -20 -22 -10 M 0 -14 Q -10 -26 -18 -26 M 0 -14 Q 6 -28 16 -26 M 0 -14 Q 14 -18 22 -8 M 0 -14 Q 4 -22 2 -30" />
    </g>
  )
}

export function Jar({ x, y, s = 1, torch = true }: { x: number; y: number; s?: number; torch?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -6 -6 Q -10 4 -6 10 L 6 10 Q 10 4 6 -6 Z" {...soft} />
      <path d="M -5 -6 L 5 -6" />
      {torch && <Flame x={0} y={-12} s={0.6} />}
    </g>
  )
}

export function Sword({ x, y, s = 1, angle = -30 }: { x: number; y: number; s?: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`}>
      <path d="M 0 -24 L 0 8 M -6 8 L 6 8 M 0 8 L 0 14" />
      <path d="M 0 -24 L -2 -20 L 0 -16" stroke={GOLD} />
    </g>
  )
}

export function Harp({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={GOLD}>
      <path d="M -8 12 L -8 -10 Q -4 -16 2 -12 Q 10 -8 10 2 L -8 12" fill={GOLD} fillOpacity={0.12} />
      <path d="M -4 -12 L -4 10 M 0 -12 L 0 8 M 4 -9 L 4 6 M 7 -5 L 7 4" strokeWidth={1.2} />
    </g>
  )
}

export function Sling({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 0 Q -4 12 2 18 M 0 0 Q 8 10 4 18" />
      <path d="M 1 17 Q 3 22 6 18" stroke={GOLD} />
      {[[-12, 22], [-7, 24], [-2, 25], [3, 25], [8, 24]].map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r={1.6} fill={GOLD} stroke="none" />
      ))}
    </g>
  )
}

export function Breastplate({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 6} y={y - 6} width={12} height={14} stroke={GOLD} fill={GOLD} fillOpacity={0.15} />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={x - 3.5 + (i % 3) * 3.5} cy={y - 3.5 + Math.floor(i / 3) * 3.4} r={1} fill={GOLD} stroke="none" />
      ))}
    </g>
  )
}

export function Gate({ x, y, s = 1, lions = false }: { x: number; y: number; s?: number; lions?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-26" y="-20" width="14" height="36" {...soft} />
      <rect x="12" y="-20" width="14" height="36" {...soft} />
      <path d="M -12 16 L -12 -6 Q 0 -20 12 -6 L 12 16" {...soft} />
      <path d="M -26 -20 l 0 -4 l 4 0 l 0 4 M -18 -20 l 0 -4 l 4 0 l 0 4 M 12 -20 l 0 -4 l 4 0 l 0 4 M 20 -20 l 0 -4 l 4 0 l 0 4" />
      {lions && <path d="M -24 -6 l 8 0 M -24 2 l 8 0 M 14 -6 l 8 0 M 14 2 l 8 0" stroke={GOLD} />}
    </g>
  )
}

export function Columns({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -28 -16 L 28 -16 M -30 -20 L 30 -20 M -28 18 L 28 18" />
      {[-20, -7, 7, 20].map((cx) => (
        <g key={cx}>
          <path d={`M ${cx - 3} -16 L ${cx - 3} 18 M ${cx + 3} -16 L ${cx + 3} 18`} />
          <path d={`M ${cx - 5} -16 Q ${cx} -12 ${cx + 5} -16`} stroke={GOLD} />
        </g>
      ))}
    </g>
  )
}

export function Earth({ x, y, r = 18 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} {...soft} />
      <path d={`M ${x - r} ${y} Q ${x} ${y + 6} ${x + r} ${y} M ${x - r * 0.7} ${y - r * 0.7} Q ${x} ${y - r * 0.3} ${x + r * 0.7} ${y - r * 0.7} M ${x} ${y - r} Q ${x - 8} ${y} ${x} ${y + r}`} strokeOpacity={0.6} />
    </g>
  )
}

export function Sprout({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={GOLD}>
      <path d="M 0 0 L 0 -14" />
      <path d="M 0 -8 Q -10 -10 -10 -18 Q -2 -18 0 -8 Z M 0 -12 Q 8 -14 9 -22 Q 1 -22 0 -12 Z" fill={GOLD} fillOpacity={0.3} />
    </g>
  )
}

export function Rain({ x, y, w = 40 }: { x: number; y: number; w?: number }) {
  return (
    <g>
      <path d={`M ${x - w / 2} ${y} Q ${x - w / 2 - 6} ${y - 10} ${x - w / 4} ${y - 10} Q ${x - w / 6} ${y - 20} ${x + 2} ${y - 16} Q ${x + w / 3} ${y - 22} ${x + w / 2} ${y - 8} Q ${x + w / 2 + 6} ${y} ${x + w / 2 - 4} ${y} Z`} {...soft} />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M ${x - w / 2 + 4 + i * (w / 6)} ${y + 4} l -2 7`} strokeOpacity={0.7} />
      ))}
    </g>
  )
}

export function Ladder({ x, y, h = 60 }: { x: number; y: number; h?: number }) {
  return (
    <g stroke={GOLD}>
      <path d={`M ${x - 5} ${y} L ${x + 3} ${y - h} M ${x + 5} ${y} L ${x + 13} ${y - h}`} />
      {Array.from({ length: 7 }, (_, i) => {
        const t = (i + 1) / 8
        return <path key={i} d={`M ${x - 5 + 8 * t} ${y - h * t} L ${x + 5 + 8 * t} ${y - h * t}`} />
      })}
    </g>
  )
}

export function Group({ x, y, n = 3, s = 0.55 }: { x: number; y: number; n?: number; s?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Person key={i} x={x + (i - (n - 1) / 2) * 14 * s * 1.6} y={y + (i % 2) * 2} s={s} beard={i % 2 === 0} head={i % 2 ? "veil" : "none"} arm={i === 0 ? "hold" : "down"} />
      ))}
    </g>
  )
}

export function Footprints({ x, y }: { x: number; y: number }) {
  return (
    <g strokeOpacity={0.7}>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx={x + i * 10} cy={y - i * 5 + (i % 2) * 5} rx={2.4} ry={4} transform={`rotate(-30 ${x + i * 10} ${y - i * 5 + (i % 2) * 5})`} />
      ))}
    </g>
  )
}

export function Cycle({ x, y, r = 16 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <path d={`M ${x + r} ${y} A ${r} ${r} 0 1 1 ${x} ${y - r}`} />
      <path d={`M ${x - 4} ${y - r - 4} L ${x} ${y - r} L ${x - 4} ${y - r + 4}`} />
    </g>
  )
}

export function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -16 4 Q -22 4 -20 -2 Q -18 -8 -12 -6 Q -8 -14 0 -12 Q 8 -16 12 -8 Q 20 -8 18 0 Q 18 4 12 4 Z" {...soft} />
    </g>
  )
}

export function Heart({ x, y, s = 1, broken = false }: { x: number; y: number; s?: number; broken?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 10 Q -14 0 -12 -6 Q -10 -12 -4 -11 Q -1 -10 0 -6 Q 1 -10 4 -11 Q 10 -12 12 -6 Q 14 0 0 10 Z" stroke={GOLD} fill={GOLD} fillOpacity={0.2} />
      {broken && <path d="M 0 -6 L -2 -1 L 2 2 L 0 8" />}
    </g>
  )
}

export function Spear({ x, y, h = 46 }: { x: number; y: number; h?: number }) {
  return (
    <g>
      <path d={`M ${x} ${y + h * 0.5} L ${x} ${y - h * 0.5}`} />
      <path d={`M ${x} ${y - h * 0.5 - 8} L ${x - 3} ${y - h * 0.5} L ${x + 3} ${y - h * 0.5} Z`} stroke={GOLD} fill={GOLD} fillOpacity={0.3} />
    </g>
  )
}

export function Trumpet({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={GOLD}>
      <path d="M -12 4 Q -2 2 6 -4 Q 10 -8 12 -14 Q 16 -6 10 0 Q 2 6 -12 8 Z" fill={GOLD} fillOpacity={0.2} />
    </g>
  )
}

export function Branch({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -12 10 Q 0 0 12 -10" />
      {[-6, 0, 6].map((t) => (
        <g key={t}>
          <path d={`M ${t} ${-t * 0.8} q -4 -6 -1 -9 q 3 3 1 9`} {...soft} />
          <circle cx={t + 3} cy={-t * 0.8 - 2} r={1.6} fill={GOLD} stroke="none" />
        </g>
      ))}
    </g>
  )
}
