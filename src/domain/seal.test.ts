import { describe, expect, it } from "vitest"
import { getEvidence, getSequence, sequenceScenes, sequences } from "@/content"
import { allReleasedSyntheses } from "@/content/released"
import { toAudienceView, toProjectorView } from "./projection"
import { createSession, reduceAudience, reduceHost, SEAL_TAPS, sealGameId, type SessionState } from "./session"

const seq = getSequence("visao-geral")!
const scenes = sequenceScenes(seq.id)
const ctx = { now: 1000, narrative: { scenes } }
const pistas = scenes.filter((s) => s.releases)
const first = pistas[0]
const ev = first.releases!
const game = sealGameId(ev)
const syntheses = Object.fromEntries(allReleasedSyntheses().map((x) => [x.evidenceId, x]))

function roomAt(index: number, people = ["p1", "p2"]): SessionState {
  let s = createSession({ roomCode: "ABCDEF", sequenceId: seq.id, sceneIds: seq.sceneIds, now: 0 })
  s = reduceHost(s, { type: "start" }, ctx).state
  s = reduceHost(s, { type: "goto", index }, ctx).state
  for (const id of people) s = reduceAudience(s, { type: "join", participantId: id }, ctx).state
  return s
}
const atFirstPista = () => roomAt(scenes.indexOf(first))
const release = (s: SessionState) => reduceHost(s, { type: "release", evidenceId: ev }, ctx).state
const breakSeal = (s: SessionState, pid: string) =>
  reduceAudience(s, { type: "play", participantId: pid, gameId: game, value: SEAL_TAPS, done: true }, ctx)

describe("selo do trilho", () => {
  it("o celular só quebra o selo depois que o apresentador libera", () => {
    const s = atFirstPista()
    expect(breakSeal(s, "p1").result).toBe("rejected")
    const r = breakSeal(release(s), "p1")
    expect(r.result).toBe("accepted")
    expect(r.state.plays?.[game].p1).toMatchObject({ value: SEAL_TAPS, done: true })
    expect(reduceAudience(r.state, { type: "play", participantId: "p1", gameId: game, value: 999, done: true }, ctx).result).toBe("unchanged")
  })

  it("quem chega atrasado ainda quebra o selo pelo Arquivo, em outra cena", () => {
    let s = release(atFirstPista())
    s = reduceHost(s, { type: "next" }, ctx).state
    expect(breakSeal(s, "p2").result).toBe("accepted")
  })

  it("telão: fechado → liberado com contagem → aberto quando todos quebram", () => {
    let s = atFirstPista()
    const stage = () => toProjectorView(s, { scenes }, getEvidence).scene!
    expect(stage().seal).toBe("fechado")
    expect(stage().sealInfo).toMatchObject({ trail: { n: 1, total: pistas.length }, opened: 0, players: 2 })
    expect(stage().sealInfo?.hint).toMatch(/Gênesis 3:15/)
    s = release(s)
    expect(stage().seal).toBe("liberado")
    s = breakSeal(s, "p1").state
    expect(stage()).toMatchObject({ seal: "liberado", sealInfo: { opened: 1, players: 2 } })
    s = breakSeal(s, "p2").state
    expect(stage().seal).toBe("aberto")
  })

  it("o apresentador pode abrir o selo do telão sem esperar todos", () => {
    let s = reduceHost(atFirstPista(), { type: "cue", kind: "selo" }, ctx).state
    // Antes da liberação, o telão continua fechado.
    expect(toProjectorView(s, { scenes }, getEvidence).scene?.seal).toBe("fechado")
    s = reduceHost(release(s), { type: "cue", kind: "selo" }, ctx).state
    expect(toProjectorView(s, { scenes }, getEvidence).scene?.seal).toBe("aberto")
  })

  it("celular: pista em destaque na cena, posição no trilho e selo quebrado só para quem quebrou", () => {
    const s = breakSeal(release(atFirstPista()), "p1").state
    const mine = toAudienceView(s, { scenes }, getEvidence, "p1", syntheses)
    expect(mine.scene?.clueId).toBe(ev)
    expect(mine.clues.find((c) => c.evidenceId === ev)).toMatchObject({ broken: true, trail: { n: 1, total: pistas.length } })
    expect(toAudienceView(s, { scenes }, getEvidence, "p2", syntheses).clues.find((c) => c.evidenceId === ev)?.broken).toBe(false)
  })

  it("nenhum minijogo usa o prefixo reservado dos selos", () => {
    const games = sequences.flatMap((q) => sequenceScenes(q.id)).flatMap((s) => (s.game ? [s.game.id] : []))
    expect(games.length).toBeGreaterThan(0)
    expect(games.filter((id) => id.startsWith("selo-"))).toEqual([])
  })
})
