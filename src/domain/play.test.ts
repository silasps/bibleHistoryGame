import { describe, expect, it } from "vitest"
import { getEvidence, getSequence, sequenceScenes } from "@/content"
import { toAudienceView, toProjectorView } from "./projection"
import { createSession, reduceAudience, reduceHost, type SessionState } from "./session"

const seq = getSequence("visao-geral")!
const scenes = sequenceScenes(seq.id)
const ctx = { now: 1000, narrative: { scenes } }
const at = (id: string) => scenes.findIndex((s) => s.id === id)

function roomAt(sceneId: string): SessionState {
  let s = createSession({ roomCode: "ABCDEF", sequenceId: seq.id, sceneIds: seq.sceneIds, now: 0 })
  s = reduceHost(s, { type: "start" }, ctx).state
  s = reduceHost(s, { type: "goto", index: at(sceneId) }, ctx).state
  for (const id of ["p1", "p2"]) s = reduceAudience(s, { type: "join", participantId: id }, ctx).state
  return s
}

describe("minijogos na sala", () => {
  it("aceita o jogo da cena atual, limita ao máximo e nunca volta atrás", () => {
    let s = roomAt("item-criacao")
    let r = reduceAudience(s, { type: "play", participantId: "p1", gameId: "criacao", value: 3, done: false }, ctx)
    expect(r.result).toBe("accepted")
    s = r.state
    r = reduceAudience(s, { type: "play", participantId: "p1", gameId: "criacao", value: 1, done: false }, ctx)
    expect(r.result).toBe("unchanged")
    s = reduceAudience(s, { type: "play", participantId: "p2", gameId: "criacao", value: 99, done: true }, ctx).state
    expect(s.plays?.criacao.p2).toEqual({ value: 8, done: true })

    const projector = toProjectorView(s, { scenes }, getEvidence).scene?.game
    expect(projector).toMatchObject({ kind: "criacao", players: 2, total: 11, done: 1 })
    expect(projector?.mine).toBeUndefined()
    expect(toAudienceView(s, { scenes }, getEvidence, "p1", {}).scene?.game?.mine).toEqual({ value: 3, done: false })
  })

  it("recusa jogo de outra cena, quem não entrou, jogos só de assistir e sala encerrada", () => {
    const s = roomAt("item-criacao")
    expect(reduceAudience(s, { type: "play", participantId: "p1", gameId: "arvore", value: 1, done: false }, ctx).result).toBe("rejected")
    expect(reduceAudience(s, { type: "play", participantId: "intruso", gameId: "criacao", value: 1, done: false }, ctx).result).toBe("rejected")
    const garden = roomAt("item-adao-eva")
    expect(reduceAudience(garden, { type: "play", participantId: "p1", gameId: "jardim", value: 1, done: false }, ctx).result).toBe("rejected")
    const ended = reduceHost(s, { type: "end" }, ctx).state
    expect(reduceAudience(ended, { type: "play", participantId: "p1", gameId: "criacao", value: 1, done: false }, ctx).result).toBe("rejected")
  })

  it("salas antigas, sem `plays`, continuam funcionando", () => {
    const old: SessionState = { ...roomAt("jogo-arvore"), plays: undefined }
    const r = reduceAudience(old, { type: "play", participantId: "p1", gameId: "arvore", value: 2, done: true }, ctx)
    expect(r.state.plays?.arvore.p1).toEqual({ value: 2, done: true })
  })
})
