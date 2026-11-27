import { describe, expect, it } from "vitest"
import { getEvidence, getSequence, sequenceScenes } from "@/content"
import { allReleasedSyntheses } from "@/content/released"
import { phoneFocus, stagePhoneAction } from "./phone-action"
import { toAudienceView, toProjectorView } from "./projection"
import { createSession, reduceAudience, reduceHost, type HostCommand, type SessionState } from "./session"

const seq = getSequence("visao-geral")!
const scenes = sequenceScenes(seq.id)
const ctx = { now: 1000, narrative: { scenes } }
const at = (id: string) => scenes.findIndex((s) => s.id === id)
const syntheses = Object.fromEntries(allReleasedSyntheses().map((s) => [s.evidenceId, s]))

function roomAt(index: number): SessionState {
  let s = createSession({ roomCode: "ABCDEF", sequenceId: seq.id, sceneIds: seq.sceneIds, now: 0 })
  s = reduceHost(s, { type: "start" }, ctx).state
  s = reduceHost(s, { type: "goto", index }, ctx).state
  return reduceAudience(s, { type: "join", participantId: "p1" }, ctx).state
}
const host = (s: SessionState, cmd: HostCommand) => reduceHost(s, cmd, ctx).state
const stage = (s: SessionState) => stagePhoneAction(toProjectorView(s, { scenes }, getEvidence))
const phone = (s: SessionState) => phoneFocus(toAudienceView(s, { scenes }, getEvidence, "p1", syntheses))

describe("celular só na hora da ação", () => {
  it("tópico sem ação: o celular descansa e o telão não chama", () => {
    const s = roomAt(at("item-babel"))
    expect(stage(s)).toBeNull()
    expect(phone(s)).toEqual({ game: false, clue: false, poll: false, light: false, todo: null })
  })

  it("jogo ao vivo: só depois do Jogar agora; na pausa, o telão não chama", () => {
    let s = roomAt(at("item-noe"))
    expect(stage(s)).toBeNull()
    expect(phone(s).game).toBe(false)
    s = host(s, { type: "game_start" })
    expect(stage(s)).toBe("jogo")
    expect(phone(s)).toMatchObject({ game: true, todo: "jogo" })
    s = host(s, { type: "pause" })
    expect(stage(s)).toBeNull()
    expect(phone(s).todo).toBeNull()
  })

  it("minijogo da Etapa 1: o celular joga assim que o slide abre", () => {
    const s = roomAt(at("item-criacao"))
    expect(stage(s)).toBe("jogo")
    expect(phone(s)).toMatchObject({ game: true, todo: "jogo" })
  })

  it("pista: antes da liberação nada; depois, quebrar o selo", () => {
    const i = scenes.findIndex((sc) => sc.releases)
    let s = roomAt(i)
    expect(stage(s)).toBeNull()
    expect(phone(s).clue).toBe(false)
    s = host(s, { type: "release", evidenceId: scenes[i].releases! })
    expect(stage(s)).toBe("selo")
    expect(phone(s)).toMatchObject({ clue: true, todo: "selo" })
  })

  it("luzes do público: o telão chama e o celular mostra o botão até acender", () => {
    let s = host(roomAt(at("item-babel")), { type: "moment", kind: "luzes" })
    expect(stage(s)).toBe("luz")
    expect(phone(s)).toMatchObject({ light: true, todo: "luz" })
    s = reduceAudience(s, { type: "light", participantId: "p1" }, ctx).state
    expect(phone(s)).toMatchObject({ light: true, todo: null })
  })
})
