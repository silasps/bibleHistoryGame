import { describe, expect, it } from "vitest"
import { sequenceScenes } from "@/content"
import { arcadeMelody, MOOD_FOR_GAME, moodForScene } from "./sound"

const ARCADE = ["play", "play-tense", "play-epic"]

describe("música por cena", () => {
  const scenes = sequenceScenes("visao-geral")

  it("os minijogos tocam trilha de game; os momentos da Queda, não", () => {
    for (const s of scenes.filter((s) => s.game)) {
      const mood = moodForScene(s)
      if (["jardim", "queda", "vestes", "fora"].includes(s.game!.kind)) expect(ARCADE, s.id).not.toContain(mood)
      else expect(ARCADE, s.id).toContain(mood)
    }
    expect(Object.keys(MOOD_FOR_GAME).length).toBeGreaterThanOrEqual(16)
  })

  it("cada etapa tem o seu clima e o versículo tem o clima da esperança", () => {
    const mood = (id: string) => moodForScene(scenes.find((s) => s.id === id))
    expect(mood("item-criacao")).toBe("play")
    expect(mood("item-diluvio")).toBe("sorrow")
    expect(mood("item-exodo")).toBe("triumph")
    expect(mood("versiculo-01")).toBe("hope")
    expect(moodForScene(null)).toBe("night")
  })

  it("a melodia gerada é sempre a mesma para a mesma trilha e termina na tônica", () => {
    const def = { seed: 11, progression: [0, 4, 5, 3], scale: [0, 2, 4, 5, 7, 9, 11] }
    const a = arcadeMelody(def)
    expect(arcadeMelody(def)).toEqual(a)
    expect(a).toHaveLength(32)
    expect(a.at(-1)).toBe(7)
    expect(a.every((n) => n === null || (n >= 0 && n <= 11))).toBe(true)
    expect(arcadeMelody({ ...def, seed: 23 })).not.toEqual(a)
  })
})
