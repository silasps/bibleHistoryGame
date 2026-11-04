import { describe, expect, it } from "vitest"
import { MAX_SHOTS, PULL_BY_SHOT, simulateShot, velocityToward, type Target } from "./aim"
import { applyInventory, emptyInventory, treeOfLife } from "./relics"
import { clearedFraction } from "./scratch"

const fruit: Target = { id: "fruto", x: 0.5, y: 0.3, r: 0.07 }
const targets: Target[] = [
  { id: "nomear", x: 0.15, y: 0.25, r: 0.08 },
  { id: "cuidar", x: 0.85, y: 0.25, r: 0.08 },
  { id: "obedecer", x: 0.2, y: 0.55, r: 0.08 },
]
const start = { x: 0.5, y: 0.88 }

describe("Etapa 1: mira, raspagem e relíquias", () => {
  it("nas primeiras jogadas dá para acertar um alvo bom", () => {
    const shot = simulateShot({ start, velocity: velocityToward(start, targets[0]), fruit, targets, pull: PULL_BY_SHOT[0] })
    expect(shot.hit).toBe("nomear")
  })

  it("a última jogada sempre termina no fruto, para qualquer mira", () => {
    expect(PULL_BY_SHOT[MAX_SHOTS - 1]).toBe(1)
    for (let a = 0; a < 24; a++) {
      const angle = (a / 24) * Math.PI * 2
      const velocity = { x: Math.cos(angle) * 3, y: Math.sin(angle) * 3 }
      expect(simulateShot({ start, velocity, fruit, targets, pull: 1 }).hit, `ângulo ${a}`).toBe("fruto")
    }
  })

  it("conta a parte raspada da camada", () => {
    const w = 16
    const h = 16
    const alpha = new Uint8ClampedArray(w * h * 4).fill(255)
    expect(clearedFraction(alpha, w, h, 4)).toBe(0)
    for (let i = 3; i < alpha.length / 2; i += 4) alpha[i] = 0
    expect(clearedFraction(alpha, w, h, 4)).toBeCloseTo(0.5, 1)
  })

  it("na Queda as conquistas param e a árvore da vida fica trancada; as relíquias continuam", () => {
    let inv = applyInventory(emptyInventory, { type: "conquest", id: "luz" })
    expect(treeOfLife(inv)).toBe("no-jardim")
    inv = applyInventory(inv, { type: "fall" })
    inv = applyInventory(inv, { type: "conquest", id: "nomear" })
    inv = applyInventory(inv, { type: "relic", id: "semente" })
    expect(inv).toEqual({ conquests: ["luz"], fallen: true, relics: ["semente"] })
    expect(treeOfLife(inv)).toBe("trancada")
  })
})
