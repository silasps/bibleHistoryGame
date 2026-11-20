// Bible Show: como jogar cada tipo de carta, em passos curtos, para quem
// nunca jogou. Aparece na configuração. (Regras do jogo, não texto bíblico.)

export type TipoDeCarta = "mimica" | "perguntas" | "letras"

export interface ComoJogar {
  resumo: string
  passos: string[]
}

export function comoJogar(tipo: TipoDeCarta, equipes: boolean): ComoJogar {
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
          "Ela faz perguntas como “Sou um profeta?” ou “Estou no Antigo Testamento?”.",
          "O grupo só pode responder sim ou não.",
          "A categoria da carta fica em segredo. No nível Fácil, ela aparece como dica.",
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
