import { describe, expect, it } from "vitest"
import { allReleasedSyntheses } from "@/content/released"
import { getEvidence, sequences } from "@/content"
import type { ReleasedSynthesis } from "@/content/schema"
import { toAudienceView, toProjectorView } from "./projection"
import { everyState, secretTexts } from "@/test/session-states"

const allSyntheses: Record<string, ReleasedSynthesis> = Object.fromEntries(
  allReleasedSyntheses().map((s) => [s.evidenceId, s]),
)
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
