import type { Metadata } from "next"
import { AppHeader } from "@/components/app/AppHeader"
import { episodes } from "@/content"
import { EpisodeCard } from "@/features/solo/SoloHub"

export const metadata: Metadata = { title: "Catálogo de cenas" }

export default function CatalogPage() {
  const playable = episodes.filter((e) => e.status === "jogavel")
  const drafts = episodes.filter((e) => e.status !== "jogavel")
  return (
    <div className="min-h-dvh bg-night">
      <AppHeader />
      <main id="conteudo" className="mx-auto max-w-7xl space-y-14 px-4 pb-20 pt-6 md:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold">Catálogo</p>
          <h1 className="mt-2 font-display text-5xl text-parchment">Experiências disponíveis</h1>
          <p className="mt-3 max-w-2xl text-mist">
            As analogias são histórias ilustrativas, não eventos bíblicos. Seu encaixe editorial sugerido é o Ato 2 (Lei e santidade), mas podem ser jogadas avulsas ou usadas como votação ao vivo.
          </p>
        </div>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {playable.map((e) => (
            <EpisodeCard key={e.id} episodeId={e.id} />
          ))}
        </section>
        <section>
          <h2 className="font-display text-3xl text-parchment">Em desenvolvimento</h2>
          <p className="mt-2 text-sm text-mist">Esboços editoriais, aguardando os resumos autorais. Não são jogáveis.</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {drafts.map((e) => (
              <li key={e.id} className="rounded-2xl border border-dashed border-border bg-ink/60 p-5">
                <p className="text-xs uppercase tracking-widest text-mist">Esboço editorial · {e.actId.replace("ato-", "Ato ")}</p>
                <h3 className="mt-2 font-display text-2xl text-parchment">{e.title}</h3>
                <p className="mt-1 font-display text-lg italic text-sand">{e.humanQuestion}</p>
                {e.draft && <p className="mt-3 text-sm text-mist">{e.draft.dilemma}</p>}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
