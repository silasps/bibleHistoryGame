import { getBook, type BookId } from "./books"
import type { BibleRef, ContentBlock, ContentKind } from "./schema"

type RefInput = Omit<BibleRef, "translation"> & { translation?: "NAA" }

/** ref("Gen", 3, 15) · ref("Gen", 3, 1, 6) · ref("Exod", 19) */
export function ref(book: BookId, chapter: number, verseStart?: number, verseEnd?: number): RefInput {
  return { book, chapter, verseStart, verseEnd }
}

/** chapters("Exod", 19, 20) → Êxodo 19–20 */
export function chapters(book: BookId, chapter: number, chapterEnd: number): RefInput {
  return { book, chapter, chapterEnd }
}

/** Atalho para blocos de conteúdo nos módulos editoriais. */
export function block(kind: ContentKind, text: string, refs: RefInput[] = [], label?: string) {
  return { kind, text, refs, label }
}

type FormattableRef = Pick<BibleRef, "book" | "chapter" | "verseStart" | "verseEnd" | "chapterEnd">

export function formatRef(r: FormattableRef, style: "long" | "short" = "long"): string {
  const book = getBook(r.book)
  const name = style === "long" ? book.name : book.abbr
  if (r.chapterEnd && r.chapterEnd !== r.chapter) return `${name} ${r.chapter}–${r.chapterEnd}`
  if (!r.verseStart) return `${name} ${r.chapter}`
  if (r.verseEnd && r.verseEnd !== r.verseStart) return `${name} ${r.chapter}:${r.verseStart}–${r.verseEnd}`
  return `${name} ${r.chapter}:${r.verseStart}`
}

export function formatRefs(refs: FormattableRef[], style: "long" | "short" = "short"): string {
  return refs.map((r) => formatRef(r, style)).join("; ")
}

export const CONTENT_KIND_LABEL: Record<ContentKind, string> = {
  texto_biblico: "Texto bíblico",
  parafrase: "Paráfrase do texto",
  interpretacao: "Interpretação",
  analogia: "Analogia",
  hipotese_ficcional: "Hipótese / simulação",
  narracao: "Narração",
}

export function blockLabel(b: Pick<ContentBlock, "kind" | "label">): string {
  return b.label ?? CONTENT_KIND_LABEL[b.kind]
}
