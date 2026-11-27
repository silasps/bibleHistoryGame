import { ref } from "../refs"

// RASCUNHOS para o "Aprofundar" dos slides (Rodada 4, briefing de 16/11/2026).
// Cada linha é paráfrase curta do texto bíblico (NAA, com referência) e tem a
// FONTE do material do autor que orientou a ênfase (aula, resumo, linha do tempo).
// Deus é o sujeito: o personagem aparece como quem revela Deus.
// Tudo aqui passa pela revisão do autor na página "Revisão dos textos".

type Ref = ReturnType<typeof ref>

export interface Linha {
  text: string
  refs: Ref[]
  /** contexto: história fora do texto bíblico, tirada das aulas/linha do tempo do autor. */
  kind: "parafrase" | "narracao" | "interpretacao" | "contexto"
  /** De onde veio a ênfase no material do autor. */
  fonte: string
}

export interface Aprofundamento {
  /** Linha principal: só quando o slide não tem um trecho próprio do resumo. */
  principal?: Linha
  /** Linhas que o apresentador revela com "Aprofundar". */
  passos: Linha[]
  /** Material de apoio: Área de preparação e solo ("Para aprofundar"). Nunca no telão nem no painel. */
  apoio?: Linha[]
}

const AULA_PENTATEUCO = "Aula Pentateuco (semana 2)"
const AULA_TRIBOS = "Aula Tribos (semana 3)"
const RESUMO = (w: number) => `Seu resumo (semana ${w})`
const LINHA = (w: number) => `Sua linha do tempo (semana ${w})`
const BRIEFING = "Seu briefing (16/11/2026)"

const l = (text: string, refs: Ref[], fonte: string, kind: Linha["kind"] = "narracao"): Linha => ({ text, refs, kind, fonte })

