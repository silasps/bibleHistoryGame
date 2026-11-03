import { chapters, ref } from "../../refs"
import type { ResumoExcerptInput } from "../schema"

// Resumo do autor · Semana 1 — Origens e Cosmovisão (w1-resumo.txt).
// O parágrafo do PRD está em src/content/released/overview.ts (server-only).
export const resumo01: ResumoExcerptInput[] = [
  {
    id: "r01-intro",
    week: 1,
    text: "O livro de Gênesis se divide em 2 partes macros: a criação e a aliança de Deus com esta criação. Mas qual o porquê dessa aliança?",
    stageLine: "Gênesis se divide em duas partes: a criação e a aliança de Deus com esta criação. Mas por que essa aliança?",
    refs: [chapters("Gen", 1, 11), chapters("Gen", 12, 50)],
  },
  {
    id: "r01-criacao",
    week: 1,
    text: "Deus cria e organiza, de forma esplêndida, todas as coisas.",
    stageLine: "Deus cria e organiza, de forma esplêndida, todas as coisas.",
    refs: [chapters("Gen", 1, 2)],
    itemIds: ["criacao"],
  },
  {
    // Mesma frase do resumo, separada no ponto final: o fato f1 fica fora do palco.
    id: "r01-humanidade",
    week: 1,
    text: "Cria o jardim do Éden e coloca nele a Humanidade, que em grego quer dizer “Adão”.",
    refs: [ref("Gen", 2, 8)],
    itemIds: ["adao-eva"],
    pendingFact: "f1",
  },
  {
    id: "r01-limite",
    week: 1,
    text: "Depois deu instruções claras para o homem sobre o que deveria fazer, inclusive a limitação: “mas da árvore do conhecimento do bem e do mal você não deve comer…”.",
    stageLine: "Deus dá ao homem instruções claras, inclusive um limite: a árvore do conhecimento do bem e do mal.",
    refs: [ref("Gen", 2, 16, 17)],
    itemIds: ["adao-eva"],
  },
  {
    id: "r01-queda",
    week: 1,
    text: "Acontece que a serpente engana o homem e a mulher dizendo que o fruto é bom. O homem, então, desobedece a Deus, tanto ele quanto a mulher que Deus havia criado para ele, e comem o fruto que Deus tinha proibido. Por causa dessa desobediência do homem o mal entra no mundo e cria uma grande desordem que precisa de redenção.",
    stageLine: "Por causa da desobediência, o mal entra no mundo e cria uma grande desordem que precisa de redenção.",
    refs: [ref("Gen", 3, 1, 7)],
    itemIds: ["queda"],
  },
  {
    id: "r01-consequencias",
    week: 1,
    text: "Por causa do que fizeram receberam consequências, e a mulher e a serpente receberam a seguinte consequência: Gênesis 3:15.",
    refs: [ref("Gen", 3, 14, 19)],
    itemIds: ["queda"],
  },
  {
    id: "r01-noe",
    week: 1,
    text: "A Humanidade ia indo de mal a pior, então Deus escolheu alguns homens para fazer aliança neste cenário de grandes potências se desenvolvendo, como a Babilônia e o Egito. Deus escolhe Noé…",
    stageLine: "A humanidade ia de mal a pior; Deus escolhe alguns homens para fazer aliança — primeiro, Noé.",
    refs: [ref("Gen", 6, 5, 8), ref("Gen", 9, 9, 13)],
    itemIds: ["noe", "diluvio"],
  },
  {
    id: "r01-patriarcas",
    week: 1,
    text: "…depois Abraão, Isaque e Jacó, e promete abençoar todas as famílias da terra a partir da descendência de Abraão.",
    stageLine: "Deus promete abençoar todas as famílias da terra a partir da descendência de Abraão.",
    refs: [ref("Gen", 12, 1, 3), ref("Gen", 26, 3, 4), ref("Gen", 28, 13, 14)],
    itemIds: ["alianca-abraamica", "abraao", "isaque", "jaco"],
  },
  {
    id: "r01-egito",
    week: 1,
    text: "Deus permite que o povo de Israel passe 400 anos sob o império egípcio, talvez para que seu povo presenciasse este povo adorando outros deuses e, no processo de tirá-los do Egito, mostra grande poder com pragas que derrotavam qualquer “poder” que era atribuído aos que eles consideravam mais poderosos deles.",
    stageLine: "Ao tirar o povo do Egito, Deus mostra grande poder com pragas que derrotam os “poderes” do Egito.",
    refs: [ref("Gen", 15, 13), ref("Exod", 12, 40), chapters("Exod", 7, 11)],
    itemIds: ["tempo-egito", "exodo"],
    pendingFact: "f2",
  },
  {
    id: "r01-deserto",
    week: 1,
    text: "Deus tirou cerca de 2,2 milhões de pessoas do Egito, mas leva 40 anos para tirar o Egito deles. Neste processo estabelece algumas leis, institui o tabernáculo e toda sua estrutura, a forma como foi se movimentando pelo deserto com eles, entre outras coisas, para ensiná-los sobre como uma nação que o representaria deveria se portar para que pudesse abençoar todas as nações da terra.",
    stageLine: "Deus tira o povo do Egito, mas leva 40 anos para tirar o Egito do povo.",
    refs: [ref("Num", 1, 46), ref("Num", 14, 33, 34), chapters("Exod", 25, 40)],
    itemIds: ["exodo", "moises"],
    pendingFact: "f3",
  },
]
