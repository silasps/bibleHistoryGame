import type { Metadata } from "next"
import { AppHeader } from "@/components/app/AppHeader"
import { RoomJoin } from "@/features/join/RoomJoin"

export const metadata: Metadata = { title: "Entrar em uma sala" }

export default function JoinPage() {
  return (
    <div className="stage-glow min-h-dvh" style={{ ["--illumination" as string]: 0.3 }}>
      <AppHeader minimal />
      <main id="conteudo" className="mx-auto max-w-md px-4 pt-10">
        <h1 className="mb-6 text-center font-display text-4xl text-parchment">Entrar na investigação</h1>
        <RoomJoin />
      </main>
    </div>
  )
}
