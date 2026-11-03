import { z } from "zod"
import { ref } from "../refs"
import { BibleRef } from "../schema"
import { ItemColor } from "../overview/schema"

// Personagens da linha do tempo. Cada objeto da "skin" declara sua base:
// texto (com referência NAA), contexto (com fonte) ou licença artística.
// Significado dos nomes conferido no Bible Hub (Easton's / Strong's /
// Hitchcock's) em 2026-11-03; quando o próprio texto explica o nome, ele é citado.

export const SkinItem = z
  .object({
    id: z.string(),
    label: z.string(),
    basis: z.enum(["texto", "contexto", "licenca_artistica"]),
    refs: z.array(BibleRef).default([]),
    source: z.string().optional(),
    meaning: z.string().max(170),
  })
  .refine((s) => s.basis !== "texto" || s.refs.length > 0, "skin com base no texto exige referência")
  .refine((s) => s.basis !== "contexto" || !!s.source, "skin de contexto exige fonte")
export type SkinItem = z.infer<typeof SkinItem>

export const Relation = z.enum(["genealogia", "familia", "sucessao", "uncao", "promessa", "profecia", "confronto"])
export type Relation = z.infer<typeof Relation>

export const Character = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  role: z.string(),
  week: z.number().int(),
  /** Item da linha do tempo onde o personagem aparece. */
  itemId: z.string().optional(),
  art: z.string(),
  color: ItemColor,
  nameMeaning: z.object({ text: z.string(), source: z.string(), url: z.string().url(), refs: z.array(BibleRef).default([]) }),
  skin: z.array(SkinItem).default([]),
  connections: z.array(z.object({ to: z.string(), relation: Relation, refs: z.array(BibleRef).min(1), note: z.string() })).default([]),
})
export type Character = z.infer<typeof Character>
type CharacterInput = z.input<typeof Character>

const hub = (slug: string) => `https://biblehub.com/topical/${slug[0]}/${slug}.htm`
const art = { basis: "licenca_artistica" as const }

