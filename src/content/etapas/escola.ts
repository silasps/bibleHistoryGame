import { getItem } from "../overview"

// Linha do tempo da ESCOLA (foto de 19/11/2026): a referência do roteiro de 45 min.
// Só estes itens viram slide. Os outros itens do autor (temas como Amós ou Ageu,
// e Alexandre e Antíoco IV) continuam na faixa da linha do tempo e entram no
// slide do tópico da escola ao lado, com o conteúdo no "Aprofundar".
export const SCHOOL_ITEMS = [
  // Semana 1 · Origem e Cosmovisão
  "criacao", "adao-eva", "queda", "diluvio", "noe", "babel", "abraao", "alianca-abraamica", "sacrificio-isaque", "isaque", "jaco", "migracao-egito", "tempo-egito", "exodo", "moises",
  // Semana 2 · Pentateuco
  "peregrinacao", "alianca-sinai", "tabernaculo", "arao", "espioes", "alianca-deuteronomica", "uncao-josue", "morte-moises",
  // Semana 3 · Tribos
  "conquista-canaa", "josue", "periodo-juizes", "debora", "gideao", "sansao", "rute-boaz",
  // Semana 4 · Davi
  "samuel", "saul", "davi-ungido", "davi", "alianca-davidica",
  // Semana 5 · Reis
  "aram", "salomao", "templo", "divisao-reino", "jeroboao", "roboao", "elias", "acabe", "eliseu", "assiria",
  // Semana 6 · Profetas I
  "queda-samaria", "cerco-jerusalem", "isaias", "ezequias", "manasses", "babilonia",
  // Semana 7 · Profetas II
  "josias", "jeremias", "queda-jerusalem", "inicio-exilio", "daniel", "ezequiel", "persia", "ciro",
  // Semana 8 · Pós-exílio e Intertestamentário
  "primeiro-retorno", "reconstrucao-templo", "segundo-retorno", "terceiro-retorno", "fim-at", "imperio-grego", "macabeus", "pompeu", "imperio-romano",
  // Semana 9 · Jesus
  "augusto", "herodes", "nascimento-jesus", "jesus", "herodes-antipas", "pilatos", "ministerio-jesus", "morte-ressurreicao", "ascensao",
  // Semana 10 · Igreja
  "nero", "pentecostes", "estevao", "conversao-paulo", "ministerio-pedro", "visao-pedro", "ministerio-paulo", "primeira-viagem", "concilio", "roma-queimada",
  // Semana 11 · Paulo
  "segunda-viagem", "timoteo", "terceira-viagem", "prisao-roma", "martirio-paulo-pedro", "templo-artemis",
  // Semana 12 · Apocalipse
  "queda-jerusalem-70", "domiciano", "patmos", "morte-joao", "fim-nt",
] as const

const SCHOOL = new Set<string>(SCHOOL_ITEMS)

/** Itens do autor fora da lista da escola que não são temas: entram neste slide. */
const HOST_OF: Record<string, string> = {
  alexandre: "imperio-grego",
  "antioco-iv": "macabeus",
  // "Levítico: sejam santos" vai com Arão (sacerdócio e sistema sacrificial, Lv 8–10), depois do tabernáculo.
  "levitico-santidade": "arao",
}

export const isSchoolItem = (id: string) => SCHOOL.has(id)

/** Slide da escola que recebe um item que não está na lista (o tema entra no item-âncora). */
export function schoolHostOf(id: string): string | undefined {
  if (SCHOOL.has(id)) return undefined
  return HOST_OF[id] ?? getItem(id)?.anchor
}
