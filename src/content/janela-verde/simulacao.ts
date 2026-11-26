// Janela Verde: a dinâmica Auren × Nair (do documento da equipe, parte da
// Kézia). Povos SIMULADOS: as regras são inventadas para a dinâmica e não
// descrevem nenhum povo real. Textos do documento, só com acentos corrigidos.

export type GrupoId = "auren" | "nair"

export const DEFINICAO =
  "A Janela Verde é uma expressão utilizada no contexto missionário para destacar regiões de florestas tropicais próximas à linha do Equador, onde existem povos com pouco acesso ao Evangelho."

export const ISOLAMENTO = [
  {
    titulo: "A. Regiões de florestas tropicais",
    itens: [
      "Deslocamento difícil e caro.",
      "Diversidade de povos e línguas.",
      "Acesso limitado à educação, à saúde e a materiais bíblicos em algumas comunidades.",
      "Necessidade de relacionamentos duradouros com os povos locais.",
    ],
  },
  {
    titulo: "B. Regiões de ilhas",
    itens: [
      "Comunidades separadas geograficamente.",
      "Diferentes idiomas, tradições e crenças.",
      "Custos elevados para visitas frequentes.",
      "Necessidade de adaptar a comunicação do Evangelho a cada contexto cultural.",
    ],
  },
]

/** Abertura da dinâmica, parágrafo por parágrafo (documento). */
export const LINGUA_INTRO = [
  "Imaginem que vocês estão em uma região onde existem dois povos que nunca tiveram contato um com o outro.",
  "Os dois povos vivem no mesmo território, mas desenvolveram línguas, costumes e maneiras de enxergar o mundo completamente diferentes.",
  "Recentemente, surgiu uma situação que exige que eles se comuniquem. Um dos povos possui algo de que o outro precisa, mas, para que a troca aconteça, será necessário construir uma relação de confiança.",
  "Vocês terão alguns minutos para conhecer a cultura do seu próprio povo. Depois, receberão visitantes do outro grupo.",
  "Existe um objetivo que vocês precisam alcançar, mas vocês não poderão simplesmente explicar suas regras em português. Terão que se comunicar da maneira que conhecem.",
  "Vocês não são inimigos. Mas ainda não sabem disso.",
]

export const NAO_SAO_INIMIGOS = "Vocês não são inimigos. Mas ainda não sabem disso."

export interface Cultura {
  id: GrupoId
  nome: string
  titulo: string
  visao: string
  regras: { nome: string; texto: string }[]
  palavras: { palavra: string; sentido: string }[]
  resto: string
  semPortugues: string
  missao: string
}

export const CULTURAS: Record<GrupoId, Cultura> = {
  auren: {
    id: "auren",
    nome: "Auren",
    titulo: "A cultura da honra e da proximidade",
    visao: "Vocês acreditam que uma pessoa só é confiável quando demonstra interesse, proximidade e disposição para compartilhar a vida.",
    regras: [
      { nome: "Cumprimento", texto: "vocês tocam levemente o próprio ombro e depois o ombro da outra pessoa, se ela permitir." },
      { nome: "Respeito", texto: "olhar nos olhos demonstra sinceridade. Desviar o olhar significa que a pessoa está escondendo algo." },
      { nome: "Amizade", texto: "vocês ficam próximos enquanto conversam. Manter distância parece rejeição." },
      { nome: "Agradecimento", texto: "quando recebem algo, fazem um gesto de mãos abertas em direção à pessoa." },
      { nome: "Confiança", texto: "antes de negociar, vocês precisam saber o nome do visitante e descobrir algo de que ele gosta." },
      { nome: "Desconfiança", texto: "pessoas que não aceitam proximidade ou evitam contato visual parecem frias e pouco confiáveis." },
    ],
    palavras: [
      { palavra: "Aru", sentido: "amigo" },
      { palavra: "Meka", sentido: "compartilhar" },
      { palavra: "Tovan", sentido: "perigo" },
    ],
    resto: "Todo o restante da comunicação acontece por gestos, expressões e demonstrações de afeto.",
    semPortugues: "Vocês não podem explicar suas regras em português.",
    missao: "Vocês precisam conseguir que os visitantes aceitem compartilhar um objeto com vocês. Antes disso, devem demonstrar que eles podem confiar no seu povo.",
  },
  nair: {
    id: "nair",
    nome: "Nair",
    titulo: "A cultura da honra e da distância",
    visao: "Vocês acreditam que uma pessoa só é confiável quando demonstra autocontrole, paciência e respeito pelo espaço do outro. Para vocês, a intimidade precisa ser conquistada lentamente.",
    regras: [
      { nome: "Cumprimento", texto: "vocês colocam a mão sobre o próprio peito e inclinam levemente a cabeça. Tocar outra pessoa sem permissão é ofensivo." },
      { nome: "Respeito", texto: "olhar fixamente nos olhos de alguém é considerado uma tentativa de intimidação. Pessoas respeitosas desviam levemente o olhar." },
      { nome: "Amizade", texto: "vocês mantêm uma distância de aproximadamente um braço enquanto conversam." },
      { nome: "Agradecimento", texto: "quando recebem algo, colocam a mão sobre o peito e abaixam a cabeça." },
      { nome: "Confiança", texto: "antes de negociar, vocês precisam observar se o visitante consegue esperar em silêncio e respeitar seus limites." },
      { nome: "Desconfiança", texto: "pessoas que se aproximam demais, tocam vocês ou insistem em contato visual parecem invasivas e perigosas." },
    ],
    palavras: [
      { palavra: "Sena", sentido: "amigo" },
      { palavra: "Veli", sentido: "compartilhar" },
      { palavra: "Kor", sentido: "perigo" },
    ],
    resto: "Todo o restante da comunicação acontece por gestos, expressões e demonstrações de respeito.",
    semPortugues: "Vocês não podem explicar suas regras em português.",
    missao: "Vocês precisam conseguir que os visitantes aceitem compartilhar um objeto com vocês. Antes disso, devem demonstrar que são dignos de confiança.",
  },
}

