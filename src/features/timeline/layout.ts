import { getItem, itemsOfWeek, type TimelineItem } from "@/content/overview"

// Layout de uma semana da linha do tempo, em porcentagem do palco.
// Personagens, potências e temas ficam acima do eixo; eventos, abaixo.
// Cada lado tem duas faixas; os cartões se deslocam para não se sobrepor e
// ligam-se ao eixo por linhas tracejadas (como nas linhas do tempo do autor).

export interface TimelineCard {
  item: TimelineItem
  side: "acima" | "abaixo"
  lane: 0 | 1
  /** Centro do cartão (x em %). */
  x: number
  /** Ponto no eixo ao qual o cartão se liga. */
  anchorX: number
  /** Período (personagens e potências). */
  bracket?: [number, number]
}

export interface TimelineLayout {
  cards: TimelineCard[]
  ticks: { x: number; year: number }[]
  cardWidth: number
}

const LEFT = 6
const RIGHT = 94

function niceStep(range: number): number {
  for (const step of [10, 20, 25, 50, 100, 200, 250, 500, 1000]) if (range / step <= 7) return step
  return 2000
}

export function layoutWeek(week: number, baseWidth = 11): TimelineLayout {
  const items = itemsOfWeek(week)
  const years = items.flatMap((i) => [i.from, i.to]).filter((y): y is number => y !== undefined)
  let min = Math.min(...years)
  let max = Math.max(...years)
  if (!isFinite(min) || min === max) {
    min = (min || 0) - 50
    max = (max || 0) + 50
  }
  const pad = (max - min) * 0.06
  min -= pad
  max += pad
  const x = (year: number) => LEFT + ((year - min) / (max - min)) * (RIGHT - LEFT)

  const base = items.map((item) => {
    const anchorItem = item.kind === "tema" && item.anchor ? getItem(item.anchor) : undefined
    const from = item.from ?? anchorItem?.from ?? min
    const bracket: [number, number] | undefined = item.to !== undefined && item.from !== undefined ? [x(item.from), x(item.to)] : undefined
    const anchorX = bracket ? (bracket[0] + bracket[1]) / 2 : x(from)
    const side: TimelineCard["side"] = item.kind === "evento" ? "abaixo" : "acima"
    return { item, side, anchorX, bracket }
  })

  // Reduz a largura até caber tudo (no máximo 6 tentativas).
  let width = baseWidth
  let cards: TimelineCard[] = []
  for (let attempt = 0; attempt < 6; attempt++) {
    cards = []
    let overflow = false
    for (const side of ["acima", "abaixo"] as const) {
      const last: [number, number] = [-Infinity, -Infinity]
      for (const b of base.filter((c) => c.side === side).sort((a, c) => a.anchorX - c.anchorX)) {
        const candidates = ([0, 1] as const).map((lane) => {
          let px = Math.max(b.anchorX, last[lane] + width, LEFT + width / 2 - 2)
          // Na faixa de fora, desvia do cartão logo à frente para a linha não cruzá-lo.
          if (lane === 1 && Math.abs(px - last[0]) < width * 0.6) px = last[0] + width * 0.6
          return { lane, x: px }
        })
        const pick = candidates.sort((p, q) => Math.abs(p.x - b.anchorX) - Math.abs(q.x - b.anchorX) || p.lane - q.lane)[0]
        last[pick.lane] = pick.x
        if (pick.x > RIGHT + 2 - width / 2) overflow = true
        cards.push({ ...b, lane: pick.lane, x: pick.x })
      }
    }
    if (!overflow) break
    width *= 0.86
  }

  const step = niceStep(max - min)
  const ticks: TimelineLayout["ticks"] = []
  for (let year = Math.ceil(min / step) * step; year <= max; year += step) ticks.push({ x: x(year), year })
  return { cards, ticks, cardWidth: width }
}
