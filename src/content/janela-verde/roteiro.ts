import { z } from "zod"
import { PERGUNTAS_PADRAO, LINGUA_INTRO, COMPARACAO } from "./simulacao"
import { ORACOES, type OracaoId } from "./oracoes"
import { SAWI_REAL, type VisitaId } from "./cultura"

// Janela Verde: o roteiro em ordem. Cada etapa tem uma marca (explicação,
// dinâmica ou oração), um tempo previsto e, quando dá, cortes de emergência.
// Orçamento: 45 min + 5 de folga (limite: 50).

export const LIMITE_MIN = 50
export const ORCAMENTO_MIN = 45

export type Marca = "explicacao" | "dinamica" | "oracao"

export const MARCAS: Record<Marca, { rotulo: string; curto: string; cor: string }> = {
  explicacao: { rotulo: "Explicação", curto: "Ouvir", cor: "#9fb7d9" },
  dinamica: { rotulo: "Dinâmica", curto: "Participar", cor: "#e0866c" },
  oracao: { rotulo: "Hora de orar", curto: "Orar", cor: "#f4d27a" },
}

/** As 4 barreiras da jornada. */
export const BARREIRAS = [
  { n: 1, nome: "Isolamento", arte: "barreira-rio", antes: "Eles estão longe, e o caminho está fechado.", regiao: "amazonia" },
  { n: 2, nome: "Língua", arte: "barreira-lingua", antes: "Cheguei. Mas não entendo uma palavra.", regiao: "africa" },
  { n: 3, nome: "Cultura", arte: "barreira-cultura", antes: "Agora vocês são missionários brasileiros.", regiao: "asia" },
  { n: 4, nome: "Permanência", arte: "barreira-semente", antes: "Agora falo a língua e entendo a cultura. Mas preciso ficar.", regiao: "todas" },
] as const

export type Tela =
  | { tipo: "grupos" }
  | { tipo: "abertura" }
  | { tipo: "isolamento" }
  | { tipo: "fatos"; fatos: string[][]; titulo: string }
  | { tipo: "oracao"; oracao: OracaoId }
  | { tipo: "lingua" }
  | { tipo: "conhecer" }
  | { tipo: "encontro" }
  | { tipo: "comparacao" }
  | { tipo: "reflexao" }
  | { tipo: "cultura" }
  | { tipo: "preparo" }
  | { tipo: "visita"; visita: VisitaId }
  | { tipo: "revelacao" }
  | { tipo: "sawi" }
  | { tipo: "permanencia" }
  | { tipo: "compromisso" }
  | { tipo: "fim" }

export interface Corte {
  id: string
  texto: string
  economiza: number
  /** Novo número de itens da etapa. */
  itens?: number
  /** Novo tempo do relógio (min). */
  relogio?: number
  /** Primeiro item a mostrar (ex.: só a última linha da comparação). */
  desde?: number
}

export interface Etapa {
  id: string
  /** 0 = abertura; 1 a 4 = as barreiras. */
  bloco: 0 | 1 | 2 | 3 | 4
  marca: Marca
  titulo: string
  minutos: number
  conduz?: string
  tela: Tela
  /** Quantos itens o condutor vai abrindo (cada toque em Avançar). */
  itens: number
  /** Relógio da dinâmica, em minutos. */
  relogio?: number
  /** Nota só para o condutor. */
  nota?: string
  cortes?: Corte[]
  arte?: string
}

const cardsDe = (o: OracaoId) => ORACOES[o].cards.length

/** Itens de uma oração: os cards e, por fim, a barreira caindo. */
const oracao = (id: string, bloco: Etapa["bloco"], o: OracaoId, minutos: number): Etapa => ({
  id,
  bloco,
  marca: "oracao",
  titulo: ORACOES[o].titulo,
  minutos,
  tela: { tipo: "oracao", oracao: o },
  itens: cardsDe(o) + 1,
  arte: "oracao",
  nota: "Cada card: leiam a declaração, orem e o grupo toca “Oramos”. O último toque em Avançar abre a barreira.",
  cortes: cardsDe(o) > 2 ? [{ id: `${id}-2cards`, texto: "Só 2 cards", economiza: 1, itens: 3 }] : undefined,
})

