"use server"

import { cookies } from "next/headers"
import { z } from "zod"
import { getSequence } from "@/content"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { isLiveConfigured } from "@/data/supabase/admin"
import { applyHostCommand, broadcast, castVote, createRoom, deleteRoom, joinRoom, lightUp } from "@/data/supabase/rooms"
import { COOKIE_OPTIONS, hostCookie, participantCookie } from "@/data/supabase/secrets"
import type { HostCommand, SessionState } from "@/domain/session"

// Toda ação valida a entrada e a credencial no servidor. Nada confia em
// "isHost" vindo do cliente.

const Code = z.string().transform(normalizeRoomCode).refine(isRoomCode, "Código inválido")
const Id = z.string().min(1).max(80).regex(/^[a-z0-9-]+$/)

const HostCommandSchema: z.ZodType<HostCommand> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("start") }),
  z.object({ type: z.literal("next") }),
  z.object({ type: z.literal("prev") }),
  z.object({ type: z.literal("goto"), index: z.number().int().min(0).max(500) }),
  z.object({ type: z.literal("pause") }),
  z.object({ type: z.literal("resume") }),
  z.object({ type: z.literal("open_poll"), pollId: Id }),
  z.object({ type: z.literal("close_poll"), pollId: Id }),
  z.object({ type: z.literal("show_results"), pollId: Id }),
  z.object({ type: z.literal("hide_results"), pollId: Id }),
  z.object({ type: z.literal("release"), evidenceId: z.string().regex(/^ev-[a-z0-9-]+$/) }),
  z.object({ type: z.literal("moment"), kind: z.enum(["haja-luz", "luzes"]) }),
  z.object({ type: z.literal("clear_moment") }),
  z.object({ type: z.literal("step"), delta: z.union([z.literal(1), z.literal(-1)]) }),
  z.object({ type: z.literal("cue"), kind: z.enum(["trem", "muro"]) }),
  z.object({ type: z.literal("set_rehearsal"), value: z.boolean() }),
  z.object({ type: z.literal("end") }),
])

async function presenterAllowed(accessCode: string | undefined): Promise<boolean> {
  const required = process.env.PRESENTER_ACCESS_CODE
  return !required || accessCode === required
}

export async function createLiveRoom(input: { sequenceId: string; rehearsal: boolean; accessCode?: string }) {
  if (!isLiveConfigured()) return { error: "Supabase não configurado" } as const
  if (!(await presenterAllowed(input.accessCode))) return { error: "Código de apresentador incorreto" } as const
  if (!getSequence(input.sequenceId)) return { error: "Sequência inválida" } as const
  const { code, secret } = await createRoom(input.sequenceId, !!input.rehearsal)
  ;(await cookies()).set(hostCookie(code), secret, COOKIE_OPTIONS)
  return { code } as const
}

export async function liveHostCommand(rawCode: string, rawCmd: unknown): Promise<{ state?: SessionState; error?: string }> {
  const code = Code.safeParse(rawCode)
  const cmd = HostCommandSchema.safeParse(rawCmd)
  if (!code.success || !cmd.success) return { error: "Comando inválido" }
  const secret = (await cookies()).get(hostCookie(code.data))?.value
  const result = await applyHostCommand(code.data, secret, cmd.data)
  if (!result.error) await broadcast(code.data, "stage")
  return result
}

export async function deleteLiveRoom(rawCode: string) {
  const code = Code.safeParse(rawCode)
  if (!code.success) return { ok: false }
  const jar = await cookies()
  const ok = await deleteRoom(code.data, jar.get(hostCookie(code.data))?.value)
  if (ok) {
    jar.delete(hostCookie(code.data))
    await broadcast(code.data, "stage")
  }
  return { ok }
}

export async function joinLiveRoom(rawCode: string, nickname?: string) {
  const code = Code.safeParse(rawCode)
  if (!code.success) return { error: "Código inválido" }
  const name = z.string().trim().max(24).optional().safeParse(nickname)
  const jar = await cookies()
  const result = await joinRoom(code.data, jar.get(participantCookie(code.data))?.value, name.success ? name.data : undefined)
  if ("error" in result) return { error: result.error }
  jar.set(participantCookie(code.data), result.token, COOKIE_OPTIONS)
  await broadcast(code.data, "people")
  return { ok: true }
}

export async function castLiveVote(rawCode: string, pollId: string, optionId: string) {
  const code = Code.safeParse(rawCode)
  const poll = Id.safeParse(pollId)
  const option = Id.safeParse(optionId)
  if (!code.success || !poll.success || !option.success) return { error: "Voto inválido" }
  const token = (await cookies()).get(participantCookie(code.data))?.value
  const result = await castVote(code.data, token, poll.data, option.data)
  if (result.ok) await broadcast(code.data, "votes")
  return result.ok ? { ok: true } : { error: result.error }
}

export async function lightLive(rawCode: string) {
  const code = Code.safeParse(rawCode)
  if (!code.success) return { ok: false }
  const ok = await lightUp(code.data, (await cookies()).get(participantCookie(code.data))?.value)
  if (ok) await broadcast(code.data, "lights")
  return { ok }
}
