import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { getEvidence, sequences } from "@/content"
import type { HostRoomApi } from "@/data/ports"
import { toProjectorView } from "@/domain/projection"
import { everyState, secretTexts } from "@/test/session-states"
import { PresenterConsole } from "./PresenterConsole"
import { ProjectorStage } from "./ProjectorStage"

vi.mock("@/app/actions/live", () => ({}))

const FORBIDDEN = /\bPRD\b|plano redentivo/i

describe("texto renderizado nas superfícies de palco", () => {
  for (const seq of sequences) {
    it(`telão e painel nunca mostram PRD nem conteúdo server-only — ${seq.id}`, () => {
      let checked = 0
      for (const { state, scenes } of everyState(seq.id)) {
        const projector = render(<ProjectorStage view={toProjectorView(state, { scenes }, getEvidence)} joinUrl="http://x/join/TESTE1" />)
        const room: HostRoomApi = { mode: "demo", state, link: "conectado", command: async () => undefined }
        const presenter = render(<PresenterConsole room={room} code="TESTE1" joinUrl="http://x" projectorUrl="/projector/TESTE1" />)
        for (const text of [projector.container.textContent ?? "", presenter.container.textContent ?? ""]) {
          expect(text).not.toMatch(FORBIDDEN)
          for (const secret of secretTexts) expect(text).not.toContain(secret)
        }
        projector.unmount()
        presenter.unmount()
        checked++
      }
      expect(checked).toBeGreaterThan(20)
    }, 60_000)
  }
})
