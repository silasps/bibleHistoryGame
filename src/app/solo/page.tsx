import type { Metadata } from "next"
import { AppHeader } from "@/components/app/AppHeader"
import { EpisodeCard } from "@/features/solo/SoloHub"
import { ActsTimeline } from "@/features/timeline/ActsTimeline"

export const metadata: Metadata = { title: "Modo solo" }

export default function SoloPage() {
  return (
    <div className="min-h-dvh bg-night">
      <AppHeader />
      <main id="conteudo" className="mx-auto max-w-7xl space-y-16 px-4 pb-20 pt-6 md:px-8">
        <EpisodeCard episodeId="genesis-1-3" featured />
        <section className="grid gap-4 md:grid-cols-2">
          <EpisodeCard episodeId="analogia-muro-trem" />
          <EpisodeCard episodeId="analogia-cinco-motoristas" />
        </section>
        <section>
          <h2 className="mb-6 font-display text-3xl text-parchment">Os 11 atos</h2>
          <ActsTimeline compact />
        </section>
      </main>
    </div>
  )
}
