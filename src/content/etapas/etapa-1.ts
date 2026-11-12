import { ref } from "../refs"

type Ref = ReturnType<typeof ref>

// Etapa 1 · O começo. Rótulos curtos dos minijogos e das relíquias, cada um
// com a passagem (NAA). Os alvos do jardim vêm da ideia do autor (as funções
// do homem no jardim); o jogo nunca muda o relato: termina sempre no fruto.

export interface CreationReveal {
  id: string
  /** Dia da Criação (Gn 1–2). */
  day: number
  /** Nome da imagem em public/art/cenas/ (com a versão "-celular" para o celular). */
  art: string
  label: string
  ref: Ref
  /** Cores do desenho provisório, até chegar a imagem. */
  palette: [string, string, string]
}

/** Toque para "Haja luz" e depois raspar cada dia. */
export const CREATION: CreationReveal[] = [
  { id: "luz", day: 1, art: "criacao-1", label: "Luz", ref: ref("Gen", 1, 3, 5), palette: ["#fff6d8", "#f4d27a", "#6e5137"] },
  { id: "ceu-aguas", day: 2, art: "criacao-2", label: "Céu e águas", ref: ref("Gen", 1, 6, 8), palette: ["#cfe7ff", "#4f8fc9", "#0e2a4a"] },
  { id: "terra-plantas", day: 3, art: "criacao-3", label: "Terra e plantas", ref: ref("Gen", 1, 9, 13), palette: ["#e9f5c8", "#63a85a", "#1f4a2a"] },
  { id: "luzeiros", day: 4, art: "criacao-4", label: "Sol, lua e estrelas", ref: ref("Gen", 1, 14, 19), palette: ["#ffe7a3", "#d98b3a", "#1a1f4a"] },
  { id: "peixes-aves", day: 5, art: "criacao-5", label: "Peixes e aves", ref: ref("Gen", 1, 20, 23), palette: ["#d6f3ff", "#2f9bb3", "#0d3550"] },
  { id: "animais", day: 6, art: "criacao-6", label: "Animais", ref: ref("Gen", 1, 24, 25), palette: ["#f6e2b8", "#b9894a", "#4a3218"] },
  { id: "ser-humano", day: 6, art: "criacao-6b", label: "O ser humano", ref: ref("Gen", 1, 26, 31), palette: ["#fff1d6", "#e0a85a", "#5a3a22"] },
  { id: "descanso", day: 7, art: "criacao-7", label: "Descanso", ref: ref("Gen", 2, 1, 3), palette: ["#ffe0b8", "#c77a52", "#2a1f3a"] },
]

export interface GardenTarget {
  id: string
  label: string
  ref: Ref
}

/** Alvos bons do jardim (dá para acertar e cada acerto vira conquista). */
export const GARDEN_TARGETS: GardenTarget[] = [
  { id: "nomear", label: "Dar nome aos animais", ref: ref("Gen", 2, 19, 20) },
  { id: "cuidar", label: "Cuidar do jardim", ref: ref("Gen", 2, 15) },
  { id: "caminhar-deus", label: "Caminhar com Deus", ref: ref("Gen", 3, 8) },
  { id: "caminhar-esposa", label: "Caminhar com a esposa", ref: ref("Gen", 2, 22, 24) },
  { id: "contemplar", label: "Contemplar a criação", ref: ref("Gen", 2, 9) },
  { id: "obedecer", label: "Obedecer", ref: ref("Gen", 2, 16, 17) },
]

export const FORBIDDEN_FRUIT = { label: "O fruto", ref: ref("Gen", 3, 6) }

export interface Relic {
  id: string
  label: string
  ref: Ref
  /** Nome da imagem em public/art/reliquias/. */
  art: string
}

/** Relíquias da etapa. A árvore da vida aparece desde o começo e fica trancada depois da Queda. */
export const RELICS: Record<"arvore-vida" | "vestes" | "semente", Relic> = {
  "arvore-vida": { id: "arvore-vida", label: "A árvore da vida", ref: ref("Gen", 3, 22, 24), art: "arvore-vida" },
  vestes: { id: "vestes", label: "As vestes de pele", ref: ref("Gen", 3, 21), art: "vestes" },
  semente: { id: "semente", label: "A semente", ref: ref("Gen", 3, 15), art: "semente" },
}

/** Textos curtos dos momentos sem fala do autor na tela (rótulos, não interpretação). */
export const ETAPA1_LABELS = {
  hajaLuz: "Toque para dizer: haja luz",
  scratch: "Deslize o dedo para revelar",
  garden: "No jardim do Éden",
  aim: "Puxe e solte para mirar",
  darkness: "A luz do jardim se apagou",
  darknessRef: ref("Gen", 3, 6, 8),
  creationDone: "Tudo foi criado",
  creationDoneRef: ref("Gen", 1, 31),
  fallTitle: "Fora do jardim",
  fallRef: ref("Gen", 3, 22, 24),
  lockedTree: "A árvore da vida ficou trancada",
}
