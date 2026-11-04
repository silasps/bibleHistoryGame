// Física da mira no jardim: um lançamento com gravidade leve e uma força que
// puxa para o fruto. A força cresce a cada jogada; na última, o tiro sempre
// termina no fruto. Unidades: a tela vai de 0 a 1 nos dois eixos (y para baixo).

export interface Point {
  x: number
  y: number
}

export interface Target extends Point {
  id: string
  r: number
}

export interface ShotInput {
  start: Point
  velocity: Point
  fruit: Target
  targets: Target[]
  /** 0 = sem atração; 1 = a atração vence qualquer mira. */
  pull: number
  /** Alvos já acertados não contam de novo. */
  ignore?: string[]
}

export interface ShotResult {
  path: Point[]
  hit: string | null
}

const GRAVITY = 0.9
const DT = 1 / 60
const MAX_STEPS = 360

/** Atração por jogada: livre no começo, inevitável na última. */
export const PULL_BY_SHOT = [0, 0.18, 0.4, 0.65, 1]
export const MAX_SHOTS = PULL_BY_SHOT.length

export function simulateShot({ start, velocity, fruit, targets, pull, ignore = [] }: ShotInput): ShotResult {
  const path: Point[] = [{ ...start }]
  let { x, y } = start
  let vx = velocity.x
  let vy = velocity.y
  const live = targets.filter((t) => !ignore.includes(t.id))
  for (let i = 0; i < MAX_STEPS; i++) {
    const dx = fruit.x - x
    const dy = fruit.y - y
    const dist = Math.hypot(dx, dy) || 1e-6
    if (pull >= 1) {
      // Na última jogada a direção vira para o fruto, com rapidez crescente.
      const speed = Math.max(0.9, Math.hypot(vx, vy))
      const k = Math.min(1, 0.08 + i * 0.01)
      vx += ((dx / dist) * speed - vx) * k
      vy += ((dy / dist) * speed - vy) * k
    } else {
      vx += (dx / dist) * pull * 6 * DT
      vy += ((dy / dist) * pull * 6 + GRAVITY * (1 - pull)) * DT
    }
    x += vx * DT
    y += vy * DT
    path.push({ x, y })
    if (Math.hypot(fruit.x - x, fruit.y - y) <= fruit.r) return { path, hit: "fruto" }
    // Na última jogada nenhum alvo segura o tiro.
    if (pull < 1) {
      const t = live.find((t) => Math.hypot(t.x - x, t.y - y) <= t.r)
      if (t) return { path, hit: t.id }
    }
    if (x < -0.2 || x > 1.2 || y < -0.3 || y > 1.3) return { path, hit: null }
  }
  return { path, hit: null }
}

/** Velocidade do lançamento a partir do quanto o dedo puxou (estilingue: sai para o lado oposto). */
export function launchVelocity(drag: Point, power = 3): Point {
  const len = Math.min(0.35, Math.hypot(drag.x, drag.y))
  const scale = len === 0 ? 0 : (len / 0.35) * power / Math.hypot(drag.x, drag.y)
  return { x: -drag.x * scale, y: -drag.y * scale }
}

/** Velocidade que leva, sem atração, do ponto de partida até um ponto (para o botão "Lançar"). */
export function velocityToward(start: Point, to: Point, speed = 2.4): Point {
  const dx = to.x - start.x
  const dy = to.y - start.y
  const d = Math.hypot(dx, dy) || 1
  return { x: (dx / d) * speed, y: (dy / d) * speed - 0.25 }
}
