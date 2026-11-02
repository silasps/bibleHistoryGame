import "server-only"

import { createHash, randomBytes, timingSafeEqual } from "node:crypto"

export function newSecret(): string {
  return randomBytes(32).toString("base64url")
}

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex")
}

export function secretMatches(secret: string | undefined, hash: string): boolean {
  if (!secret) return false
  const a = Buffer.from(hashSecret(secret), "hex")
  const b = Buffer.from(hash, "hex")
  return a.length === b.length && timingSafeEqual(a, b)
}

export const hostCookie = (code: string) => `bph_host_${code}`
export const participantCookie = (code: string) => `bph_p_${code}`

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24,
}
