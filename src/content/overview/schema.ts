import { z } from "zod"
import { BibleRef } from "../schema"

// Visão geral (apresentação e trilha do jogo): linha do tempo das 11 semanas
// e o resumo do autor dividido em trechos. Datas: anos a.C. são negativos.

export const ItemColor = z.enum([
  "lilas",
  "ceu",
  "coral",
  "verde",
  "oliva",
  "laranja",
  "magenta",
  "carmim",
  "turquesa",
  "violeta",
  "azul",
  "dourado",
])
export type ItemColor = z.infer<typeof ItemColor>

export const TimelineItem = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    week: z.number().int().min(1).max(11),
    /** evento e potência ficam embaixo do eixo; personagens em cima; "tema" é parada do resumo sem data. */
    kind: z.enum(["evento", "personagem", "potencia", "tema"]),
    label: z.string().min(1).max(48),
    /** Subtítulo curto, ex.: "Israel", "Judá", "no exílio". */
    sub: z.string().max(24).optional(),
    from: z.number().int().optional(),
    to: z.number().int().optional(),
    /** "±" das datas aproximadas do Manual. */
    approx: z.boolean().default(false),
    /** Para "tema": item datado perto do qual a parada aparece. */
    anchor: z.string().optional(),
    /** Desempate no mesmo ano: menor vem antes. Só quando a narrativa não segue "personagem antes de evento". */
    seq: z.number().int().optional(),
    color: ItemColor,
    /** Ilustração (biblioteca de arte). */
    art: z.string().min(1),
    characterId: z.string().optional(),
    refs: z.array(BibleRef).min(1),
  })
  .refine((i) => i.kind === "tema" || i.from !== undefined, "item datado precisa de `from`")
  .refine((i) => i.kind !== "tema" || !!i.anchor, "tema precisa de `anchor`")
  .refine((i) => i.to === undefined || i.from === undefined || i.to >= i.from, "`to` antes de `from`")
export type TimelineItem = z.infer<typeof TimelineItem>
export type TimelineItemInput = z.input<typeof TimelineItem>

export const TimelineWeek = z.object({
  week: z.number().int().min(1).max(11),
  actId: z.string(),
  title: z.string().min(1),
  status: z.enum(["com_material", "aguardando_material"]),
  span: z.object({ from: z.number().int(), to: z.number().int() }),
  /** Versículo para memorizar da semana (Manual 11S). */
  memoryVerse: z.array(BibleRef).min(1),
  color: ItemColor,
  /** Arquivos do autor que alimentam a semana (nomes locais, para o /editor). */
  sources: z.array(z.string()).default([]),
})
export type TimelineWeek = z.infer<typeof TimelineWeek>
export type TimelineWeekInput = z.input<typeof TimelineWeek>

/** Trecho do resumo do autor. O texto é dele (só ortografia corrigida). */
export const ResumoExcerpt = z.object({
  id: z.string().regex(/^r\d{2}-[a-z0-9-]+$/),
  week: z.number().int().min(1).max(11),
  text: z.string().min(1),
  /** Linha para o palco, condensada das frases do autor. */
  stageLine: z.string().max(140).optional(),
  refs: z.array(BibleRef).default([]),
  itemIds: z.array(z.string()).default([]),
  /** Fato com conferência pendente no relatório: não vai ao palco. */
  pendingFact: z.string().optional(),
  /** Correções de referência aplicadas neste trecho. */
  corrections: z.array(z.string()).default([]),
})
export type ResumoExcerpt = z.infer<typeof ResumoExcerpt>
export type ResumoExcerptInput = z.input<typeof ResumoExcerpt>

export const Correction = z.object({
  id: z.string(),
  week: z.number().int(),
  file: z.enum(["resumo", "contexto", "linha-do-tempo"]),
  original: z.string(),
  corrected: z.string(),
  note: z.string().optional(),
})
export type Correction = z.infer<typeof Correction>

/** Nota de contexto (Task 4) para o dossiê do jogo. */
export const ContextNote = z.object({
  id: z.string(),
  week: z.number().int(),
  title: z.string(),
  text: z.string().min(1),
  refs: z.array(BibleRef).default([]),
  itemIds: z.array(z.string()).default([]),
  source: z.string().optional(),
  pendingFact: z.string().optional(),
})
export type ContextNote = z.infer<typeof ContextNote>
export type ContextNoteInput = z.input<typeof ContextNote>

/** Parágrafo do PRD do autor (server-only, liberado depois da fala). */
export const WeekConnection = z.object({
  week: z.number().int(),
  verseText: z.string().optional(),
  blocks: z.array(z.string().min(1)).default([]),
})
export type WeekConnection = z.infer<typeof WeekConnection>
