import type { Poll } from "@/content/schema"

export type PollStatus = "idle" | "open" | "closed"

export interface PollState {
  id: string
  status: PollStatus
  resultsVisible: boolean
  /** participantId → optionId. Um voto por participante; muda enquanto aberta. */
  votes: Record<string, string>
}

export type VoteResult = "accepted" | "updated" | "unchanged" | "rejected_not_open" | "rejected_invalid_option"

export function createPoll(id: string): PollState {
  return { id, status: "idle", resultsVisible: false, votes: {} }
}

/** Idempotente: repetir o mesmo voto não altera nada. */
export function castVote(
  poll: PollState,
  def: Pick<Poll, "options">,
  participantId: string,
  optionId: string,
): { poll: PollState; result: VoteResult } {
  if (poll.status !== "open") return { poll, result: "rejected_not_open" }
  if (!def.options.some((o) => o.id === optionId)) return { poll, result: "rejected_invalid_option" }
  const previous = poll.votes[participantId]
  if (previous === optionId) return { poll, result: "unchanged" }
  return {
    poll: { ...poll, votes: { ...poll.votes, [participantId]: optionId } },
    result: previous ? "updated" : "accepted",
  }
}

export function openPoll(poll: PollState): PollState {
  return { ...poll, status: "open", resultsVisible: false }
}

export function closePoll(poll: PollState): PollState {
  return poll.status === "open" ? { ...poll, status: "closed" } : poll
}

export interface TallyRow {
  optionId: string
  label: string
  count: number
  /** 0..100, arredondado; soma pode diferir de 100 por arredondamento. */
  pct: number
}

export function tally(votes: Record<string, string>, def: Pick<Poll, "options">): { rows: TallyRow[]; total: number } {
  const counts = new Map(def.options.map((o) => [o.id, 0]))
  let total = 0
  for (const optionId of Object.values(votes)) {
    if (!counts.has(optionId)) continue
    counts.set(optionId, (counts.get(optionId) ?? 0) + 1)
    total++
  }
  const rows = def.options.map((o) => {
    const count = counts.get(o.id) ?? 0
    return { optionId: o.id, label: o.label, count, pct: total ? Math.round((count / total) * 100) : 0 }
  })
  return { rows, total }
}
