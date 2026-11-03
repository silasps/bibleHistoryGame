import { ref } from "../../refs"
import type { ResumoExcerptInput } from "../schema"

// Resumo do autor · Semana 6 — Últimos Profetas (w6-resumo.txt; ainda parcial).
export const resumo06: ResumoExcerptInput[] = [
  {
    id: "r06-intro",
    week: 6,
    text: "Vamos terminar agora a saga dos profetas, mostrando o que eles vinham trazendo da parte do Senhor para o povo, começando por dois profetas menores marcantes para todo esse processo de alerta e juízo de Deus sobre o povo.",
    stageLine: "O fim da saga dos profetas: o que eles traziam da parte do Senhor para o povo.",
  },
  {
    id: "r06-sofonias-linhagem",
    week: 6,
    text: "Sofonias era um profeta vindo de uma linhagem real, tataraneto de Ezequias.",
    refs: [ref("Zeph", 1, 1)],
    itemIds: ["sofonias"],
    pendingFact: "f16",
  },
  {
    id: "r06-sofonias",
    week: 6,
    text: "Sua mensagem traz três abordagens: um olhar para dentro, a própria nação; um olhar para fora, as nações vizinhas; e um olhar para o futuro, aquilo que Deus faria com seu remanescente. O propósito da sua mensagem era mostrar o juízo de Deus caso não houvesse arrependimento e, se o juízo viesse, a restauração prometida para o remanescente.",
    stageLine: "Sofonias olha para dentro, para fora e para o futuro: juízo sem arrependimento — e restauração para o remanescente.",
    refs: [ref("Zeph", 1, 3), ref("Zeph", 3, 18, 20)],
    itemIds: ["sofonias"],
  },
  {
    id: "r06-sofonias-josias",
    week: 6,
    text: "No mesmo período em que ele estava profetizando, o rei Josias estava fazendo a reforma religiosa na nação, mas mesmo com a reforma ainda havia lugares de adoração a Baal. Sofonias profetiza a queda da Assíria, uma grande potência dessa época, que já dominava o Norte de Israel. A mensagem que Deus traz através de Sofonias não é para trazer medo às pessoas, mas para gerar temor, para que elas se arrependam.",
    stageLine: "Mesmo com a reforma de Josias, ainda havia altares a Baal — e Sofonias chama ao arrependimento.",
    refs: [ref("Zeph", 1, 4), ref("Zeph", 2, 13)],
    itemIds: ["josias", "sofonias"],
  },
  {
    id: "r06-habacuque",
    week: 6,
    text: "Outro profeta muito conhecido e marcante é Habacuque. “Sofonias declara que Deus agirá com juízo justo. Habacuque pergunta por que Ele age assim.” (Prof. Diego) Habacuque profetiza às vésperas da invasão da Babilônia em Judá. Diante de Judá em decadência espiritual, violência, injustiça e corrupção, e da Babilônia (os caldeus) crescendo como império, ele começa a questionar o Senhor o porquê de tudo aquilo estar acontecendo.",
    stageLine: "Às vésperas da invasão da Babilônia, Habacuque pergunta ao Senhor: por quê?",
    refs: [ref("Hab", 1, 2), ref("Hab", 1, 6)],
    itemIds: ["habacuque", "babilonia"],
    corrections: ["c9"],
  },
  {
    id: "r06-habacuque-fe",
    week: 6,
    text: "O Senhor responde a Habacuque e mostra quais são seus planos, e diz que, em meio a toda essa adversidade, “o justo viverá pela sua fé”. Agora que Habacuque entendeu o que Deus está fazendo, sua postura muda, e ele começa a mostrar como seu coração está descansado no Senhor em qualquer situação que estiver por vir.",
    stageLine: "Deus responde: “o justo viverá pela sua fé” — e o coração de Habacuque descansa no Senhor.",
    refs: [ref("Hab", 2, 4), ref("Hab", 3, 17, 19)],
    itemIds: ["habacuque"],
    corrections: ["c9"],
  },
]
