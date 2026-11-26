import { ref } from "@/content/refs"
import { getDeclaracao, getFato, type Regiao } from "./fontes"

// Janela Verde: os cards de oração. Cada card traz uma declaração real (ou um
// fato, com fonte) e, embaixo, o pedido. Pedidos são rascunho aprovado no
// plano; as declarações e os fatos vêm de `fontes.ts`.

export interface CardOracao {
  id: string
  regiao: Regiao
  declaracao?: string
  fato?: string
  /** Trecho bíblico conferido (NAA) ou pergunta do documento. */
  texto?: { texto: string; ref?: ReturnType<typeof ref>; kind: "texto_biblico" | "narracao" }
  pedido: string
}

export type OracaoId = "isolamento" | "lingua" | "cultura" | "discipulado"

export const ORACOES: Record<OracaoId, { titulo: string; cards: CardOracao[]; quebra: string }> = {
  isolamento: {
    titulo: "Oração: isolamento",
    cards: [
      { id: "criancas", regiao: "amazonia", declaracao: "hekurari-criancas", pedido: "Ore pela saúde das crianças Yanomami." },
      { id: "ficar", regiao: "amazonia", declaracao: "dario", pedido: "Ore por pessoas que cheguem e fiquem, com remédio, cuidado e a Palavra." },
      { id: "javari", regiao: "amazonia", declaracao: "beto-marubo", pedido: "Ore pelos povos isolados do Vale do Javari: proteção da vida e do território." },
      { id: "terra", regiao: "amazonia", fato: "yan-garimpo", pedido: "Ore pela proteção da terra e dos rios Yanomami." },
    ],
    quebra: "Oramos, e Deus abriu o caminho.",
  },
  lingua: {
    titulo: "Oração: língua",
    cards: [
      { id: "ler", regiao: "africa", declaracao: "hekurari-ler", fato: "baka-leitura", pedido: "Ore pela alfabetização na língua materna." },
      { id: "traduzir", regiao: "africa", fato: "baka-biblia", pedido: "Ore pelos tradutores e pelos cristãos Baka que traduzem a Bíblia." },
      { id: "linguas", regiao: "asia", fato: "png-linguas", pedido: "Ore pelas línguas que ainda esperam a Bíblia." },
    ],
    quebra: "Oramos, e de forma milagrosa aprendi a língua.",
  },
  cultura: {
    titulo: "Oração: cultura",
    cards: [
      { id: "pontes", regiao: "asia", declaracao: "steve-paz", pedido: "Ore por missionários que observem antes de falar e encontrem as pontes de cada cultura." },
      {
        id: "respeito",
        regiao: "todas",
        texto: { texto: "Como podemos demonstrar amor e respeito por uma cultura sem abrir mão da mensagem bíblica?", kind: "narracao" },
        pedido: "Ore por amor e respeito à cultura sem abrir mão da mensagem bíblica.",
      },
    ],
    quebra: "Oramos, e a barreira da cultura caiu.",
  },
  discipulado: {
    titulo: "Oração: discipulado",
    cards: [
      { id: "ficar-anos", regiao: "asia", fato: "sawi-50", pedido: "Ore por missionários que fiquem por anos, até a igreja andar sozinha." },
      { id: "ensinar", regiao: "amazonia", declaracao: "terena", pedido: "Ore por quem ensine a Palavra e forme discípulos." },
      { id: "terceira-onda", regiao: "todas", declaracao: "sawi-missao", pedido: "Ore pelas igrejas Sawi e por cristãos indígenas que levem o Evangelho a outros povos." },
      {
        id: "seara",
        regiao: "todas",
        texto: { texto: "— A seara é grande, mas os trabalhadores são poucos.", ref: ref("Matt", 9, 37), kind: "texto_biblico" },
        pedido: "Ore ao Senhor da seara por trabalhadores para a seara.",
      },
    ],
    quebra: "Oramos. A semente foi plantada.",
  },
}

export const COMPROMISSOS = [
  { id: "orar-povos", texto: "Vou orar pelos Yanomami, pelos Baka e pelos Sawi." },
  { id: "orar-missionarios", texto: "Vou orar pelos missionários que estão lá." },
  { id: "discipular", texto: "Quero discipular alguém onde estou." },
  { id: "ir", texto: "Eis-me aqui, envia-me.", ref: ref("Isa", 6, 8) },
] as const
export type CompromissoId = (typeof COMPROMISSOS)[number]["id"]

/** Mt 9:37, NAA, trecho conferido. */
export const SEARA = { texto: "— A seara é grande, mas os trabalhadores são poucos.", ref: ref("Matt", 9, 37) }

for (const o of Object.values(ORACOES)) {
  for (const c of o.cards) {
    if (c.declaracao) getDeclaracao(c.declaracao)
    if (c.fato) getFato(c.fato)
  }
}
