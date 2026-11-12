// Textos do "selo do trilho": a pista de cada semana chega ao celular como uma
// recompensa selada; depois que o apresentador libera, cada pessoa quebra o
// selo com toques e o telão conta quantos já abriram. Ajuste os nomes aqui.
// (Nada aqui fala do conteúdo da pista: estes textos aparecem também no telão.)

const ordinal = (n: number) => `${n}º`

export const TRILHO = {
  /** Rótulo do selo (telão e celular). */
  selo: (n: number) => (n > 0 ? `${ordinal(n)} selo do trilho` : "Selo do trilho"),
  /** Posição no trilho, no celular. */
  posicao: (n: number, total: number) => `${n} de ${total}`,
  /** Celular, quando o selo chega (antes da liberação). */
  recebeu: (n: number) => (n > 0 ? `Você ganhou o ${ordinal(n)} selo do trilho!` : "Você ganhou um selo do trilho!"),
  espere: "Espere o sinal do apresentador para quebrar.",
  /** Celular, quando a pessoa toca antes da liberação. */
  aindaNao: "Ainda não! Espere o sinal.",
  /** Celular, depois da liberação. */
  toque: "Toque no selo para quebrar.",
  faltam: (k: number) => (k === 1 ? "Falta 1 toque" : `Faltam ${k} toques`),
  /** Celular, no Arquivo: pista liberada que a pessoa ainda não abriu. */
  pronto: "Pronto para quebrar",
  /** Telão, depois da liberação. */
  telaoToque: "Toquem no selo pelo celular",
  telaoContagem: (opened: number, total: number) =>
    `${opened} de ${total} ${opened === 1 ? "já quebrou" : "já quebraram"} o selo`,
} as const
