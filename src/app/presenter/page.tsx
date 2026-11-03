import type { Metadata } from "next"
import { AppHeader } from "@/components/app/AppHeader"
import { sequences, sequenceScenes } from "@/content"
import { isLiveConfigured } from "@/data/supabase/admin"
import { PresenterLobby } from "@/features/presentation/PresenterLobby"

export const metadata: Metadata = { title: "Apresentar ao vivo" }
export const dynamic = "force-dynamic"

export default function PresenterPage() {
  const seqs = sequences.filter((s) => s.presentable).map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    minutes: Math.round(sequenceScenes(s.id).reduce((sum, sc) => sum + sc.estimatedSeconds, 0) / 60),
  }))
  return (
    <div className="min-h-dvh bg-night">
      <AppHeader />
      <main id="conteudo" className="mx-auto max-w-5xl px-4 pb-20 pt-6 md:px-8">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Modo apresentação</p>
        <h1 className="mt-2 font-display text-5xl text-parchment">Preparar a sala</h1>
        <p className="mt-3 max-w-2xl text-mist">
          Três superfícies: o telão (abra numa janela no projetor), este painel e os celulares do público. A apresentação é conduzida por você — nada avança sozinho.
        </p>
        <div className="mt-10">
          <PresenterLobby sequences={seqs} liveAvailable={isLiveConfigured()} accessRequired={!!process.env.PRESENTER_ACCESS_CODE} />
        </div>
      </main>
    </div>
  )
}
