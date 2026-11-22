// Bible Show: como jogar cada tipo de carta, em passos curtos, para quem
// nunca jogou. Aparece na configuração. (Regras do jogo, não texto bíblico.)

import type { Tema } from "./cartas"

export type TipoDeCarta = "mimica" | "perguntas" | "letras"

export interface ComoJogar {
  resumo: string
  passos: string[]
}

/** `modo`: em equipes, cada um por si ou só brincar (sem disputa). */
/** Exemplos de perguntas de sim ou não, conforme as cartas da partida. */
const EXEMPLOS: Record<Tema, string> = {
  biblia: "Ela faz perguntas como “Sou um profeta?” ou “Estou no Antigo Testamento?”.",
  geral: "Ela faz perguntas como “Sou uma pessoa?” ou “Existo até hoje?”.",
  ambos: "Ela faz perguntas como “Sou da Bíblia?” ou “Sou uma pessoa?”.",
}

export function comoJogar(tipo: TipoDeCarta, modo: "equipes" | "individual" | "livre", tema: Tema = "biblia"): ComoJogar {
  const equipes = modo === "equipes"
  if (modo === "livre") return soBrincar(tipo, tema)
  switch (tipo) {
    case "mimica":
      return {
        resumo: "Uma pessoa representa a carta, sem falar.",
        passos: [
          equipes ? "A equipe da vez escolhe quem vai representar. Só essa pessoa vê a carta." : "Quem está na vez representa. Só essa pessoa vê a carta.",
          "Ela representa com gestos, sem falar e sem fazer sons.",
          equipes ? "A equipe tenta adivinhar antes de o tempo acabar." : "Quem acertar primeiro anda junto com quem representou.",
        ],
      }
    case "perguntas":
      return {
        resumo: "Uma pessoa descobre a carta fazendo perguntas de sim ou não.",
        passos: [
          equipes ? "A equipe da vez escolhe quem vai adivinhar. Essa pessoa não olha a carta; os outros olham." : "Quem está na vez adivinha e não olha a carta; os outros olham.",
          EXEMPLOS[tema],
          "O grupo só pode responder sim ou não.",
          "Quem adivinha não vê a categoria. Ela aparece só na carta, e quem responde pode dá-la como dica.",
          ...(equipes ? ["Se o tempo acabar, a equipe seguinte tenta, com metade do tempo."] : []),
        ],
      }
    case "letras":
      return {
        resumo: "Descubram a palavra escondida escolhendo letras.",
        passos: [
          "A palavra aparece escondida, com um espaço para cada letra.",
          equipes ? "Na vez da equipe, escolham letras. A certa aparece e dá +10 s; a errada tira 5 s." : "Na sua vez, escolha letras. A certa aparece e dá +10 s; a errada tira 5 s.",
          "A vez só passa quando o tempo acaba ou quando arriscam a palavra e erram.",
          "Arriscar para o tempo e não tem volta.",
          "Quem abrir a última letra ou acertar a palavra anda.",
        ],
      }
  }
}

/** Só brincar: alguém vai à frente e o resto do grupo joga junto; sem pontos. */
function soBrincar(tipo: TipoDeCarta, tema: Tema): ComoJogar {
  switch (tipo) {
    case "mimica":
      return {
        resumo: "Alguém vai à frente e representa a carta, sem falar.",
        passos: ["Alguém vai à frente. Só essa pessoa vê a carta.", "Ela representa com gestos, sem falar e sem fazer sons.", "O resto do grupo tenta adivinhar antes de o tempo acabar."],
      }
    case "perguntas":
      return {
        resumo: "Alguém vai à frente e descobre a carta com perguntas de sim ou não.",
        passos: [
          "Alguém vai à frente e não olha a carta; o resto do grupo olha.",
          EXEMPLOS[tema],
          "O grupo só pode responder sim ou não.",
          "Quem adivinha não vê a categoria. Ela aparece só na carta, e quem responde pode dá-la como dica.",
        ],
      }
    case "letras":
      return {
        resumo: "O grupo todo descobre a palavra escondida escolhendo letras.",
        passos: [
          "A palavra aparece escondida, com um espaço para cada letra.",
          "Escolham as letras juntos. A certa aparece e dá +10 s; a errada tira 5 s.",
          "Arriscar para o tempo e não tem volta: se errarem, a carta acaba.",
          "Se o tempo acabar, a palavra aparece e vem a próxima carta.",
        ],
      }
  }
}
