/**
 * Fração já raspada de uma camada (canal alfa de um ImageData), amostrando
 * uma grade. Pixel com alfa baixo conta como limpo.
 */
export function clearedFraction(alpha: ArrayLike<number>, width: number, height: number, step = 8): number {
  let total = 0
  let clear = 0
  for (let y = Math.floor(step / 2); y < height; y += step) {
    for (let x = Math.floor(step / 2); x < width; x += step) {
      total++
      if (alpha[(y * width + x) * 4 + 3] < 40) clear++
    }
  }
  return total ? clear / total : 0
}

/** O dia se revela quando boa parte da tela foi raspada. */
export const SCRATCH_DONE = 0.55
