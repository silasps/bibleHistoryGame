import "server-only"

import { z } from "zod"
import { WeekConnection } from "../overview/schema"

// Parágrafo do PRD de cada semana, do resumo do autor. Só sai do servidor
// depois que o apresentador libera a semana (ao vivo) ou que o jogador abre o
// selo da semana (jogo). O versículo para memorizar é público e fica em
// overview/timeline.ts.
const CONNECTIONS = z.array(WeekConnection).parse([
  {
    week: 1,
    blocks: [
      "Aqui Deus promete resolver o problema, mas esta solução ainda é uma promessa, e os próximos capítulos de Gênesis e Êxodo vão trazer um pano de fundo para a entrada triunfal desta solução.",
      "Deus não somente promete resolver o problema: Ele está ensinando um povo como exemplo para que “todas as famílias da terra sejam abençoadas da mesma forma”, a saber, através de Jesus.",
    ],
  },
  {
    week: 2,
    blocks: [
      "Deus estabeleceu uma série de rituais para que fosse possível Ele se relacionar com o povo e, como lá no jardim o homem havia sido separado de Deus, agora Ele encontra um meio de se relacionar novamente, fazendo um convite através de cada lei, ritual e mandamento.",
      "O capítulo 16, no meio de Levítico — a expiação por todo o povo —, conecta com a vida de Cristo.",
    ],
  },
  {
    week: 3,
    blocks: [],
  },
  {
    week: 4,
    blocks: [
      "Diante de toda a maldade humana e do desejo insistente de se afastar do Senhor, Deus apresenta um caminho, sua graça, e dá esperança a todo aquele que o buscar de que sua oração será ouvida e sua terra será sarada; e essa graça, no Filho, é derramada de forma abundante.",
    ],
  },
  {
    week: 5,
    blocks: [
      "A mensagem central da maioria dos profetas é a mesma. Ou seja: lembrem-se do que já foi dito. Nada novo está sendo dado. É um chamado a praticar as leis do Senhor, que são justas e cheias de misericórdia, e praticá-las requer humildade, pois é preciso confiar que o Senhor instruiu aquilo que é o melhor para a vida.",
    ],
  },
  { week: 6, blocks: [] },
])

const byWeek = new Map(CONNECTIONS.map((c) => [c.week, c]))

export function getWeekConnection(week: number): WeekConnection | undefined {
  return byWeek.get(week)
}

export function allWeekConnections(): WeekConnection[] {
  return CONNECTIONS
}
