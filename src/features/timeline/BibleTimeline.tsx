"use client"

import { Check } from "lucide-react"
import { motion } from "motion/react"
import { useMemo } from "react"
import { ITEM_COLORS, ItemArt } from "@/components/art/ItemArt"
import { formatSpan, formatYear, getWeek } from "@/content/overview"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"
import { layoutWeek, type TimelineCard } from "./layout"

// Linha do tempo de uma semana, no estilo das linhas do tempo do autor:
// eixo com anos, cartões com ilustração, rótulo e data na cor do item,
// ligados ao eixo por linhas tracejadas.

const AXIS_Y = 54
const LANE_Y: Record<TimelineCard["side"], [number, number]> = { acima: [37, 20], abaixo: [71, 88] }

interface Props {
  week: number
  variant?: "stage" | "trail"
  /** Item em destaque (brilha; os demais esmaecem). */
  focusId?: string
  /** Itens visíveis por completo; os outros aparecem apagados. `undefined` = todos. */
  revealed?: ReadonlySet<string>
  /** Item cuja arte foi "ampliada" para o destaque (a arte sai daqui). */
  spotlightId?: string
  /** Itens já visitados no jogo (recebem uma marca). */
  visited?: ReadonlySet<string>
  onSelect?: (itemId: string) => void
  showTitle?: boolean
  className?: string
}

export function BibleTimeline({ week, variant = "stage", focusId, revealed, spotlightId, visited, onSelect, showTitle = true, className }: Props) {
  const layout = useMemo(() => layoutWeek(week, variant === "trail" ? 12 : 11), [week, variant])
  const info = getWeek(week)
  const fx = useFx()
  const W = layout.cardWidth

  return (
    <div className={cn("relative h-full w-full select-none [container-type:size]", className)} data-week={week}>
      {showTitle && info && (
        <div className="absolute inset-x-0 top-[1.5cqh] text-center">
          <p className="font-display text-[3.6cqh] font-semibold tracking-wide text-parchment">{info.title}</p>
        </div>
      )}

      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <line x1="2" y1={AXIS_Y} x2="97" y2={AXIS_Y} stroke="#6b7387" strokeWidth={0.35} strokeDasharray="1.4 1.2" vectorEffect="non-scaling-stroke" />
        <path d={`M 97 ${AXIS_Y - 1.2} L 98.4 ${AXIS_Y} L 97 ${AXIS_Y + 1.2}`} fill="none" stroke="#6b7387" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {layout.cards.map((c) => {
          const color = ITEM_COLORS[c.item.color]
          const visible = !revealed || revealed.has(c.item.id)
          const y = LANE_Y[c.side][c.lane]
          const edge = c.side === "acima" ? y + 7.5 : y - 8.5
          const dim = focusId && focusId !== c.item.id
          return (
            <g key={c.item.id} opacity={visible ? (dim ? (variant === "trail" ? 0.6 : 0.35) : 0.9) : 0.12} style={{ transition: "opacity .6s" }}>
              {c.bracket && (
                <path
                  d={`M ${c.bracket[0]} ${AXIS_Y - 2} L ${c.bracket[0]} ${AXIS_Y - 4.5} L ${c.bracket[1]} ${AXIS_Y - 4.5} L ${c.bracket[1]} ${AXIS_Y - 2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.6}
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {c.item.kind !== "tema" && (
                <path
                  d={`M ${c.anchorX} ${c.bracket ? AXIS_Y - 4.5 : AXIS_Y} L ${c.x} ${edge}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.4}
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </g>
          )
        })}
      </svg>

      {layout.cards
        .filter((c) => !c.bracket && c.item.kind !== "tema")
        .map((c) => (
          <span
            key={`dot-${c.item.id}`}
            aria-hidden
            className="absolute size-[1.3cqh] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-500"
            style={{ left: `${c.anchorX}%`, top: `${AXIS_Y}%`, background: ITEM_COLORS[c.item.color], opacity: !revealed || revealed.has(c.item.id) ? 1 : 0.15 }}
          />
        ))}
      {layout.ticks.map((t) => (
        <span key={t.year} className="absolute -translate-x-1/2 text-[1.9cqh] font-medium tabular-nums text-mist/70" style={{ left: `${t.x}%`, top: `${AXIS_Y + 0.8}%` }}>
          {formatYear(t.year)}
        </span>
      ))}

      {layout.cards.map((c) => {
        const visible = !revealed || revealed.has(c.item.id)
        const focused = focusId === c.item.id
        const dim = !!focusId && !focused
        const color = ITEM_COLORS[c.item.color]
        const y = LANE_Y[c.side][c.lane]
        const Tag = onSelect ? motion.button : motion.div
        return (
          <Tag
            key={c.item.id}
            type={onSelect ? "button" : undefined}
            onClick={onSelect ? () => onSelect(c.item.id) : undefined}
            aria-label={onSelect ? `${c.item.label}, ${formatSpan(c.item)}` : undefined}
            className={cn("absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center", onSelect && "cursor-pointer rounded-xl focus-visible:outline-2")}
            style={{ left: `${c.x}%`, top: `${y}%`, width: `${W}%` }}
            initial={false}
            animate={{
              opacity: visible ? (dim ? (variant === "trail" ? 0.75 : 0.4) : 1) : 0.14,
              scale: focused && fx.motion ? 1.18 : 1,
              filter: focused ? `drop-shadow(0 0 1.6cqh ${color})` : "drop-shadow(0 0 0 transparent)",
            }}
            transition={{ duration: fx.motion ? 0.6 : 0 }}
          >
            <div className="relative h-[10.5cqh] w-[10.5cqh]">
              {spotlightId !== c.item.id && (
                <motion.div layoutId={`art-${c.item.id}`} className="h-full w-full" transition={{ duration: fx.motion ? 0.8 : 0, ease: [0.3, 0.7, 0.2, 1] }}>
                  <ItemArt art={c.item.art} color={c.item.color} className="h-full w-full" />
                </motion.div>
              )}
              {visited?.has(c.item.id) && (
                <span className="absolute -right-[0.8cqh] -top-[0.4cqh] grid size-[2.6cqh] place-items-center rounded-full bg-gold text-night" aria-label="visitado">
                  <Check className="size-[1.9cqh]" strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="mt-[0.3cqh] text-[1.95cqh] font-semibold leading-tight" style={{ color }}>
              {c.item.label}
            </p>
            <p className="text-[1.55cqh] leading-tight text-mist">
              {[c.item.sub, formatSpan(c.item)].filter(Boolean).join(" · ")}
            </p>
          </Tag>
        )
      })}
    </div>
  )
}

/** Faixa com as 11 semanas: onde estamos na história. */
export function WeekStrip({ current, className }: { current?: number; className?: string }) {
  return (
    <ol className={cn("flex w-full gap-[0.4%]", className)} aria-label="Semanas">
      {Array.from({ length: 11 }, (_, i) => i + 1).map((n) => {
        const w = getWeek(n)!
        const active = n === current
        const pending = w.status === "aguardando_material"
        return (
          <li
            key={n}
            className={cn("flex-1 rounded-full py-[0.5cqh] text-center text-[1.4cqh] transition-all", pending ? "opacity-35" : "opacity-90")}
            style={{ background: active ? ITEM_COLORS[w.color] : `${ITEM_COLORS[w.color]}33`, color: active ? "#05070d" : ITEM_COLORS[w.color] }}
            aria-current={active ? "step" : undefined}
            title={`Semana ${n} · ${w.title}${pending ? " (em breve)" : ""}`}
          >
            {n}
          </li>
        )
      })}
    </ol>
  )
}
