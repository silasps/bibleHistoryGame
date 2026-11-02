import { block, chapters, ref } from "../refs"
import type { EpisodeInput } from "../schema"

const STRATEGIES = [
  { id: "proibir", label: "Proibir o quintal" },
  { id: "vigiar", label: "Vigiar o tempo todo" },
  { id: "explicar", label: "Explicar o perigo e confiar" },
  { id: "muro", label: "Construir um muro diante dos trilhos" },
]

// Analogia ilustrativa (não é evento bíblico). Encaixe editorial sugerido: Ato 2.
export const muroTrem: EpisodeInput = {
  id: "analogia-muro-trem",
  actId: "ato-02",
  kind: "analogia",
  status: "jogavel",
  order: 90,
  title: "O muro e a linha de trem",
  subtitle: "Alguns limites protegem a liberdade",
  period: { label: "Analogia (sem época)", approximate: false, debated: false },
  references: [chapters("Exod", 19, 20), ref("Lev", 19, 2), ref("Deut", 6, 4, 9)],
  theme: "Lei, aliança e limites que protegem",
  humanQuestion: "Por que Deus estabelece limites?",
  authorSummary: { status: "pendente_fonte" },
  manualRequirement: { status: "pendente_fonte" },
  reviewStatus: "em_revisao",
  visualHook: "Um trem passando rente ao quintal — e um muro que transforma o quintal inteiro em lugar de brincar.",
  scenes: [
    {
      id: "muro-quintal",
      type: "analogy",
      title: "Três crianças e um quintal",
      perspective: "investigator",
      visual: "yard-train",
      fxCue: "train",
      illumination: 0.5,
      stage: { caption: "Um quintal enorme. Uma linha de trem nos fundos." },
      audiencePrompt: "Ouça a história. Você vai decidir em seguida.",
      presenterCue: "historia",
      estimatedSeconds: 120,
      blocks: [
        block(
          "analogia",
          "Uma mãe tem três crianças e um quintal enorme. Nos fundos passa uma linha de trem — rápida, barulhenta, perigosa. As crianças querem brincar lá fora. Ela precisa decidir.",
        ),
        block("narracao", "Esta é uma história ilustrativa, não um evento bíblico."),
      ],
    },
    {
      id: "muro-decisao",
      type: "choice",
      title: "Como deixar as crianças brincarem com segurança?",
      perspective: "investigator",
      visual: "yard-train",
      fxCue: "heartbeat",
      illumination: 0.4,
      stage: { caption: "Como deixar as crianças brincarem com segurança?" },
      audiencePrompt: "Vote: o que a mãe deveria fazer?",
      presenterCue: "votacao",
      estimatedSeconds: 150,
      blocks: [block("narracao", "Escolha uma estratégia. Depois, veja o que acontece na simulação.")],
      choice: { prompt: "O que a mãe deveria fazer?", options: STRATEGIES },
      poll: { id: "poll-muro-estrategia", question: "O que a mãe deveria fazer?", kind: "opiniao", options: STRATEGIES },
    },
    {
      id: "muro-consequencia",
      type: "hypothetical_consequence",
      title: "Na simulação…",
      perspective: "investigator",
      visual: "yard-train",
      fxCue: "train",
      illumination: 0.55,
      stage: { caption: "O trem passa." },
      presenterCue: "historia",
      estimatedSeconds: 120,
      hypothetical: {
        choiceSceneId: "muro-decisao",
        byOption: {
          proibir: [
            block(
              "analogia",
              "As crianças ficam seguras — e presas dentro de casa. O perigo foi evitado, mas a liberdade também.",
            ),
          ],
          vigiar: [
            block(
              "analogia",
              "Funciona enquanto a mãe não pisca. Mas ninguém vigia o tempo todo, e as crianças crescem se sentindo sob suspeita.",
            ),
          ],
          explicar: [
            block(
              "analogia",
              "Explicar é essencial. Mas basta uma bola rolando em direção aos trilhos: saber do perigo nem sempre impede a corrida atrás da bola.",
            ),
          ],
          muro: [
            block(
              "analogia",
              "Com o muro, o quintal inteiro vira lugar de brincar. O limite não diminuiu a liberdade: tornou-a possível.",
            ),
          ],
        },
      },
      blocks: [block("narracao", "Agora, veja o muro sendo levantado — e o trem passando.")],
    },
    {
      id: "muro-alianca",
      type: "reflection",
      title: "A Lei dada a um povo libertado",
      perspective: "investigator",
      visual: "yard-train",
      fxCue: "embers",
      illumination: 0.7,
      stage: { caption: "Limites que protegem" },
      audiencePrompt: "Pense: que limite na sua vida funciona como esse muro?",
      presenterCue: "pausa",
      estimatedSeconds: 240,
      blocks: [
        block(
          "parafrase",
          "Antes dos mandamentos, Deus se apresenta como aquele que tirou Israel do Egito, da casa da escravidão. A aliança vem antes da Lei.",
          [ref("Exod", 19, 4, 6), ref("Exod", 20, 2)],
        ),
        block(
          "interpretacao",
          "Como o muro, muitos mandamentos protegem a vida, a família, a verdade e o próximo — e assim tornam possível uma vida livre em comunidade.",
          [ref("Exod", 20, 12, 17)],
        ),
        block(
          "analogia",
          "Limites da analogia: ela ilumina um aspecto, mas não explica toda a Lei. A Lei também trata de santidade, de culto e sacrifícios, de justiça para o pobre e o estrangeiro, da identidade de Israel entre as nações e de uma relação de amor com Deus.",
          [],
          "Limites da analogia",
        ),
        block("narracao", "Para aprofundar: Levítico 19:2; Deuteronômio 4:5–8; 6:4–9; 15; 24:10–22.", [
          ref("Lev", 19, 2),
          ref("Deut", 4, 5, 8),
          ref("Deut", 6, 4, 9),
          ref("Deut", 15, 1, 11),
          ref("Deut", 24, 10, 22),
        ]),
      ],
      reflection: {
        prompts: [
          "Que limite você recebeu (ou deu) que, olhando hoje, protegia a sua liberdade?",
          "Por que faz diferença que a Lei tenha sido dada a um povo já libertado, e não como condição para a libertação?",
        ],
      },
    },
  ],
}
