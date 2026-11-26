import { z } from "zod"

// Janela Verde (seção temporária). Fatos e declarações reais, cada um com a
// fonte que aparece na tela. Onde as fontes discordam, vai o número mais
// conservador ("cerca de"). Nada aqui é inventado: o texto das declarações foi
// conferido palavra por palavra na página original.

export const Fonte = z.object({
  nome: z.string().min(2),
  url: z.string().url(),
  data: z.string().optional(),
})
export type Fonte = z.infer<typeof Fonte>

export const Regiao = z.enum(["amazonia", "africa", "asia", "todas"])
export type Regiao = z.infer<typeof Regiao>

const Fato = z.object({
  id: z.string(),
  regiao: Regiao,
  povo: z.string(),
  texto: z.string().min(10),
  fonte: Fonte,
})
export type Fato = z.infer<typeof Fato>

const Declaracao = z.object({
  id: z.string(),
  regiao: Regiao,
  /** Texto exato (ou tradução livre, quando `original` existe). */
  texto: z.string().min(5),
  /** Com aspas (fala exata) ou paráfrase do que a fonte narra. */
  kind: z.enum(["citacao", "parafrase"]),
  quem: z.string(),
  papel: z.string(),
  /** Frase original, quando o texto é tradução livre. */
  original: z.string().optional(),
  fonte: Fonte,
})
export type Declaracao = z.infer<typeof Declaracao>

const F = {
  radar: { nome: "Green Window Ministries, via RadarMissionário", url: "https://www.radarmissionario.org/o-que-e-janela-verde-e-seus-grandes-desafios/" },
  funai: { nome: "Funai", url: "https://www.gov.br/funai/pt-br/centrais-de-conteudo/publicacoes/sos-yanomami_cartilha_final.pdf" },
  censo: { nome: "IBGE, Censo 2022", url: "https://www.band.com.br/noticias/maior-terra-indigena-do-brasil-yanomami-contabiliza-27-152-pessoas-16622582" },
  unicef: { nome: "UNICEF", url: "https://www.unicef.org/brazil/media/36741/file/Estudo%20Yanomami_dez2025.pdf" },
  xapono: { nome: "Portal Amazônia", url: "https://portalamazonia.com/cultura/conheca-os-xaponos-moradias-comunais-dos-indigenas-yanomami" },
  javari: { nome: "Portal Amazônia", url: "https://portalamazonia.com/estados/amazonas/conheca-o-vale-do-javari-terra-indigena-com-maior-concentracao-de-povos-indigenas-isolados-do-mundo" },
  isolados: { nome: "Funai, via A Pública", url: "https://apublica.org/2024/11/e-inedito-descoberto-novo-grupo-de-indigenas-isolados-no-amazonas/" },
  bakaJp: { nome: "Joshua Project", url: "https://joshuaproject.net/people_groups/10587/CM" },
  bakaWt: { nome: "WorldTeam", url: "https://us.worldteam.org/wp-content/uploads/2025/12/Cameroon-Baka-UPG-2025-1.pdf" },
  bakaCamp: { nome: "Pygmies.org", url: "https://www.pygmies.org/baka/camps.php" },
  ethnologue: { nome: "Ethnologue", url: "https://www.ethnologue.com/faq/country-most-languages/" },
  sawiWiki: { nome: "Wikipedia (Sawi people)", url: "https://en.wikipedia.org/wiki/Sawi_people" },
  richardson: { nome: "Wikipedia (Don Richardson)", url: "https://en.wikipedia.org/wiki/Don_Richardson_(missionary)" },
  mnn: { nome: "Mission Network News", url: "https://www.mnnonline.org/news/fifty-years-later-peace-child-tribe-still-following-christ/", data: "21/06/2012" },
  sawiJp: { nome: "Joshua Project", url: "https://www.joshuaproject.net/index.php/people_groups/18881" },
  pub2021: { nome: "Agência Pública", url: "https://apublica.org/2021/09/sob-bolsonaro-yanomami-tem-o-maior-indice-de-mortes-por-desnutricao-infantil-do-pais/", data: "13/09/2021" },
  pub2023: { nome: "Agência Pública", url: "https://apublica.org/2023/02/os-yanomami-continuam-morrendo-emergencia-completou-1-mes-longe-de-acabar/", data: "23/02/2023" },
  beto: { nome: "Agência Brasil (Correio Braziliense)", url: "https://www.correiobraziliense.com.br/brasil/2023/03/5077663-lider-marubo-aponta-questoes-que-afetam-comunidades-do-vale-do-javari.html", data: "03/03/2023" },
  luiz: { nome: "Pr. Luiz Antonio Oliveira", url: "https://luizantoniooliveira.wordpress.com/2019/02/22/a-janela-verde-por-pastor-luiz-antonio-bel-me-th-m/" },
} satisfies Record<string, Fonte>

