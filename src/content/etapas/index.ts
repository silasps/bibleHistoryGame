import { z } from "zod"
import { compareItems, excerpts, getItem, getWeek, items, weeks, type TimelineItem } from "../overview"
import { ItemColor } from "../overview/schema"

// A história contada por ETAPAS (não por semanas). As semanas continuam nos
// arquivos do autor e na folha de notas; na tela só aparecem as etapas.
// Cada etapa reúne itens das linhas do tempo do autor; os versículos para
// memorizar (o PRD de cada semana) entram logo depois do item em que o texto
// acontece. Os nomes das etapas são rótulos de estrutura, não conteúdo.

export const PrdAnchor = z.object({
  week: z.number().int(),
  /** Índice em `memoryVerse` da semana (a semana 3 tem dois versículos). */
  refIndex: z.number().int().min(0).default(0),
  afterItemId: z.string(),
})
export type PrdAnchor = z.infer<typeof PrdAnchor>

export const Etapa = z.object({
  n: z.number().int().min(1),
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(40),
  color: ItemColor,
  status: z.enum(["com_material", "aguardando_material"]),
  itemIds: z.array(z.string()).default([]),
  /** Trechos de abertura do resumo (sem item) que abrem esta etapa. */
  intros: z.array(z.string()).default([]),
  prd: z.array(PrdAnchor).default([]),
  /** Semana do Manual de onde vem a etapa, só para as etapas ainda sem material. */
  week: z.number().int().optional(),
})
export type Etapa = z.infer<typeof Etapa>

const ETAPAS = z.array(Etapa).parse([
  {
    n: 1, id: "o-comeco", title: "O começo", color: "lilas", status: "com_material",
    itemIds: ["criacao", "adao-eva", "queda"],
    intros: ["r01-intro"],
    prd: [{ week: 1, afterItemId: "queda" }],
  },
  { n: 2, id: "o-mundo-se-afasta", title: "O mundo se afasta", color: "ceu", status: "com_material", itemIds: ["noe", "diluvio", "babel"] },
  { n: 3, id: "a-promessa", title: "A promessa", color: "verde", status: "com_material", itemIds: ["abraao", "alianca-abraamica", "isaque", "sacrificio-isaque", "jaco"] },
  { n: 4, id: "no-egito", title: "No Egito", color: "laranja", status: "com_material", itemIds: ["migracao-egito", "tempo-egito", "moises"], intros: ["r02-intro"] },
  { n: 5, id: "libertacao", title: "Libertação", color: "carmim", status: "com_material", itemIds: ["exodo"] },
  {
    n: 6, id: "deus-no-meio-do-povo", title: "Deus no meio do povo", color: "dourado", status: "com_material",
    itemIds: ["peregrinacao", "arao", "alianca-sinai", "tabernaculo", "levitico-santidade", "espioes", "alianca-deuteronomica", "uncao-josue", "morte-moises"],
    intros: ["r02-recapitulacao"],
    prd: [{ week: 2, afterItemId: "levitico-santidade" }],
  },
  {
    n: 7, id: "a-terra", title: "A terra", color: "oliva", status: "com_material",
    itemIds: ["josue", "conquista-canaa", "periodo-juizes", "debora", "gideao", "rute-boaz", "sansao"],
    intros: ["r03-intro"],
    prd: [{ week: 3, refIndex: 0, afterItemId: "josue" }],
  },
  {
    n: 8, id: "o-reino", title: "O reino", color: "violeta", status: "com_material",
    itemIds: ["samuel", "saul", "davi-ungido", "davi", "alianca-davidica", "salomao", "templo"],
    intros: ["r04-intro", "r04-arquiteto"],
    prd: [
      { week: 3, refIndex: 1, afterItemId: "alianca-davidica" },
      { week: 4, afterItemId: "templo" },
    ],
  },
  {
    n: 9, id: "o-reino-dividido", title: "O reino dividido", color: "azul", status: "com_material",
    itemIds: ["aram", "jeroboao", "roboao", "divisao-reino", "reis-julgamento", "elias", "profetas-do-reino", "acabe", "eliseu", "assiria"],
  },
  {
    n: 10, id: "os-profetas-avisam", title: "Os profetas avisam", color: "turquesa", status: "com_material",
    itemIds: ["isaias", "joel", "miqueias", "ezequias", "queda-samaria", "amos", "oseias", "jonas", "cerco-jerusalem", "manasses", "naum", "babilonia"],
    intros: ["r05-intro", "r05-alerta", "r05-servos"],
    prd: [{ week: 5, afterItemId: "miqueias" }],
  },
  {
    n: 11, id: "exilio-e-esperanca", title: "Exílio e esperança", color: "coral", status: "com_material",
    itemIds: ["josias", "sofonias", "jeremias", "habacuque", "daniel", "ezequiel", "queda-jerusalem", "inicio-exilio", "ciro", "persia"],
    intros: ["r06-intro", "r04-esperanca"],
    prd: [{ week: 6, afterItemId: "ezequiel" }],
  },
  // Semanas 7–11: uma etapa por semana até chegar o material (títulos do Manual).
  ...[7, 8, 9, 10, 11].map((week, i) => ({
    n: 12 + i,
    id: `semana-${week}`,
    title: getWeek(week)!.title,
    color: getWeek(week)!.color,
    status: "aguardando_material" as const,
    week,
  })),
])

