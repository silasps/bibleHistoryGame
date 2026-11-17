// Mapas de contexto histórico (Rodada 4). Desenhos esquemáticos, só com nomes
// de lugares que estão no texto bíblico ou nas aulas do autor. O slide do item
// mostra o mapa no lugar da ilustração.

export type MapaId = "exodo" | "reinos" | "exilios" | "imperios"

export interface MapaSpec {
  id: MapaId
  /** O que o mapa destaca neste slide. */
  foco?: "assiria" | "babilonia" | "retornos" | "persa" | "alexandre" | "divisao" | "roma"
}

export const MAPA_DO_ITEM: Record<string, MapaSpec> = {
  exodo: { id: "exodo" },
  "divisao-reino": { id: "reinos" },
  "queda-samaria": { id: "exilios", foco: "assiria" },
  "inicio-exilio": { id: "exilios", foco: "babilonia" },
  persia: { id: "imperios", foco: "persa" },
  "primeiro-retorno": { id: "exilios", foco: "retornos" },
  alexandre: { id: "imperios", foco: "alexandre" },
  "imperio-grego": { id: "imperios", foco: "divisao" },
  pompeu: { id: "imperios", foco: "roma" },
}

export function mapaDoItem(itemId: string | undefined): MapaSpec | undefined {
  return itemId ? MAPA_DO_ITEM[itemId] : undefined
}
