import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { TelaoShow } from "@/features/bible-show/Telao"

export const metadata: Metadata = { title: "Bible Show · Telão", robots: { index: false } }

type Props = { params: Promise<{ code: string }> }

export default async function TelaoBibleShowPage({ params }: Props) {
  const code = normalizeRoomCode((await params).code)
  if (!isRoomCode(code)) notFound()
  return <TelaoShow code={code} />
}
