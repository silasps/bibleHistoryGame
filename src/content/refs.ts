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
  resumo_autor: "Do resumo",
  reflexao: "Reflexão",
}

export function blockLabel(b: Pick<ContentBlock, "kind" | "label">): string {
  return b.label ?? CONTENT_KIND_LABEL[b.kind]
}

// Códigos USFM (usados pelo YouVersion) a partir dos ids OSIS do projeto.
const USFM: Record<string, string> = {
  Gen: "GEN", Exod: "EXO", Lev: "LEV", Num: "NUM", Deut: "DEU", Josh: "JOS", Judg: "JDG", Ruth: "RUT", "1Sam": "1SA", "2Sam": "2SA",
  "1Kgs": "1KI", "2Kgs": "2KI", "1Chr": "1CH", "2Chr": "2CH", Ezra: "EZR", Neh: "NEH", Esth: "EST", Job: "JOB", Ps: "PSA", Prov: "PRO",
  Eccl: "ECC", Song: "SNG", Isa: "ISA", Jer: "JER", Lam: "LAM", Ezek: "EZK", Dan: "DAN", Hos: "HOS", Joel: "JOL", Amos: "AMO",
  Obad: "OBA", Jonah: "JON", Mic: "MIC", Nah: "NAM", Hab: "HAB", Zeph: "ZEP", Hag: "HAG", Zech: "ZEC", Mal: "MAL", Matt: "MAT",
  Mark: "MRK", Luke: "LUK", John: "JHN", Acts: "ACT", Rom: "ROM", "1Cor": "1CO", "2Cor": "2CO", Gal: "GAL", Eph: "EPH", Phil: "PHP",
  Col: "COL", "1Thess": "1TH", "2Thess": "2TH", "1Tim": "1TI", "2Tim": "2TI", Titus: "TIT", Phlm: "PHM", Heb: "HEB", Jas: "JAS",
  "1Pet": "1PE", "2Pet": "2PE", "1John": "1JN", "2John": "2JN", "3John": "3JN", Jude: "JUD", Rev: "REV",
}

/** Link para ler a passagem na NAA (YouVersion, versão 1840). */
export function linkNaa(r: FormattableRef): string {
  const verses = r.verseStart ? `.${r.verseStart}${r.verseEnd && r.verseEnd !== r.verseStart ? `-${r.verseEnd}` : ""}` : ""
  return `https://www.bible.com/bible/1840/${USFM[r.book] ?? "GEN"}.${r.chapter}${verses}.NAA`
}
