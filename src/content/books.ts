// Livros do cânon protestante (66), com ids OSIS, nomes em português e
// número de capítulos conforme a numeração usada nas Bíblias em português.
export const BOOKS = [
  { id: "Gen", name: "Gênesis", abbr: "Gn", chapters: 50, testament: "AT" },
  { id: "Exod", name: "Êxodo", abbr: "Êx", chapters: 40, testament: "AT" },
  { id: "Lev", name: "Levítico", abbr: "Lv", chapters: 27, testament: "AT" },
  { id: "Num", name: "Números", abbr: "Nm", chapters: 36, testament: "AT" },
  { id: "Deut", name: "Deuteronômio", abbr: "Dt", chapters: 34, testament: "AT" },
  { id: "Josh", name: "Josué", abbr: "Js", chapters: 24, testament: "AT" },
  { id: "Judg", name: "Juízes", abbr: "Jz", chapters: 21, testament: "AT" },
  { id: "Ruth", name: "Rute", abbr: "Rt", chapters: 4, testament: "AT" },
  { id: "1Sam", name: "1 Samuel", abbr: "1Sm", chapters: 31, testament: "AT" },
  { id: "2Sam", name: "2 Samuel", abbr: "2Sm", chapters: 24, testament: "AT" },
  { id: "1Kgs", name: "1 Reis", abbr: "1Rs", chapters: 22, testament: "AT" },
  { id: "2Kgs", name: "2 Reis", abbr: "2Rs", chapters: 25, testament: "AT" },
  { id: "1Chr", name: "1 Crônicas", abbr: "1Cr", chapters: 29, testament: "AT" },
  { id: "2Chr", name: "2 Crônicas", abbr: "2Cr", chapters: 36, testament: "AT" },
  { id: "Ezra", name: "Esdras", abbr: "Ed", chapters: 10, testament: "AT" },
  { id: "Neh", name: "Neemias", abbr: "Ne", chapters: 13, testament: "AT" },
  { id: "Esth", name: "Ester", abbr: "Et", chapters: 10, testament: "AT" },
  { id: "Job", name: "Jó", abbr: "Jó", chapters: 42, testament: "AT" },
  { id: "Ps", name: "Salmos", abbr: "Sl", chapters: 150, testament: "AT" },
  { id: "Prov", name: "Provérbios", abbr: "Pv", chapters: 31, testament: "AT" },
  { id: "Eccl", name: "Eclesiastes", abbr: "Ec", chapters: 12, testament: "AT" },
  { id: "Song", name: "Cântico dos Cânticos", abbr: "Ct", chapters: 8, testament: "AT" },
  { id: "Isa", name: "Isaías", abbr: "Is", chapters: 66, testament: "AT" },
  { id: "Jer", name: "Jeremias", abbr: "Jr", chapters: 52, testament: "AT" },
  { id: "Lam", name: "Lamentações", abbr: "Lm", chapters: 5, testament: "AT" },
  { id: "Ezek", name: "Ezequiel", abbr: "Ez", chapters: 48, testament: "AT" },
  { id: "Dan", name: "Daniel", abbr: "Dn", chapters: 12, testament: "AT" },
  { id: "Hos", name: "Oseias", abbr: "Os", chapters: 14, testament: "AT" },
  { id: "Joel", name: "Joel", abbr: "Jl", chapters: 3, testament: "AT" },
  { id: "Amos", name: "Amós", abbr: "Am", chapters: 9, testament: "AT" },
  { id: "Obad", name: "Obadias", abbr: "Ob", chapters: 1, testament: "AT" },
  { id: "Jonah", name: "Jonas", abbr: "Jn", chapters: 4, testament: "AT" },
  { id: "Mic", name: "Miqueias", abbr: "Mq", chapters: 7, testament: "AT" },
  { id: "Nah", name: "Naum", abbr: "Na", chapters: 3, testament: "AT" },
  { id: "Hab", name: "Habacuque", abbr: "Hc", chapters: 3, testament: "AT" },
  { id: "Zeph", name: "Sofonias", abbr: "Sf", chapters: 3, testament: "AT" },
  { id: "Hag", name: "Ageu", abbr: "Ag", chapters: 2, testament: "AT" },
  { id: "Zech", name: "Zacarias", abbr: "Zc", chapters: 14, testament: "AT" },
  { id: "Mal", name: "Malaquias", abbr: "Ml", chapters: 4, testament: "AT" },
  { id: "Matt", name: "Mateus", abbr: "Mt", chapters: 28, testament: "NT" },
  { id: "Mark", name: "Marcos", abbr: "Mc", chapters: 16, testament: "NT" },
  { id: "Luke", name: "Lucas", abbr: "Lc", chapters: 24, testament: "NT" },
  { id: "John", name: "João", abbr: "Jo", chapters: 21, testament: "NT" },
  { id: "Acts", name: "Atos", abbr: "At", chapters: 28, testament: "NT" },
  { id: "Rom", name: "Romanos", abbr: "Rm", chapters: 16, testament: "NT" },
  { id: "1Cor", name: "1 Coríntios", abbr: "1Co", chapters: 16, testament: "NT" },
  { id: "2Cor", name: "2 Coríntios", abbr: "2Co", chapters: 13, testament: "NT" },
  { id: "Gal", name: "Gálatas", abbr: "Gl", chapters: 6, testament: "NT" },
  { id: "Eph", name: "Efésios", abbr: "Ef", chapters: 6, testament: "NT" },
  { id: "Phil", name: "Filipenses", abbr: "Fp", chapters: 4, testament: "NT" },
  { id: "Col", name: "Colossenses", abbr: "Cl", chapters: 4, testament: "NT" },
  { id: "1Thess", name: "1 Tessalonicenses", abbr: "1Ts", chapters: 5, testament: "NT" },
  { id: "2Thess", name: "2 Tessalonicenses", abbr: "2Ts", chapters: 3, testament: "NT" },
  { id: "1Tim", name: "1 Timóteo", abbr: "1Tm", chapters: 6, testament: "NT" },
  { id: "2Tim", name: "2 Timóteo", abbr: "2Tm", chapters: 4, testament: "NT" },
  { id: "Titus", name: "Tito", abbr: "Tt", chapters: 3, testament: "NT" },
  { id: "Phlm", name: "Filemom", abbr: "Fm", chapters: 1, testament: "NT" },
  { id: "Heb", name: "Hebreus", abbr: "Hb", chapters: 13, testament: "NT" },
  { id: "Jas", name: "Tiago", abbr: "Tg", chapters: 5, testament: "NT" },
  { id: "1Pet", name: "1 Pedro", abbr: "1Pe", chapters: 5, testament: "NT" },
  { id: "2Pet", name: "2 Pedro", abbr: "2Pe", chapters: 3, testament: "NT" },
  { id: "1John", name: "1 João", abbr: "1Jo", chapters: 5, testament: "NT" },
  { id: "2John", name: "2 João", abbr: "2Jo", chapters: 1, testament: "NT" },
  { id: "3John", name: "3 João", abbr: "3Jo", chapters: 1, testament: "NT" },
  { id: "Jude", name: "Judas", abbr: "Jd", chapters: 1, testament: "NT" },
  { id: "Rev", name: "Apocalipse", abbr: "Ap", chapters: 22, testament: "NT" },
] as const

export type BookId = (typeof BOOKS)[number]["id"]

export const BOOK_IDS = BOOKS.map((b) => b.id) as [BookId, ...BookId[]]

const byId = new Map<string, (typeof BOOKS)[number]>(BOOKS.map((b) => [b.id, b]))

export function getBook(id: BookId) {
  const book = byId.get(id)
  if (!book) throw new Error(`Livro desconhecido: ${id}`)
  return book
}
