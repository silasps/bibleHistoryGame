import { chapters, ref } from "../refs"
import type { TimelineItemInput, TimelineWeekInput } from "./schema"

// Linhas do tempo do autor (Task 1 de cada semana), com as datas do Manual
// DBS 11S. Semanas 7–11 ainda aguardam o material do autor.

export const WEEKS: TimelineWeekInput[] = [
  { week: 1, actId: "ato-01", title: "Origens e Cosmovisão", status: "com_material", span: { from: -4000, to: -1446 }, memoryVerse: [ref("Gen", 3, 15)], color: "lilas", sources: ["w1-resumo.txt", "w1-linha-do-tempo.pdf", "w1-contexto.txt"] },
  { week: 2, actId: "ato-02", title: "Pentateuco", status: "com_material", span: { from: -1446, to: -1406 }, memoryVerse: [ref("Lev", 20, 7, 8)], color: "turquesa", sources: ["w2-resumo.txt", "w2-linha-do-tempo.pdf", "w2-contexto.txt"] },
  { week: 3, actId: "ato-03", title: "Tribos e Davi", status: "com_material", span: { from: -1406, to: -970 }, memoryVerse: [ref("Josh", 1, 7), ref("2Sam", 7, 16)], color: "verde", sources: ["w3-resumo.txt", "w3-linha-do-tempo.pdf", "w3-contexto.txt"] },
  { week: 4, actId: "ato-04", title: "Reis", status: "com_material", span: { from: -970, to: -612 }, memoryVerse: [ref("2Chr", 7, 14)], color: "violeta", sources: ["w4-resumo.txt", "w4-linha-do-tempo.pdf", "w4-contexto.txt"] },
  { week: 5, actId: "ato-05", title: "Primeiros Profetas", status: "com_material", span: { from: -800, to: -539 }, memoryVerse: [ref("Mic", 6, 8)], color: "laranja", sources: ["w5-resumo.txt", "w5-linha-do-tempo.pdf", "w5-contexto.txt"] },
  { week: 6, actId: "ato-06", title: "Últimos Profetas", status: "com_material", span: { from: -640, to: -331 }, memoryVerse: [ref("Ezek", 36, 26)], color: "azul", sources: ["w6-resumo.txt", "w6-linha-do-tempo.pdf", "w6-contexto.txt"] },
  { week: 7, actId: "ato-07", title: "Pós-exílio e Intertestamentário", status: "aguardando_material", span: { from: -538, to: -5 }, memoryVerse: [ref("Ezra", 1, 3)], color: "oliva" },
  { week: 8, actId: "ato-08", title: "Jesus", status: "aguardando_material", span: { from: -4, to: 30 }, memoryVerse: [ref("Matt", 28, 5, 6)], color: "dourado" },
  { week: 9, actId: "ato-09", title: "Igreja", status: "aguardando_material", span: { from: 30, to: 68 }, memoryVerse: [ref("Acts", 1, 8)], color: "coral" },
  { week: 10, actId: "ato-10", title: "Paulo", status: "aguardando_material", span: { from: 46, to: 68 }, memoryVerse: [ref("Rom", 5, 10)], color: "magenta" },
  { week: 11, actId: "ato-11", title: "João", status: "aguardando_material", span: { from: 70, to: 100 }, memoryVerse: [ref("Rev", 22, 20)], color: "carmim" },
]

