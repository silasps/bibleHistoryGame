"use server"

import { z } from "zod"
import { readPresenterNotes, writePresenterNote } from "@/data/supabase/notes"
import { presenterUnlocked } from "@/lib/presenter-access"

const Id = z.string().regex(/^[a-z0-9-]+$/).max(80)

/** Notas do painel: só para quem tem acesso de apresentador (a mesma regra da Área de preparação). */
export async function loadPresenterNotes(sequenceId: string): Promise<{ ok: boolean; notes: Record<string, string> }> {
  const seq = Id.safeParse(sequenceId)
  if (!seq.success || !(await presenterUnlocked())) return { ok: false, notes: {} }
  const notes = await readPresenterNotes(seq.data)
  return notes ? { ok: true, notes } : { ok: false, notes: {} }
}

export async function savePresenterNote(sequenceId: string, sceneId: string, body: string): Promise<{ ok: boolean }> {
  const input = z.object({ seq: Id, scene: Id, body: z.string().max(6000) }).safeParse({ seq: sequenceId, scene: sceneId, body })
  if (!input.success || !(await presenterUnlocked())) return { ok: false }
  return { ok: await writePresenterNote(input.data.seq, input.data.scene, input.data.body) }
}