export const APROFUNDAR: Record<string, Aprofundamento> = {
  // ── Etapa 4 · No Egito ────────────────────────────────────────────────────
  "tempo-egito": {
    principal: l("No Egito, os filhos de Israel se multiplicam muito, e a terra se enche deles.", [ref("Exod", 1, 7)], RESUMO(2)),
    passos: [],
  },

  // ── Etapa 6 · Deus no meio do povo ────────────────────────────────────────
  "alianca-sinai": {
    principal: l("No Sinai, Deus faz aliança com Israel, e o povo responde: faremos tudo o que o Senhor falou.", [ref("Exod", 19, 5, 8), ref("Exod", 24, 3, 7)], AULA_PENTATEUCO),
    passos: [],
  },
  // Origem do sacerdócio (briefing, item 6).
  arao: {
    passos: [
      l("Deus escolhe Arão e seus filhos para servirem como sacerdotes diante dEle.", [ref("Exod", 28, 1)], AULA_PENTATEUCO),
      l("Deus manda consagrar os sacerdotes, com vestes santas, unção e sacrifícios.", [ref("Exod", 29, 1, 9), ref("Lev", 8)], AULA_PENTATEUCO),
      l("Os sacerdotes cuidam do altar e dos sacrifícios; os levitas os ajudam no serviço do tabernáculo.", [ref("Num", 3, 5, 10), ref("Num", 18, 1, 7)], AULA_PENTATEUCO),
      l("Servir diante de Deus exige santidade: Nadabe e Abiú oferecem fogo estranho e morrem.", [ref("Lev", 10, 1, 3)], AULA_PENTATEUCO),
    ],
  },
  // Os doze espiões e Raabe (briefing, itens 9 e 10; o autor pediu Raabe aqui).
  espioes: {
    principal: l("Deus manda Moisés enviar doze homens para observar a terra que Ele daria ao povo.", [ref("Num", 13, 1, 2)], LINHA(2)),
    passos: [
      l("Eles voltam com frutos e contam: a terra é boa, mas o povo é forte e as cidades têm muralhas.", [ref("Num", 13, 23, 28)], AULA_TRIBOS),
      l("Dez espiões espalham medo: diante daquele povo, eles se sentiam como gafanhotos.", [ref("Num", 13, 31, 33)], AULA_TRIBOS),
      l("O povo chora a noite inteira e quer voltar para o Egito.", [ref("Num", 14, 1, 4)], AULA_TRIBOS),
      l("Josué e Calebe confiam: se o Senhor se agradar de nós, Ele nos dará esta terra.", [ref("Num", 14, 6, 9)], AULA_TRIBOS),
      // Pedido do autor (26/11/2026): os 40 dias espiando viram 40 anos (um ano por dia).
      l("Os espiões andaram 40 dias pela terra; por causa da incredulidade, cada dia vira um ano no deserto.", [ref("Num", 13, 25), ref("Num", 14, 34)], "Pedido do autor (26/11/2026) · Nm 14:34"),
      l("A incredulidade tem consequência: aquela geração fica 40 anos no deserto; só Josué e Calebe entram.", [ref("Num", 14, 29, 34)], AULA_TRIBOS),
    ],
  },

  // ── Etapa 7 · A terra ─────────────────────────────────────────────────────
  // Pedido do autor (26/11/2026): a segunda ida dos espiões (Raabe) é depois dos 40 anos, sob Josué, antes de Jericó.
  "conquista-canaa": {
    passos: [
      l("Antes de Jericó, Josué envia dois espiões, e Raabe, uma cananeia, os esconde.", [ref("Josh", 2, 1, 6)], AULA_TRIBOS),
      l("Raabe confessa que o Senhor deu a terra a Israel e pede que poupem a sua família.", [ref("Josh", 2, 9, 13)], AULA_TRIBOS),
      l("Um cordão vermelho na janela é o sinal: quando Jericó cai, Raabe e sua família são salvas.", [ref("Josh", 2, 18, 21), ref("Josh", 6, 22, 25)], AULA_TRIBOS),
      l("Desta vez, os espiões voltam dizendo: o Senhor entregou toda a terra em nossas mãos.", [ref("Josh", 2, 24)], AULA_TRIBOS),
      l("Raabe é lembrada pela sua fé.", [ref("Heb", 11, 31)], AULA_TRIBOS),
    ],
    apoio: [l("Raabe aparece na genealogia de Jesus, como mãe de Boaz.", [ref("Matt", 1, 5)], AULA_TRIBOS)],
  },
  josue: {
    principal: l("Depois da morte de Moisés, o Senhor fala com Josué: atravesse o Jordão com todo o povo.", [ref("Josh", 1, 1, 2)], AULA_TRIBOS),
    passos: [],
  },
  // Juízes (briefing, item 12): Débora, Gideão e Sansão, cada um com a sua linha.
  debora: {
    passos: [
      l("Israel volta a fazer o mal e é oprimido por Jabim; o povo clama, e Deus levanta Débora.", [ref("Judg", 4, 1, 5)], AULA_TRIBOS),
      l("Débora, profetisa e juíza, chama Baraque: o Senhor entregaria Sísera nas mãos dele.", [ref("Judg", 4, 4, 7)], AULA_TRIBOS),
      l("Baraque só vai se Débora for; ela vai, mas avisa que a honra ficará com uma mulher.", [ref("Judg", 4, 8, 9)], AULA_TRIBOS),
      l("O Senhor derrota o exército de Sísera, e Jael, uma mulher, dá fim a ele.", [ref("Judg", 4, 15, 22)], AULA_TRIBOS),
      l("No cântico de Débora, a vitória é celebrada como obra do Senhor.", [ref("Judg", 5, 2, 5)], AULA_TRIBOS),
    ],
  },
  gideao: {
    principal: l("Deus chama Gideão, que se escondia dos midianitas, e lhe diz: o Senhor está com você.", [ref("Judg", 6, 11, 12)], AULA_TRIBOS),
    passos: [
      l("Gideão pergunta onde estão as maravilhas de Deus e pede sinais, e Deus responde a cada pedido.", [ref("Judg", 6, 13, 22), ref("Judg", 6, 36, 40)], AULA_TRIBOS),
      l("Gideão derruba o altar de Baal, e passa a ser chamado Jerubaal.", [ref("Judg", 6, 25, 32)], AULA_TRIBOS),
      l("Deus reduz o exército de 32 mil para 300, para que Israel não se glorie contra Ele.", [ref("Judg", 7, 2, 7)], AULA_TRIBOS),
      l("Com trombetas, cântaros e tochas, os 300 veem o Senhor derrotar Midiã.", [ref("Judg", 7, 16, 22)], AULA_TRIBOS),
      l("Depois, Gideão faz uma estola sacerdotal de ouro, e ela vira um laço para Israel.", [ref("Judg", 8, 24, 27)], AULA_TRIBOS),
    ],
  },
  sansao: {
    principal: l("Antes de Sansão nascer, Deus o separa como nazireu para começar a livrar Israel dos filisteus.", [ref("Judg", 13, 3, 5)], AULA_TRIBOS),
    passos: [
      l("Nazireu: consagrado a Deus, sem vinho, sem cortar o cabelo e sem tocar em mortos.", [ref("Num", 6, 1, 8)], AULA_TRIBOS),
      l("O Espírito do Senhor vem sobre Sansão, e ele tem uma força extraordinária.", [ref("Judg", 14, 6), ref("Judg", 15, 14)], AULA_TRIBOS),
      l("Mas Sansão vive pelos próprios desejos, até Dalila descobrir o segredo da sua força.", [ref("Judg", 14, 1, 3), ref("Judg", 16, 4, 21)], AULA_TRIBOS),
      l("Preso e cego, Sansão clama ao Senhor, e Deus lhe dá força para derrubar o templo de Dagom.", [ref("Judg", 16, 21, 30)], AULA_TRIBOS),
    ],
  },

  // ── Etapa 8 · O reino ─────────────────────────────────────────────────────
  // O autor pediu os reis principais no lugar de Arã: Salomão, a riqueza, a queda e as tribos.
  salomao: {
    passos: [
      l("Deus dá a Salomão sabedoria, riqueza e honra; em Jerusalém, a prata era comum como pedras.", [ref("1Kgs", 3, 12, 13), ref("1Kgs", 10, 27)], RESUMO(4)),
      l("Mas as mulheres estrangeiras desviam o coração de Salomão para outros deuses.", [ref("1Kgs", 11, 1, 6)], RESUMO(4)),
      l("Deus anuncia: dez tribos seriam tiradas; por amor a Davi, Judá e Benjamim ficariam com a sua descendência.", [ref("1Kgs", 11, 31, 36), ref("1Kgs", 12, 21)], RESUMO(4)),
    ],
  },

  // ── Etapa 9 · O reino dividido ────────────────────────────────────────────
  "divisao-reino": {
    passos: [
      l("Depois de Salomão, as dez tribos do norte seguem Jeroboão: nasce o reino de Israel.", [ref("1Kgs", 12, 16, 20)], "Aulas Reis (semana 4)"),
      l("Judá e Benjamim ficam com Roboão, filho de Salomão, em Jerusalém: o reino de Judá.", [ref("1Kgs", 12, 21)], "Aulas Reis (semana 4)"),
      l("Isso vinha do Senhor: cumpria-se a palavra que Ele tinha dado.", [ref("1Kgs", 12, 15)], "Aulas Reis (semana 4)"),
    ],
  },
  // Harã-Síria (linha do tempo da escola): um slide curto, com o mapa e uma linha só.
  aram: {
    principal: l("Arã, a Síria, com capital em Damasco, é o vizinho do norte que guerreia com Israel.", [ref("1Kgs", 20, 1), ref("Isa", 7, 8)], "Linha do tempo da escola · sua linha do tempo (semana 4)"),
    passos: [],
  },
  assiria: {
    principal: l("A Assíria cresce como potência e passa a cobrar tributo de Israel.", [ref("2Kgs", 15, 19, 20)], LINHA(4)),
    passos: [],
  },

  // ── Etapa 10 · Os profetas avisam ─────────────────────────────────────────
  "cerco-jerusalem": {
    principal: l("A Assíria cerca Jerusalém; Ezequias ora, e o Senhor livra a cidade.", [ref("2Kgs", 18, 13), ref("2Kgs", 19, 14, 19), ref("2Kgs", 19, 35, 36)], LINHA(5)),
    passos: [],
  },

  // ── Etapa 11 · Exílio e esperança ─────────────────────────────────────────
  // Jeremias (complemento, item 2): Deus avisa muitas vezes antes do juízo.
  jeremias: {
    passos: [
      l("Na porta do templo, Deus fala por Jeremias: corrijam seus caminhos, e eu os deixarei morar nesta terra.", [ref("Jer", 7, 1, 7)], RESUMO(6)),
      l("Durante 23 anos Jeremias avisa, e o povo não ouve; ele anuncia 70 anos de domínio da Babilônia.", [ref("Jer", 25, 3, 11)], RESUMO(6)),
      l("O Senhor enviou seus mensageiros muitas vezes, porque tinha compaixão do povo; mas eles zombaram.", [ref("2Chr", 36, 15, 16)], BRIEFING),
      l("O exílio não vem porque Deus abandonou a promessa, mas porque o povo quebrou a aliança.", [ref("Jer", 11, 10), ref("2Chr", 36, 16)], BRIEFING, "interpretacao"),
    ],
  },
  "queda-jerusalem": {
    passos: [l("Tudo se cumpre: Jerusalém é tomada, o templo é queimado, e o povo vai para a Babilônia.", [ref("Jer", 39, 1, 10), ref("2Chr", 36, 17, 21)], BRIEFING)],
  },
  // Ezequiel (complemento, item 3): o problema era o coração. O jogo vem depois.
  ezequiel: {
    passos: [
      l("O problema de Israel não era só político ou militar: era o coração.", [ref("Ezek", 11, 19), ref("Ezek", 36, 26)], BRIEFING, "interpretacao"),
      l("Deus promete tirar o coração de pedra e dar um coração novo, que siga os seus caminhos.", [ref("Ezek", 11, 19, 20)], BRIEFING),
      l("Deus faz isso pelo seu santo nome, não porque o povo merecia.", [ref("Ezek", 36, 22, 32)], BRIEFING),
    ],
  },
  daniel: {
    passos: [
      l("Na Babilônia, Daniel decide não se contaminar com a comida do rei, e Deus lhe dá favor.", [ref("Dan", 1, 8, 9)], RESUMO(6)),
      l("Deus dá a Daniel e aos amigos sabedoria dez vezes maior que a dos sábios do rei.", [ref("Dan", 1, 17, 20)], RESUMO(6)),
    ],
  },
  ciro: {
    principal: l("Deus chama Ciro pelo nome antes de ele reinar: ele seria o instrumento do Senhor.", [ref("Isa", 44, 28), ref("Isa", 45, 1)], LINHA(6)),
    passos: [],
  },
  persia: {
    principal: l("O reino da Babilônia passa aos medos e aos persas, como Daniel tinha anunciado.", [ref("Dan", 5, 28, 31)], LINHA(6)),
    passos: [],
  },
}

