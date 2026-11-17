"use client"

import { motion } from "motion/react"
import type { MapaSpec } from "@/content/overview/mapas"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"

// Mapas esquemáticos de contexto histórico. Coordenadas em longitude/latitude,
// projetadas num retângulo simples: servem para situar, não para medir.
// Só nomes de lugares que estão no texto bíblico ou nas aulas do autor.

type LonLat = [number, number]

const WIDE = { lon0: 20, lat0: 42, sx: 25, sy: 32, w: 1000, h: 640 }
const NEAR = { lon0: 34.15, lat0: 33.45, sx: 250, sy: 250, w: 600, h: 650 }
type Frame = typeof WIDE

const pt = (f: Frame, [lon, lat]: LonLat) => [(lon - f.lon0) * f.sx, (f.lat0 - lat) * f.sy] as const
const path = (f: Frame, pts: LonLat[], close = true) => pts.map((p, i) => `${i ? "L" : "M"}${pt(f, p).map((n) => n.toFixed(1)).join(" ")}`).join(" ") + (close ? " Z" : "")

const WATER = "#0c2134"
const LAND = "#1b1912"
const COAST = "rgba(216,169,72,0.35)"
const RIVER = "#2f6f9c"

// ── Oriente Próximo ──────────────────────────────────────────────────────────
const MED: LonLat[] = [[20, 39.6], [21.5, 37], [23, 36.4], [23.9, 37.8], [26, 40.3], [26.5, 39], [27.3, 37.9], [28.3, 36.7], [30.6, 36.8], [32.5, 36.1], [34.6, 36.8], [36.1, 36.6], [35.9, 35.3], [35.6, 34.2], [35.1, 33.1], [34.5, 31.6], [34.2, 31.3], [32.3, 31.2], [30.9, 31.6], [29.9, 31.2], [29, 30.9], [25.2, 31.6], [20, 32.4]]
const BLACK: LonLat[] = [[27.6, 42], [28.9, 41.3], [31.4, 41.2], [35.2, 42], [38, 41.1], [41.5, 41.5], [41.8, 42]]
const RED: LonLat[] = [[32.4, 30], [32.6, 29.85], [33.9, 27.6], [34.3, 27.95], [34.95, 29.55], [35.05, 29.35], [34.7, 28], [35.6, 26.6], [38.6, 22], [36.2, 22], [33.6, 26.4], [32.6, 29.4]]
const GULF: LonLat[] = [[48, 30.1], [50.1, 29.3], [51.4, 27.9], [53.6, 26.8], [56.2, 26.6], [56.5, 24.4], [54, 24], [52, 24], [51, 25.4], [50.2, 26.6], [49.3, 27.6], [48.4, 28.6], [47.8, 29.8]]
const CASPIAN: LonLat[] = [[49.2, 42], [49.9, 40.6], [49.4, 38.6], [50.6, 37], [53.1, 36.8], [54, 38], [53, 40.2], [52.3, 42]]
const NILE: LonLat[] = [[32.9, 22], [32.9, 24.1], [32.7, 25.8], [31.8, 27.3], [31.2, 29.9], [30.9, 30.8]]
const EUPHRATES: LonLat[] = [[38.5, 39.8], [38.3, 37.9], [38.2, 36.8], [40, 35.4], [42.5, 34.3], [43.8, 33], [44.4, 32.4], [46, 31], [47.6, 30.4]]
const TIGRIS: LonLat[] = [[40.9, 38], [42.4, 37.1], [43.1, 36.4], [43.5, 35.2], [44.4, 33.3], [46, 32], [47.6, 30.4], [48, 30.1]]

const PLACES = {
  jerusalem: [35.23, 31.78],
  samaria: [35.19, 32.28],
  ninive: [43.15, 36.36],
  babilonia: [44.42, 32.54],
  susa: [48.25, 32.19],
  gosen: [31.8, 30.6],
  sinai: [33.97, 28.54],
  cades: [34.4, 30.65],
  jerico: [35.44, 31.87],
  alexandria: [29.92, 31.2],
  macedonia: [22.5, 40.6],
} satisfies Record<string, LonLat>

