import { RELICS } from "./etapa-1"
import { ROOM_GAMES, type EtapaRelic } from "./jogos"

// Todas as relíquias, na ordem da história. A árvore da vida não entra aqui:
// ela fica à parte no inventário, trancada desde a Queda.

export const ALL_RELICS: (EtapaRelic & { etapa: number })[] = [
  { ...RELICS.vestes, etapa: 1 },
  { ...RELICS.semente, etapa: 1 },
  ...ROOM_GAMES.map((g) => ({ ...g.relic, etapa: g.etapa })),
]

export function getRelic(id: string) {
  return ALL_RELICS.find((r) => r.id === id) ?? (id === "arvore-vida" ? { ...RELICS["arvore-vida"], etapa: 1 } : undefined)
}
