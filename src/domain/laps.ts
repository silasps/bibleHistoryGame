// Jericó: conta as voltas que o dedo dá em volta da cidade. Soma o ângulo
// percorrido (com sinal): voltar desfaz; meia volta não conta; o sentido não importa.

export interface LapState {
  /** Último ângulo visto (radianos), ou undefined antes do primeiro toque. */
  last?: number
  /** Ângulo acumulado, com sinal. */
  acc: number
  /** Voltas completas (sempre ≥ 0, no sentido em que a pessoa está girando). */
  laps: number
}

export const LAP_START: LapState = { acc: 0, laps: 0 }

/** Diferença entre dois ângulos, normalizada para (−π, π]. */
export function angleDelta(from: number, to: number): number {
  let d = to - from
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  return d
}

/** Novo ponto do dedo (ângulo em volta do centro). Um salto grande demais (dedo levantado) é ignorado. */
export function addAngle(s: LapState, angle: number): LapState {
  if (s.last === undefined) return { ...s, last: angle }
  const d = angleDelta(s.last, angle)
  if (Math.abs(d) > Math.PI * 0.9) return { ...s, last: angle }
  const acc = s.acc + d
  return { last: angle, acc, laps: Math.max(s.laps, Math.floor(Math.abs(acc) / (2 * Math.PI))) }
}

/** Dedo levantado: o próximo toque recomeça a medir dali, sem perder as voltas já dadas. */
export const liftFinger = (s: LapState): LapState => ({ ...s, last: undefined })
