// Inventário da etapa: conquistas que a pessoa ganha jogando, a perda na
// Queda e as relíquias. Puro: o armazenamento fica em src/stores/inventory.ts.

export interface Inventory {
  /** Dias revelados da Criação e alvos acertados no jardim. */
  conquests: string[]
  /** Depois da Queda as conquistas se apagam e a árvore da vida fica trancada. */
  fallen: boolean
  relics: string[]
}

export type InventoryEvent = { type: "conquest"; id: string } | { type: "fall" } | { type: "relic"; id: string }

export const emptyInventory: Inventory = { conquests: [], fallen: false, relics: [] }

export function applyInventory(inv: Inventory, ev: InventoryEvent): Inventory {
  switch (ev.type) {
    case "conquest":
      // Fora do jardim não se ganha mais nada do jardim.
      if (inv.fallen || inv.conquests.includes(ev.id)) return inv
      return { ...inv, conquests: [...inv.conquests, ev.id] }
    case "fall":
      return inv.fallen ? inv : { ...inv, fallen: true }
    case "relic":
      return inv.relics.includes(ev.id) ? inv : { ...inv, relics: [...inv.relics, ev.id] }
  }
}

/** A árvore da vida: à vista no jardim; trancada depois da Queda. */
export function treeOfLife(inv: Inventory): "no-jardim" | "trancada" {
  return inv.fallen ? "trancada" : "no-jardim"
}