export const FATOS = z.array(Fato).parse([
  { id: "jv-faixa", regiao: "todas", povo: "Janela Verde", texto: "A faixa tropical entre 23,5° Norte e 23,5° Sul do Equador.", fonte: F.radar },
  { id: "jv-povos", regiao: "todas", povo: "Janela Verde", texto: "Cerca de 2.200 povos tribais menos alcançados, em 35 países.", fonte: F.radar },
  { id: "jv-regioes", regiao: "todas", povo: "Janela Verde", texto: "Três regiões de floresta: a Amazônica, a Africana e a Asiática.", fonte: F.radar },

  { id: "yan-terra", regiao: "amazonia", povo: "Yanomami", texto: "A Terra Indígena Yanomami, em Roraima e no Amazonas, tem cerca de 9,6 milhões de hectares e foi demarcada em 1992.", fonte: F.funai },
  { id: "yan-censo", regiao: "amazonia", povo: "Yanomami", texto: "27.152 pessoas vivem na Terra Indígena. Para contá-las, o IBGE precisou de helicópteros.", fonte: F.censo },
  { id: "yan-jovens", regiao: "amazonia", povo: "Yanomami", texto: "75% dos Yanomami têm menos de 30 anos.", fonte: F.unicef },
  { id: "yan-garimpo", regiao: "amazonia", povo: "Yanomami", texto: "O governo federal decretou emergência humanitária na Terra Yanomami, que sofre com o garimpo ilegal.", fonte: F.funai },
  { id: "yan-xapono", regiao: "amazonia", povo: "Yanomami", texto: "Vivem em casas coletivas circulares, o xapono, com um grande pátio no centro.", fonte: F.xapono },
  { id: "yan-redes", regiao: "amazonia", povo: "Yanomami", texto: "Dentro do xapono não há paredes: cada pessoa tem o lugar da sua rede.", fonte: F.xapono },
  { id: "yan-visita", regiao: "amazonia", povo: "Yanomami", texto: "Quando chega um visitante, é comum a rede dele ficar ao lado do pata, a liderança tradicional.", fonte: F.xapono },
  { id: "yan-urihi", regiao: "amazonia", povo: "Yanomami", texto: "A floresta, para eles, é urihi: a terra-floresta.", fonte: F.xapono },

  { id: "jav-terra", regiao: "amazonia", povo: "Vale do Javari", texto: "Cerca de 8,5 milhões de hectares no oeste do Amazonas, na fronteira com o Peru e a Colômbia, homologados em 2001.", fonte: F.javari },
  { id: "jav-isolados", regiao: "amazonia", povo: "Vale do Javari", texto: "É apontado como a maior concentração de povos indígenas isolados do mundo.", fonte: F.javari },
  { id: "bra-isolados", regiao: "amazonia", povo: "Vale do Javari", texto: "No Brasil, a Funai lista 114 registros de indígenas isolados. A política é de não contato.", fonte: F.isolados },

  { id: "baka-pop", regiao: "africa", povo: "Baka", texto: "Cerca de 62 mil Baka vivem na floresta de Camarões, e outros no Gabão.", fonte: F.bakaJp },
  { id: "baka-biblia", regiao: "africa", povo: "Baka", texto: "Na língua baka só existem porções da Bíblia (2011). A tradução começou.", fonte: F.bakaJp },
  { id: "baka-leitura", regiao: "africa", povo: "Baka", texto: "Cerca de 5% dos Baka sabem ler. A tradução é feita junto com cristãos Baka.", fonte: F.bakaWt },
  { id: "baka-mongulu", regiao: "africa", povo: "Baka", texto: "Moram em cabanas de galhos e folhas, o mongulu, construídas principalmente pelas mulheres.", fonte: F.bakaCamp },
  { id: "png-linguas", regiao: "asia", povo: "Papua-Nova Guiné", texto: "Cerca de 840 línguas: o país com mais línguas do mundo.", fonte: F.ethnologue },

  { id: "sawi-onde", regiao: "asia", povo: "Sawi", texto: "Cerca de 5 mil pessoas, nos pântanos de sagu do sul de Papua, na Indonésia, em casas sobre palafitas perto dos rios Kronkel, Ayip e Fayit.", fonte: F.sawiWiki },
  { id: "sawi-sagu", regiao: "asia", povo: "Sawi", texto: "A comida principal é o sagu.", fonte: F.sawiWiki },
  { id: "sawi-guerra", regiao: "asia", povo: "Sawi", texto: "Em 1962, as aldeias viviam em guerra umas com as outras.", fonte: F.richardson },
  { id: "sawi-paz", regiao: "asia", povo: "Sawi", texto: "Para fazer as pazes, uma aldeia entregava um filho à aldeia inimiga. Enquanto aquela criança vivesse, a paz durava.", fonte: F.mnn },
  { id: "sawi-1962", regiao: "asia", povo: "Sawi", texto: "Em 1962, Don e Carol Richardson chegaram aos Sawi. Jesus foi apresentado como o Filho da Paz de Deus.", fonte: F.richardson },
  { id: "sawi-50", regiao: "asia", povo: "Sawi", texto: "Os Richardson chegaram em 1962. Cinquenta anos depois, em 2012, os Sawi seguiam a Cristo.", fonte: F.mnn },
  { id: "sawi-biblia", regiao: "asia", povo: "Sawi", texto: "Hoje existe a Bíblia em sawi no aplicativo.", fonte: F.sawiJp },
])