const DATA: CharacterInput[] = [
  {
    id: "adao-eva", name: "Adão e Eva", role: "Os primeiros seres humanos", week: 1, itemId: "adao-eva", art: "adao-eva", color: "lilas",
    nameMeaning: { text: "Adão: “terroso; vermelho” (Hitchcock, Easton). Eva: “vida” (Strong); o texto explica o nome: ela é a mãe de todos os seres humanos.", source: "Bible Hub · Hitchcock, Easton, Strong", url: hub("eve"), refs: [ref("Gen", 3, 20)] },
    skin: [
      { id: "arvore", label: "A árvore e o fruto", basis: "texto", refs: [ref("Gen", 2, 9), ref("Gen", 2, 16, 17)], meaning: "A árvore do conhecimento do bem e do mal: o único limite no jardim." },
      { id: "folhas", label: "Folhas de figueira", basis: "texto", refs: [ref("Gen", 3, 7)], meaning: "Depois da queda, eles costuram folhas de figueira para se cobrir." },
      { id: "vestes", label: "Vestes de pele", basis: "texto", refs: [ref("Gen", 3, 21)], meaning: "O próprio Deus faz roupas de pele e os veste." },
      { id: "roupas-desenho", label: "Roupas no desenho", ...art, meaning: "A representação vestida é uma escolha artística." },
    ],
    connections: [{ to: "noe", relation: "genealogia", refs: [ref("Gen", 5, 1, 32)], note: "A genealogia de Adão chega a Noé." }],
  },
  {
    id: "noe", name: "Noé", role: "Construtor da arca", week: 1, itemId: "noe", art: "noe", color: "ceu",
    nameMeaning: { text: "“Descanso” (Easton, Strong); o texto liga o nome a consolo e alívio.", source: "Bible Hub · Easton, Strong 5146", url: hub("noah"), refs: [ref("Gen", 5, 29)] },
    skin: [
      { id: "arca", label: "A arca", basis: "texto", refs: [ref("Gen", 6, 14, 16)], meaning: "Deus manda construir a arca para salvar Noé, sua família e os animais." },
      { id: "pomba", label: "Pomba com folha de oliveira", basis: "texto", refs: [ref("Gen", 8, 11)], meaning: "A pomba volta com uma folha de oliveira: as águas tinham baixado." },
      { id: "cajado", label: "Cajado", ...art, meaning: "Objeto de composição, sem base no texto." },
    ],
    connections: [{ to: "abraao", relation: "genealogia", refs: [ref("Gen", 11, 10, 26)], note: "De Sem, filho de Noé, vem Abrão." }],
  },
  {
    id: "abraao", name: "Abraão", role: "Pai da fé e da aliança", week: 1, itemId: "abraao", art: "abraao", color: "verde",
    nameMeaning: { text: "“Pai de uma multidão” (Easton); o texto explica: Deus o faz pai de muitas nações.", source: "Bible Hub · Easton, Hitchcock, Strong 85", url: hub("abraham"), refs: [ref("Gen", 17, 5)] },
    skin: [
      { id: "estrelas", label: "As estrelas", basis: "texto", refs: [ref("Gen", 15, 5)], meaning: "Deus manda Abrão olhar para o céu e contar as estrelas: assim seria a sua descendência." },
      { id: "tenda", label: "A tenda", basis: "texto", refs: [ref("Gen", 18, 1)], meaning: "Abraão vivia em tendas; à entrada da tenda recebe a visita do Senhor." },
      { id: "turbante", label: "Turbante", ...art, meaning: "Indumentária de composição, sem base no texto." },
    ],
    connections: [
      { to: "isaque", relation: "genealogia", refs: [ref("Gen", 21, 3)], note: "Pai de Isaque, o filho da promessa." },
      { to: "moises", relation: "promessa", refs: [ref("Exod", 2, 24)], note: "Deus se lembra da aliança com Abraão, Isaque e Jacó ao ouvir o povo no Egito." },
    ],
  },
  {
    id: "isaque", name: "Isaque", role: "O filho da promessa", week: 1, itemId: "isaque", art: "isaque", color: "oliva",
    nameMeaning: { text: "“Riso” (Easton); “ele ri” (Strong).", source: "Bible Hub · Easton, Strong 3327", url: hub("isaac"), refs: [ref("Gen", 21, 6)] },
    skin: [
      { id: "lenha", label: "A lenha nas costas", basis: "texto", refs: [ref("Gen", 22, 6)], meaning: "Abraão põe a lenha do holocausto sobre Isaque." },
      { id: "carneiro", label: "O carneiro", basis: "texto", refs: [ref("Gen", 22, 13)], meaning: "Um carneiro preso pelos chifres é oferecido no lugar de Isaque." },
    ],
    connections: [{ to: "jaco", relation: "genealogia", refs: [ref("Gen", 25, 26)], note: "Pai de Esaú e Jacó." }],
  },
  {
    id: "jaco", name: "Jacó", role: "Chamado Israel", week: 1, itemId: "jaco", art: "jaco", color: "violeta",
    nameMeaning: { text: "“Aquele que segue os calcanhares; suplantador” (Easton). Depois, recebe o nome Israel.", source: "Bible Hub · Easton, Hitchcock", url: hub("jacob"), refs: [ref("Gen", 25, 26), ref("Gen", 32, 28)] },
    skin: [{ id: "escada", label: "A escada", basis: "texto", refs: [ref("Gen", 28, 12)], meaning: "Em sonho, uma escada liga a terra ao céu, e Deus renova a promessa." }],
  },
  {
    id: "moises", name: "Moisés", role: "Libertador e legislador", week: 1, itemId: "moises", art: "moises", color: "turquesa",
    nameMeaning: { text: "“Tirado (das águas)” (Hitchcock, Easton); o texto explica o nome.", source: "Bible Hub · Hitchcock, Easton", url: hub("moses"), refs: [ref("Exod", 2, 10)] },
    skin: [
      { id: "tabuas", label: "As tábuas da Lei", basis: "texto", refs: [ref("Exod", 31, 18), ref("Exod", 34, 29)], meaning: "As duas tábuas do testemunho, escritas pelo dedo de Deus." },
      { id: "cajado", label: "O cajado", basis: "texto", refs: [ref("Exod", 4, 2, 4), ref("Exod", 14, 16)], meaning: "O cajado que Deus usa nos sinais e na abertura do mar." },
    ],
    connections: [
      { to: "arao", relation: "familia", refs: [ref("Exod", 4, 14)], note: "Arão, seu irmão, fala por ele." },
      { to: "josue", relation: "sucessao", refs: [ref("Num", 27, 18, 23)], note: "Moisés impõe as mãos sobre Josué." },
    ],
  },
  {
    id: "arao", name: "Arão", role: "Sumo sacerdote", week: 2, itemId: "arao", art: "arao", color: "dourado",
    nameMeaning: { text: "Significado incerto: “montanhês”, “monte de força” ou “iluminador” (Easton).", source: "Bible Hub · Easton, Hitchcock", url: hub("aaron") },
    skin: [
      { id: "mitra", label: "A mitra com a lâmina de ouro", basis: "texto", refs: [ref("Exod", 28, 36, 38)], meaning: "Na lâmina de ouro, presa à mitra, estava gravado: Santidade ao Senhor." },
      { id: "peitoral", label: "O peitoral com 12 pedras", basis: "texto", refs: [ref("Exod", 28, 15, 21), ref("Exod", 28, 29)], meaning: "Doze pedras com os nomes das tribos, sobre o coração do sacerdote." },
      { id: "romas", label: "Campainhas e romãs na orla", basis: "texto", refs: [ref("Exod", 28, 33, 35)], meaning: "Na orla do manto, campainhas de ouro e romãs." },
      { id: "vara", label: "A vara que floresceu", basis: "texto", refs: [ref("Num", 17, 8)], meaning: "A vara de Arão brota, floresce e dá amêndoas." },
    ],
  },
  {
    id: "josue", name: "Josué", role: "Líder da conquista", week: 3, itemId: "josue", art: "josue", color: "ceu",
    nameMeaning: { text: "“O Senhor é salvação” (Strong 3091).", source: "Bible Hub · Strong 3091, Easton", url: hub("joshua") },
    skin: [
      { id: "lanca", label: "A lança estendida", basis: "texto", refs: [ref("Josh", 8, 18), ref("Josh", 8, 26)], meaning: "Josué estende a lança em direção a Ai, e só a recolhe depois da vitória." },
      { id: "muralhas", label: "As muralhas de Jericó", basis: "texto", refs: [ref("Josh", 6, 20)], meaning: "Ao som das trombetas e do grito do povo, as muralhas caem." },
      { id: "elmo", label: "Elmo", ...art, meaning: "Indumentária de composição." },
    ],
  },
  {
    id: "raabe", name: "Raabe", role: "A estrangeira resgatada", week: 3, itemId: "rute-boaz", art: "raabe", color: "carmim",
    nameMeaning: { text: "“Larga, ampla” (Easton).", source: "Bible Hub · Easton, Hitchcock", url: hub("rahab") },
    skin: [
      { id: "cordao", label: "O cordão escarlate", basis: "texto", refs: [ref("Josh", 2, 18), ref("Josh", 2, 21)], meaning: "O cordão na janela marca a casa que seria poupada." },
      { id: "linho", label: "Os feixes de linho", basis: "texto", refs: [ref("Josh", 2, 6)], meaning: "Ela esconde os espiões sob os feixes de linho no terraço." },
    ],
    connections: [{ to: "boaz", relation: "genealogia", refs: [ref("Matt", 1, 5)], note: "Mãe de Boaz." }],
  },
  {
    id: "boaz", name: "Boaz", role: "O resgatador", week: 3, itemId: "rute-boaz", art: "rute-boaz", color: "magenta",
    nameMeaning: { text: "“Prontidão” (Easton); “rapidez” (Strong).", source: "Bible Hub · Easton, Strong", url: hub("boaz") },
    skin: [{ id: "feixes", label: "Os feixes de cevada", basis: "texto", refs: [ref("Ruth", 2, 15, 17)], meaning: "Boaz manda deixar espigas para Rute recolher." }],
    connections: [
      { to: "rute", relation: "familia", refs: [ref("Ruth", 4, 13)], note: "Casa-se com Rute." },
      { to: "davi", relation: "genealogia", refs: [ref("Ruth", 4, 21, 22)], note: "Bisavô de Davi." },
    ],
  },
  {
    id: "rute", name: "Rute", role: "A moabita fiel", week: 3, itemId: "rute-boaz", art: "rute-boaz", color: "magenta",
    nameMeaning: { text: "“Amiga” (Easton); “amizade” (Strong).", source: "Bible Hub · Easton, Strong", url: hub("ruth") },
    skin: [{ id: "cevada", label: "A cevada recolhida", basis: "texto", refs: [ref("Ruth", 2, 17)], meaning: "Rute recolhe e debulha cerca de uma efa de cevada." }],
  },
  {
    id: "debora", name: "Débora", role: "Profetisa e juíza", week: 3, itemId: "debora", art: "debora", color: "lilas",
    nameMeaning: { text: "“Abelha” (Easton, Strong).", source: "Bible Hub · Easton, Strong 1682", url: hub("deborah") },
    skin: [{ id: "palmeira", label: "A palmeira de Débora", basis: "texto", refs: [ref("Judg", 4, 5)], meaning: "Ela julgava Israel sentada debaixo da palmeira." }],
  },
  {
    id: "gideao", name: "Gideão", role: "Juiz", week: 3, itemId: "gideao", art: "gideao", color: "turquesa",
    nameMeaning: { text: "“O que quebra; destruidor” (só Hitchcock; Easton e Strong não dão significado).", source: "Bible Hub · Hitchcock", url: hub("gideon") },
    skin: [{ id: "jarro", label: "Jarro, tocha e trombeta", basis: "texto", refs: [ref("Judg", 7, 16), ref("Judg", 7, 20)], meaning: "Trezentos homens com trombetas e tochas dentro de jarros." }],
  },
  {
    id: "sansao", name: "Sansão", role: "Juiz nazireu", week: 3, itemId: "sansao", art: "sansao", color: "coral",
    nameMeaning: { text: "“Do sol” (Easton).", source: "Bible Hub · Easton, Hitchcock", url: hub("samson") },
    skin: [
      { id: "cabelo", label: "O cabelo comprido", basis: "texto", refs: [ref("Judg", 13, 5), ref("Judg", 16, 17)], meaning: "Nazireu desde o ventre: a navalha não passaria pela sua cabeça." },
      { id: "colunas", label: "As colunas", basis: "texto", refs: [ref("Judg", 16, 29, 30)], meaning: "No fim, ele derruba as colunas do templo de Dagom." },
    ],
  },
  {
    id: "samuel", name: "Samuel", role: "Profeta e juiz", week: 3, itemId: "samuel", art: "samuel", color: "violeta",
    nameMeaning: { text: "“Ouvido por Deus” (Easton); Ana explica o nome: ela o pediu ao Senhor.", source: "Bible Hub · Easton, Hitchcock", url: hub("samuel"), refs: [ref("1Sam", 1, 20)] },
    skin: [{ id: "chifre", label: "O chifre de azeite", basis: "texto", refs: [ref("1Sam", 16, 13)], meaning: "Samuel unge Davi com o chifre de azeite." }],
    connections: [
      { to: "saul", relation: "uncao", refs: [ref("1Sam", 10, 1)], note: "Unge Saul como rei." },
      { to: "davi", relation: "uncao", refs: [ref("1Sam", 16, 13)], note: "Unge Davi." },
    ],
  },
  {
    id: "saul", name: "Saul", role: "Primeiro rei", week: 3, itemId: "saul", art: "saul", color: "carmim",
    nameMeaning: { text: "“Pedido” (Easton).", source: "Bible Hub · Easton, Hitchcock", url: hub("saul") },
    skin: [
      { id: "altura", label: "Mais alto que o povo", basis: "texto", refs: [ref("1Sam", 9, 2), ref("1Sam", 10, 23)], meaning: "Dos ombros para cima, era mais alto que todo o povo." },
      { id: "lanca", label: "A lança", basis: "texto", refs: [ref("1Sam", 26, 7)], meaning: "A lança fincada na terra, à sua cabeceira." },
      { id: "coroa", label: "A coroa", basis: "texto", refs: [ref("2Sam", 1, 10)], meaning: "A coroa que estava na sua cabeça é levada a Davi." },
    ],
  },
  {
    id: "davi", name: "Davi", role: "Rei segundo o coração de Deus", week: 3, itemId: "davi", art: "davi", color: "dourado",
    nameMeaning: { text: "“Amado” (Easton); “talvez ‘amado’” (Strong 1732).", source: "Bible Hub · Easton, Strong 1732", url: hub("david") },
    skin: [
      { id: "harpa", label: "A harpa", basis: "texto", refs: [ref("1Sam", 16, 23)], meaning: "Davi tocava a harpa para Saul." },
      { id: "funda", label: "A funda e as cinco pedras", basis: "texto", refs: [ref("1Sam", 17, 40)], meaning: "Cinco pedras lisas do ribeiro e a funda na mão, diante de Golias." },
      { id: "ruivo", label: "Ruivo, de belos olhos", basis: "texto", refs: [ref("1Sam", 16, 12)], meaning: "Assim o texto descreve o jovem Davi (ainda não representado no desenho)." },
    ],
    connections: [{ to: "salomao", relation: "genealogia", refs: [ref("2Sam", 12, 24)], note: "Pai de Salomão." }],
  },
  {
    id: "salomao", name: "Salomão", role: "Rei sábio, construtor do templo", week: 4, itemId: "salomao", art: "salomao", color: "azul",
    nameMeaning: { text: "“Pacífico” (Easton); o texto liga o nome à paz.", source: "Bible Hub · Easton, Hitchcock", url: hub("solomon"), refs: [ref("1Chr", 22, 9)] },
    skin: [
      { id: "templo", label: "O templo", basis: "texto", refs: [ref("1Kgs", 6, 1), ref("1Kgs", 6, 38)], meaning: "Constrói a Casa do Senhor em sete anos." },
      { id: "rolo", label: "O rolo", ...art, meaning: "Representa a sabedoria pedida a Deus (1Rs 3:9); o objeto é escolha artística." },
    ],
    connections: [
      { to: "roboao", relation: "genealogia", refs: [ref("1Kgs", 11, 43)], note: "Pai de Roboão." },
      { to: "jeroboao", relation: "sucessao", refs: [ref("1Kgs", 11, 31)], note: "Dez tribos são entregues a Jeroboão." },
    ],
  },
  {
    id: "jeroboao", name: "Jeroboão", role: "Primeiro rei de Israel (Norte)", week: 4, itemId: "jeroboao", art: "jeroboao", color: "verde",
    nameMeaning: { text: "“O povo aumenta” (Strong); “aumento do povo” (Easton).", source: "Bible Hub · Strong, Easton", url: hub("jeroboam") },
    skin: [{ id: "bezerro", label: "O bezerro de ouro", basis: "texto", refs: [ref("1Kgs", 12, 28, 29)], meaning: "Faz dois bezerros de ouro, em Betel e em Dã." }],
  },
  {
    id: "roboao", name: "Roboão", role: "Rei de Judá (Sul)", week: 4, itemId: "roboao", art: "roboao", color: "coral",
    nameMeaning: { text: "“O povo se amplia” (Strong); “ele amplia o povo” (Easton).", source: "Bible Hub · Strong, Easton", url: hub("rehoboam") },
    skin: [{ id: "jugo", label: "O jugo pesado", basis: "texto", refs: [ref("1Kgs", 12, 14)], meaning: "Roboão responde ao povo que tornaria o jugo ainda mais pesado do que o do seu pai." }],
  },
  {
    id: "elias", name: "Elias", role: "Profeta em Israel", week: 4, itemId: "elias", art: "elias", color: "ceu",
    nameMeaning: { text: "“Cujo Deus é o Senhor” (Easton); “Yah é Deus” (Strong).", source: "Bible Hub · Easton, Strong", url: hub("elijah") },
    skin: [{ id: "fogo", label: "Fogo sobre o altar", basis: "texto", refs: [ref("1Kgs", 18, 38)], meaning: "No Carmelo, o fogo do Senhor cai e consome o sacrifício." }],
    connections: [
      { to: "eliseu", relation: "sucessao", refs: [ref("1Kgs", 19, 19), ref("2Kgs", 2, 13, 15)], note: "Lança o manto sobre Eliseu." },
      { to: "acabe", relation: "confronto", refs: [ref("1Kgs", 18, 17, 18)], note: "Confronta o rei Acabe." },
    ],
  },
  {
    id: "acabe", name: "Acabe", role: "Rei de Israel (Norte)", week: 4, itemId: "acabe", art: "acabe", color: "oliva",
    nameMeaning: { text: "“Irmão do pai” (Easton, Strong 256).", source: "Bible Hub · Easton, Strong 256", url: hub("ahab") },
    skin: [{ id: "vinha", label: "A vinha de Nabote", basis: "texto", refs: [ref("1Kgs", 21, 15, 16)], meaning: "Toma posse da vinha de Nabote, morto injustamente." }],
  },
  {
    id: "eliseu", name: "Eliseu", role: "Profeta em Israel", week: 4, itemId: "eliseu", art: "eliseu", color: "laranja",
    nameMeaning: { text: "“Deus é salvação” (Strong); “Deus é sua salvação” (Easton).", source: "Bible Hub · Strong, Easton", url: hub("elisha") },
    skin: [
      { id: "manto", label: "O manto de Elias", basis: "texto", refs: [ref("2Kgs", 2, 13)], meaning: "Eliseu levanta o manto que caiu de Elias." },
      { id: "jordao", label: "O Jordão dividido", basis: "texto", refs: [ref("2Kgs", 2, 14)], meaning: "Bate nas águas com o manto, e elas se dividem." },
    ],
  },
  {
    id: "isaias", name: "Isaías", role: "Profeta em Judá", week: 5, itemId: "isaias", art: "isaias", color: "laranja",
    nameMeaning: { text: "“Salvação de Yah” (Strong 3470).", source: "Bible Hub · Strong 3470, Easton", url: hub("isaiah") },
    skin: [
      { id: "brasa", label: "A brasa do altar", basis: "texto", refs: [ref("Isa", 6, 6, 7)], meaning: "Um serafim toca os lábios do profeta com uma brasa viva." },
      { id: "rolo", label: "O rolo", ...art, meaning: "Representa as profecias escritas; o objeto é escolha artística." },
    ],
    connections: [{ to: "ezequias", relation: "profecia", refs: [ref("2Kgs", 19, 5, 7)], note: "Profeta no reinado de Ezequias." }],
  },
  {
    id: "ezequias", name: "Ezequias", role: "Rei de Judá", week: 5, itemId: "ezequias", art: "ezequias", color: "verde",
    nameMeaning: { text: "“Yah fortaleceu” (Strong 2396).", source: "Bible Hub · Strong 2396, Easton", url: hub("hezekiah") },
    skin: [{ id: "sombra", label: "A sombra nos degraus", basis: "texto", refs: [ref("2Kgs", 20, 9, 11)], meaning: "Como sinal, a sombra volta dez degraus." }],
    connections: [{ to: "manasses", relation: "genealogia", refs: [ref("2Kgs", 20, 21)], note: "Pai de Manassés." }],
  },
  {
    id: "manasses", name: "Manassés", role: "Rei de Judá", week: 5, itemId: "manasses", art: "manasses", color: "coral",
    nameMeaning: { text: "“Que faz esquecer” (Easton).", source: "Bible Hub · Easton, Hitchcock", url: hub("manasseh") },
    skin: [
      { id: "poste", label: "O poste-ídolo de Aserá", basis: "texto", refs: [ref("2Kgs", 21, 3), ref("2Kgs", 21, 7)], meaning: "Levanta altares a Baal e põe a imagem de Aserá no templo." },
      { id: "fogo", label: "O fogo", basis: "texto", refs: [ref("2Kgs", 21, 6)], meaning: "Chega a queimar o próprio filho como sacrifício." },
    ],
  },
  {
    id: "amos", name: "Amós", role: "Profeta", week: 5, itemId: "amos", art: "amos", color: "oliva",
    nameMeaning: { text: "“Carregado; um fardo” (Easton).", source: "Bible Hub · Easton, Hitchcock", url: hub("amos") },
    skin: [{ id: "prumo", label: "O prumo", basis: "texto", refs: [ref("Amos", 7, 7, 8)], meaning: "O Senhor junto a um muro, com um prumo na mão." }],
  },
  {
    id: "oseias", name: "Oseias", role: "Profeta", week: 5, itemId: "oseias", art: "oseias", color: "magenta",
    nameMeaning: { text: "“Salvação” (Easton, Strong 1954).", source: "Bible Hub · Easton, Strong 1954", url: hub("hosea") },
    skin: [{ id: "coracao", label: "O amor que volta", basis: "texto", refs: [ref("Hos", 3, 1)], meaning: "Deus manda Oseias amar outra vez a esposa infiel: retrato do amor de Deus por Israel." }],
  },
  {
    id: "joel", name: "Joel", role: "Profeta", week: 5, itemId: "joel", art: "joel", color: "ceu",
    nameMeaning: { text: "“Provavelmente ‘o Senhor é Deus’” (Strong 3100).", source: "Bible Hub · Strong 3100, Easton", url: hub("joel") },
    skin: [
      { id: "gafanhotos", label: "Os gafanhotos", basis: "texto", refs: [ref("Joel", 1, 4)], meaning: "Uma praga de gafanhotos devasta a terra." },
      { id: "espirito", label: "O Espírito derramado", basis: "texto", refs: [ref("Joel", 2, 28)], meaning: "Deus promete derramar o seu Espírito sobre todas as pessoas." },
    ],
  },
  {
    id: "miqueias", name: "Miqueias", role: "Profeta", week: 5, itemId: "miqueias", art: "miqueias", color: "dourado",
    nameMeaning: { text: "“Quem é como o Senhor?” (Easton).", source: "Bible Hub · Easton", url: hub("micah") },
    skin: [{ id: "belem", label: "Belém", basis: "texto", refs: [ref("Mic", 5, 2)], meaning: "A pequena Belém Efrata, de onde sairia o governante." }],
  },
  {
    id: "jonas", name: "Jonas", role: "Profeta enviado a Nínive", week: 5, itemId: "jonas", art: "jonas", color: "turquesa",
    nameMeaning: { text: "“Pomba” (Easton).", source: "Bible Hub · Easton, Hitchcock", url: hub("jonah") },
    skin: [{ id: "peixe", label: "O grande peixe", basis: "texto", refs: [ref("Jonah", 1, 17)], meaning: "O Senhor prepara um grande peixe que engole Jonas." }],
  },
  {
    id: "naum", name: "Naum", role: "Profeta", week: 5, itemId: "naum", art: "naum", color: "violeta",
    nameMeaning: { text: "“Consolação” (Easton).", source: "Bible Hub · Easton, Hitchcock", url: hub("nahum") },
    skin: [{ id: "leao", label: "O leão", basis: "texto", refs: [ref("Nah", 2, 11, 12)], meaning: "Nínive comparada a um covil de leões." }],
  },
  {
    id: "josias", name: "Josias", role: "Rei reformador de Judá", week: 6, itemId: "josias", art: "josias", color: "turquesa",
    nameMeaning: { text: "“Yah apoia” (Strong 2977); “curado pelo Senhor” (Easton).", source: "Bible Hub · Strong 2977, Easton", url: hub("josiah") },
    skin: [{ id: "livro", label: "O livro da Lei", basis: "texto", refs: [ref("2Kgs", 22, 8)], meaning: "O livro da Lei é encontrado no templo e lido diante do rei." }],
  },
  {
    id: "jeremias", name: "Jeremias", role: "Profeta em Judá", week: 6, itemId: "jeremias", art: "jeremias", color: "azul",
    nameMeaning: { text: "Debatido: “levantado pelo Senhor” (Easton) ou “Yah solta” (Strong 3414).", source: "Bible Hub · Easton, Strong 3414", url: hub("jeremiah") },
    skin: [
      { id: "amendoeira", label: "O ramo de amendoeira", basis: "texto", refs: [ref("Jer", 1, 11, 12)], meaning: "O Senhor vigia para cumprir a sua palavra." },
      { id: "jugo", label: "O jugo", basis: "texto", refs: [ref("Jer", 27, 2)], meaning: "Jeremias põe um jugo sobre o pescoço como sinal." },
    ],
    connections: [{ to: "josias", relation: "profecia", refs: [ref("Jer", 1, 2)], note: "Começa a profetizar no reinado de Josias." }],
  },
  {
    id: "daniel", name: "Daniel", role: "Profeta no exílio", week: 6, itemId: "daniel", art: "daniel", color: "coral",
    nameMeaning: { text: "“Deus é meu juiz” (Strong 1840, Easton).", source: "Bible Hub · Strong 1840, Easton", url: hub("daniel") },
    skin: [{ id: "leoes", label: "A cova dos leões", basis: "texto", refs: [ref("Dan", 6, 22)], meaning: "Deus envia o seu anjo e fecha a boca dos leões." }],
  },
  {
    id: "ezequiel", name: "Ezequiel", role: "Profeta no exílio", week: 6, itemId: "ezequiel", art: "ezequiel", color: "laranja",
    nameMeaning: { text: "“Deus fortalece” (Strong 3168).", source: "Bible Hub · Strong 3168, Easton", url: hub("ezekiel") },
    skin: [{ id: "rodas", label: "As rodas", basis: "texto", refs: [ref("Ezek", 1, 15, 16)], meaning: "Na visão, rodas junto aos seres viventes, como uma roda dentro da outra." }],
  },
  {
    id: "sofonias", name: "Sofonias", role: "Profeta", week: 6, itemId: "sofonias", art: "sofonias", color: "violeta",
    nameMeaning: { text: "“Yah guardou como tesouro” (Strong); “o Senhor escondeu” (Easton).", source: "Bible Hub · Strong, Easton", url: hub("zephaniah") },
    skin: [{ id: "lanterna", label: "A lanterna", basis: "texto", refs: [ref("Zeph", 1, 12)], meaning: "O Senhor diz que vai vasculhar Jerusalém com lanternas." }],
    connections: [{ to: "josias", relation: "profecia", refs: [ref("Zeph", 1, 1)], note: "Profetiza nos dias de Josias." }],
  },
  {
    id: "habacuque", name: "Habacuque", role: "Profeta", week: 6, itemId: "habacuque", art: "habacuque", color: "dourado",
    nameMeaning: { text: "“Abraço” (Easton).", source: "Bible Hub · Easton, Hitchcock", url: hub("habakkuk") },
    skin: [{ id: "torre", label: "A torre de vigia", basis: "texto", refs: [ref("Hab", 2, 1)], meaning: "O profeta sobe à sua torre de vigia para esperar a resposta do Senhor." }],
  },
]

export const characters: Character[] = z.array(Character).parse(DATA)

export function getCharacter(id: string): Character | undefined {
  return characters.find((c) => c.id === id)
}

export function charactersOfWeek(week: number): Character[] {
  return characters.filter((c) => c.week === week)
}

export function validateCharacters(itemIds: Set<string>, artIds: Set<string>): string[] {
  const ids = new Set(characters.map((c) => c.id))
  const issues: string[] = []
  for (const c of characters) {
    if (c.itemId && !itemIds.has(c.itemId)) issues.push(`${c.id}: item inexistente ${c.itemId}`)
    if (!artIds.has(c.art)) issues.push(`${c.id}: arte inexistente ${c.art}`)
    for (const k of c.connections) if (!ids.has(k.to)) issues.push(`${c.id}: liga a personagem inexistente ${k.to}`)
  }
  return issues
}
