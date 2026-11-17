// Pontuação dos minijogos das etapas 2–11 (até 1000, o teto da tabela `plays`).
// Funções puras: o celular calcula e manda; o pódio só ordena.

export const POINTS_MAX = 1000

const clamp = (n: number) => Math.max(0, Math.min(POINTS_MAX, Math.round(n)))

/** Bônus proporcional ao tempo que sobrou (0 a `max`). */
export function timeBonus(leftMs: number, totalMs: number, max: number): number {
  if (totalMs <= 0) return 0
  return Math.round(max * Math.max(0, Math.min(1, leftMs / totalMs)))
}

/** Arca: +100 por par, −50 por objeto errado; o bônus de tempo só vale com todos os pares. */
export function arcaScore(pairs: number, errors: number, total: number, leftMs: number, totalMs: number): number {
  const done = pairs >= total
  return clamp(pairs * 100 - errors * 50 + (done ? timeBonus(leftMs, totalMs, POINTS_MAX - total * 100) : 0))
}

/** Estrelas: uma estrela contada, um ponto. */
export const starsScore = (counted: number) => clamp(counted)

/** Jogos em partes (cesto, altar): cada parte vale o seu peso; terminar dá bônus de tempo. */
export function stagedScore(partsDone: number, parts: number, leftMs: number, totalMs: number, penalty = 0, bonusMax = 400): number {
  const base = ((POINTS_MAX - bonusMax) * partsDone) / parts
  return clamp(base - penalty + (partsDone >= parts ? timeBonus(leftMs, totalMs, bonusMax) : 0))
}

/** Mar: +60 por grupo; vencer dá 300 e o bônus da travessia; cada nova tentativa custa 100. */
export function seaScore(crossed: number, groups: number, won: boolean, crossLeftMs: number, crossMs: number, attempts: number): number {
  const base = crossed * 60 + (won ? 300 + timeBonus(crossLeftMs, crossMs, POINTS_MAX - 300 - groups * 60) : 0)
  return clamp(base - Math.max(0, attempts - 1) * 100)
}

/** Maná: +20 por porção do dia, −20 por porção que estragou; bônus de tempo ao fim dos seis dias. */
export function manaScore(portions: number, spoiled: number, finished: boolean, leftMs: number, totalMs: number, totalPortions: number): number {
  return clamp(portions * 20 - spoiled * 20 + (finished ? timeBonus(leftMs, totalMs, POINTS_MAX - totalPortions * 20) : 0))
}

/** Jericó: +100 por volta do sétimo dia (sete voltas), mais o bônus de tempo. */
export function lapsScore(laps: number, total: number, leftMs: number, totalMs: number): number {
  return clamp(laps * 100 + (laps >= total ? timeBonus(leftMs, totalMs, POINTS_MAX - total * 100) : 0))
}

/** Funda: quanto mais longe (mais alto na tela) o acerto, mais pontos: de 20 a 100. */
export function slingHitPoints(heightFromBottom: number): number {
  const h = Math.max(0, Math.min(1, heightFromBottom))
  return Math.round(20 + 80 * h)
}

/** Nínive: +80 por lugar alcançado; terminar dá bônus de tempo. */
export function announceScore(places: number, total: number, leftMs: number, totalMs: number): number {
  return clamp(places * 80 + (places >= total ? timeBonus(leftMs, totalMs, POINTS_MAX - total * 80) : 0))
}

/** Coração: os toques valem até 400; quebrar dá 200 e o bônus de quem quebrou mais rápido. */
export function heartScore(taps: number, needed: number, leftMs: number, totalMs: number): number {
  const done = taps >= needed
  return clamp((400 * Math.min(taps, needed)) / needed + (done ? 200 + timeBonus(leftMs, totalMs, 400) : 0))
}