export const etapas: Etapa[] = ETAPAS
export const presentableEtapas = etapas.filter((e) => e.status === "com_material")

export function getEtapa(n: number): Etapa | undefined {
  return etapas.find((e) => e.n === n)
}

export function getEtapaById(id: string): Etapa | undefined {
  return etapas.find((e) => e.id === id)
}

/** Itens da etapa em ordem cronológica (mesmo critério das semanas). */
export function itemsOfEtapa(n: number): TimelineItem[] {
  return (getEtapa(n)?.itemIds ?? []).map((id) => getItem(id)!).sort(compareItems)
}

export function etapaOfItem(itemId: string): Etapa | undefined {
  return etapas.find((e) => e.itemIds.includes(itemId))
}

/** Todos os momentos do PRD em ordem de apresentação: o "fio do plano". */
export const prdMoments: (PrdAnchor & { etapa: number; knot: number })[] = presentableEtapas
  .flatMap((e) => {
    const order = itemsOfEtapa(e.n).map((i) => i.id)
    return [...e.prd].sort((a, b) => order.indexOf(a.afterItemId) - order.indexOf(b.afterItemId)).map((p) => ({ ...p, etapa: e.n }))
  })
  .map((p, i) => ({ ...p, knot: i + 1 }))

export function validateEtapas(): string[] {
  const issues: string[] = []
  const placed = new Map<string, number>()
  for (const e of etapas) {
    for (const id of e.itemIds) {
      if (!getItem(id)) issues.push(`etapa ${e.n}: item inexistente ${id}`)
      if (placed.has(id)) issues.push(`${id}: está nas etapas ${placed.get(id)} e ${e.n}`)
      placed.set(id, e.n)
    }
    for (const p of e.prd) {
      if (!e.itemIds.includes(p.afterItemId)) issues.push(`etapa ${e.n}: PRD depois de ${p.afterItemId}, que não está na etapa`)
      if (!getWeek(p.week)?.memoryVerse[p.refIndex]) issues.push(`etapa ${e.n}: semana ${p.week} não tem o versículo ${p.refIndex}`)
    }
  }
  for (const i of items) if (!placed.has(i.id)) issues.push(`${i.id}: fora de qualquer etapa`)

  const anchors = new Set(etapas.flatMap((e) => e.prd.map((p) => `${p.week}:${p.refIndex}`)))
  for (const w of weeks.filter((w) => w.status === "com_material")) {
    w.memoryVerse.forEach((_, i) => {
      if (!anchors.has(`${w.week}:${i}`)) issues.push(`semana ${w.week}: versículo ${i} sem lugar em nenhuma etapa`)
    })
  }

  const intros = etapas.flatMap((e) => e.intros)
  const introIds = new Set(excerpts.filter((x) => x.itemIds.length === 0).map((x) => x.id))
  for (const id of intros) if (!introIds.has(id)) issues.push(`abertura inexistente: ${id}`)
  for (const id of introIds) if (intros.filter((x) => x === id).length !== 1) issues.push(`${id}: abertura do resumo precisa estar em exatamente uma etapa`)
  return issues
}
