import type { Metadata } from "next"
import Link from "next/link"
import { AppHeader } from "@/components/app/AppHeader"
import { getEtapa } from "@/content/etapas"
import { CREATION, GARDEN_TARGETS } from "@/content/etapas/etapa-1"
import { weeks } from "@/content/overview"
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
        <EtapaCard />
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

/** Entrada da etapa jogável: a história contada por etapas, com minijogos. */
function EtapaCard() {
  const etapa = getEtapa(1)!
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-navy-2 via-ink to-night p-6 md:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-gold/15 blur-3xl" />
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Etapa {etapa.n} · jogável</p>
      <h2 className="mt-3 font-display text-4xl text-parchment md:text-6xl">{etapa.title}</h2>
      <p className="mt-2 max-w-xl text-sand">
        {CREATION.length} revelações da Criação, o caminho pelo jardim e {GARDEN_TARGETS.length} alvos diante da árvore.
      </p>
      <Link href={`/solo/etapa/${etapa.n}`} className="mt-6 inline-flex min-h-12 items-center rounded-full bg-gold px-6 font-semibold text-primary-foreground hover:bg-gold-bright">
        Jogar a etapa
      </Link>
    </section>
  )
}