export const ITEMS: TimelineItemInput[] = [
  // ── Semana 1 · Origens e Cosmovisão ────────────────────────────────────
  { id: "criacao", week: 1, kind: "evento", label: "Criação", from: -4000, approx: true, seq: -1, color: "lilas", art: "criacao", refs: [chapters("Gen", 1, 2)] },
  { id: "queda", week: 1, kind: "evento", label: "Queda", from: -4000, approx: true, color: "lilas", art: "queda", refs: [ref("Gen", 3)] },
  { id: "diluvio", week: 1, kind: "evento", label: "Dilúvio", from: -3000, approx: true, color: "ceu", art: "diluvio", refs: [chapters("Gen", 6, 9)] },
  { id: "babel", week: 1, kind: "evento", label: "Torre de Babel", from: -2400, approx: true, color: "coral", art: "babel", refs: [ref("Gen", 11, 1, 9)] },
  { id: "alianca-abraamica", week: 1, kind: "evento", label: "Aliança Abraâmica", from: -2100, color: "verde", art: "alianca-abraamica", refs: [ref("Gen", 12, 1, 3), ref("Gen", 15), ref("Gen", 17)] },
  { id: "sacrificio-isaque", week: 1, kind: "evento", label: "Sacrifício de Isaque", from: -2058, color: "oliva", art: "sacrificio-isaque", refs: [ref("Gen", 22, 1, 19)] },
  { id: "migracao-egito", week: 1, kind: "evento", label: "Migração para o Egito", from: -1876, color: "laranja", art: "migracao-egito", refs: [ref("Gen", 46, 1, 7)] },
  { id: "tempo-egito", week: 1, kind: "evento", label: "Tempo no Egito", from: -1876, to: -1446, color: "magenta", art: "tempo-egito", refs: [ref("Exod", 1, 8, 14), ref("Gen", 15, 13), ref("Exod", 12, 40)] },
  { id: "exodo", week: 1, kind: "evento", label: "Êxodo do Egito", from: -1446, color: "carmim", art: "exodo", refs: [chapters("Exod", 12, 14)] },
  { id: "adao-eva", week: 1, kind: "personagem", label: "Adão e Eva", from: -4000, approx: true, color: "lilas", art: "adao-eva", characterId: "adao-eva", refs: [chapters("Gen", 2, 3)] },
  { id: "noe", week: 1, kind: "personagem", label: "Noé", from: -3000, approx: true, color: "ceu", art: "noe", characterId: "noe", refs: [chapters("Gen", 6, 9)] },
  { id: "abraao", week: 1, kind: "personagem", label: "Abraão", from: -2166, to: -1991, color: "verde", art: "abraao", characterId: "abraao", refs: [ref("Gen", 12, 1, 3), ref("Gen", 25, 7, 8)] },
  { id: "isaque", week: 1, kind: "personagem", label: "Isaque", from: -2066, to: -1886, color: "oliva", art: "isaque", characterId: "isaque", refs: [ref("Gen", 21, 1, 7), ref("Gen", 35, 28, 29)] },
  { id: "jaco", week: 1, kind: "personagem", label: "Jacó", from: -2006, to: -1859, color: "violeta", art: "jaco", characterId: "jaco", refs: [ref("Gen", 28, 10, 22), ref("Gen", 32, 28)] },
  { id: "moises", week: 1, kind: "personagem", label: "Moisés", from: -1526, to: -1406, color: "turquesa", art: "moises", characterId: "moises", refs: [ref("Exod", 2, 1, 10), ref("Exod", 3), ref("Deut", 34, 5, 7)] },

  // ── Semana 2 · Pentateuco ──────────────────────────────────────────────
  { id: "alianca-sinai", week: 2, kind: "evento", label: "A Aliança do Sinai", from: -1445, color: "turquesa", art: "alianca-sinai", refs: [chapters("Exod", 19, 24)] },
  { id: "tabernaculo", week: 2, kind: "evento", label: "Construção do Tabernáculo", from: -1445, color: "dourado", art: "tabernaculo", refs: [chapters("Exod", 25, 40)] },
  { id: "espioes", week: 2, kind: "evento", label: "Espiões enviados", from: -1445, color: "laranja", art: "espioes", refs: [chapters("Num", 13, 14)] },
  { id: "peregrinacao", week: 2, kind: "evento", label: "Peregrinação pelo deserto", from: -1446, to: -1406, color: "oliva", art: "peregrinacao", refs: [ref("Num", 14, 33, 34), ref("Num", 33, 1, 2)] },
  { id: "alianca-deuteronomica", week: 2, kind: "evento", label: "A Aliança Deuteronômica", from: -1406, color: "verde", art: "alianca-deuteronomica", refs: [ref("Deut", 28, 1, 14), chapters("Deut", 29, 30)] },
  { id: "uncao-josue", week: 2, kind: "evento", label: "Unção de Josué", from: -1406, color: "ceu", art: "uncao-josue", refs: [ref("Num", 27, 18, 23), ref("Deut", 34, 9)] },
  { id: "morte-moises", week: 2, kind: "evento", label: "Morte de Moisés", from: -1406, color: "carmim", art: "morte-moises", refs: [ref("Deut", 34, 1, 8)] },
  { id: "arao", week: 2, kind: "personagem", label: "Arão como sumo sacerdote", from: -1445, to: -1407, color: "dourado", art: "arao", characterId: "arao", refs: [chapters("Exod", 28, 29), ref("Lev", 8), ref("Num", 20, 22, 29)] },
  { id: "levitico-santidade", week: 2, kind: "tema", label: "Levítico: sejam santos", anchor: "tabernaculo", color: "dourado", art: "levitico", refs: [ref("Lev", 16), ref("Lev", 20, 7, 8)] },

  // ── Semana 3 · Tribos e Davi ───────────────────────────────────────────
  { id: "conquista-canaa", week: 3, kind: "evento", label: "Conquista de Canaã", from: -1406, to: -1399, color: "verde", art: "conquista", refs: [chapters("Josh", 1, 12)] },
  { id: "periodo-juizes", week: 3, kind: "evento", label: "Período dos Juízes", from: -1375, to: -1050, color: "oliva", art: "juizes", refs: [ref("Judg", 2, 16, 19)] },
  { id: "rute-boaz", week: 3, kind: "evento", label: "Rute se casa com Boaz", from: -1180, color: "magenta", art: "rute-boaz", refs: [ref("Ruth", 4, 13, 17)] },
  { id: "davi-ungido", week: 3, kind: "evento", label: "Davi ungido rei", from: -1024, color: "laranja", art: "davi-ungido", refs: [ref("1Sam", 16, 1, 13)] },
  { id: "alianca-davidica", week: 3, kind: "evento", label: "Aliança Davídica", from: -1000, color: "dourado", art: "alianca-davidica", refs: [ref("2Sam", 7, 12, 16)] },
  { id: "josue", week: 3, kind: "personagem", label: "Josué na liderança", from: -1406, to: -1390, color: "ceu", art: "josue", characterId: "josue", refs: [ref("Josh", 1, 1, 9), ref("Josh", 24, 29)] },
  { id: "debora", week: 3, kind: "personagem", label: "Débora como juíza", from: -1209, to: -1169, color: "lilas", art: "debora", characterId: "debora", refs: [chapters("Judg", 4, 5)] },
  { id: "gideao", week: 3, kind: "personagem", label: "Gideão como juiz", from: -1191, to: -1144, color: "turquesa", art: "gideao", characterId: "gideao", refs: [chapters("Judg", 6, 8)] },
  { id: "sansao", week: 3, kind: "personagem", label: "Sansão como juiz", from: -1118, to: -1078, color: "coral", art: "sansao", characterId: "sansao", refs: [chapters("Judg", 13, 16)] },
  { id: "samuel", week: 3, kind: "personagem", label: "Samuel", from: -1102, to: -1014, color: "violeta", art: "samuel", characterId: "samuel", refs: [ref("1Sam", 1, 20), ref("1Sam", 3), ref("1Sam", 25, 1)] },
  { id: "saul", week: 3, kind: "personagem", label: "Reinado de Saul", from: -1050, to: -1010, color: "carmim", art: "saul", characterId: "saul", refs: [ref("1Sam", 10, 1), ref("1Sam", 31)] },
  { id: "davi", week: 3, kind: "personagem", label: "Reinado de Davi", from: -1010, to: -970, color: "dourado", art: "davi", characterId: "davi", refs: [ref("2Sam", 5, 1, 5), ref("1Kgs", 2, 10, 11)] },

  // ── Semana 4 · Reis ────────────────────────────────────────────────────
  { id: "templo", week: 4, kind: "evento", label: "Construção do Templo", from: -966, to: -959, color: "violeta", art: "templo", refs: [ref("1Kgs", 6, 1), ref("1Kgs", 6, 37, 38)] },
  { id: "divisao-reino", week: 4, kind: "evento", label: "Divisão do Reino", from: -931, color: "carmim", art: "divisao-reino", refs: [ref("1Kgs", 12, 1, 20)] },
  { id: "salomao", week: 4, kind: "personagem", label: "Reinado de Salomão", from: -970, to: -931, color: "azul", art: "salomao", characterId: "salomao", refs: [chapters("1Kgs", 1, 11)] },
  { id: "jeroboao", week: 4, kind: "personagem", label: "Reinado de Jeroboão", sub: "Israel", from: -931, to: -910, color: "verde", art: "jeroboao", characterId: "jeroboao", refs: [ref("1Kgs", 12, 20, 33)] },
  { id: "roboao", week: 4, kind: "personagem", label: "Reinado de Roboão", sub: "Judá", from: -931, to: -913, color: "coral", art: "roboao", characterId: "roboao", refs: [ref("1Kgs", 12, 1, 19), ref("1Kgs", 14, 21, 31)] },
  { id: "elias", week: 4, kind: "personagem", label: "Elias como profeta", sub: "Israel", from: -875, to: -848, color: "ceu", art: "elias", characterId: "elias", refs: [ref("1Kgs", 17, 1), ref("1Kgs", 18, 20, 40), ref("2Kgs", 2, 11)] },
  { id: "acabe", week: 4, kind: "personagem", label: "Reinado de Acabe", sub: "Israel", from: -874, to: -853, color: "oliva", art: "acabe", characterId: "acabe", refs: [ref("1Kgs", 16, 29, 33), ref("1Kgs", 21)] },
  { id: "eliseu", week: 4, kind: "personagem", label: "Eliseu como profeta", sub: "Israel", from: -848, to: -797, color: "laranja", art: "eliseu", characterId: "eliseu", refs: [ref("1Kgs", 19, 19, 21), ref("2Kgs", 2, 9, 15)] },
  { id: "aram", week: 4, kind: "potencia", label: "Aram/Síria", from: -940, to: -732, color: "turquesa", art: "aram", refs: [ref("1Kgs", 20, 1), ref("2Kgs", 16, 9)] },
  { id: "assiria", week: 4, kind: "potencia", label: "Assíria", from: -745, to: -612, color: "azul", art: "assiria", refs: [ref("2Kgs", 15, 19, 20), ref("2Kgs", 17, 3, 6)] },
  { id: "reis-julgamento", week: 4, kind: "tema", label: "Os reis e a aliança", anchor: "divisao-reino", color: "violeta", art: "coroa", refs: [ref("Deut", 17, 14, 20), ref("2Kgs", 17, 7, 23)] },
  { id: "profetas-do-reino", week: 4, kind: "tema", label: "Profetas lembram a aliança", anchor: "elias", color: "ceu", art: "profeta-rolo", refs: [ref("Amos", 5, 24), ref("Hos", 3, 1), ref("Isa", 9, 6, 7)] },

  // ── Semana 5 · Primeiros Profetas ──────────────────────────────────────
  { id: "queda-samaria", week: 5, kind: "evento", label: "Queda de Samaria", from: -722, color: "lilas", art: "queda-samaria", refs: [ref("2Kgs", 17, 5, 6)] },
  { id: "cerco-jerusalem", week: 5, kind: "evento", label: "Cerco Assírio a Jerusalém", from: -701, color: "carmim", art: "cerco-jerusalem", refs: [ref("2Kgs", 18, 13), ref("2Kgs", 19, 32, 36)] },
  { id: "isaias", week: 5, kind: "personagem", label: "Isaías como profeta", sub: "Judá", from: -740, to: -686, color: "laranja", art: "isaias", characterId: "isaias", refs: [ref("Isa", 1, 1), ref("Isa", 6, 1, 8)] },
  { id: "ezequias", week: 5, kind: "personagem", label: "Reinado de Ezequias", sub: "Judá", from: -727, to: -697, color: "verde", art: "ezequias", characterId: "ezequias", refs: [chapters("2Kgs", 18, 20)] },
  { id: "manasses", week: 5, kind: "personagem", label: "Reinado de Manassés", sub: "Judá", from: -697, to: -642, color: "coral", art: "manasses", characterId: "manasses", refs: [ref("2Kgs", 21, 1, 18)] },
  { id: "babilonia", week: 5, kind: "potencia", label: "Babilônia", from: -626, to: -539, color: "azul", art: "babilonia", refs: [ref("2Kgs", 20, 12, 18), ref("2Kgs", 24, 10, 16)] },
  { id: "amos", week: 5, kind: "tema", label: "Amós", sub: "justiça", anchor: "queda-samaria", color: "oliva", art: "amos", characterId: "amos", refs: [ref("Amos", 1, 1), ref("Amos", 5, 24)] },
  { id: "oseias", week: 5, kind: "tema", label: "Oseias", sub: "amor fiel", anchor: "queda-samaria", color: "magenta", art: "oseias", characterId: "oseias", refs: [chapters("Hos", 1, 3), ref("Hos", 11, 8, 9)] },
  { id: "joel", week: 5, kind: "tema", label: "Joel", sub: "o Espírito", anchor: "isaias", color: "ceu", art: "joel", characterId: "joel", refs: [ref("Joel", 2, 28), ref("Joel", 3, 14, 16)] },
  { id: "miqueias", week: 5, kind: "tema", label: "Miqueias", sub: "Belém", anchor: "isaias", color: "dourado", art: "miqueias", characterId: "miqueias", refs: [ref("Mic", 5, 2), ref("Mic", 6, 8)] },
  { id: "jonas", week: 5, kind: "tema", label: "Jonas", sub: "Nínive", anchor: "queda-samaria", color: "turquesa", art: "jonas", characterId: "jonas", refs: [ref("Jonah", 1, 2), ref("Jonah", 3, 4, 10)] },
  { id: "naum", week: 5, kind: "tema", label: "Naum", sub: "juízo da Assíria", anchor: "manasses", color: "violeta", art: "naum", characterId: "naum", refs: [ref("Nah", 1, 3, 8)] },

  // ── Semana 6 · Últimos Profetas ────────────────────────────────────────
  { id: "queda-jerusalem", week: 6, kind: "evento", label: "Queda de Jerusalém", from: -586, color: "lilas", art: "queda-jerusalem", refs: [ref("2Kgs", 25, 1, 10)] },
  { id: "inicio-exilio", week: 6, kind: "evento", label: "Início do Exílio", from: -586, color: "verde", art: "exilio", refs: [ref("2Kgs", 25, 11, 21)] },
  { id: "ciro", week: 6, kind: "evento", label: "Ciro conquistou a Babilônia", from: -539, color: "carmim", art: "ciro", refs: [ref("Ezra", 1, 1, 3), ref("Isa", 45, 1)] },
  { id: "josias", week: 6, kind: "personagem", label: "Reinado de Josias", sub: "Judá", from: -640, to: -609, color: "turquesa", art: "josias", characterId: "josias", refs: [chapters("2Kgs", 22, 23)] },
  { id: "jeremias", week: 6, kind: "personagem", label: "Jeremias como profeta", sub: "Judá", from: -627, to: -580, color: "azul", art: "jeremias", characterId: "jeremias", refs: [ref("Jer", 1, 1, 10)] },
  { id: "daniel", week: 6, kind: "personagem", label: "Daniel como profeta", sub: "no exílio", from: -605, to: -536, color: "coral", art: "daniel", characterId: "daniel", refs: [ref("Dan", 1, 1, 6), ref("Dan", 6, 22)] },
  { id: "ezequiel", week: 6, kind: "personagem", label: "Ezequiel como profeta", sub: "no exílio", from: -597, to: -571, color: "laranja", art: "ezequiel", characterId: "ezequiel", refs: [ref("Ezek", 1, 1, 3), ref("Ezek", 36, 26)] },
  { id: "persia", week: 6, kind: "potencia", label: "Pérsia", from: -539, to: -331, color: "oliva", art: "persia", refs: [ref("Ezra", 1, 1, 4)] },
  { id: "sofonias", week: 6, kind: "tema", label: "Sofonias", sub: "juízo e remanescente", anchor: "josias", color: "violeta", art: "sofonias", characterId: "sofonias", refs: [ref("Zeph", 1, 4), ref("Zeph", 3, 18, 20)] },
  { id: "habacuque", week: 6, kind: "tema", label: "Habacuque", sub: "o justo pela fé", anchor: "jeremias", color: "dourado", art: "habacuque", characterId: "habacuque", refs: [ref("Hab", 1, 2, 6), ref("Hab", 2, 4), ref("Hab", 3, 17, 19)] },
]