// Regiões (contornos grosseiros, de propósito).
const R_PERSA: LonLat[] = [[26.5, 41], [41, 41.6], [52, 41], [60, 39.5], [60, 24.5], [56.5, 24.5], [50, 28.5], [47.8, 29.8], [44, 29.5], [38, 28], [35, 24], [33, 22], [25.2, 22], [25.2, 31.5], [29, 30.9], [32.3, 31.2], [34.2, 31.3], [35.1, 33.1], [36, 36.5], [32.5, 36.1], [28.3, 36.7], [26.5, 39]]
const R_GRECIA: LonLat[] = [[20, 41.6], [26.4, 41.6], [26.3, 40.4], [24, 37.8], [23, 36.4], [21.5, 37], [20, 39.6]]
const R_PTOLOMEUS: LonLat[] = [[25.2, 22], [33, 22], [35, 24], [35.6, 29.5], [35.6, 33.2], [35.1, 33.1], [34.2, 31.3], [32.3, 31.2], [29, 30.9], [25.2, 31.5]]
const R_SELEUCIDAS: LonLat[] = [[35.6, 33.2], [36.1, 36.6], [38, 38.5], [44, 39.5], [52, 40], [60, 39.5], [60, 24.5], [56.5, 24.5], [50, 28.5], [47.8, 29.8], [44, 29.5], [38.5, 31], [35.6, 32]]

const ARROWS = {
  assiria: { from: PLACES.samaria, to: PLACES.ninive, label: "Assíria · 722 a.C.", color: "#5c95ff" },
  babilonia: { from: PLACES.jerusalem, to: PLACES.babilonia, label: "Babilônia · 586 a.C.", color: "#ff8576" },
  retornos: { from: PLACES.babilonia, to: PLACES.jerusalem, label: "Retornos · 538, 458, 444 a.C.", color: "#63d891" },
}

function Label({ f, at, text, size, anchor = "middle", dy = 0, color = "#efe3c4", delay = 0 }: { f: Frame; at: LonLat; text: string; size: number; anchor?: "start" | "middle" | "end"; dy?: number; color?: string; delay?: number }) {
  const fx = useFx()
  const [x, y] = pt(f, at)
  return (
    <motion.text
      x={x}
      y={y + dy}
      textAnchor={anchor}
      fontSize={size}
      fill={color}
      className="font-display"
      style={{ paintOrder: "stroke", stroke: "rgba(5,7,13,0.85)", strokeWidth: size / 5 }}
      initial={fx.motion ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ delay: fx.motion ? delay : 0, duration: 0.5 }}
    >
      {text}
    </motion.text>
  )
}

function Dot({ f, at, size, color = "#f4d27a", delay = 0 }: { f: Frame; at: LonLat; size: number; color?: string; delay?: number }) {
  const fx = useFx()
  const [x, y] = pt(f, at)
  return (
    <motion.circle cx={x} cy={y} r={size} fill={color} initial={fx.motion ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ delay: fx.motion ? delay : 0 }} style={{ transformOrigin: `${x}px ${y}px` }} />
  )
}

function Route({ f, pts, color, delay = 0, width = 5, dashed = false }: { f: Frame; pts: LonLat[]; color: string; delay?: number; width?: number; dashed?: boolean }) {
  const fx = useFx()
  return (
    <motion.path
      d={path(f, pts, false)}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? "2 12" : undefined}
      initial={fx.motion ? { pathLength: 0 } : false}
      animate={{ pathLength: 1 }}
      transition={{ delay: fx.motion ? delay : 0, duration: fx.motion ? 1.6 : 0, ease: "easeInOut" }}
    />
  )
}

