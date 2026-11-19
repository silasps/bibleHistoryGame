import { z } from "zod"
import { ref } from "../refs"

// Bible Show: jogo de mímica e desenho em grupo. Cada carta é algo que está
// no texto bíblico (com a referência NAA) e, sempre que possível, vem da
// linha do tempo do autor ou dos minijogos que ele já aprovou.
// STATUS: rascunho — aguarda a revisão do autor (palavras e categorias).

export const CATEGORIAS = [
  { id: "quem", nome: "Quem é?", sub: "Personagens", cor: "#d8a948" },
  { id: "objeto", nome: "O que é?", sub: "Objetos", cor: "#5fb3c9" },
  { id: "acontecimento", nome: "O que aconteceu?", sub: "Acontecimentos", cor: "#e0736b" },
  { id: "lugar", nome: "Onde fica?", sub: "Lugares", cor: "#8fbf6a" },
  { id: "bicho", nome: "Bichos da Bíblia", sub: "Animais", cor: "#e89a4f" },
  { id: "desafio", nome: "Desafio", sub: "Vale 2 casas", cor: "#b18ad8" },
] as const

export type CategoriaId = (typeof CATEGORIAS)[number]["id"]
export const CATEGORIA_IDS = CATEGORIAS.map((c) => c.id) as CategoriaId[]

/** De onde a carta saiu (para a revisão do autor). */
type Fonte = "linha do tempo" | "minijogo" | "Bíblia"

const Carta = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  palavra: z.string().min(2).max(40),
  categoria: z.enum(CATEGORIA_IDS as [CategoriaId, ...CategoriaId[]]),
  ref: z.object({ book: z.string(), chapter: z.number(), verseStart: z.number().optional(), verseEnd: z.number().optional() }),
  fonte: z.enum(["linha do tempo", "minijogo", "Bíblia"]),
})
export type Carta = z.infer<typeof Carta>

type R = ReturnType<typeof ref>
const c = (categoria: CategoriaId, palavra: string, r: R, fonte: Fonte = "Bíblia") => ({
  id: `${categoria}-${palavra
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`,
  palavra,
  categoria,
  ref: r,
  fonte,
})

const T = "linha do tempo" as const
const J = "minijogo" as const

