// Folha de notas da "Apresentação Visão Geral da Bíblia" (Manual DBS 11S,
// p. 14 e 18). O app só confere e avisa; o conteúdo de cada item é do autor.

export const RUBRIC_SOURCE = "Manual DBS 11S, p. 14 e 18"

export const RUBRIC_DATES = {
  rehearsal: "Ensaio ao final do Antigo Testamento",
  final: "Apresentação final: 10 e 11 de dezembro",
}

export const RUBRIC = {
  intro: { label: "Introdução que mencione a finalidade de mostrar o PRD", points: "3" },
  weeks: { label: "Cada semana com histórias principais, versículo e PRD", points: "3 por semana" },
  personal: { label: "Alguma revelação pessoal (e a transformação que você viveu)", points: "—" },
  character: { label: "Caráter e Natureza de Deus ao longo da apresentação", points: "10" },
  conclusion: { label: "Conclusão", points: "2" },
  timeline: { label: "Qualidade e uso da linha do tempo", points: "10" },
  time: { label: "Tempo entre 30 e 45 minutos", points: "4" },
  guests: { label: "Trazer 2 pessoas de fora da escola", points: "20" },
} as const