function Region({ f, pts, color, label, at, size = 20, delay = 0 }: { f: Frame; pts: LonLat[]; color: string; label?: string; at?: LonLat; size?: number; delay?: number }) {
  const fx = useFx()
  return (
    <>
      <motion.path d={path(f, pts)} fill={color} fillOpacity={0.28} stroke={color} strokeWidth={2} strokeOpacity={0.8} initial={fx.motion ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: fx.motion ? delay : 0, duration: 0.8 }} />
      {label && at && <Label f={f} at={at} text={label} size={size} color={color} delay={delay + 0.3} />}
    </>
  )
}

/** Terra, depois o que estiver "em terra" (regiões), depois a água por cima: o mar nunca fica pintado. */
function NearEastBase({ f, children }: { f: Frame; children?: React.ReactNode }) {
  return (
    <>
      <rect width={f.w} height={f.h} fill={LAND} />
      {children}
      {[MED, BLACK, RED, GULF, CASPIAN].map((p, i) => (
        <path key={i} d={path(f, p)} fill={WATER} stroke={COAST} strokeWidth={1.5} />
      ))}
      {[NILE, EUPHRATES, TIGRIS].map((p, i) => (
        <path key={i} d={path(f, p, false)} fill="none" stroke={RIVER} strokeWidth={3} strokeLinecap="round" />
      ))}
    </>
  )
}

/** Êxodo: do Egito ao Sinai e daí a Canaã (trajeto ilustrativo). */
function Exodo({ s }: { s: number }) {
  const f = WIDE
  return (
    <>
      <NearEastBase f={f} />
      <Route f={f} pts={[PLACES.gosen, [32.6, 29.75], [33.2, 29.2], PLACES.sinai, [34.1, 29.6], PLACES.cades, [35.3, 31.2], PLACES.jerico]} color="#f4c86a" delay={0.4} width={6} dashed />
      <Dot f={f} at={PLACES.gosen} size={7} delay={0.2} />
      <Dot f={f} at={PLACES.sinai} size={7} delay={1} />
      <Dot f={f} at={PLACES.jerico} size={7} delay={1.8} />
      <Label f={f} at={[30.5, 28.6]} text="Egito" size={s * 1.3} delay={0.1} />
      <Label f={f} at={PLACES.sinai} text="Monte Sinai" size={s} dy={s * 1.6} delay={1} />
      <Label f={f} at={[36.9, 31.2]} text="Canaã" size={s * 1.3} anchor="start" delay={1.8} />
      <Label f={f} at={[29.5, 34]} text="Mar Mediterrâneo" size={s * 0.8} color="#7fa8c8" />
      <Label f={f} at={[35.6, 25.4]} text="Mar Vermelho" size={s * 0.8} color="#7fa8c8" anchor="start" />
    </>
  )
}

/** Exílios: Assíria leva Israel; Babilônia leva Judá; os retornos (semana 7). */
function Exilios({ s, foco }: { s: number; foco?: string }) {
  const f = WIDE
  const keys = (foco === "retornos" ? ["retornos"] : foco === "assiria" ? ["assiria"] : ["assiria", "babilonia"]) as (keyof typeof ARROWS)[]
  return (
    <>
      <NearEastBase f={f} />
      {keys.map((k, i) => {
        const a = ARROWS[k]
        const mid: LonLat = [(a.from[0] + a.to[0]) / 2, Math.max(a.from[1], a.to[1]) + 2.2]
        return (
          <g key={k} opacity={foco && foco !== k && !(foco === "babilonia" && k === "assiria") ? 0.9 : 1}>
            <Route f={f} pts={[a.from, mid, a.to]} color={a.color} delay={0.4 + i * 0.9} width={6} />
            <Label f={f} at={mid} text={a.label} size={s * 0.95} color={a.color} dy={-s * 0.6} delay={0.8 + i * 0.9} />
          </g>
        )
      })}
      <Dot f={f} at={PLACES.jerusalem} size={7} />
      <Dot f={f} at={PLACES.samaria} size={6} />
      <Dot f={f} at={PLACES.ninive} size={7} color="#5c95ff" />
      <Dot f={f} at={PLACES.babilonia} size={7} color="#ff8576" />
      <Label f={f} at={PLACES.jerusalem} text="Jerusalém" size={s} anchor="end" dy={s * 1.4} />
      <Label f={f} at={PLACES.samaria} text="Samaria" size={s * 0.85} anchor="end" dy={-s * 0.5} />
      <Label f={f} at={PLACES.ninive} text="Nínive" size={s} anchor="start" dy={-s * 0.6} />
      <Label f={f} at={PLACES.babilonia} text="Babilônia" size={s} anchor="start" dy={s * 1.4} />
    </>
  )
}

