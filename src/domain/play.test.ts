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
    expect(s.plays?.criacao.p2).toMatchObject({ value: 8, done: true })

    const projector = toProjectorView(s, { scenes }, getEvidence).scene?.game
    expect(projector).toMatchObject({ kind: "criacao", players: 2, total: 11, done: 1 })
    expect(projector?.mine).toBeUndefined()
    expect(toAudienceView(s, { scenes }, getEvidence, "p1", {}).scene?.game?.mine).toMatchObject({ value: 3, done: false })
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
    expect(r.state.plays?.arvore.p1).toMatchObject({ value: 2, done: true })
  })
})

describe("pódio dos minijogos", () => {
  const playAt = (s: SessionState, pid: string, value: number, done: boolean, now: number) =>
    reduceAudience(s, { type: "play", participantId: pid, gameId: "criacao", value, done }, { now, narrative: { scenes } }).state

  it("ordena por resultado e, no empate, por quem chegou antes; usa apelido ou 'Jogador N'", () => {
    let s = roomAt("item-criacao")
    s = reduceAudience(s, { type: "join", participantId: "p3", nickname: "Ana" }, ctx).state
    s = playAt(s, "p1", 8, true, 5000)
    s = playAt(s, "p3", 8, true, 3000)
    s = playAt(s, "p2", 5, false, 1000)
    const top = toProjectorView(s, { scenes }, getEvidence).scene?.game?.top
    expect(top?.map((e) => [e.place, e.name, e.value])).toEqual([
      [1, "Ana", 8],
      [2, "Jogador 1", 8],
      [3, "Jogador 2", 5],
    ])
    // Reenviar o mesmo resultado depois não muda quem chegou antes.
    s = playAt(s, "p3", 8, true, 9000)
    expect(toProjectorView(s, { scenes }, getEvidence).scene?.game?.top?.[0].name).toBe("Ana")
    // O celular não recebe o pódio ao vivo, nem ids.
    const phone = toAudienceView(s, { scenes }, getEvidence, "p1", {})
    expect(phone.scene?.game?.top).toBeUndefined()
  })

  it("ao passar o slide, o fim do jogo traz o pódio no telão e a colocação no celular", () => {
    let s = roomAt("item-criacao")
    s = playAt(s, "p1", 3, false, 2000)
    s = playAt(s, "p2", 8, true, 3000)
    expect(toProjectorView(s, { scenes }, getEvidence).results).toBeUndefined()
    s = reduceHost(s, { type: "next" }, { now: 9000, narrative: { scenes } }).state
    const results = toProjectorView(s, { scenes }, getEvidence).results
    expect(results).toMatchObject({ at: 9000, max: 8, players: 2, top: [{ place: 1, name: "Jogador 2" }, { place: 2, name: "Jogador 1" }] })
    expect(toAudienceView(s, { scenes }, getEvidence, "p1", {}).results?.me).toEqual({ place: 2, value: 3 })
    expect(JSON.stringify(toAudienceView(s, { scenes }, getEvidence, "p1", {}).results)).not.toContain('"p2"')
  })

  it("sair de um jogo sem ninguém pontuar não mostra pódio", () => {
    const s = reduceHost(roomAt("item-criacao"), { type: "next" }, ctx).state
    expect(toProjectorView(s, { scenes }, getEvidence).results).toBeUndefined()
  })
})
