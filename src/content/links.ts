import { getBook } from "./books"
import type { BibleRef } from "./schema"

// Links externos para aprofundar (sem reproduzir o conteúdo dos sites):
// leitura na NAA (Bíblia Online) e comentários no Bible Hub.

const BIBLEHUB_SLUG: Record<string, string> = {
  Gen: "genesis", Exod: "exodus", Lev: "leviticus", Num: "numbers", Deut: "deuteronomy", Josh: "joshua", Judg: "judges", Ruth: "ruth",
  "1Sam": "1_samuel", "2Sam": "2_samuel", "1Kgs": "1_kings", "2Kgs": "2_kings", "1Chr": "1_chronicles", "2Chr": "2_chronicles",
  Ezra: "ezra", Neh: "nehemiah", Esth: "esther", Job: "job", Ps: "psalms", Prov: "proverbs", Eccl: "ecclesiastes", Song: "songs",
  Isa: "isaiah", Jer: "jeremiah", Lam: "lamentations", Ezek: "ezekiel", Dan: "daniel", Hos: "hosea", Joel: "joel", Amos: "amos",
  Obad: "obadiah", Jonah: "jonah", Mic: "micah", Nah: "nahum", Hab: "habakkuk", Zeph: "zephaniah", Hag: "haggai", Zech: "zechariah",
  Mal: "malachi", Matt: "matthew", Mark: "mark", Luke: "luke", John: "john", Acts: "acts", Rom: "romans", "1Cor": "1_corinthians",
  "2Cor": "2_corinthians", Gal: "galatians", Eph: "ephesians", Phil: "philippians", Col: "colossians", "1Thess": "1_thessalonians",
  "2Thess": "2_thessalonians", "1Tim": "1_timothy", "2Tim": "2_timothy", Titus: "titus", Phlm: "philemon", Heb: "hebrews",
  Jas: "james", "1Pet": "1_peter", "2Pet": "2_peter", "1John": "1_john", "2John": "2_john", "3John": "3_john", Jude: "jude", Rev: "revelation",
}

/** Slug da Bíblia Online: abreviação em minúsculas (Jó mantém o acento). */
function bibliaOnlineSlug(book: BibleRef["book"]): string {
  return getBook(book).abbr.toLowerCase().replace("ê", "e")
}

export function naaUrl(r: Pick<BibleRef, "book" | "chapter">): string {
  return `https://www.bibliaonline.com.br/naa/${encodeURIComponent(bibliaOnlineSlug(r.book))}/${r.chapter}`
}

export function bibleHubCommentaryUrl(r: Pick<BibleRef, "book" | "chapter" | "verseStart">): string {
  return `https://biblehub.com/commentaries/${BIBLEHUB_SLUG[r.book]}/${r.chapter}-${r.verseStart ?? 1}.htm`
}