/** Impérios do período entre os Testamentos (aula do Prof. Diego, 13/11). */
function Imperios({ s, foco = "persa" }: { s: number; foco?: string }) {
  const f = WIDE
  return (
    <>
      <NearEastBase f={f}>
        {foco === "persa" && <Region f={f} pts={R_PERSA} color="#cfc657" />}
        {foco === "alexandre" && (
          <>
            <Region f={f} pts={R_GRECIA} color="#5cc3f0" delay={0.2} />
            <Region f={f} pts={R_PERSA} color="#5cc3f0" delay={1} />
          </>
        )}
        {foco === "divisao" && (
          <>
            <Region f={f} pts={R_PTOLOMEUS} color="#ffa64d" delay={0.3} />
            <Region f={f} pts={R_SELEUCIDAS} color="#bb86ff" delay={0.9} />
          </>
        )}
      </NearEastBase>
      {foco === "persa" && <Label f={f} at={[47, 34.5]} text="Império Persa" size={s * 1.2} color="#cfc657" delay={0.6} />}
      {foco === "alexandre" && (
        <>
          <Label f={f} at={[22.6, 41.2]} text="Macedônia" size={s} color="#5cc3f0" anchor="start" delay={0.5} />
          <Label f={f} at={[48, 35.4]} text="Conquistas de Alexandre" size={s * 1.1} color="#5cc3f0" delay={1.3} />
          <Route f={f} pts={[PLACES.macedonia, [28, 39.6], [34, 37.5], [36, 35], PLACES.jerusalem, PLACES.alexandria, [36, 34], [44.4, 33], [52, 30]]} color="#9fdcf7" delay={0.6} width={4} dashed />
        </>
      )}
      {foco === "divisao" && (
        <>
          <Label f={f} at={[29.5, 26.5]} text="Ptolomeus · Egito" size={s * 1.05} color="#ffa64d" delay={0.6} />
          <Label f={f} at={[48, 35.4]} text="Selêucidas · Síria" size={s * 1.05} color="#bb86ff" delay={1.2} />
          <Label f={f} at={PLACES.alexandria} text="Alexandria" size={s * 0.8} anchor="end" dy={-s * 0.6} delay={0.5} />
        </>
      )}
      {foco === "roma" && (
        <>
          <Route f={f} pts={[[20.3, 36.6], [27, 34.4], [33.5, 33], PLACES.jerusalem]} color="#ff5a69" delay={0.3} width={7} />
          <Label f={f} at={[20.6, 35.4]} text="Roma →" size={s * 1.2} anchor="start" color="#ff5a69" delay={0.3} />
          <Label f={f} at={[27, 33.3]} text="63 a.C." size={s} color="#ff5a69" delay={1.2} />
        </>
      )}
      <Dot f={f} at={PLACES.jerusalem} size={8} color="#f4d27a" delay={0.1} />
      <Label f={f} at={PLACES.jerusalem} text="Judeia" size={s * 1.05} anchor="start" dy={s * 1.5} color="#f4d27a" />
    </>
  )
}

