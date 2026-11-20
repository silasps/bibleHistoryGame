import "server-only"

import { admin, isLiveConfigured } from "./admin"

/** Notas do apresentador de uma sequência (cena → texto). Vazio se o Supabase não estiver configurado. */
export async function readPresenterNotes(sequenceId: string): Promise<Record<string, string> | null> {
  if (!isLiveConfigured()) return null
  const { data, error } = await admin().from("presenter_notes").select("scene_id, body").eq("sequence_id", sequenceId)
  if (error) return null
  return Object.fromEntries((data ?? []).filter((r) => r.body).map((r) => [r.scene_id as string, r.body as string]))
}

export async function writePresenterNote(sequenceId: string, sceneId: string, body: string): Promise<boolean> {
  if (!isLiveConfigured()) return false
  const { error } = await admin()
    .from("presenter_notes")
    .upsert({ sequence_id: sequenceId, scene_id: sceneId, body, updated_at: new Date().toISOString() }, { onConflict: "sequence_id,scene_id" })
  return !error
}