export const ROTEIRO: Etapa[] = [
  { id: "grupos", bloco: 0, marca: "dinamica", titulo: "Formar os grupos", minutos: 1, tela: { tipo: "grupos" }, itens: 1, arte: "capa", nota: "Dividam a sala em Grupo Auren e Grupo Nair. Um celular por grupo lê o QR." },
  { id: "abertura", bloco: 0, marca: "explicacao", titulo: "Abertura", minutos: 1, tela: { tipo: "abertura" }, itens: 2, arte: "capa" },
  { id: "isolamento", bloco: 1, marca: "explicacao", titulo: "Barreira 1: Isolamento", minutos: 1.5, tela: { tipo: "isolamento" }, itens: 3, arte: "barreira-rio" },
  {
    id: "isolamento-real",
    bloco: 1,
    marca: "explicacao",
    titulo: "Na vida real: Yanomami e Javari",
    minutos: 1.5,
    tela: { tipo: "fatos", titulo: "Na vida real", fatos: [["yan-terra", "yan-censo", "yan-garimpo"], ["jav-terra", "jav-isolados", "bra-isolados"]] },
    itens: 2,
    arte: "yanomami-xapono",
  },
  oracao("oracao-isolamento", 1, "isolamento", 3),
  { id: "lingua", bloco: 2, marca: "explicacao", titulo: "Barreira 2: Língua", minutos: 1, conduz: "Kézia", tela: { tipo: "lingua" }, itens: LINGUA_INTRO.length + 1, arte: "barreira-lingua" },
  { id: "conhecer", bloco: 2, marca: "dinamica", titulo: "Conheçam o seu povo", minutos: 2, conduz: "Kézia", tela: { tipo: "conhecer" }, itens: 1, relogio: 2, nota: "Cada grupo lê o card secreto no celular. Ninguém conta para o outro grupo." },
  { id: "encontro", bloco: 2, marca: "dinamica", titulo: "O encontro", minutos: 5, conduz: "Kézia", tela: { tipo: "encontro" }, itens: 1, relogio: 5, arte: "encontro", nota: "Alguns de cada grupo visitam o outro. Só as 3 palavras e gestos." },
  {
    id: "comparacao",
    bloco: 2,
    marca: "explicacao",
    titulo: "Revelação da Língua",
    minutos: 1,
    conduz: "Kézia",
    tela: { tipo: "comparacao" },
    itens: COMPARACAO.length + 1,
    cortes: [{ id: "comparacao-palavras", texto: "Só as palavras", economiza: 0.5, desde: COMPARACAO.length }],
  },
  {
    id: "reflexao",
    bloco: 2,
    marca: "explicacao",
    titulo: "Reflexão",
    minutos: 3,
    conduz: "Kézia",
    tela: { tipo: "reflexao" },
    itens: PERGUNTAS_PADRAO.length,
    nota: "Escolham as perguntas na aba Palco.",
    cortes: [{ id: "reflexao-1", texto: "Só 1 pergunta", economiza: 2, itens: 1 }],
  },
  {
    id: "baka",
    bloco: 2,
    marca: "explicacao",
    titulo: "Na vida real: Baka",
    minutos: 1,
    tela: { tipo: "fatos", titulo: "Na vida real", fatos: [["baka-pop", "baka-biblia", "baka-leitura"], ["png-linguas"]] },
    itens: 2,
    arte: "baka-mongulu",
    cortes: [{ id: "baka-1", texto: "Um card só", economiza: 0.5, itens: 1 }],
  },
  oracao("oracao-lingua", 2, "lingua", 3),
  { id: "cultura", bloco: 3, marca: "explicacao", titulo: "Barreira 3: Cultura", minutos: 1, conduz: "Silas", tela: { tipo: "cultura" }, itens: 3, arte: "missionarios" },
  {
    id: "preparo",
    bloco: 3,
    marca: "dinamica",
    titulo: "Preparem a visita",
    minutos: 3,
    conduz: "Silas",
    tela: { tipo: "preparo" },
    itens: 1,
    relogio: 3,
    nota: "Cada grupo lê as mensagens e o estudo do povo e escolhe quem vai falar com o chefe.",
    cortes: [{ id: "preparo-2", texto: "Preparo de 2 min", economiza: 1, relogio: 2 }],
  },
  { id: "visita-yanomami", bloco: 3, marca: "dinamica", titulo: "Visita aos Yanomami", minutos: 2.5, conduz: "Silas", tela: { tipo: "visita", visita: "yanomami" }, itens: 3, relogio: 2, arte: "yanomami-xapono", nota: "1º toque: a chegada. 2º: os 2 min de fala (liguem o relógio). 3º: as respostas." },
  { id: "visita-sawi", bloco: 3, marca: "dinamica", titulo: "Visita aos Sawi", minutos: 2.5, conduz: "Silas", tela: { tipo: "visita", visita: "sawi" }, itens: 3, relogio: 2, arte: "sawi-pantano", nota: "1º toque: a chegada. 2º: os 2 min de fala (liguem o relógio). 3º: as respostas." },
  { id: "revelacao", bloco: 3, marca: "explicacao", titulo: "A revelação", minutos: 1.5, conduz: "Silas", tela: { tipo: "revelacao" }, itens: 2 },
  { id: "sawi-real", bloco: 3, marca: "explicacao", titulo: "Na vida real: tradução direta não funciona", minutos: 2, conduz: "Silas", tela: { tipo: "sawi" }, itens: SAWI_REAL.length, arte: "sawi-paz" },
  oracao("oracao-cultura", 3, "cultura", 3),
  { id: "permanencia", bloco: 4, marca: "explicacao", titulo: "Barreira 4: Permanência", minutos: 1, tela: { tipo: "permanencia" }, itens: 2, arte: "barreira-semente" },
  oracao("oracao-discipulado", 4, "discipulado", 2.5),
  { id: "compromisso", bloco: 4, marca: "oracao", titulo: "Compromisso: eu fico", minutos: 1, tela: { tipo: "compromisso" }, itens: 1, arte: "discipulado" },
  { id: "fim", bloco: 4, marca: "oracao", titulo: "Encerramento", minutos: 1, tela: { tipo: "fim" }, itens: 1, arte: "colheita" },
]

const ROTEIRO_SCHEMA = z.array(
  z.object({
    id: z.string(),
    marca: z.enum(["explicacao", "dinamica", "oracao"]),
    minutos: z.number().positive(),
    itens: z.number().int().positive(),
  }),
)
ROTEIRO_SCHEMA.parse(ROTEIRO)

export const ETAPA_IDS = ROTEIRO.map((e) => e.id)

export function etapaPorId(id: string): Etapa | undefined {
  return ROTEIRO.find((e) => e.id === id)
}

export const CORTES = ROTEIRO.flatMap((e) => (e.cortes ?? []).map((c) => ({ ...c, etapa: e.id })))
