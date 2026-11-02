import { describe, expect, it } from "vitest"
import { allPresenterNotes } from "@/content/private"
import { allReleasedSyntheses } from "@/content/released"
import { getEvidence, getSceneEntry, sequences } from "@/content"
import type { ReleasedSynthesis, Scene } from "@/content/schema"
import { toAudienceView, toProjectorView } from "./projection"
import { createSession, reduceAudience, reduceHost, type Ctx, type HostCommand, type SessionState } from "./session"

const allSyntheses: Record<string, ReleasedSynthesis> = Object.fromEntries(
  allReleasedSyntheses().map((s) => [s.evidenceId, s]),
)
const secretTexts = [
  ...allReleasedSyntheses().flatMap((s) => [s.classificationNote, ...s.blocks.map((b) => b.text)]),
  ...allPresenterNotes().flatMap((n) => [...n.talkingPoints, n.transitionHint ?? ""]).filter(Boolean),
]

/** Gera estados representativos de cada cena: inicial, enquete aberta/fechada/resultado, liberado, pausado, momento. */
function* everyState(sequenceId: string): Generator<{ state: SessionState; scenes: Scene[] }> {
  const seq = sequences.find((s) => s.id === sequenceId)!
  const scenes = seq.sceneIds.map((id) => getSceneEntry(id)!.scene)
  const ctx = (now: number): Ctx => ({ now, narrative: { scenes } })
  let state = createSession({ roomCode: "TESTE1", sequenceId, sceneIds: seq.sceneIds, now: 0 })
  yield { state, scenes }
  state = reduceHost(state, { type: "start" }, ctx(1)).state
  state = reduceAudience(state, { type: "join", participantId: "p1" }, ctx(1)).state
  for (let i = 0; i < scenes.length; i++) {
    state = reduceHost(state, { type: "goto", index: i }, ctx(i * 10)).state
    yield { state, scenes }
    const scene = scenes[i]
    const cmds: HostCommand[] = []
    if (scene.poll) {
      cmds.push({ type: "open_poll", pollId: scene.poll.id })
      cmds.push({ type: "close_poll", pollId: scene.poll.id })
      cmds.push({ type: "show_results", pollId: scene.poll.id })
    }
    if (scene.releases) cmds.push({ type: "release", evidenceId: scene.releases })
    cmds.push({ type: "moment", kind: "haja-luz" }, { type: "pause" }, { type: "resume" })
    for (const cmd of cmds) {
      state = reduceHost(state, cmd, ctx(i * 10 + 1)).state
      if (cmd.type === "open_poll" && scene.poll) {
        state = reduceAudience(
          state,
          { type: "vote", participantId: "p1", pollId: scene.poll.id, optionId: scene.poll.options[0].id },
          ctx(i * 10 + 1),
        ).state
      }
      yield { state, scenes }
    }
  }
}

describe("telão (ProjectorView)", () => {
  for (const seq of sequences) {
    it(`nunca contém PRD, sínteses ou notas privadas — sequência ${seq.id}`, () => {
      for (const { state, scenes } of everyState(seq.id)) {
        const json = JSON.stringify(toProjectorView(state, { scenes }, getEvidence))
        expect(json).not.toMatch(/\bPRD\b|plano redentivo/i)
        for (const secret of secretTexts) expect(json).not.toContain(secret)
      }
    })
  }

  it("no momento de conexão mostra só a imagem", () => {
    for (const { state, scenes } of everyState("genesis")) {
      const view = toProjectorView(state, { scenes }, getEvidence)
      if (view.scene?.type === "presenter_pause") {
        expect(view.scene.title).toBeUndefined()
        expect(view.scene.caption).toBeUndefined()
      }
    }
  })
})

describe("celular (AudienceView)", () => {
  it("não inclui a síntese antes da liberação, mesmo que o host tenha o cache", () => {
    let sawSealed = false
    let sawOpen = false
    for (const { state, scenes } of everyState("genesis")) {
      const view = toAudienceView(state, { scenes }, getEvidence, "p1", allSyntheses)
      const json = JSON.stringify(view)
      for (const clue of view.clues) {
        if (state.released.includes(clue.evidenceId)) {
          sawOpen = true
          expect(clue.synthesis).toBeDefined()
        } else {
          sawSealed = true
          expect(clue.synthesis).toBeUndefined()
          expect(clue.refs).toBeUndefined()
          const synth = allSyntheses[clue.evidenceId]
          for (const b of synth?.blocks ?? []) expect(json).not.toContain(b.text)
        }
      }
      expect(json).not.toMatch(/\bPRD\b|plano redentivo/i)
    }
    expect(sawSealed).toBe(true)
    expect(sawOpen).toBe(true)
  })

  it("título da pista é genérico enquanto selada", () => {
    for (const { state, scenes } of everyState("genesis")) {
      for (const clue of toAudienceView(state, { scenes }, getEvidence, "p1", {}).clues) {
        if (clue.status !== "aberta") expect(clue.title).toBe("Pista selada")
      }
    }
  })

  it("não expõe votos de outros participantes", () => {
    for (const { state, scenes } of everyState("genesis")) {
      const view = toAudienceView(state, { scenes }, getEvidence, "outro", allSyntheses)
      expect(view.scene?.poll?.myVote).toBeUndefined()
      expect(JSON.stringify(view)).not.toContain('"p1"')
    }
  })
})
