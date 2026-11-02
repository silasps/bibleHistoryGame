"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { hashSecret } from "@/data/supabase/secrets"

const PRESENTER_COOKIE = "bph_presenter"

/** Libera a Área de preparação quando PRESENTER_ACCESS_CODE está definido. */
export async function unlockPresenter(formData: FormData) {
  const required = process.env.PRESENTER_ACCESS_CODE
  const given = String(formData.get("code") ?? "")
  const seq = String(formData.get("seq") ?? "genesis").replace(/[^a-z-]/g, "")
  if (required && given === required) {
    ;(await cookies()).set(PRESENTER_COOKIE, hashSecret(required), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 })
  }
  redirect(`/presenter/prep?seq=${seq}`)
}
