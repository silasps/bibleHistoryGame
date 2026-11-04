import { ref } from "../refs"

// Falas do AUTOR para os momentos das etapas (comentários dele, 2026-11-03).
// `text` é a frase dele; `stageLine` (e `steps`) são condensadas das mesmas
// palavras para a tela. Leituras dele que vão além do texto bíblico ficam
// marcadas como `interpretacao`. `cn`: o Caráter e Natureza de Deus que ele
// destaca no momento (aparece como selo na tela).

export interface Fala {
  text: string
  stageLine: string
  /** Linhas extras que o apresentador revela com "Aprofundar". */
  steps?: string[]
  kind: "interpretacao" | "narracao"
  refs: ReturnType<typeof ref>[]
  cn?: string
}

export const FALAS = {
  // Etapa 1 · O começo
  vestes: {
    text: "Deus faz o primeiro sacrifício para vestir o homem e mostra sua bondade em não deixar o homem do jeito que ele ficou após a desobediência.",
    stageLine: "Deus faz o primeiro sacrifício para vestir o homem: Ele não deixa o homem do jeito que ficou.",
    kind: "interpretacao",
    refs: [ref("Gen", 3, 21)],
    cn: "Bondade",
  },
  fora: {
    text: "Deus é santo, e quando o homem come do fruto, Deus não pode mais ficar junto com ele, porque ele pecou. A maior recompensa da vida dele, que era a vida eterna, ele perde.",
    stageLine: "Deus é santo, e o homem pecou: a maior recompensa da vida dele, a vida eterna, ficou para trás.",
    kind: "interpretacao",
    refs: [ref("Gen", 3, 22, 24)],
    cn: "Santo",
  },

  // Etapa 2 · O mundo se afasta
  "bondade-juizo": {
    text: "No dilúvio, a ênfase está na bondade de Deus, no caráter dele, que é bom e amoroso, porque o amor é fazer o bem maior para todos sem egoísmo. Quando Deus traz juízo sobre a humanidade, a humanidade já tinha colocado esse juízo sobre si mesma. Deus só executa o juízo por causa da sua bondade, porque ele pensava em toda a criação: se o homem continuasse daquele jeito, ia destruir toda a criação.",
    stageLine: "Deus é bom e amoroso: Ele executa o juízo pensando em toda a criação, que o homem ia destruir.",
    steps: ["O amor é fazer o bem maior para todos, sem egoísmo.", "A humanidade já tinha colocado o juízo sobre si mesma."],
    kind: "interpretacao",
    refs: [ref("Gen", 6, 5), ref("Gen", 6, 11, 13)],
    cn: "Bom e amoroso",
  },
  "arco-iris": {
    text: "Deus faz a primeira aliança com o arco-íris no céu.",
    stageLine: "Deus faz a primeira aliança, com o arco-íris no céu.",
    kind: "narracao",
    refs: [ref("Gen", 9, 12, 13)],
  },
  "noe-caido": {
    text: "A narrativa segue e mostra que Noé também erra. Logo depois de sair da arca, ele está ali jogado no chão, como se fosse um segundo Adão. Tinha sido escolhido pelo Senhor e agora está ali, bêbado, jogado. A natureza caída do homem ainda estava levando ele para esse lugar de destruição, de autodestruição.",
    stageLine: "Noé também erra: escolhido pelo Senhor, agora está caído, bêbado, como um segundo Adão.",
    steps: ["A natureza caída do homem ainda o levava para a autodestruição."],
    kind: "interpretacao",
    refs: [ref("Gen", 9, 20, 21)],
  },

  // Etapa 3 · A promessa
  "promessa-demora": {
    text: "Deus chama um homem chamado Abraão e promete para ele um filho, Isaque. Uma promessa que demora a acontecer, mas que, assim como toda promessa de Deus, se cumpre.",
    stageLine: "Deus promete a Abraão um filho. A promessa demora, mas, como toda promessa de Deus, se cumpre.",
    kind: "narracao",
    refs: [ref("Gen", 15, 4), ref("Gen", 21, 1, 2)],
  },
  "doze-filhos": {
    text: "Depois de Isaque vem Jacó. De Jacó vêm 12 filhos, dos quais um deles era José, que foi vendido pelos seus irmãos como escravo e foi parar no Egito.",
    stageLine: "De Jacó vêm 12 filhos. Um deles, José, é vendido pelos irmãos como escravo e vai parar no Egito.",
    kind: "narracao",
    refs: [ref("Gen", 35, 22, 26), ref("Gen", 37, 28)],
  },
  "jose-governador": {
    text: "No Egito, José se tornou governador. Aqui a gente vê o caráter de Deus, protetor e zeloso: zeloso pela sua palavra e pela sua promessa.",
    stageLine: "No Egito, José se torna governador. Deus é protetor e zeloso pela sua palavra e pela sua promessa.",
    kind: "interpretacao",
    refs: [ref("Gen", 41, 41)],
    cn: "Protetor e zeloso",
  },

  // Etapa 4 · No Egito
  "fome-acolhida": {
    text: "Num tempo de muita fome em toda aquela região, o povo de Israel foi recebido no Egito, onde havia fartura por causa da sabedoria que Deus tinha dado a José para governar.",
    stageLine: "Na fome, Israel é recebido no Egito, onde havia fartura pela sabedoria que Deus deu a José.",
    kind: "narracao",
    refs: [ref("Gen", 41, 53, 57), ref("Gen", 47, 11, 12)],
  },
  "novo-farao": {
    text: "Mas vem um outro faraó, que não conhecia José, se incomoda com o crescimento do povo e dá a sentença de matar todo menino que nascesse.",
    stageLine: "Um novo faraó, que não conhecia José, se incomoda com o crescimento do povo e manda matar os meninos.",
    kind: "narracao",
    refs: [ref("Exod", 1, 8, 16)],
  },
  "moises-protegido": {
    text: "Mas Deus protege um menino chamado Moisés, que no futuro seria o libertador desse povo.",
    stageLine: "Mas Deus protege um menino chamado Moisés, que no futuro seria o libertador desse povo.",
    kind: "narracao",
    refs: [ref("Exod", 2, 1, 10)],
  },
  palacio: {
    text: "Ele cresce no palácio do faraó, provavelmente tendo a melhor educação do Egito.",
    stageLine: "Moisés cresce no palácio do faraó, provavelmente com a melhor educação do Egito.",
    kind: "narracao",
    refs: [ref("Exod", 2, 10), ref("Acts", 7, 22)],
  },
  "fuga-midia": {
    text: "Um dia ele sai para visitar os seus compatriotas e vê um egípcio maltratando um dos seus irmãos israelitas. Ele mata esse egípcio, e o faraó quer matar Moisés. Moisés foge para a terra de Midiã, onde se torna pastor, se casa e trabalha durante 40 anos.",
    stageLine: "Moisés mata um egípcio que maltratava um israelita, foge para Midiã e ali vive 40 anos como pastor.",
    kind: "narracao",
    refs: [ref("Exod", 2, 11, 22), ref("Acts", 7, 29, 30)],
  },
  sarca: {
    text: "Até que um dia Deus aparece para ele e lhe dá a missão de libertar o seu povo. De novo, Deus mostra o seu caráter de cuidador da sua promessa e zeloso.",
    stageLine: "Deus aparece a Moisés e lhe dá a missão de libertar o seu povo: Ele cuida da sua promessa.",
    kind: "interpretacao",
    refs: [ref("Exod", 3, 1, 10)],
    cn: "Cuidador da promessa",
  },
  identidade: {
    text: "Depois de 400 anos no Egito, trabalhando como escravos, os israelitas já tinham perdido até a sua identidade. Não sabiam quem eram: na cabeça deles, eram escravos. Quando se falava “senhor”, imaginavam alguém que sempre ia cobrar alguma coisa. Então Deus começa uma trilha de relacionamento próximo, ensinando que foi Ele que criou. Gênesis, a criação, tudo isso era para mostrar aos israelitas quem era o Criador deles, e que o mundo estava mal porque o homem tinha pecado e transgredido o que Deus falou.",
    stageLine: "Depois de 400 anos como escravos, o povo já não sabia quem era. Deus começa a mostrar quem Ele é.",
    steps: [
      "Para eles, “senhor” era alguém que sempre ia cobrar alguma coisa.",
      "Gênesis mostra ao povo quem é o Criador deles.",
      "O mundo estava mal porque o homem pecou e transgrediu o que Deus falou.",
    ],
    kind: "interpretacao",
    refs: [ref("Gen", 15, 13), ref("Exod", 1, 13, 14)],
  },
} satisfies Record<string, Fala>

export type FalaId = keyof typeof FALAS