export const DECLARACOES = z.array(Declaracao).parse([
  {
    id: "hekurari-criancas",
    regiao: "amazonia",
    kind: "citacao",
    texto: "A sociedade tem que entender que essas crianças são doentes porque não há uma atenção à saúde para as comunidades.",
    quem: "Júnior Hekurari",
    papel: "Presidente do Conselho de Saúde Indígena Yanomami e Ye'kwana",
    fonte: F.pub2021,
  },
  {
    id: "hekurari-crise",
    regiao: "amazonia",
    kind: "citacao",
    texto: "A crise não acabou, não. A saúde nem chegou ainda, não chegou assistência às comunidades.",
    quem: "Júnior Hekurari",
    papel: "Presidente do Conselho de Saúde Indígena Yanomami e Ye'kwana",
    fonte: F.pub2023,
  },
  {
    id: "dario",
    regiao: "amazonia",
    kind: "citacao",
    texto: "Não tem remédio, não tem profissionais, não tem estrutura boa para os profissionais ficarem.",
    quem: "Dário Yanomami",
    papel: "Filho de Davi Kopenawa",
    fonte: F.pub2023,
  },
  {
    id: "beto-marubo",
    regiao: "amazonia",
    kind: "citacao",
    texto: "Uma das populações mais vulneráveis são os isolados.",
    quem: "Beto Marubo",
    papel: "Liderança Marubo, da Univaja (Vale do Javari)",
    fonte: F.beto,
  },
  {
    id: "hekurari-ler",
    regiao: "amazonia",
    kind: "citacao",
    texto: "A maioria dos Yanomami não sabe ler.",
    quem: "Júnior Hekurari",
    papel: "Presidente do Conselho de Saúde Indígena Yanomami e Ye'kwana",
    fonte: F.pub2021,
  },
  {
    id: "steve-paz",
    regiao: "asia",
    kind: "citacao",
    texto: "Eles começaram a reconhecer que Jesus era o filho da paz de Deus, o filho da paz definitivo.",
    original: "They started recognizing that Jesus was God's peace child–the ultimate peace child.",
    quem: "Steve Richardson",
    papel: "Filho de Don e Carol Richardson, missionário na Indonésia",
    fonte: F.mnn,
  },
  {
    id: "judas-heroi",
    regiao: "asia",
    kind: "citacao",
    texto: "Aos olhos deles, Judas, e não Jesus, era o herói dos Evangelhos; Jesus era só o tolo de quem rir.",
    original: "In their eyes, Judas, not Jesus, was the hero of the Gospels, Jesus was just the dupe to be laughed at.",
    quem: "Don Richardson",
    papel: "Missionário entre os Sawi (citado por Ruth A. Tucker, 1983, p. 477)",
    fonte: F.richardson,
  },
  {
    id: "confiar",
    regiao: "asia",
    kind: "citacao",
    texto: "Se um homem chegasse a entregar o próprio filho aos inimigos, nele se poderia confiar!",
    original: "if a man would actually give his own son to his enemies, that man could be trusted!",
    quem: "Don Richardson",
    papel: "Missionário entre os Sawi",
    fonte: F.richardson,
  },
  {
    id: "sawi-missao",
    regiao: "asia",
    kind: "parafrase",
    texto: "Os Sawi passaram a levar o Evangelho às tribos contra as quais antes guerreavam.",
    quem: "Steve Richardson",
    papel: "Segundo o relato dele",
    fonte: F.mnn,
  },
  {
    id: "terena",
    regiao: "amazonia",
    kind: "citacao",
    texto: "O que nós precisamos mesmo é que nos ensinem a Palavra de Deus.",
    quem: "Um líder Terena",
    papel: "Ao Pr. Joshua Chang, fundador do ministério Janela Verde",
    fonte: F.luiz,
  },
  {
    id: "terceira-onda",
    regiao: "todas",
    kind: "parafrase",
    texto: "A “Terceira Onda” é o movimento de cristãos indígenas levando o Evangelho a outros povos indígenas.",
    quem: "RadarMissionário",
    papel: "Sobre a Janela Verde",
    fonte: F.radar,
  },
])

const fatos = new Map(FATOS.map((f) => [f.id, f]))
const declaracoes = new Map(DECLARACOES.map((d) => [d.id, d]))

export function getFato(id: string): Fato {
  const f = fatos.get(id)
  if (!f) throw new Error(`Fato desconhecido: ${id}`)
  return f
}

export function getDeclaracao(id: string): Declaracao {
  const d = declaracoes.get(id)
  if (!d) throw new Error(`Declaração desconhecida: ${id}`)
  return d
}
