import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { CondutorJanela } from "@/features/janela-verde/Condutor"

export const metadata: Metadata = { title: "Janela Verde · Condutor", robots: { index: false } }

type Props = { params: Promise<{ code: string }> }

export default async function CondutorJanelaPage({ params }: Props) {
  const code = normalizeRoomCode((await params).code)
  if (!isRoomCode(code)) notFound()
  return <CondutorJanela code={code} />
}
