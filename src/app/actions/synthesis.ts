"use server"

import { z } from "zod"
import { getEvidence } from "@/content"
import { getReleasedSynthesis } from "@/content/released"
import type { ReleasedSynthesis } from "@/content/schema"

const EvidenceId = z.string().regex(/^ev-[a-z0-9-]+$/).max(80)

/**
 * Entrega a síntese de uma conexão: no modo solo, quando o jogador abre o selo;
 * na demonstração local, quando o apresentador libera a pista.
 * Conexões "futuras" (episódio ainda não implementado) não são entregues.
 * Proteção anti-spoiler, não sigilo: no modo solo qualquer jogador pode abrir o selo.
 * Ao vivo com Supabase, a síntese só sai pela rota da audiência depois da liberação.
 */
export async function fetchConnectionSynthesis(evidenceId: string): Promise<{ ok: true; synthesis: ReleasedSynthesis } | { ok: false }> {
  const parsed = EvidenceId.safeParse(evidenceId)
  if (!parsed.success) return { ok: false }
  const ev = getEvidence(parsed.data)
  if (!ev?.connection || ev.availability !== "disponivel") return { ok: false }
  const synthesis = getReleasedSynthesis(ev.id)
  return synthesis ? { ok: true, synthesis } : { ok: false }
}
