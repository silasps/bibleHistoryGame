import { ref } from "@/content/refs"
import type { BookId } from "@/content/books"
import { getDeclaracao, getFato } from "./fontes"

// Janela Verde, barreira da Cultura: os grupos viram missionários
// brasileiros e visitam povos REAIS (Yanomami e Sawi). O estudo usa só fatos e
// declarações com fonte. As pistas ficam no meio, sem destaque, para o
// público; o condutor as vê destacadas. "Como poderiam ter falado" e as
// reações sugeridas são interpretação (rascunho aprovado no plano).

export type VisitaId = "yanomami" | "sawi"

export interface ItemEstudo {
  /** Fato ou declaração da fonte. */
  fato?: string
  declaracao?: string
  /** Pista ligada a este item (o público não vê a marca). */
  pista?: string
}

export interface Pista {
  id: string
  rotulo: string
  /** Como poderiam ter falado (interpretação). */
  revelacao: string
}

export interface Mensagem {
  id: string
  tipo: "versiculo" | "historia"
  ref: ReturnType<typeof ref>
  /** Texto NAA conferido (completo ou só o começo) ou resumo em paráfrase. */
  texto: string
  kind: "texto_biblico" | "parafrase"
  /** false: só o começo do versículo foi conferido; mostra "…" e o link. */
  completo: boolean
}

export interface Visita {
  id: VisitaId
  povo: string
  /** Quem visita: o grupo que era Auren vai aos Yanomami; o Nair, aos Sawi. */
  visitante: "auren" | "nair"
  quando: string
  lider: string
  lugar: string
  estudo: ItemEstudo[]
  pistas: Pista[]
  reacoes: { se: string; diga: string }[]
  mensagens: Mensagem[]
  arte: string
}

const r = (book: BookId, c: number, v1: number, v2?: number) => ref(book, c, v1, v2)

