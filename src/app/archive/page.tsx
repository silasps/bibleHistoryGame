import type { Metadata } from "next"
import { AppHeader } from "@/components/app/AppHeader"
import { DiscoveryArchive } from "@/features/archive/DiscoveryArchive"

export const metadata: Metadata = { title: "Arquivo de Descobertas" }

export default function ArchivePage() {
  return (
    <div className="min-h-dvh bg-night">
      <AppHeader />
      <main id="conteudo" className="mx-auto max-w-7xl px-4 pb-20 pt-6 md:px-8">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Arquivo de Descobertas</p>
        <h1 className="mt-2 font-display text-5xl text-parchment">O que você já encontrou</h1>
        <p className="mt-3 max-w-2xl text-mist">
          Evidências abertas, pistas seladas e conexões futuras. Cada trecho mostra se é relato bíblico, interpretação ou simulação.
        </p>
        <div className="mt-10">
          <DiscoveryArchive />
        </div>
      </main>
    </div>
  )
}
