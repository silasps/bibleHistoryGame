import { ref } from "../refs"

// RASCUNHOS para o "Aprofundar" dos slides (Rodada 4, briefing de 16/11/2026).
// Cada linha é paráfrase curta do texto bíblico (NAA, com referência) e tem a
// FONTE do material do autor que orientou a ênfase (aula, resumo, linha do tempo).
// Deus é o sujeito: o personagem aparece como quem revela Deus.
// Tudo aqui passa pela revisão do autor na página "Revisão dos textos".

type Ref = ReturnType<typeof ref>

export interface Linha {
  text: string
  refs: Ref[]
  /** contexto: história fora do texto bíblico, tirada das aulas/linha do tempo do autor. */
  kind: "parafrase" | "narracao" | "interpretacao" | "contexto"
  /** De onde veio a ênfase no material do autor. */
  fonte: string
}

export interface Aprofundamento {
  /** Linha principal: só quando o slide não tem um trecho próprio do resumo. */
  principal?: Linha
  /** Linhas que o apresentador revela com "Aprofundar". */
  passos: Linha[]
}

export const APROFUNDAR: Record<string, Aprofundamento> = {}

export function aprofundarDe(itemId: string): Aprofundamento | undefined {
  return APROFUNDAR[itemId]
}
