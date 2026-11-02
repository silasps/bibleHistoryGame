"use server"

import { z } from "zod"
import { getEvidence } from "@/content"
import { getReleasedSynthesis } from "@/content/released"
import type { ReleasedSynthesis } from "@/content/schema"

const EvidenceId = z.string().regex(/^ev-[a-z0-9-]+$/).max(80)

/**
 * Modo solo: entrega a síntese de uma conexão quando o jogador abre o selo.
 * Conexões "futuras" (episódio ainda não implementado) não são entregues.
 * Proteção anti-spoiler, não sigilo: qualquer jogador solo pode abrir o selo.
 */
export async function openSoloSeal(evidenceId: string): Promise<{ ok: true; synthesis: ReleasedSynthesis } | { ok: false }> {
  const parsed = EvidenceId.safeParse(evidenceId)
  if (!parsed.success) return { ok: false }
  const ev = getEvidence(parsed.data)
  if (!ev?.connection || ev.availability !== "disponivel") return { ok: false }
  const synthesis = getReleasedSynthesis(ev.id)
  return synthesis ? { ok: true, synthesis } : { ok: false }
}
