"use client"

import { ArrowLeft, ArrowRight, BookMarked, Loader2 } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { getEpisode, getEvidence, getSceneEntry, sceneHref } from "@/content"
import { ExitLink } from "@/components/app/ExitLink"
import { PreferencesMenu } from "@/components/app/PreferencesMenu"
import { Button } from "@/components/ui/button"
import { canComplete, nextSceneId, previousSceneId, resumeSceneId, statusOf } from "@/domain/solo-progress"
import { RewindGlitch } from "@/fx/RewindGlitch"
import { MOOD_FOR_CUE } from "@/fx/sound"
import { useMood, useStinger } from "@/fx/useSound"
import { useFx } from "@/fx/useFx"
import { useHydrated } from "@/stores/hydration"
import { useSolo } from "@/stores/solo-store"
import { SceneRenderer } from "../scenes/SceneRenderer"
import { SceneHeading } from "../scenes/renderers/SceneHeading"
import type { VisualState } from "../scenes/types"
import { SceneProgress } from "./SceneProgress"
import { StageBackground } from "./StageBackground"

export function ScenePlayer({ sceneId }: { sceneId: string }) {
  const entry = getSceneEntry(sceneId)!
  const { scene } = entry
  const episode = getEpisode(entry.episode.id)!
  const router = useRouter()
  const hydrated = useHydrated()
  const fx = useFx()
  const stinger = useStinger()
  useMood(scene.fxCue ? MOOD_FOR_CUE[scene.fxCue] ?? "night" : "night")

  const progress = useSolo()
  const { start, enter, complete } = progress
  const status = statusOf(progress, scene.id)
  const [visual, setVisualState] = useState<VisualState>({})
  const setVisual = useCallback((v: VisualState) => setVisualState(v), [])
  const headingRef = useRef<HTMLDivElement>(null)

  // Rebobinar ao chegar no relato canônico vindo de uma simulação.
  const prevId = previousSceneId(episode, scene.id)
  const cameFromHypothesis = scene.type === "canonical_reveal" && prevId && getSceneEntry(prevId)?.scene.type === "hypothetical_consequence"
  const [rewoundFor, setRewoundFor] = useState<string | null>(null)
  const rewind = hydrated && !!cameFromHypothesis && status === "active" && rewoundFor !== scene.id

  useEffect(() => {
    if (!hydrated) return
    start(episode.id)
    const p = useSolo.getState()
    if (statusOf(p, scene.id) === "locked") {
      router.replace(sceneHref(resumeSceneId(p, episode)))
      return
    }
    enter(scene.id)
    headingRef.current?.focus({ preventScroll: true })
  }, [hydrated, scene.id, episode, start, enter, router])

  const next = nextSceneId(episode, scene.id)
  const allowed = status === "completed" || canComplete(progress, scene)

  const goNext = useCallback(() => {
    if (!allowed) return
    const before = useSolo.getState().openEvidence
    complete(scene.id)
    const after = useSolo.getState().openEvidence
    const fresh = Object.keys(after).filter((id) => !before[id])
    for (const id of fresh) {
      const ev = getEvidence(id)
      if (ev && !ev.connection) toast(`Nova evidência no Arquivo: ${ev.title}`, { icon: "✦" })
    }
    if (fresh.length) stinger("light")
    if (next) router.push(sceneHref(next))
  }, [allowed, complete, scene.id, next, router, stinger])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("input, textarea, select, [contenteditable]")) return
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft" && prevId) router.push(sceneHref(prevId))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, prevId, router])

  const index = episode.scenes.findIndex((s) => s.id === scene.id)

  return (
    <div className="relative min-h-dvh bg-night lg:grid lg:h-dvh lg:grid-cols-[1fr_minmax(420px,560px)] lg:overflow-hidden">
      <RewindGlitch play={rewind} onDone={() => setRewoundFor(scene.id)} />
      <StageBackground scene={scene} visual={visual} className="relative h-[42dvh] overflow-hidden lg:h-full" />

      <div className="relative z-10 -mt-10 flex min-h-[58dvh] flex-col rounded-t-3xl border-t border-border bg-gradient-to-b from-ink/95 to-night lg:mt-0 lg:h-dvh lg:rounded-none lg:border-l lg:border-t-0">
        <header className="flex items-center justify-between gap-3 px-5 pt-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <ExitLink href="/solo" to="o modo solo" />
            <p className="truncate text-xs uppercase tracking-[0.25em] text-mist">{episode.title}</p>
          </div>
          <div className="flex shrink-0 items-center">
            <Link href="/archive" aria-label="Abrir o Arquivo de Descobertas" className="grid size-10 place-items-center rounded-full text-mist hover:bg-navy-2 hover:text-parchment">
              <BookMarked className="size-5" />
            </Link>
            <PreferencesMenu />
          </div>
        </header>
        <div className="px-5 md:px-8">
          <SceneProgress episode={episode} currentId={scene.id} />
        </div>

        <main id="conteudo" className="flex-1 overflow-y-auto px-5 pb-6 pt-4 md:px-8">
          {!hydrated ? (
            <div className="grid h-40 place-items-center text-mist" role="status">
              <Loader2 className="size-6 animate-spin" aria-label="Carregando progresso" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.article
                key={scene.id}
                initial={fx.motion ? { opacity: 0, y: 20 } : { opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={fx.motion ? { opacity: 0, y: -12 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: rewind ? 1.2 : 0 }}
                className="space-y-8"
                aria-labelledby={`scene-${scene.id}`}
              >
                <p className="text-xs text-mist/70" id={`scene-${scene.id}`}>
                  Cena {index + 1} de {episode.scenes.length}
                </p>
                <SceneHeading ref={headingRef} scene={scene} />
                <SceneRenderer scene={scene} episode={episode} setVisual={setVisual} />
              </motion.article>
            </AnimatePresence>
          )}
        </main>

        <footer className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-night/90 px-5 py-3 backdrop-blur md:px-8">
          {prevId ? (
            <Button variant="ghost" size="lg" className="h-12 rounded-full px-4 text-mist" onClick={() => router.push(sceneHref(prevId))}>
              <ArrowLeft /> Voltar
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button size="lg" className="h-12 rounded-full px-6 text-base" disabled={!hydrated || !allowed} onClick={goNext}>
              Continuar <ArrowRight />
            </Button>
          ) : (
            status !== "completed" && (
              <Button size="lg" className="h-12 rounded-full px-6 text-base" disabled={!hydrated || !allowed} onClick={goNext}>
                Concluir capítulo
              </Button>
            )
          )}
        </footer>
      </div>
    </div>
  )
}