/** Revelação: a comparação condensada (rascunho aprovado no plano). */
export const COMPARACAO: { tema: string; auren: string; nair: string }[] = [
  { tema: "Cumprimento", auren: "Toca o ombro", nair: "Mão no peito" },
  { tema: "Olhar", auren: "Olho no olho", nair: "Olhar baixo" },
  { tema: "Distância", auren: "Perto", nair: "Um braço" },
  { tema: "Agradecer", auren: "Mãos abertas", nair: "Mão no peito" },
  { tema: "Confiança", auren: "O nome e o gosto", nair: "Esperar em silêncio" },
]

export const MESMAS_PALAVRAS = "As palavras eram as mesmas."

export const PERGUNTAS: { id: string; grupo: "experiencia" | "missionaria"; texto: string }[] = [
  { id: "p1", grupo: "experiencia", texto: "Em que momento vocês começaram a se sentir frustrados?" },
  { id: "p2", grupo: "experiencia", texto: "Alguém interpretou o comportamento do outro como falta de educação, desinteresse ou hostilidade?" },
  { id: "p3", grupo: "experiencia", texto: "Vocês tentaram compreender o outro ou esperavam que ele se comportasse como vocês?" },
  { id: "p4", grupo: "experiencia", texto: "Quando perceberam que o outro não estava entendendo, vocês mudaram a maneira de se comunicar ou apenas repetiram o que já estavam fazendo?" },
  { id: "p5", grupo: "experiencia", texto: "O que mudou quando vocês começaram a observar, em vez de apenas tentar falar?" },
  { id: "p6", grupo: "experiencia", texto: "Como foi perceber que uma atitude que vocês consideravam respeitosa era interpretada de maneira completamente diferente?" },
  { id: "p7", grupo: "missionaria", texto: "Se foi difícil compreender pessoas que falavam português e estavam tentando interagir conosco, como seria chegar a um povo cuja língua não conhecemos?" },
  { id: "p8", grupo: "missionaria", texto: "O que acontece quando um missionário interpreta os costumes de um povo a partir dos próprios valores?" },
  { id: "p9", grupo: "missionaria", texto: "Será que uma pessoa pode não compreender a mensagem do evangelho porque ela foi comunicada de uma forma que não faz sentido para seu contexto?" },
  { id: "p10", grupo: "missionaria", texto: "O que precisamos aprender sobre um povo antes de comunicar a mensagem de Cristo a ele?" },
  { id: "p11", grupo: "missionaria", texto: "Como podemos demonstrar amor e respeito por uma cultura sem abrir mão da mensagem bíblica?" },
]

/** As 3 que já vêm marcadas (o condutor troca na hora). */
export const PERGUNTAS_PADRAO = ["p2", "p5", "p7"]

export const GRUPO_LABEL = "povos simulados"