export const CARTAS: Carta[] = z.array(Carta).parse([
  // Quem é?
  c("quem", "Adão e Eva", ref("Gen", 2, 22), T),
  c("quem", "Noé", ref("Gen", 6, 9), T),
  c("quem", "Abraão", ref("Gen", 12, 1), T),
  c("quem", "Isaque", ref("Gen", 21, 3), T),
  c("quem", "Jacó", ref("Gen", 25, 26), T),
  c("quem", "José do Egito", ref("Gen", 41, 41)),
  c("quem", "Moisés", ref("Exod", 2, 10), T),
  c("quem", "Josué", ref("Josh", 1, 1), T),
  c("quem", "Raabe", ref("Josh", 2, 1)),
  c("quem", "Débora", ref("Judg", 4, 4), T),
  c("quem", "Gideão", ref("Judg", 6, 11), T),
  c("quem", "Sansão", ref("Judg", 13, 24), T),
  c("quem", "Rute", ref("Ruth", 1, 16), T),
  c("quem", "Samuel", ref("1Sam", 3, 10), T),
  c("quem", "Davi", ref("1Sam", 16, 13), T),
  c("quem", "Golias", ref("1Sam", 17, 4), J),
  c("quem", "Salomão", ref("1Kgs", 3, 12), T),
  c("quem", "Elias", ref("1Kgs", 17, 1), T),
  c("quem", "Jonas", ref("Jonah", 1, 1), T),
  c("quem", "Daniel", ref("Dan", 6, 16), T),
  c("quem", "Neemias", ref("Neh", 2, 5), T),

  // O que é?
  c("objeto", "Arca de Noé", ref("Gen", 6, 14), J),
  c("objeto", "Fruto da árvore", ref("Gen", 3, 6), J),
  c("objeto", "Estrelas do céu", ref("Gen", 15, 5), J),
  c("objeto", "Escada de Jacó", ref("Gen", 28, 12)),
  c("objeto", "Cesto de junco", ref("Exod", 2, 3), J),
  c("objeto", "Vara de Moisés", ref("Exod", 4, 2)),
  c("objeto", "Maná", ref("Exod", 16, 31), J),
  c("objeto", "Tábuas de pedra", ref("Exod", 24, 12), T),
  c("objeto", "Arca da Aliança", ref("Josh", 3, 6)),
  c("objeto", "Trombetas", ref("Josh", 6, 4), J),
  c("objeto", "Cântaros e tochas", ref("Judg", 7, 16)),
  c("objeto", "Harpa", ref("1Sam", 16, 23)),
  c("objeto", "Funda e pedras", ref("1Sam", 17, 40), J),
  c("objeto", "Coroa", ref("2Sam", 12, 30)),
  c("objeto", "Altar de pedras", ref("1Kgs", 18, 31), J),
  c("objeto", "Livro da Lei", ref("2Kgs", 22, 8), T),

  // O que aconteceu?
  c("acontecimento", "Criação", ref("Gen", 1, 1), T),
  c("acontecimento", "Comer o fruto proibido", ref("Gen", 3, 6), T),
  c("acontecimento", "Construir a arca", ref("Gen", 6, 22)),
  c("acontecimento", "Dilúvio", ref("Gen", 7, 17), T),
  c("acontecimento", "Torre de Babel", ref("Gen", 11, 4), T),
  c("acontecimento", "Travessia do mar Vermelho", ref("Exod", 14, 22), J),
  c("acontecimento", "Recolher o maná", ref("Exod", 16, 21), J),
  c("acontecimento", "Muralhas de Jericó caindo", ref("Josh", 6, 20), J),
  c("acontecimento", "Sansão derruba as colunas", ref("Judg", 16, 29, 30)),
  c("acontecimento", "Rute colhe espigas", ref("Ruth", 2, 3), T),
  c("acontecimento", "Davi é ungido rei", ref("1Sam", 16, 13), T),
  c("acontecimento", "Davi derruba Golias", ref("1Sam", 17, 49), J),
  c("acontecimento", "Fogo do céu no Carmelo", ref("1Kgs", 18, 38), J),
  c("acontecimento", "Elias sobe num redemoinho", ref("2Kgs", 2, 11)),
  c("acontecimento", "Jonas engolido pelo peixe", ref("Jonah", 1, 17), T),
  c("acontecimento", "Daniel na cova dos leões", ref("Dan", 6, 16), T),
  c("acontecimento", "Reconstruir o muro", ref("Neh", 6, 15), T),

  // Onde fica?
  c("lugar", "Jardim do Éden", ref("Gen", 2, 8), T),
  c("lugar", "Canaã", ref("Gen", 12, 5), T),
  c("lugar", "Egito", ref("Gen", 46, 6), T),
  c("lugar", "Rio Nilo", ref("Exod", 1, 22), J),
  c("lugar", "Mar Vermelho", ref("Exod", 15, 4), J),
  c("lugar", "Deserto", ref("Exod", 16, 1), T),
  c("lugar", "Monte Sinai", ref("Exod", 19, 20), T),
  c("lugar", "Rio Jordão", ref("Josh", 3, 17)),
  c("lugar", "Jericó", ref("Josh", 6, 1), T),
  c("lugar", "Belém", ref("Ruth", 1, 19), T),
  c("lugar", "Jerusalém", ref("2Sam", 5, 7), T),
  c("lugar", "Templo", ref("1Kgs", 6, 14), T),
  c("lugar", "Monte Carmelo", ref("1Kgs", 18, 19), J),
  c("lugar", "Nínive", ref("Jonah", 3, 3), T),
  c("lugar", "Babilônia", ref("Dan", 1, 1), T),

  // Bichos da Bíblia
  c("bicho", "Serpente", ref("Gen", 3, 1), T),
  c("bicho", "Corvo", ref("Gen", 8, 7)),
  c("bicho", "Pomba com folha de oliveira", ref("Gen", 8, 11)),
  c("bicho", "Carneiro preso pelos chifres", ref("Gen", 22, 13), T),
  c("bicho", "Camelos", ref("Gen", 24, 10)),
  c("bicho", "Rãs", ref("Exod", 8, 6)),
  c("bicho", "Gafanhotos", ref("Exod", 10, 13)),
  c("bicho", "Cordeiro da Páscoa", ref("Exod", 12, 3)),
  c("bicho", "Codornizes", ref("Exod", 16, 13), J),
  c("bicho", "Jumenta que fala", ref("Num", 22, 28)),
  c("bicho", "Raposas de Sansão", ref("Judg", 15, 4)),
  c("bicho", "Ovelhas", ref("1Sam", 16, 11)),
  c("bicho", "Leão e urso", ref("1Sam", 17, 34)),
  c("bicho", "Corvos que alimentam Elias", ref("1Kgs", 17, 6)),
  c("bicho", "Grande peixe", ref("Jonah", 1, 17), T),
  c("bicho", "Leões", ref("Dan", 6, 22), T),

  // Desafio (vale 2 casas)
  c("desafio", "Arco-íris", ref("Gen", 9, 13)),
  c("desafio", "Aliança", ref("Gen", 15, 18), T),
  c("desafio", "Sacrifício de Isaque", ref("Gen", 22, 2), T),
  c("desafio", "Pragas do Egito", ref("Exod", 11, 1)),
  c("desafio", "Páscoa", ref("Exod", 12, 11)),
  c("desafio", "Sábado", ref("Exod", 20, 8)),
  c("desafio", "Tabernáculo", ref("Exod", 25, 8, 9), T),
  c("desafio", "Quarenta anos no deserto", ref("Num", 14, 33), T),
  c("desafio", "Profeta", ref("Deut", 18, 18)),
  c("desafio", "Divisão do Reino", ref("1Kgs", 12, 16), T),
  c("desafio", "Exílio", ref("2Kgs", 25, 11), T),
  c("desafio", "Queda de Jerusalém", ref("2Kgs", 25, 9), T),
  c("desafio", "Jejum", ref("Jonah", 3, 5), T),
  c("desafio", "Reconstrução do Templo", ref("Ezra", 6, 15), T),
])

export function getCarta(id: string): Carta | undefined {
  return CARTAS.find((x) => x.id === id)
}

export function getCategoria(id: CategoriaId) {
  return CATEGORIAS.find((x) => x.id === id)!
}
