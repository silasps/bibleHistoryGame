import "server-only"

import { cookies } from "next/headers"
import { hashSecret } from "@/data/supabase/secrets"

/** Área de preparação: aberta se não houver código configurado; senão, exige o cookie. */
export async function presenterUnlocked(): Promise<boolean> {
  const required = process.env.PRESENTER_ACCESS_CODE
  if (!required) return true
  return (await cookies()).get("bph_presenter")?.value === hashSecret(required)
}
