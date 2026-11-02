"use client"

import Link from "next/link"
import type { Episode } from "@/content/schema"
import { sceneHref } from "@/content"
import { statusOf } from "@/domain/solo-progress"
import { cn } from "@/lib/utils"
import { useSolo } from "@/stores/solo-store"

export function SceneProgress({ episode, currentId }: { episode: Episode; currentId: string }) {
  const progress = useSolo()
  return (
    <nav aria-label="Cenas do episódio" className="flex items-center gap-1.5">
      {episode.scenes.map((s, i) => {
        const status = statusOf(progress, s.id)
        const current = s.id === currentId
        const reachable = status !== "locked"
        const dot = (
          <span
            className={cn(
              "block h-1.5 rounded-full transition-all",
              current ? "w-6 bg-gold-bright" : status === "completed" ? "w-1.5 bg-gold/70" : reachable ? "w-1.5 bg-sand/50" : "w-1.5 bg-mist/20",
            )}
          />
        )
        return reachable && !current ? (
          <Link key={s.id} href={sceneHref(s.id)} aria-label={`Cena ${i + 1}: ${s.title}`} className="py-2">
            {dot}
          </Link>
        ) : (
          <span key={s.id} aria-label={`Cena ${i + 1}${current ? " (atual)" : " (bloqueada)"}`} aria-current={current ? "step" : undefined} className="py-2">
            {dot}
          </span>
        )
      })}
    </nav>
  )
}
