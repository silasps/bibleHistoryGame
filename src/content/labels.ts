import type { ConnectionType, TheologicalCategory } from "./schema"

export const CONNECTION_LABEL: Record<ConnectionType, { label: string; hint: string }> = {
  promessa_explicita: { label: "Promessa explícita", hint: "O próprio texto anuncia uma promessa." },
  profecia_direta: { label: "Profecia direta", hint: "Um anúncio profético citado como cumprido." },
  tipologia_interpretativa: { label: "Tipologia (interpretação)", hint: "Uma figura lida à luz de algo posterior." },
  tema_redentivo: { label: "Tema redentivo", hint: "Um tema que atravessa a narrativa." },
  cumprimento_novo_testamento: { label: "Cumprimento no NT", hint: "O Novo Testamento faz a ligação." },
}

export const CATEGORY_LABEL: Record<TheologicalCategory, string> = {
  criacao: "Criação",
  imagem_de_deus: "Imagem de Deus",
  limite_e_liberdade: "Limite e liberdade",
  pecado_e_queda: "Pecado e queda",
  graca: "Graça",
  promessa: "Promessa",
  alianca: "Aliança",
  santidade: "Santidade",
  presenca: "Presença",
  realeza: "Realeza",
  justica: "Justiça",
}
