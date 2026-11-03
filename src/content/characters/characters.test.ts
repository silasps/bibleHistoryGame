import { describe, expect, it } from "vitest"
import { ART_IDS } from "@/components/art/registry"
import { items } from "../overview"
import { characters, validateCharacters } from "."

describe("personagens", () => {
  it("passam na integridade (itens, arte e ligações existentes)", () => {
    expect(validateCharacters(new Set(items.map((i) => i.id)), new Set(ART_IDS))).toEqual([])
  })

  it("toda skin com base no texto tem referência; nenhuma cita a NAA entre aspas sem conferência", () => {
    for (const c of characters) {
      for (const s of c.skin) {
        if (s.basis === "texto") expect(s.refs.length).toBeGreaterThan(0)
        expect(s.meaning).not.toMatch(/^“/)
      }
    }
  })

  it("todo significado de nome tem fonte do Bible Hub", () => {
    for (const c of characters) expect(c.nameMeaning.url).toMatch(/^https:\/\/biblehub\.com\//)
  })

  it("cada personagem datado da linha do tempo tem ficha", () => {
    const withCharacter = items.filter((i) => i.characterId && i.kind === "personagem")
    for (const i of withCharacter) expect(characters.some((c) => c.id === i.characterId)).toBe(true)
  })
})
