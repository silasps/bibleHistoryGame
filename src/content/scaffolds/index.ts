import { chapters, ref } from "../refs"
import type { EpisodeInput } from "../schema"

// Esboços editoriais: estrutura, dilema e cuidados. Não são jogáveis e não
// contêm resumos inventados — aguardam os resumos autorais da DBS.
const pending = { status: "pendente_fonte" } as const

export const scaffolds: EpisodeInput[] = [
  {
    id: "tabernaculo",
    actId: "ato-02",
    kind: "narrativa",
    status: "esboco_editorial",
    order: 10,
    title: "O tabernáculo",
    period: { label: "Deserto, após o Êxodo", approximate: true, debated: true },
    references: [chapters("Exod", 25, 40), ref("Lev", 16), ref("Heb", 9, 1, 28)],
    theme: "Presença, santidade e mediação",
    humanQuestion: "Como um Deus santo habita entre pessoas pecadoras?",
    characters: ["Moisés", "Arão (sumo sacerdote)", "Os sacerdotes", "O povo de Israel"],
    authorSummary: pending,
    manualRequirement: pending,
    reviewStatus: "rascunho",
    draft: {
      dilemma:
        "O jogador acompanha o povo montando o tabernáculo e descobre que o acesso ao Santo dos Santos é restrito. Pergunta: por que tanta mediação para estar perto de Deus?",
      cautions: [
        "Não confundir sacerdote comum com sumo sacerdote: só o sumo sacerdote entra no Santo dos Santos, no Dia da Expiação (Lv 16:2, 34).",
        "A conexão com Hebreus deve ser revelada progressivamente, só no momento adequado.",
        "Marcar a ligação com João 1:14 (Deus que “habita” entre nós) como interpretação.",
      ],
      proposedConnections: [
        {
          type: "cumprimento_novo_testamento",
          basis: [ref("Heb", 9, 11, 12), ref("Heb", 9, 24, 26), ref("Heb", 10, 19, 22)],
          note: "Hebreus lê Cristo como sumo sacerdote que entra no santuário de uma vez por todas.",
        },
        {
          type: "tipologia_interpretativa",
          basis: [ref("Exod", 25, 8), ref("John", 1, 14)],
          note: "A presença de Deus no meio do povo como figura da encarnação — leitura interpretativa.",
        },
      ],
    },
  },
  {
    id: "raabe",
    actId: "ato-03",
    kind: "narrativa",
    status: "esboco_editorial",
    order: 20,
    title: "Raabe e os espiões",
    period: { label: "Entrada em Canaã", approximate: true, debated: true },
    references: [ref("Josh", 2), ref("Josh", 6, 22, 25), ref("Heb", 11, 31), ref("Jas", 2, 25), ref("Matt", 1, 5)],
    theme: "Fé que age; inclusão na história de Israel",
    humanQuestion: "O que você arriscaria pelo que ouviu sobre Deus?",
    characters: ["Raabe", "Os dois espiões", "O rei de Jericó"],
    geography: "Jericó, a oeste do Jordão.",
    authorSummary: pending,
    manualRequirement: pending,
    reviewStatus: "rascunho",
    draft: {
      dilemma:
        "Em perspectiva de Raabe: ela ouviu notícias do Deus de Israel (Js 2:9–11), os espiões chegam e os mensageiros do rei batem à porta. Escondê-los ou entregá-los? Depois da decisão, revelar a narrativa canônica.",
      cautions: [
        "Não afirmar como fato que ela receberia honras do rei se denunciasse os espiões — isso seria hipótese.",
        "Genealogia: Mateus 1:5 apresenta Salmom como pai de Boaz, com Raabe como mãe; Boaz se casa com Rute. Possíveis lacunas genealógicas são debatidas — tratar a cronologia com cuidado.",
      ],
      proposedConnections: [
        {
          type: "cumprimento_novo_testamento",
          basis: [ref("Heb", 11, 31), ref("Jas", 2, 25)],
          note: "O Novo Testamento cita Raabe como exemplo de fé e de fé que age.",
        },
        {
          type: "tema_redentivo",
          basis: [ref("Matt", 1, 5)],
          note: "Uma mulher cananeia na genealogia de Jesus.",
        },
      ],
    },
  },
  {
    id: "davi-alianca",
    actId: "ato-03",
    kind: "narrativa",
    status: "esboco_editorial",
    order: 30,
    title: "Davi e a promessa real",
    period: { label: "c. séc. X a.C.", approximate: true, debated: false },
    references: [ref("2Sam", 7, 12, 16), ref("Ps", 89, 3, 4), ref("Luke", 1, 32, 33), ref("Acts", 2, 29, 36)],
    theme: "Liderança, fidelidade, fracasso e um reino duradouro",
    humanQuestion: "Por que precisamos de um rei diferente?",
    characters: ["Davi", "O profeta Natã", "Saul", "Bate-Seba"],
    authorSummary: pending,
    manualRequirement: pending,
    reviewStatus: "rascunho",
    draft: {
      dilemma:
        "Dilemas de liderança e fidelidade (Saul perseguindo Davi; o pecado com Bate-Seba e a confrontação de Natã), culminando na promessa de 2 Samuel 7.",
      cautions: [
        "2 Samuel 7 é uma promessa explícita, não apenas um exemplo moral.",
        "A ligação com Jesus é feita pelo próprio Novo Testamento (Lc 1:32–33), mas a forma do cumprimento deve ser apresentada com referências.",
      ],
      proposedConnections: [
        {
          type: "promessa_explicita",
          basis: [ref("2Sam", 7, 12, 16)],
          note: "Deus promete a Davi uma casa e um trono estabelecido para sempre.",
        },
        {
          type: "cumprimento_novo_testamento",
          basis: [ref("Luke", 1, 32, 33), ref("Rom", 1, 3)],
          note: "Jesus é anunciado como herdeiro do trono de Davi.",
        },
      ],
    },
  },
  {
    id: "miqueias-justica",
    actId: "ato-05",
    kind: "narrativa",
    status: "esboco_editorial",
    order: 40,
    title: "Miqueias: o que Deus espera",
    period: { label: "Séc. VIII a.C.", approximate: true, debated: false },
    references: [ref("Mic", 6, 6, 8), ref("Mic", 5, 2), ref("Matt", 2, 6)],
    theme: "Justiça, misericórdia e humildade versus religiosidade externa",
    humanQuestion: "O que Deus realmente espera do seu povo?",
    characters: ["O profeta Miqueias", "O povo de Judá"],
    authorSummary: pending,
    manualRequirement: pending,
    reviewStatus: "rascunho",
    draft: {
      dilemma:
        "O jogador oferece cada vez mais sacrifícios (Mq 6:6–7) e descobre que a resposta de Deus é outra: praticar a justiça, amar a misericórdia e andar humildemente com Deus (Mq 6:8).",
      cautions: [
        "Miqueias 6:8 é um chamado ético, não uma profecia messiânica.",
        "Distinguir de Miqueias 5:2 (o governante de Belém), que Mateus 2:6 cita.",
      ],
      proposedConnections: [
        {
          type: "profecia_direta",
          basis: [ref("Mic", 5, 2), ref("Matt", 2, 6)],
          note: "Mateus cita Miqueias 5:2 a respeito do nascimento em Belém.",
        },
      ],
    },
  },
]
