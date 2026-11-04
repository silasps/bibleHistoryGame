import { z } from "zod"
import { getBook } from "../books"
import type { BibleRef } from "../schema"
import { contexto } from "./contexto"
import { CORRECTIONS } from "./corrections"
import { resumo01 } from "./resumos/semana-01"
import { resumo02 } from "./resumos/semana-02"
import { resumo03 } from "./resumos/semana-03"
import { resumo04 } from "./resumos/semana-04"
import { resumo05 } from "./resumos/semana-05"
import { resumo06 } from "./resumos/semana-06"
import { ContextNote, ResumoExcerpt, TimelineItem, TimelineWeek, type ContextNote as CN } from "./schema"
import { ITEMS, WEEKS } from "./timeline"

export * from "./schema"
export { CORRECTIONS }

export const weeks: TimelineWeek[] = z.array(TimelineWeek).parse(WEEKS)
export const items: TimelineItem[] = z.array(TimelineItem).parse(ITEMS)
export const excerpts: ResumoExcerpt[] = z
  .array(ResumoExcerpt)
  .parse([...resumo01, ...resumo02, ...resumo03, ...resumo04, ...resumo05, ...resumo06])
export const contextNotes: CN[] = z.array(ContextNote).parse(contexto)

const itemById = new Map(items.map((i) => [i.id, i]))

export function getItem(id: string): TimelineItem | undefined {
  return itemById.get(id)
}

export function getWeek(week: number): TimelineWeek | undefined {
  return weeks.find((w) => w.week === week)
}

/** Ano de referência para ordenar (temas usam o item-âncora). */
export function itemYear(item: TimelineItem): number {
  if (item.from !== undefined) return item.from
  const anchor = item.anchor ? itemById.get(item.anchor) : undefined
  return anchor?.from ?? 0
}

const KIND_ORDER = { personagem: 0, evento: 1, potencia: 2, tema: 3 } as const

/** Ordem cronológica. No mesmo ano: `seq` (se houver), depois personagens antes de eventos. */
export function compareItems(a: TimelineItem, b: TimelineItem): number {
  return itemYear(a) - itemYear(b) || (a.seq ?? 0) - (b.seq ?? 0) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
}

/** Itens da semana em ordem cronológica. */
export function itemsOfWeek(week: number): TimelineItem[] {
  return items.filter((i) => i.week === week).sort(compareItems)
}

export function excerptsForItem(itemId: string): ResumoExcerpt[] {
  const item = itemById.get(itemId)
  const all = excerpts.filter((e) => e.itemIds.includes(itemId))
  // Trechos da própria semana primeiro; depois os que recapitulam o item em outra semana.
  return [...all.filter((e) => e.week === item?.week), ...all.filter((e) => e.week !== item?.week)]
}

/** Linha de palco do item: a primeira linha disponível nos trechos do autor (fato em revisão não vai ao palco). */
export function stageLineForItem(itemId: string): ResumoExcerpt | undefined {
  return excerptsForItem(itemId).find((e) => e.stageLine && !e.pendingFact)
}

/** Trechos de abertura da semana (não ligados a itens). */
export function weekIntroExcerpts(week: number): ResumoExcerpt[] {
  return excerpts.filter((e) => e.week === week && e.itemIds.length === 0)
}

export function contextForItem(itemId: string): CN[] {
  return contextNotes.filter((n) => n.itemIds.includes(itemId))
}

export function formatYear(year: number): string {
  return year < 0 ? `${-year} a.C.` : `${year} d.C.`
}

/** "±4000 a.C.", "2166–1991 a.C.", "4 a.C.–30 d.C." */
export function formatSpan(item: Pick<TimelineItem, "from" | "to" | "approx">): string {
  if (item.from === undefined) return ""
  const prefix = item.approx ? "± " : ""
  if (item.to === undefined || item.to === item.from) return prefix + formatYear(item.from)
  if (item.from < 0 && item.to < 0) return `${prefix}${-item.from}–${-item.to} a.C.`
  return `${prefix}${formatYear(item.from)}–${formatYear(item.to)}`
}

function refIssue(r: BibleRef, where: string): string | undefined {
  const book = getBook(r.book)
  if (r.chapter > book.chapters || (r.chapterEnd ?? 0) > book.chapters) return `${where}: ${book.name} ${r.chapter} não existe`
  if (r.verseStart && r.verseEnd && r.verseEnd < r.verseStart) return `${where}: versículos invertidos`
}

export function validateOverview(): string[] {
  const issues: string[] = []
  const seen = new Set<string>()
  const weekIds = new Set(weeks.map((w) => w.week))
  const correctionIds = new Set(CORRECTIONS.map((c) => c.id))

  for (const i of items) {
    if (seen.has(i.id)) issues.push(`item duplicado: ${i.id}`)
    seen.add(i.id)
    if (!weekIds.has(i.week)) issues.push(`${i.id}: semana inexistente`)
    if (i.anchor && !itemById.get(i.anchor)?.from) issues.push(`${i.id}: âncora inválida ${i.anchor}`)
    i.refs.forEach((r) => {
      const issue = refIssue(r, i.id)
      if (issue) issues.push(issue)
    })
  }

  const excerptIds = new Set<string>()
  for (const e of excerpts) {
    if (excerptIds.has(e.id)) issues.push(`trecho duplicado: ${e.id}`)
    excerptIds.add(e.id)
    if (!e.id.startsWith(`r${String(e.week).padStart(2, "0")}-`)) issues.push(`${e.id}: prefixo não bate com a semana ${e.week}`)
    for (const id of e.itemIds) if (!itemById.has(id)) issues.push(`${e.id}: item inexistente ${id}`)
    for (const c of e.corrections) if (!correctionIds.has(c)) issues.push(`${e.id}: correção inexistente ${c}`)
    if (/\bPRD\b/.test(e.text) || /\bPRD\b/.test(e.stageLine ?? "")) issues.push(`${e.id}: contém "PRD" (deve ficar no server-only)`)
    e.refs.forEach((r) => {
      const issue = refIssue(r, e.id)
      if (issue) issues.push(issue)
    })
  }

  for (const n of contextNotes) for (const id of n.itemIds) if (!itemById.has(id)) issues.push(`${n.id}: item inexistente ${id}`)

  for (const w of weeks.filter((w) => w.status === "com_material")) {
    if (!items.some((i) => i.week === w.week)) issues.push(`semana ${w.week}: sem itens na linha do tempo`)
  }
  return issues
}
