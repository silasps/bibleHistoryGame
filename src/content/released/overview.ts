import "server-only"

import { z } from "zod"
import { WeekConnection } from "../overview/schema"

// Versículo para memorizar + parágrafo do PRD de cada semana, do resumo do
// autor. Só sai do servidor depois que o apresentador libera a semana (ao
// vivo) ou que o jogador abre o selo da semana (jogo). Os versículos foram
// conferidos com a NAA (bibliaonline.com.br/naa) em 2026-11-03.
const CONNECTIONS = z.array(WeekConnection).parse([
  {
    week: 1,
    verseText:
      "Porei inimizade entre você e a mulher, entre a sua descendência e o descendente dela. Este lhe ferirá a cabeça, e você lhe ferirá o calcanhar.",
    blocks: [
      "Aqui Deus promete resolver o problema, mas esta solução ainda é uma promessa, e os próximos capítulos de Gênesis e Êxodo vão trazer um pano de fundo para a entrada triunfal desta solução.",
      "Deus não somente promete resolver o problema: Ele está ensinando um povo como exemplo para que “todas as famílias da terra sejam abençoadas da mesma forma”, a saber, através de Jesus.",
    ],
  },
  {
    week: 2,
    verseText:
      "Portanto, santifiquem-se e sejam santos, pois eu sou o Senhor, o Deus de vocês. Guardem os meus estatutos e tratem de cumpri-los. Eu sou o Senhor, que os santifico.",
    blocks: [
      "Deus estabeleceu uma série de rituais para que fosse possível Ele se relacionar com o povo e, como lá no jardim o homem havia sido separado de Deus, agora Ele encontra um meio de se relacionar novamente, fazendo um convite através de cada lei, ritual e mandamento.",
      "O capítulo 16, no meio de Levítico — a expiação por todo o povo —, conecta com a vida de Cristo.",
    ],
  },
  {
    week: 3,
    verseText:
      "Tão somente seja forte e muito corajoso para que você tenha o cuidado de fazer segundo toda a Lei que o meu servo Moisés lhe ordenou. Não se desvie dela, nem para a direita nem para a esquerda, para que seja bem-sucedido por onde quer que você andar. · Quanto a você, a sua casa e o seu reino serão firmados para sempre diante de mim; o seu trono será estabelecido para sempre.",
    blocks: [],
  },
  {
    week: 4,
    verseText:
      "se o meu povo, que se chama pelo meu nome, se humilhar, orar, me buscar e se converter dos seus maus caminhos, eu ouvirei dos céus, perdoarei os seus pecados e sararei a sua terra.",
    blocks: [
      "Diante de toda a maldade humana e do desejo insistente de se afastar do Senhor, Deus apresenta um caminho, sua graça, e dá esperança a todo aquele que o buscar de que sua oração será ouvida e sua terra será sarada; e essa graça, no Filho, é derramada de forma abundante.",
    ],
  },
  {
    week: 5,
    verseText:
      "Ele já mostrou a você o que é bom; e o que o Senhor pede de você? Que pratique a justiça, ame a misericórdia e ande humildemente com o seu Deus.",
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