export const VISITAS: Record<VisitaId, Visita> = {
  yanomami: {
    id: "yanomami",
    povo: "Yanomami",
    visitante: "auren",
    quando: "Hoje, em Roraima e no Amazonas",
    lider: "o pata, a liderança tradicional",
    lugar: "na entrada do xapono",
    estudo: [
      { fato: "yan-xapono", pista: "patio" },
      { fato: "yan-redes" },
      { fato: "yan-visita", pista: "pata" },
      { fato: "yan-urihi" },
      { fato: "yan-jovens", pista: "cuidado" },
      { declaracao: "hekurari-ler", pista: "contar" },
      { declaracao: "dario", pista: "cuidado" },
    ],
    pistas: [
      { id: "pata", rotulo: "Falaram primeiro com o pata, a liderança", revelacao: "A rede do visitante vai ao lado do pata: apresentar-se primeiro à liderança." },
      { id: "contar", rotulo: "Contaram a história em vez de ler", revelacao: "A maioria não sabe ler: contar a história, em vez de ler o texto." },
      { id: "patio", rotulo: "Falaram no pátio, para todos", revelacao: "O xapono tem um pátio no centro: falar ali, para todos." },
      { id: "cuidado", rotulo: "Mostraram cuidado antes de pregar", revelacao: "Muitos jovens e crianças, sem remédio: mostrar cuidado e contar como Jesus acolheu as crianças." },
    ],
    reacoes: [
      { se: "Se começarem lendo um texto", diga: "Aqui quase ninguém lê. Conte para nós." },
      { se: "Se não procurarem a liderança", diga: "Vocês já falaram com o pata?" },
      { se: "Se falarem só com alguns", diga: "Aqui todos ouvem juntos, no pátio." },
    ],
    mensagens: [
      {
        id: "criancas",
        tipo: "historia",
        ref: r("Mark", 10, 13, 16),
        kind: "parafrase",
        texto: "Trouxeram crianças a Jesus para que as abençoasse. Os discípulos quiseram impedir, mas Jesus as acolheu, tomou-as nos braços e as abençoou.",
        completo: true,
      },
      {
        id: "mt-11-28",
        tipo: "versiculo",
        ref: r("Matt", 11, 28),
        kind: "texto_biblico",
        texto: "— Venham a mim todos vocês que estão cansados e sobrecarregados, e eu os aliviarei.",
        completo: true,
      },
    ],
    arte: "chefe-yanomami",
  },
  sawi: {
    id: "sawi",
    povo: "Sawi",
    visitante: "nair",
    quando: "Em 1962, quando os primeiros missionários chegaram",
    lider: "o líder da aldeia",
    lugar: "na beira do rio",
    estudo: [
      { fato: "sawi-onde" },
      { fato: "sawi-sagu" },
      { fato: "sawi-guerra", pista: "judas" },
      { fato: "sawi-paz", pista: "filho" },
    ],
    pistas: [
      { id: "filho", rotulo: "Usaram a ideia do filho da paz", revelacao: "O filho da paz: Deus entregou o próprio Filho para fazer as pazes com quem era inimigo (Jo 3:16; Rm 5:10)." },
      { id: "confianca", rotulo: "Mostraram que eram dignos de confiança", revelacao: "Quem entrega o próprio filho aos inimigos merece confiança." },
      { id: "judas", rotulo: "Tiveram cuidado ao contar a traição de Judas", revelacao: "A cultura admirava quem enganava: contada direto, a história fazia de Judas o herói." },
    ],
    reacoes: [
      { se: "Se contarem a traição de Judas sem explicar", diga: "Esse Judas foi esperto!" },
      { se: "Se travarem", diga: "Aqui, quando duas aldeias querem paz, alguém entrega um filho." },
    ],
    mensagens: [
      {
        id: "jo-3-16",
        tipo: "versiculo",
        ref: r("John", 3, 16),
        kind: "texto_biblico",
        texto: "— Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito,",
        completo: false,
      },
      {
        id: "rm-5-10",
        tipo: "versiculo",
        ref: r("Rom", 5, 10),
        kind: "texto_biblico",
        texto: "Porque, se nós, quando inimigos, fomos reconciliados com Deus mediante a morte do seu Filho,",
        completo: false,
      },
    ],
    arte: "chefe-sawi",
  },
}

export const VISITA_ORDEM: VisitaId[] = ["yanomami", "sawi"]

/** O grupo que visita e o que ouve (o outro grupo responde no celular). */
export function visitaDoGrupo(grupo: "auren" | "nair"): VisitaId {
  return grupo === "auren" ? "yanomami" : "sawi"
}

export const RESPOSTAS = [
  { id: "sim", rotulo: "Sim" },
  { id: "parte", rotulo: "Em parte" },
  { id: "nao", rotulo: "Não" },
] as const
export type RespostaId = (typeof RESPOSTAS)[number]["id"]

/** Os 3 passos do caso real dos Sawi (barreira da Cultura). */
export const SAWI_REAL = [
  { titulo: "Contaram a história de Jesus direto", declaracao: "judas-heroi" },
  { titulo: "O costume do filho da paz", fato: "sawi-paz" },
  { titulo: "Jesus, o Filho da Paz de Deus", declaracao: "confiar", depois: "steve-paz" },
] as const

export const LINHAS_CULTURA = {
  virada: "Agora vocês são missionários brasileiros.",
  desafio: "Vocês já falam a língua, mas precisam falar com o chefe da aldeia do jeito que o povo entende.",
  ideia: "Traduzir direto da minha língua, sem pensar na cultura, não funciona.",
  naVidaReal: "Na vida real, em 1962, essa foi a ponte.",
}

/** Garante, no carregamento, que todo item do estudo aponta para uma fonte. */
for (const v of Object.values(VISITAS)) {
  for (const item of v.estudo) {
    if (item.fato) getFato(item.fato)
    if (item.declaracao) getDeclaracao(item.declaracao)
  }
}
