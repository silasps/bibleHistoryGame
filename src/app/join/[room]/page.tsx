import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { DemoAudience, LiveAudience } from "@/features/presentation/rooms"

export const metadata: Metadata = { title: "Entrar na sala", robots: { index: false } }

type Props = { params: Promise<{ room: string }>; searchParams: Promise<{ modo?: string }> }

export default async function JoinRoomPage({ params, searchParams }: Props) {
  const code = normalizeRoomCode((await params).room)
  if (!isRoomCode(code)) notFound()
  return (await searchParams).modo === "demo" ? <DemoAudience code={code} /> : <LiveAudience code={code} />
}
