import { block, chapters } from "../../refs"
import type { EpisodeInput } from "../../schema"
import { genesisEvidence } from "./evidence"
import { genesisScenes } from "./scenes"

export const genesis13: EpisodeInput = {
  id: "genesis-1-3",
  actId: "ato-01",
  kind: "narrativa",
  status: "jogavel",
  order: 1,
  title: "Gênesis 1–3 · O jardim e a promessa",
  subtitle: "Se Deus criou tudo bom, por que existe tanto mal?",
  period: {
    label: "Origens",
    approximate: true,
    debated: true,
    note: "O relato não oferece datação histórica.",
  },
  references: [chapters("Gen", 1, 3)],
  events: [
    "Deus cria e ordena os céus e a terra",
    "O ser humano é criado à imagem de Deus",
    "O jardim do Éden, a ordem e o limite",
    "A tentação e a queda",
    "Consequências, cuidado de Deus e saída do jardim",
  ],
  characters: ["Deus", "O homem (Adão)", "A mulher (Eva)", "A serpente"],
  geography:
    "O Éden é descrito com quatro rios, dois deles identificáveis com o Tigre e o Eufrates (Gn 2:10–14); a localização exata é desconhecida.",
  historicalContext: [
    block(
      "interpretacao",
      "Gênesis foi transmitido em um mundo antigo com outros relatos de origem; muitos estudiosos leem os capítulos 1–11 como uma resposta teológica a perguntas que todos esses povos faziam.",
    ),
  ],
  peoplesAndPowers: [],
  theme: "Criação boa, liberdade, queda e promessa",
  humanQuestion: "Se Deus criou tudo bom, por que existe tanto mal?",
  connectionEvidence: ["ev-descendencia", "ev-abraao-descendencia"],
  linksTo: [{ episodeId: "abraao", note: "A promessa da descendência continua em Gênesis 12 (em desenvolvimento)." }],
  authorSummary: {
    status: "pendente_fonte",
    source: "O resumo da semana 1 (DBS 2026) está na jornada pela linha do tempo; este episódio ainda não foi conferido com ele.",
  },
  manualRequirement: {
    status: "pendente_fonte",
    note: "Exigências do Manual DBS do Estudante 11S ainda não conferidas.",
  },
  gaps: [
    "Conferir as paráfrases contra a NAA antes de publicar.",
    "Conferir a nota sobre o pronome singular em Gn 3:15 com comentários (Bible Hub).",
  ],
  supportSources: ["NAA (conferência de versículos)", "BibleProject (organização temática, sem copiar material)", "Bible Hub (comentários)"],
  visualHook: "Uma semente caindo na terra escura e um fio dourado que começa a se desenhar.",
  reviewStatus: "em_revisao",
  scenes: genesisScenes,
  movements: [
    { id: "criacao-jardim", title: "Criação e jardim", endsAt: "jardim" },
    { id: "tentacao-queda", title: "Tentação e queda", endsAt: "relato" },
    { id: "promessa", title: "A promessa", endsAt: "evidencia-descendencia" },
    { id: "hoje", title: "Hoje", endsAt: "chave-limites" },
  ],
  evidence: genesisEvidence,
}
