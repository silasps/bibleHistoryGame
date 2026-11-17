import { describe, expect, it } from "vitest"
import { addAngle, angleDelta, LAP_START, liftFinger, type LapState } from "./laps"
import { arcaScore, heartScore, lapsScore, POINTS_MAX, seaScore, slingHitPoints, stagedScore, starsScore, timeBonus } from "./score"

const turn = (s: LapState, from: number, to: number, steps = 24) => {
  let out = s
  for (let i = 0; i <= steps; i++) out = addAngle(out, from + ((to - from) * i) / steps)
  return out
}

describe("voltas em Jericó", () => {
  it("uma volta completa conta, nos dois sentidos", () => {
    expect(turn(LAP_START, 0, 2 * Math.PI + 0.01).laps).toBe(1)
    expect(turn(LAP_START, 0, -2 * Math.PI - 0.01).laps).toBe(1)
  })
  it("meia volta não conta, e ir e voltar não soma", () => {
    expect(turn(LAP_START, 0, Math.PI).laps).toBe(0)
    let s = turn(LAP_START, 0, Math.PI)
    s = turn(s, Math.PI, 0)
    s = turn(s, 0, Math.PI)
    expect(s.laps).toBe(0)
  })
  it("sete voltas seguidas, mesmo levantando o dedo no meio", () => {
    let s = turn(LAP_START, 0, 3 * 2 * Math.PI + 0.1, 100)
    s = liftFinger(s)
    s = turn(s, 3 * 2 * Math.PI + 0.1, 7 * 2 * Math.PI + 0.1, 140)
    expect(s.laps).toBe(7)
  })
  it("a diferença de ângulos atravessa o ±π sem pular", () => {
    expect(angleDelta(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(0.2)
  })
})

describe("pontuação dos minijogos", () => {
  it("nada passa de 1000 nem fica negativo", () => {
    expect(arcaScore(7, 0, 7, 75_000, 75_000)).toBe(POINTS_MAX)
    expect(arcaScore(0, 9, 7, 0, 75_000)).toBe(0)
    expect(starsScore(5000)).toBe(POINTS_MAX)
    expect(heartScore(36, 36, 75_000, 75_000)).toBe(POINTS_MAX)
  })
  it("terminar mais rápido vale mais; terminar vale mais que quase terminar", () => {
    expect(lapsScore(7, 7, 50_000, 75_000)).toBeGreaterThan(lapsScore(7, 7, 10_000, 75_000))
    expect(lapsScore(7, 7, 0, 75_000)).toBeGreaterThan(lapsScore(6, 7, 75_000, 75_000))
    expect(stagedScore(3, 3, 0, 75_000)).toBeGreaterThan(stagedScore(2.9, 3, 75_000, 75_000))
  })
  it("no mar, cada nova tentativa custa pontos", () => {
    expect(seaScore(6, 6, true, 10_000, 25_000, 1)).toBeGreaterThan(seaScore(6, 6, true, 10_000, 25_000, 2))
  })
  it("na funda, acerto mais longe vale mais", () => {
    expect(slingHitPoints(1)).toBe(100)
    expect(slingHitPoints(0)).toBe(20)
    expect(timeBonus(30_000, 60_000, 100)).toBe(50)
  })
})
