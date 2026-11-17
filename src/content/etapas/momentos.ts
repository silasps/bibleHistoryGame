import type { Linha } from "../overview/aprofundar"

// Momentos novos (Rodada 4): cenas com ilustração, como as falas do autor, mas
// com texto em RASCUNHO tirado da Bíblia (NAA, paráfrase) e do material do autor.
// `principal` vazio = o momento aparece só com a imagem (aguardando o autor).

export interface Momento {
  principal?: Linha
  passos: Linha[]
  /** Material de apoio (Área de preparação e "Para aprofundar" no solo), nunca no telão. */
  apoio?: Linha[]
}

export const MOMENTOS: Record<string, Momento> = {}
