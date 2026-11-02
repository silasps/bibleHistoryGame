// Sem 0/O, 1/I/L: códigos fáceis de ditar e digitar.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

export function generateRoomCode(length = 6): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("")
}

export function normalizeRoomCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)
}

const CODE_RE = new RegExp(`^[${ALPHABET}]{6}$`)

export function isRoomCode(code: string): boolean {
  return CODE_RE.test(code)
}
