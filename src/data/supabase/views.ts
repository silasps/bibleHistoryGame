import "server-only"

import { cookies } from "next/headers"
import { getEvidence, sequenceScenes } from "@/content"
import { getReleasedSynthesis } from "@/content/released"
import type { ReleasedSynthesis } from "@/content/schema"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { toAudienceView, toProjectorView } from "@/domain/projection"
import { isLiveConfigured } from "./admin"
import { loadRoom, participantFor } from "./rooms"
import { hostCookie, participantCookie, secretMatches } from "./secrets"

const NO_STORE = { "Cache-Control": "no-store" }

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: NO_STORE })
}

export async function roomOr404(rawCode: string) {
  if (!isLiveConfigured()) return { response: json({ error: "Supabase não configurado" }, 503) } as const
  const code = normalizeRoomCode(rawCode)
  if (!isRoomCode(code)) return { response: json({ error: "Código inválido" }, 400) } as const
  const loaded = await loadRoom(code)
  if (!loaded) return { response: json({ error: "Sala não encontrada ou expirada" }, 404) } as const
  return { code, ...loaded } as const
}

export async function projectorResponse(rawCode: string) {
  const room = await roomOr404(rawCode)
  if ("response" in room) return room.response
  const narrative = { scenes: sequenceScenes(room.row.sequence_id) }
  return json(toProjectorView(room.state, narrative, getEvidence))
}

/**
 * Autorização de leitura no backend: a síntese só é anexada para evidências
 * já liberadas nesta sala. Antes disso, ela não sai do servidor.
 */
export async function audienceResponse(rawCode: string) {
  const room = await roomOr404(rawCode)
  if ("response" in room) return room.response
  const token = (await cookies()).get(participantCookie(room.code))?.value
  const participant = await participantFor(room.code, token)
  const released: Record<string, ReleasedSynthesis> = {}
  for (const id of room.state.released) {
    const s = getReleasedSynthesis(id)
    if (s) released[id] = s
  }
  const narrative = { scenes: sequenceScenes(room.row.sequence_id) }
  return json(toAudienceView(room.state, narrative, getEvidence, participant?.id ?? null, released))
}

export async function hostResponse(rawCode: string) {
  const room = await roomOr404(rawCode)
  if ("response" in room) return room.response
  const secret = (await cookies()).get(hostCookie(room.code))?.value
  if (!secretMatches(secret, room.row.host_secret_hash)) return json({ error: "Sem permissão de apresentador" }, 403)
  return json(room.state)
}
