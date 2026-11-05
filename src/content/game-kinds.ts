// Tipos de minijogo das etapas. Compartilhado pelo schema das cenas, pelas
// etapas e pelas views da sala.
export const GAME_KINDS = [
  // Etapa 1
  "criacao",
  "jardim",
  "arvore",
  "queda",
  "vestes",
  "fora",
  // Etapas 2–11
  "arca",
  "estrelas",
  "cesto",
  "mar",
  "mana",
  "jerico",
  "funda",
  "altar",
  "ninive",
  "coracao",
] as const

export type GameKind = (typeof GAME_KINDS)[number]
