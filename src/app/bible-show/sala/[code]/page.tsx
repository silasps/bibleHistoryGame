import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { SalaShow } from "@/features/bible-show/Sala"

export const metadata: Metadata = { title: "Bible Show · Sala", robots: { index: false } }

type Props = { params: Promise<{ code: string }> }

export default async function SalaBibleShowPage({ params }: Props) {
  const code = normalizeRoomCode((await params).code)
  if (!isRoomCode(code)) notFound()
  return <SalaShow code={code} />
}
