import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getSequence } from "@/content"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { isLiveConfigured } from "@/data/supabase/admin"
import { DemoPresenter, LivePresenter } from "@/features/presentation/rooms"

export const metadata: Metadata = { title: "Painel do apresentador", robots: { index: false } }

type Props = { params: Promise<{ room: string }>; searchParams: Promise<{ modo?: string; seq?: string; ensaio?: string }> }

export default async function PresenterRoomPage({ params, searchParams }: Props) {
  const code = normalizeRoomCode((await params).room)
  if (!isRoomCode(code)) notFound()
  const { modo, seq, ensaio } = await searchParams
  if (modo === "demo") {
    const sequenceId = getSequence(seq ?? "")?.id ?? "genesis"
    return <DemoPresenter code={code} sequenceId={sequenceId} rehearsal={ensaio === "1"} />
  }
  if (!isLiveConfigured()) return <p className="p-8 text-mist">Supabase não configurado. Use a demonstração local.</p>
  return <LivePresenter code={code} />
}
