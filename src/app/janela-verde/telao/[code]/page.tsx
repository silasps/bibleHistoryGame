import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { TelaoJanela } from "@/features/janela-verde/Telao"

export const metadata: Metadata = { title: "Janela Verde · Telão", robots: { index: false } }

type Props = { params: Promise<{ code: string }> }

export default async function TelaoJanelaPage({ params }: Props) {
  const code = normalizeRoomCode((await params).code)
  if (!isRoomCode(code)) notFound()
  return <TelaoJanela code={code} />
}
