import { describe, expect, it } from "vitest"
import { allPresenterNotes } from "./private"
import { allReleasedSyntheses } from "./released"
import { acts, allEvidence, allScenes, episodes, getEvidence, getSceneEntry, sequences, validateNarrative } from "."
import { formatRef } from "./refs"

describe("conteúdo editorial", () => {
  it("passa em todas as verificações de integridade", () => {
    expect(validateNarrative()).toEqual([])
  })

  it("tem os 11 atos em ordem, com os não implementados sinalizados", () => {
    expect(acts.map((a) => a.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(acts.filter((a) => a.status === "jogavel").map((a) => a.id)).toEqual(["ato-01"])
  })

  it("tem o vertical slice de Gênesis 1–3 jogável", () => {
    const genesis = episodes.find((e) => e.id === "genesis-1-3")
    expect(genesis?.status).toBe("jogavel")
    expect(genesis?.scenes.map((s) => s.type)).toContain("canonical_reveal")
    expect(genesis?.scenes.map((s) => s.type)).toContain("presenter_pause")
  })

  it("não contém citações literais não verificadas", () => {
    for (const scene of allScenes()) for (const b of scene.blocks) expect(b.kind === "texto_biblico" && !b.quoteVerified).toBe(false)
  })

  it("toda conexão tem fundamento textual e tipo", () => {
    const connections = allEvidence().filter((e) => e.connection)
    expect(connections.length).toBeGreaterThan(0)
    for (const ev of connections) {
      expect(ev.connection?.basis.length).toBeGreaterThan(0)
      expect(ev.summary).toBeUndefined()
    }
  })

  it("toda conexão liberável tem síntese server-only", () => {
    for (const ev of allEvidence().filter((e) => e.connection)) {
      expect(allReleasedSyntheses().some((s) => s.evidenceId === ev.id)).toBe(true)
    }
  })

  it("nenhum texto de palco usa a sigla PRD ou explica o plano redentivo", () => {
    for (const scene of allScenes()) {
      const stage = [scene.title, scene.stage.caption ?? "", scene.audiencePrompt ?? ""].join(" ")
      expect(stage).not.toMatch(/\bPRD\b|plano redentivo/i)
    }
  })

  it("notas do apresentador apontam para cenas reais", () => {
    for (const n of allPresenterNotes()) expect(getSceneEntry(n.sceneId)).toBeDefined()
  })

  it("sequências de apresentação só usam cenas existentes", () => {
    for (const seq of sequences) for (const id of seq.sceneIds) expect(getSceneEntry(id)).toBeDefined()
  })

  it("formata referências em português", () => {
    const ev = getEvidence("ev-descendencia")
    expect(ev && formatRef(ev.refs[0])).toBe("Gênesis 3:15")
    expect(formatRef({ book: "Exod", chapter: 19, chapterEnd: 20 })).toBe("Êxodo 19–20")
    expect(formatRef({ book: "Gen", chapter: 3, verseStart: 1, verseEnd: 6 }, "short")).toBe("Gn 3:1–6")
  })
})