// ── Semana 7 (Etapas 12 e 13) ───────────────────────────────────────────────
// O resumo do autor não fala do período entre os Testamentos: essas linhas vêm da
// aula do Prof. Diego (13/11) e ficam marcadas como contexto histórico.
const AULA_DIEGO = "Aula do Prof. Diego (13/11) · Período Interbíblico"
const ctx = (text: string, refs: Ref[]): Linha => ({ text, refs, kind: "contexto", fonte: AULA_DIEGO })

Object.assign(APROFUNDAR, {
  "segundo-retorno": {
    passos: [l("Esdras, sacerdote e escriba, conduz o segundo retorno e ensina a Lei ao povo.", [ref("Ezra", 7, 6, 10)], RESUMO(7))],
  },
  "fim-at": {
    passos: [ctx("Com Malaquias termina o Antigo Testamento: depois, cerca de 400 anos até João Batista.", [ref("Mal", 4, 5, 6)])],
  },
  alexandre: {
    principal: ctx("Alexandre, o Grande, conquista rapidamente o Império Persa e chega à Judeia.", [ref("Dan", 8, 5, 7)]),
    passos: [
      l("Daniel já tinha visto um bode veloz vindo do ocidente: o rei da Grécia.", [ref("Dan", 8, 5), ref("Dan", 8, 21)], AULA_DIEGO),
      ctx("Com Alexandre, a língua e a cultura gregas se espalham pelos povos conquistados.", [ref("Dan", 8, 21)]),
    ],
  },
  "imperio-grego": {
    principal: ctx("Alexandre morre em 323 a.C., e seus generais dividem o império.", [ref("Dan", 8, 22)]),
    passos: [
      ctx("Ptolomeus no Egito e Selêucidas na Síria: a Judeia fica no meio dos dois.", [ref("Dan", 11, 5, 6)]),
      ctx("As Escrituras passam a circular também em grego: é a Septuaginta.", [ref("Dan", 8, 22)]),
      l("Daniel já tinha visto o reino grego se dividir em quatro.", [ref("Dan", 8, 22)], AULA_DIEGO),
    ],
  },
  "antioco-iv": {
    principal: ctx("Antíoco IV persegue os judeus, impede a circuncisão e profana o templo.", [ref("Dan", 11, 31)]),
    passos: [l("Daniel tinha anunciado um rei que profanaria o santuário.", [ref("Dan", 11, 31)], AULA_DIEGO)],
  },
  macabeus: {
    principal: ctx("Em 167 a.C., o sacerdote Matatias começa a resistência; seu filho Judas Macabeu lidera a luta.", [ref("Dan", 11, 32)]),
    passos: [
      ctx("Jerusalém é retomada, e o templo é purificado e dedicado de novo.", [ref("Dan", 8, 14)]),
      ctx("A família dos Macabeus, os hasmoneus, passa a governar.", [ref("Dan", 11, 32)]),
      ctx("O povo conquista liberdade política, mas vêm disputas, divisões e novas guerras.", [ref("Dan", 11, 32)]),
      l("Daniel já dizia: o povo que conhece o seu Deus se manterá firme.", [ref("Dan", 11, 32)], AULA_DIEGO),
    ],
  },
  pompeu: {
    principal: ctx("Em 63 a.C., Pompeu conquista Jerusalém, e a Judeia passa ao domínio de Roma.", [ref("Luke", 2, 1)]),
    passos: [],
  },
  "imperio-romano": {
    principal: ctx("Roma cobra tributos, mantém soldados e governa com autoridades locais.", [ref("Luke", 2, 1)]),
    passos: [ctx("Estradas, uma língua comum e sinagogas por todo o império ligam os povos.", [ref("Luke", 2, 1)])],
  },
  herodes: {
    principal: ctx("Herodes, o Grande, aliado de Roma, reina na Judeia e amplia o templo.", [ref("Matt", 2, 1)]),
    passos: [ctx("No meio de tudo isso, o povo continua esperando o Messias prometido.", [ref("Mal", 3, 1)])],
  },
} satisfies Record<string, Aprofundamento>)

export function aprofundarDe(itemId: string): Aprofundamento | undefined {
  return APROFUNDAR[itemId]
}

/** Todas as linhas (para a revisão e para os testes de tamanho). */
export function allLinhas(): { itemId: string; where: "principal" | "passo" | "apoio"; linha: Linha }[] {
  return Object.entries(APROFUNDAR).flatMap(([itemId, a]) => [
    ...(a.principal ? [{ itemId, where: "principal" as const, linha: a.principal }] : []),
    ...a.passos.map((linha) => ({ itemId, where: "passo" as const, linha })),
    ...(a.apoio ?? []).map((linha) => ({ itemId, where: "apoio" as const, linha })),
  ])
}
