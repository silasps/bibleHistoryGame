import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { Compromisso } from "@/features/janela-verde/Compromisso"

export const metadata: Metadata = { title: "Janela Verde · Compromisso", robots: { index: false } }

type Props = { params: Promise<{ code: string }> }

export default async function CompromissoPage({ params }: Props) {
  const code = normalizeRoomCode((await params).code)
  if (!isRoomCode(code)) notFound()
  return <Compromisso code={code} />
}
