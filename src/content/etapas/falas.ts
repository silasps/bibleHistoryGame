import { ref } from "../refs"

// Falas do AUTOR para os momentos das etapas (comentários dele, 2026-11-03).
// `text` é a frase dele; `stageLine` é condensada das mesmas palavras para a tela.
// Leituras dele que vão além do texto bíblico ficam marcadas como `interpretacao`.

export interface Fala {
  text: string
  stageLine: string
  kind: "interpretacao" | "narracao"
  refs: ReturnType<typeof ref>[]
}

export const FALAS = {
  vestes: {
    text: "Deus faz o primeiro sacrifício para vestir o homem e mostra sua bondade em não deixar o homem do jeito que ele ficou após a desobediência.",
    stageLine: "Deus faz o primeiro sacrifício para vestir o homem: Ele não deixa o homem do jeito que ficou.",
    kind: "interpretacao",
    refs: [ref("Gen", 3, 21)],
  },
  fora: {
    text: "Deus é santo, e quando o homem come do fruto, Deus não pode mais ficar junto com ele, porque ele pecou. A maior recompensa da vida dele, que era a vida eterna, ele perde.",
    stageLine: "Deus é santo, e o homem pecou: a maior recompensa da vida dele, a vida eterna, ficou para trás.",
    kind: "interpretacao",
    refs: [ref("Gen", 3, 22, 24)],
  },
} satisfies Record<string, Fala>

export type FalaId = keyof typeof FALAS
