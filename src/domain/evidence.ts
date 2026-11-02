import type { Evidence } from "@/content/schema"

export function canUnlock(evidence: Evidence, unlocked: ReadonlySet<string>): boolean {
  return evidence.availability === "disponivel" && evidence.prerequisites.every((p) => unlocked.has(p))
}

export type BoardNodeStatus = "aberta" | "selada" | "futura" | "oculta"

export interface BoardNode {
  id: string
  status: BoardNodeStatus
}

export interface BoardEdge {
  from: string
  to: string
  lit: boolean
}

/**
 * Estado do quadro de investigação. `seen` são as evidências já alcançadas
 * (ainda que seladas); `open` são as abertas.
 */
export function buildBoard(
  evidence: Evidence[],
  seen: ReadonlySet<string>,
  open: ReadonlySet<string>,
): { nodes: BoardNode[]; edges: BoardEdge[] } {
  const status = (ev: Evidence): BoardNodeStatus => {
    if (open.has(ev.id)) return "aberta"
    if (!seen.has(ev.id)) return "oculta"
    return ev.availability === "futura" ? "futura" : "selada"
  }
  const nodes = evidence.map((ev) => ({ id: ev.id, status: status(ev) }))
  const visible = new Set(nodes.filter((n) => n.status !== "oculta").map((n) => n.id))
  const edges = evidence.flatMap((ev) =>
    ev.links
      .filter((to) => visible.has(ev.id) && visible.has(to))
      .map((to) => ({ from: ev.id, to, lit: open.has(ev.id) && open.has(to) })),
  )
  return { nodes, edges }
}