/** Reino dividido (1Rs 12): Israel ao norte, Judá ao sul. */
function Reinos({ s }: { s: number }) {
  const f = NEAR
  const coast: LonLat[] = [[34.15, 33.45], [35.2, 33.45], [35.17, 33.2], [35.07, 32.92], [34.95, 32.82], [34.9, 32.5], [34.75, 32.1], [34.6, 31.8], [34.45, 31.52], [34.15, 31.25]]
  const israel: LonLat[] = [[35.2, 33.42], [35.75, 33.42], [36.0, 33.0], [35.95, 32.0], [35.55, 31.95], [35.1, 31.97], [34.68, 31.97], [34.75, 32.1], [34.9, 32.5], [34.95, 32.82], [35.07, 32.92], [35.17, 33.2]]
  const juda: LonLat[] = [[34.68, 31.97], [35.1, 31.97], [35.55, 31.95], [35.5, 31.5], [35.45, 31.0], [34.6, 30.95], [34.3, 31.3], [34.45, 31.52], [34.6, 31.8]]
  const dead: LonLat[] = [[35.47, 31.77], [35.58, 31.74], [35.56, 31.2], [35.43, 31.1], [35.39, 31.48]]
  const galilee: LonLat[] = [[35.55, 32.9], [35.65, 32.87], [35.64, 32.72], [35.57, 32.7]]
  const towns: [string, LonLat, "start" | "end"][] = [
    ["Dã", [35.65, 33.25], "start"],
    ["Samaria", [35.19, 32.28], "end"],
    ["Siquém", [35.28, 32.21], "start"],
    ["Betel", [35.22, 31.93], "start"],
    ["Jerusalém", [35.23, 31.78], "end"],
  ]
  return (
    <>
      <rect width={f.w} height={f.h} fill={LAND} />
      <Region f={f} pts={israel} color="#5c95ff" label="Israel (Norte)" at={[35.55, 32.55]} size={s * 1.25} delay={0.3} />
      <Region f={f} pts={juda} color="#ff8576" label="Judá (Sul)" at={[34.95, 31.35]} size={s * 1.25} delay={1.1} />
      <path d={path(f, [...coast, [34.15, 31.25]])} fill={WATER} stroke={COAST} strokeWidth={1.5} />
      <path d={path(f, dead)} fill={WATER} stroke={COAST} />
      <path d={path(f, galilee)} fill={WATER} stroke={COAST} />
      <path d={path(f, [[35.57, 32.7], [35.55, 32.3], [35.53, 31.77]], false)} fill="none" stroke={RIVER} strokeWidth={3} />
      {towns.map(([name, at, anchor], i) => (
        <g key={name}>
          <Dot f={f} at={at} size={s * 0.28} delay={1.6 + i * 0.15} />
          <Label f={f} at={at} text={name} size={s * 0.9} anchor={anchor} dy={s * 0.32} delay={1.6 + i * 0.15} />
        </g>
      ))}
      <Label f={f} at={[34.19, 31.62]} text="Mar Mediterrâneo" size={s * 0.7} color="#7fa8c8" anchor="start" />
    </>
  )
}

/** Mapa de contexto do slide. `compact`: celular (letras maiores, proporcionalmente). */
export function ContextMap({ spec, className, compact = false, title }: { spec: MapaSpec; className?: string; compact?: boolean; title: string }) {
  const frame = spec.id === "reinos" ? NEAR : WIDE
  const s = (spec.id === "reinos" ? 24 : 22) * (compact ? 1.5 : 1)
  return (
    <svg viewBox={`0 0 ${frame.w} ${frame.h}`} className={cn("h-full w-full overflow-hidden rounded-[3%]", className)} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
      {spec.id === "exodo" && <Exodo s={s} />}
      {spec.id === "exilios" && <Exilios s={s} foco={spec.foco} />}
      {spec.id === "imperios" && <Imperios s={s} foco={spec.foco} />}
      {spec.id === "reinos" && <Reinos s={s} />}
      <rect width={frame.w} height={frame.h} fill="none" stroke={COAST} strokeWidth={2} rx={18} />
    </svg>
  )
}
