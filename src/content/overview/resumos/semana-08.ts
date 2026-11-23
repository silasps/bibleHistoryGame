import { chapters, ref } from "../../refs"
import type { ResumoExcerptInput } from "../schema"

// Resumo do autor · Semana 8 — Jesus (w8-resumo.txt, baixado em 23/11/2026).
// O versículo do plano é Mt 28:5–6, destacado em vermelho no resumo. Não há parágrafo “PRD -”.
// Ainda SEM `stageLine`: o telão continua com nome, data e referência. Os pontos
// para o apresentador ficam em `../topicos.ts` (só no painel).
export const resumo08: ResumoExcerptInput[] = [
  {
    id: "r08-chegou",
    week: 8,
    text: "Ele chegou! Aquele que estava sendo anunciado desde o início e que já “foi conhecido antes da fundação do mundo, mas foi manifestado nestes últimos tempos, em favor de muitos” (1Pe 1:20).",
    refs: [ref("1Pet", 1, 20)],
  },
  {
    id: "r08-plenitude",
    week: 8,
    text: "Todo o cenário estava perfeitamente preparado para a sua chegada. “Ele é a plenitude dos tempos. Não havia outro momento na história que fosse mais propício para que todo o processo de sua chegada acontecesse” (Professora Ingrid).",
    itemIds: ["augusto"],
  },
  {
    id: "r08-por-que",
    week: 8,
    text: "Mas por que ele precisava vir? Ele não poderia aparecer nas nuvens e simplesmente resolver o problema de uma vez por todas? Não. O maior problema ainda não tinha sido resolvido. Depois do fim do exílio, a idolatria tinha acabado, mas outras práticas ainda continuavam. O pecado ainda estava lá, na carne. O salário do pecado é a morte, e a morte de alguém perfeito precisava acontecer.",
    itemIds: ["jesus"],
  },
  {
    id: "r08-cristo",
    week: 8,
    text: "Jesus é Cristo, o Filho de Deus. Sua vida e morte, suas palavras e feitos mudaram para sempre o curso da vida humana e estabelecem as bases da esperança no futuro (Professora Ingrid).",
    itemIds: ["jesus"],
  },
  {
    id: "r08-mateus",
    week: 8,
    text: "Mateus, Marcos e Lucas vão apresentar Jesus sob perspectivas diferentes, até porque seus públicos são diferentes. Mateus revela Deus se dirigindo ao seu povo do Antigo Testamento; apresenta o Senhor Jesus ocupando um lugar distintamente judaico; e é o único dos quatro evangelistas que registra a declaração expressa do Messias: “Não fui enviado senão às ovelhas perdidas da casa de Israel” (Mt 15:24). Mateus apresenta o Senhor Jesus como o Messias e Rei de Israel, bem como aquele que salvará o seu povo dos seus pecados (Mt 1:21b).",
    refs: [ref("Matt", 15, 24), ref("Matt", 1, 21)],
    itemIds: ["jesus"],
  },
  {
    id: "r08-marcos",
    week: 8,
    text: "Marcos apresenta Jesus como o Messias e Filho de Deus, destacando sua autoridade e seu papel de servo (Mc 10:45). Marcos é um livro escrito para os cristãos gentios em Roma e busca fortalecer os crentes em meio à perseguição e os encoraja a seguir o exemplo de sofrimento e serviço de Jesus.",
    refs: [ref("Mark", 10, 45)],
    itemIds: ["jesus"],
  },
  {
    id: "r08-lucas",
    week: 8,
    text: "Já Lucas era um gentio, o que o torna único entre os evangelistas. Seu livro foi escrito para um público gentio, com foco na salvação e na explicação dos costumes judaicos. Dirigido ao “excelentíssimo Teófilo” (Lc 1:3), que provavelmente era um gentio convertido ou um oficial romano, o livro apresenta um relato ordenado e preciso da vida de Jesus. Lucas destaca Jesus como o Salvador, enfatizando sua compaixão e seu alcance aos marginalizados; por isso Lucas apresenta a aparição de anjos aos pastores, público marginalizado naquela época, mostra Jesus dando atenção à situação de uma viúva (Lc 7:11-15) e ainda mostra a cena da mulher pecadora que o ungiu com perfume (Lc 7:36-38).",
    refs: [ref("Luke", 1, 3), ref("Luke", 7, 11, 15), ref("Luke", 7, 36, 38)],
    itemIds: ["jesus"],
  },
  {
    id: "r08-reino",
    week: 8,
    text: "Todos os livros vão mostrar que um reino está chegando. “Então, o anjo lhes disse: — Não tenham medo, pois trago boas-novas de grande alegria para vocês, que são para todo o povo. Hoje, na cidade de Davi, nasceu o Salvador, que é Cristo (ungido), o Senhor (em grego, Kyrios)” (Lc 2:10-11).",
    refs: [ref("Luke", 2, 10, 11)],
    itemIds: ["nascimento-jesus"],
  },
  {
    id: "r08-boas-novas",
    week: 8,
    text: "As boas-novas, que tinham o significado de um contexto de guerra, quando um rei vencia, estavam sendo anunciadas. E essas boas-novas eram de grande alegria e para todo o povo. O reino de Deus foi expandido com a chegada de Jesus. Este Rei veio para salvar e não é um rei que tomou o trono sem merecimento: ele foi ungido e, para os súditos desse reino, ele é Senhor e tem domínio total sobre sua vida.",
    itemIds: ["nascimento-jesus"],
  },
  {
    id: "r08-ministerio",
    week: 8,
    text: "A vida e o ministério de Jesus vão se dar da seguinte forma: Jesus é anunciado para Maria e José (Lc 1:31-33), é apresentado no templo (Lc 2:23), é batizado (Mt 3:16), tentado (Mt 4:1), chama seus primeiros discípulos (Mt 4:18-22), inicia seu ministério e faz o primeiro sinal (Jo 2:9), faz uma abordagem ministerial focada no ensino sobre seu Reino (Mt 5-7), mostra sua autoridade sobre a criação (Mt 8:26), cura vários tipos de enfermidades (Mt 8:2-3; 8:16) e expulsa demônios (Mt 8:28-29). Depois de inaugurar seu Reino, mostra ao povo sua forma de aplicar este reino de Deus e como se deve fazer para ter acesso a este Reino. Acontece que os princípios que Jesus apresenta para ter acesso a este Reino chocam todos aqueles que estudavam a lei toda, ao passo que os mais marginalizados aceitavam de bom grado tudo o que era ensinado por Jesus.",
    refs: [
      ref("Luke", 1, 31, 33),
      ref("Luke", 2, 23),
      ref("Matt", 3, 16),
      ref("Matt", 4, 1),
      ref("Matt", 4, 18, 22),
      ref("John", 2, 9),
      chapters("Matt", 5, 7),
      ref("Matt", 8, 26),
      ref("Matt", 8, 2, 3),
      ref("Matt", 8, 16),
      ref("Matt", 8, 28, 29),
    ],
    itemIds: ["ministerio-jesus", "nascimento-jesus"],
  },
  {
    id: "r08-cruz",
    week: 8,
    text: "Ao fim, a mensagem tanto incomodou os mestres da Lei que eles mandaram crucificar Jesus, sacrifício este necessário para que toda dívida fosse anulada de uma vez por todas. Mas, ao morrer, ficou uma grande dúvida da parte dos discípulos: ele prometeu tudo aquilo… e agora?",
    itemIds: ["morte-ressurreicao", "pilatos"],
  },
  {
    id: "r08-ressurreicao",
    week: 8,
    text: "Jesus, então, logo após sua ressurreição, aparece às mulheres que tinham ido ao seu túmulo, mas o anjo, dirigindo-se às mulheres, disse: “— Não tenham medo! Sei que vocês procuram Jesus, que foi crucificado. Ele não está aqui; ressuscitou, como tinha dito. Venham ver onde ele jazia.” Em outras palavras, Jesus estava dizendo: tenham calma, porque tudo o que foi anunciado e prometido a vocês está se realizando.",
    refs: [ref("Matt", 28, 5, 6)],
    itemIds: ["morte-ressurreicao"],
  },
  {
    id: "r08-fe",
    week: 8,
    text: "Jesus chegou, apresentou um Reino eterno, o que muda completamente todas as expectativas, e chama as pessoas para viverem uma vida de fé, crendo neste novo templo e neste Reino, para que possam tomar posse dele.",
    itemIds: ["ascensao"],
  },
]
