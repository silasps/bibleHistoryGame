import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { DemoProjector, LiveProjector } from "@/features/presentation/rooms"

export const metadata: Metadata = { title: "Telão", robots: { index: false } }

type Props = { params: Promise<{ room: string }>; searchParams: Promise<{ modo?: string }> }

export default async function ProjectorPage({ params, searchParams }: Props) {
  const code = normalizeRoomCode((await params).room)
  if (!isRoomCode(code)) notFound()
  return (await searchParams).modo === "demo" ? <DemoProjector code={code} /> : <LiveProjector code={code} />
}
