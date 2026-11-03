import type { Correction } from "./schema"

// Referências do material do autor que o app exibe corrigidas.
// Os arquivos originais não são alterados; o /editor lista cada correção.
export const CORRECTIONS: Correction[] = [
  { id: "c1", week: 1, file: "contexto", original: "Gn 10:22-23", corrected: "Êx 10:21–23", note: "Trevas de três dias sobre o Egito" },
  { id: "c2", week: 2, file: "resumo", original: "(Gn 3)", corrected: "Êx 3", note: "Sarça ardente" },
  { id: "c3", week: 2, file: "resumo", original: "Números 10:1-3 (Morte dos filhos de Arão)", corrected: "Lv 10:1–3", note: "Trecho omitido no app por estar incompleto no resumo" },
  { id: "c4", week: 2, file: "contexto", original: "Josué 20:8-9", corrected: "Js 20:1–9", note: "Cidades de refúgio" },
  { id: "c5", week: 3, file: "resumo", original: "Js 1:11c", corrected: "1Sm 1:11", note: "Voto de Ana" },
  { id: "c6", week: 4, file: "resumo", original: "Ex 20:3", corrected: "Êx 20:13", note: "“Não mate”" },
  { id: "c7", week: 4, file: "resumo", original: "1Rs 3:3", corrected: "1Rs 11:1–13", note: "Salomão e outros deuses" },
  { id: "c8", week: 4, file: "contexto", original: "1 Reis 4:25a", corrected: "1Rs 4:26", note: "Cavalos de Salomão" },
  { id: "c9", week: 6, file: "resumo", original: "Hb 1:2; Hb 2:4c; Hb 3:17-19", corrected: "Hc 1:2; Hc 2:4; Hc 3:17–19", note: "“Hb” é Hebreus; Habacuque é “Hc”" },
  { id: "c10", week: 3, file: "resumo", original: "2Sm 2:2a", corrected: "2Sm 2:1", note: "“Davi consultou o Senhor”" },
  { id: "c11", week: 2, file: "resumo", original: "Êx 6-11", corrected: "Êx 7–11", note: "As pragas" },
]
