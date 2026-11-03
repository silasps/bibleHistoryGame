import { describe, expect, it } from "vitest"
import { getEvidence, getSequence, getSceneEntry } from "@/content"
import type { Scene } from "@/content/schema"
import { buildBoard } from "./evidence"
import { castVote, createPoll, openPoll, closePoll, tally } from "./poll"
import { canTransition, transition, InvalidTransition } from "./scene-machine"
import { createSession, reduceAudience, reduceHost, type Ctx, type SessionState } from "./session"
import { timingReport } from "./timing"

const def = { options: [{ id: "a", label: "A" }, { id: "b", label: "B" }] }

describe("máquina de estados da cena", () => {
  it("segue locked → ready → active → awaiting_presenter → revealed → completed", () => {
    let s = transition("locked", "unlock")
    s = transition(s, "activate")
    s = transition(s, "await_presenter")
    s = transition(s, "reveal")
    s = transition(s, "complete")
    expect(s).toBe("completed")
  })
  it("rejeita transições inválidas", () => {
    expect(canTransition("locked", "complete")).toBe(false)
    expect(() => transition("locked", "reveal")).toThrow(InvalidTransition)
    expect(transition("completed", "reset")).toBe("locked")
  })
})

describe("votação", () => {
  it("aceita um voto por participante e permite mudar enquanto aberta", () => {
    let poll = openPoll(createPoll("p"))
    let r = castVote(poll, def, "u1", "a")
    expect(r.result).toBe("accepted")
    poll = r.poll
    r = castVote(poll, def, "u1", "a")
    expect(r.result).toBe("unchanged")
    r = castVote(poll, def, "u1", "b")
    expect(r.result).toBe("updated")
    expect(tally(r.poll.votes, def).total).toBe(1)
  })
  it("rejeita votos com enquete fechada ou opção inválida", () => {
    const poll = closePoll(openPoll(createPoll("p")))
    expect(castVote(poll, def, "u1", "a").result).toBe("rejected_not_open")
    expect(castVote(openPoll(createPoll("p")), def, "u1", "zzz").result).toBe("rejected_invalid_option")
  })
  it("apura porcentagens", () => {
    const { rows, total } = tally({ u1: "a", u2: "a", u3: "b", u4: "a" }, def)
    expect(total).toBe(4)
    expect(rows.find((r) => r.optionId === "a")?.pct).toBe(75)
  })
})

function genesisSession() {
  const seq = getSequence("genesis")!
  const scenes = seq.sceneIds.map((id) => getSceneEntry(id)!.scene) as Scene[]
  const ctx = (now: number): Ctx => ({ now, narrative: { scenes } })
  const state = createSession({ roomCode: "ABC123", sequenceId: seq.id, sceneIds: seq.sceneIds, now: 0 })
  return { scenes, ctx, state }
}

function host(state: SessionState, ctx: Ctx, ...cmds: Parameters<typeof reduceHost>[1][]) {
  return cmds.reduce((s, c) => reduceHost(s, c, ctx).state, state)
}

describe("sessão ao vivo", () => {
  it("não aceita comandos de palco antes de começar", () => {
    const { state, ctx } = genesisSession()
    expect(reduceHost(state, { type: "next" }, ctx(1)).error).toBeDefined()
  })

  it("avança, abre enquete da cena atual, recebe votos e fecha ao sair", () => {
    const { state: s0, ctx, scenes } = genesisSession()
    const pollIndex = scenes.findIndex((s) => s.poll)
    const pollId = scenes[pollIndex].poll!.id
    let s = host(s0, ctx(0), { type: "start" }, { type: "goto", index: pollIndex }, { type: "open_poll", pollId })
    s = reduceAudience(s, { type: "join", participantId: "u1" }, ctx(1)).state
    s = reduceAudience(s, { type: "vote", participantId: "u1", pollId, optionId: scenes[pollIndex].poll!.options[0].id }, ctx(2)).state
    expect(Object.keys(s.polls[pollId].votes)).toEqual(["u1"])
    s = host(s, ctx(3), { type: "next" })
    expect(s.polls[pollId].status).toBe("closed")
    const late = reduceAudience(s, { type: "vote", participantId: "u1", pollId, optionId: "x" }, ctx(4))
    expect(late.result).toBe("rejected_not_open")
  })

  it("não abre enquete de outra cena", () => {
    const { state: s0, ctx, scenes } = genesisSession()
    const pollId = scenes.find((s) => s.poll)!.poll!.id
    const s = host(s0, ctx(0), { type: "start" })
    expect(reduceHost(s, { type: "open_poll", pollId }, ctx(1)).error).toBeDefined()
  })

  it("só libera pistas já alcançadas", () => {
    const { state: s0, ctx, scenes } = genesisSession()
    const s = host(s0, ctx(0), { type: "start" })
    expect(reduceHost(s, { type: "release", evidenceId: "ev-descendencia" }, ctx(1)).error).toBeDefined()
    const at = scenes.findIndex((x) => x.releases === "ev-descendencia")
    const s2 = host(s, ctx(1), { type: "goto", index: at }, { type: "release", evidenceId: "ev-descendencia" })
    expect(s2.released).toEqual(["ev-descendencia"])
  })

  it("destaque da skin é zerado ao trocar de cena", () => {
    const { state: s0, ctx } = genesisSession()
    let s = host(s0, ctx(0), { type: "start" }, { type: "spotlight", skinId: "harpa" })
    expect(s.spotlight).toBe("harpa")
    s = host(s, ctx(1), { type: "next" })
    expect(s.spotlight).toBeNull()
  })

  it("reconexão mantém a ordem de entrada; luz é idempotente", () => {
    const { state: s0, ctx } = genesisSession()
    let s = host(s0, ctx(0), { type: "start" })
    s = reduceAudience(s, { type: "join", participantId: "u1" }, ctx(1)).state
    s = reduceAudience(s, { type: "join", participantId: "u2" }, ctx(2)).state
    s = reduceAudience(s, { type: "join", participantId: "u1", nickname: "Ana" }, ctx(3)).state
    expect(s.participants.u1.order).toBe(0)
    expect(s.participants.u1.nickname).toBe("Ana")
    s = reduceAudience(s, { type: "light", participantId: "u1" }, ctx(4)).state
    expect(reduceAudience(s, { type: "light", participantId: "u1" }, ctx(5)).result).toBe("unchanged")
  })

  it("registra tempo por cena descontando pausas", () => {
    const { state: s0, ctx, scenes } = genesisSession()
    let s = host(s0, ctx(0), { type: "start" })
    s = host(s, ctx(10_000), { type: "pause" })
    s = host(s, ctx(70_000), { type: "resume" })
    s = host(s, ctx(80_000), { type: "next" })
    expect(s.timing.sceneMs[scenes[0].id]).toBe(20_000)
    const report = timingReport(s, scenes, () => ({ key: "g", label: "G" }), 85_000)
    expect(report.totalMs).toBe(25_000)
    expect(report.currentSceneMs).toBe(5_000)
  })
})

describe("quadro de investigação", () => {
  it("mostra fios acesos só entre evidências abertas", () => {
    const list = ["ev-deus-procura", "ev-descendencia", "ev-abraao-descendencia"].map((id) => getEvidence(id)!)
    const board = buildBoard(list, new Set(list.map((e) => e.id)), new Set(["ev-deus-procura"]))
    expect(board.nodes.find((n) => n.id === "ev-abraao-descendencia")?.status).toBe("futura")
    expect(board.edges.every((e) => !e.lit)).toBe(true)
  })
})
