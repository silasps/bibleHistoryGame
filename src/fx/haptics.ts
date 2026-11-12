/** Vibração curta no celular. No iOS e em desktops, não faz nada. */
export function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern)
  } catch {
    // ignorado
  }
}

export const HAPTIC = {
  seal: [30, 60, 30, 60, 120],
  tap: 12,
  no: [8, 40, 8],
  vote: 15,
  light: [10, 40, 10],
  wave: 80,
}
