import type { Metadata } from "next"
import Link from "next/link"
import { AppHeader } from "@/components/app/AppHeader"
import { weeks } from "@/content/overview"
import { EtapaMap } from "@/features/etapas/EtapaMap"
import { JourneyHub } from "@/features/journey/JourneyHub"
import { EpisodeCard } from "@/features/solo/SoloHub"

export const metadata: Metadata = { title: "Modo solo" }

type SearchParams = Promise<{ semana?: string }>

export default async function SoloPage({ searchParams }: { searchParams: SearchParams }) {
  const asked = Number((await searchParams).semana)
  const playable = weeks.filter((w) => w.status === "com_material")
  const week = playable.find((w) => w.week === asked)?.week ?? playable[0].week

  return (
    <div className="min-h-dvh bg-night">
      <AppHeader />
      <main id="conteudo" className="mx-auto max-w-7xl space-y-16 px-4 pb-20 pt-6 md:px-8">
        <EtapaMap />
        <JourneyHub week={week} />
        <section className="space-y-4">
          <h2 className="font-display text-3xl text-parchment">Por dentro da história</h2>
          <EpisodeCard episodeId="genesis-1-3" featured />
          <div className="grid gap-4 md:grid-cols-2">
            <EpisodeCard episodeId="analogia-muro-trem" />
            <EpisodeCard episodeId="analogia-cinco-motoristas" />
          </div>
          <Link href="/archive" className="inline-flex min-h-12 items-center rounded-full border border-border px-5 text-sm text-mist hover:text-parchment">
            Abrir o Arquivo: personagens, pistas e anotações
          </Link>
        </section>
      </main>
    </div>
  )
}

