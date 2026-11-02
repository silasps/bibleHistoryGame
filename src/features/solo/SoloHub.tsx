"use client"

import { Play, RotateCcw } from "lucide-react"
import Link from "next/link"
import type { Episode } from "@/content/schema"
import { getEpisode, sceneHref } from "@/content"
import { episodeProgress, resumeSceneId, startEpisode } from "@/domain/solo-progress"
import { useHydrated } from "@/stores/hydration"
import { useSolo } from "@/stores/solo-store"

export function EpisodeCard({ episodeId, featured = false }: { episodeId: string; featured?: boolean }) {
  const episode = getEpisode(episodeId) as Episode
  const hydrated = useHydrated()
  const progress = useSolo()
  const { done, total } = episodeProgress(progress, episode)
  const started = hydrated && done > 0
  const finished = progress.completedEpisodes.includes(episode.id)
  const href = sceneHref(hydrated ? resumeSceneId(startEpisode(progress, episode), episode) : episode.scenes[0].id)

  return (
    <article className={featured ? "relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-navy-2 via-ink to-night p-6 md:p-10" : "rounded-2xl border border-border bg-ink p-6"}>
      {featured && <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-gold/15 blur-3xl" />}
      <p className="text-xs uppercase tracking-[0.3em] text-gold">{episode.kind === "analogia" ? "Analogia interativa" : "Episódio jogável"}</p>
      <h2 className={featured ? "mt-3 font-display text-4xl text-parchment md:text-6xl" : "mt-2 font-display text-3xl text-parchment"}>{episode.title}</h2>
      {episode.subtitle && <p className="mt-2 font-display text-xl italic text-sand">{episode.subtitle}</p>}
      <div className="mt-6 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-navy-3" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={hydrated ? done : 0} aria-label="Progresso do episódio">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${hydrated ? (done / total) * 100 : 0}%` }} />
      </div>
      <p className="mt-2 text-xs text-mist">{hydrated ? `${done} de ${total} cenas` : `${total} cenas`}{finished && " · concluído"}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-6 font-semibold text-primary-foreground hover:bg-gold-bright">
          <Play className="size-4" aria-hidden /> {started ? (finished ? "Rever" : "Continuar") : "Começar"}
        </Link>
        {started && (
          <button
            onClick={() => progress.reset(episode.id)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-5 text-sm text-mist hover:text-parchment"
          >
            <RotateCcw className="size-4" aria-hidden /> Recomeçar
          </button>
        )}
      </div>
    </article>
  )
}
