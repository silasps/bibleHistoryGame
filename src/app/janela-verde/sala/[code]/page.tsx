import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { Sala } from "@/features/janela-verde/Sala"

export const metadata: Metadata = { title: "Janela Verde · Grupo", robots: { index: false } }

type Props = { params: Promise<{ code: string }> }

export default async function SalaJanelaPage({ params }: Props) {
  const code = normalizeRoomCode((await params).code)
  if (!isRoomCode(code)) notFound()
  return <Sala code={code} />
}
