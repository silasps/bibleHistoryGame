"use client"

import { Pause } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useRef } from "react"
import type { ProjectorView } from "@/domain/projection"
import { GoldThread } from "@/fx/GoldThread"
import { SealBreak } from "@/fx/SealBreak"
import { SplitReveal } from "@/fx/SplitReveal"
import { moodForScene } from "@/fx/sound"
import { useMood, useStinger } from "@/fx/useSound"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"
import { StageBackground } from "../solo/StageBackground"
import { HajaLuzStage, LightsSky } from "./Moments"
import { OverviewStage } from "./OverviewStage"
import { PollResults } from "./PollResults"
import { QRJoin } from "./QRJoin"

interface Props {
  view: ProjectorView | null
  joinUrl: string
  className?: string
  /** Prévia pequena no painel do apresentador: sem som nem momentos em tela cheia. */
  preview?: boolean
}

/**
 * Telão 16:9. Recebe apenas o ProjectorView: não tem acesso a notas do
 * apresentador nem a sínteses. Textos escalam com o tamanho do palco (cqw).
 */
export function ProjectorStage({ view, joinUrl, className, preview = false }: Props) {
  const scene = view?.scene ?? null
  const stinger = useStinger()
  const fx = useFx()
  useMood(preview ? null : moodForScene(view?.status === "running" ? scene : null))

  // Estado visual derivado dos comandos do apresentador.
  const visual = useMemo(() => {
    if (!scene) return {}
    if (scene.visual === "yard-train") {
      return { wall: scene.cue?.kind === "muro" ? 1 : 0, trainKey: scene.cue?.kind === "trem" ? scene.cue.at : undefined, kids: "quintal" as const }
    }
    if (scene.visual === "cliff-road") {
      return { edgeCm: scene.steps?.at(-1)?.value, safe: scene.type === "canonical_reveal" || scene.type === "reflection" }
    }
    return {}
  }, [scene])

  const lastTrain = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (preview || !visual.trainKey || visual.trainKey === lastTrain.current) return
    lastTrain.current = visual.trainKey
    stinger("train")
  }, [visual.trainKey, preview, stinger])

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-night [container-type:size]", className)} data-surface="projector">
      {!view && (
        <div className="grid h-full place-items-center text-[2cqw] text-mist" role="status">
          Aguardando a sala…
        </div>
      )}

      {view?.status === "lobby" && (
        <div className="stage-glow grain absolute inset-0 flex flex-col items-center justify-center gap-[3cqw] px-[6cqw]" style={{ ["--illumination" as string]: 0.3 + Math.min(0.5, view.lightsCount / 40) }}>
          <LightsSky count={view.participantCount} />
          <div className="relative text-center">
            <p className="text-[1.4cqw] uppercase tracking-[0.5em] text-gold">Uma investigação interativa</p>
            <h1 className="mt-[1cqw] font-display text-[7cqw] font-semibold uppercase tracking-[0.2em] text-gold-bright [text-shadow:0_0_4cqw_rgba(216,169,72,0.4)]">Bíblia</h1>
            <p className="font-display text-[3cqw] italic text-parchment">Por trás da história</p>
          </div>
          <QRJoin url={joinUrl} code={view.roomCode} className="relative" />
          <p className="relative text-[1.6cqw] text-sand">
            {view.participantCount} {view.participantCount === 1 ? "pessoa conectada" : "pessoas conectadas"}
          </p>
        </div>
      )}

      {view?.status === "running" && scene?.overview && ["abertura", "item", "jogo", "beat", "versiculo", "reflexao", "conclusao"].includes(scene.overview.role) && (
        <OverviewStage overview={scene.overview} game={scene.game} hideVerse={preview} />
      )}

      {view?.status === "running" && scene && !(scene.overview && ["abertura", "item", "jogo", "beat", "versiculo", "reflexao", "conclusao"].includes(scene.overview.role)) && (
        <>
          <StageBackground scene={scene} visual={visual} className="absolute inset-0" />
          {view.lightsCount > 0 && <LightsSky count={view.lightsCount} className="absolute inset-x-0 top-0 h-2/3" />}

          {/* Selo / fio dourado da conexão: só imagem e referência. */}
          {scene.seal && (
            <div className="absolute inset-0 grid place-items-center">
              {scene.seal === "aberto" && <GoldThread className="absolute inset-0 h-full w-full" d="M -20 640 C 300 300 520 760 800 450 S 1300 120 1620 300" duration={4} />}
              <div className="relative w-[34cqw] text-center">
                <SealBreak open={scene.seal === "aberto"}>
                  {scene.releasedRefs && (
                    <p className="font-display text-[5cqw] text-gold-bright [text-shadow:0_0_3cqw_rgba(216,169,72,0.6)]">{scene.releasedRefs.join(" · ")}</p>
                  )}
                </SealBreak>
              </div>
            </div>
          )}

          {/* Candidatos revelados um a um. */}
          {scene.steps && scene.steps.length > 0 && (
            <ol className="absolute left-[4cqw] top-[6cqh] w-[42cqw] space-y-[0.8cqw]">
              <AnimatePresence>
                {scene.steps.map((s, i) => (
                  <motion.li
                    key={s.id}
                    initial={fx.motion ? { opacity: 0, x: -40 } : false}
                    animate={{ opacity: i === scene.steps!.length - 1 ? 1 : 0.55, x: 0 }}
                    className="glass rounded-[1cqw] px-[1.6cqw] py-[1cqw]"
                  >
                    <p className="text-[1.1cqw] uppercase tracking-widest text-gold">{s.label}</p>
                    <p className="font-display text-[2.3cqw] italic text-parchment">“{s.text}”</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          )}

          {/* Enquete */}
          {scene.poll && scene.poll.status !== "idle" && (
            <motion.div
              initial={fx.motion ? { opacity: 0, x: 60 } : false}
              animate={{ opacity: 1, x: 0 }}
              className="glass absolute right-[4cqw] top-1/2 w-[46cqw] -translate-y-1/2 rounded-[1.6cqw] p-[2.4cqw]"
            >
              <PollResults poll={scene.poll} />
            </motion.div>
          )}

          {/* Título e legenda (terço inferior, estilo cinema) */}
          {(scene.title || scene.caption) && !(scene.poll && scene.poll.status !== "idle") && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-[5cqw] pb-[4cqh] pt-[12cqh]">
              <div className="mx-auto max-w-[80cqw] text-center">
                {scene.title && <SplitReveal key={scene.id} text={scene.title} as="h2" by="words" className="font-display text-[4.6cqw] leading-[1.05] text-parchment [text-shadow:0_0.3cqw_2cqw_rgba(0,0,0,0.7)]" />}
                {scene.caption && scene.caption !== scene.title && (
                  <motion.p key={`${scene.id}-c`} initial={fx.motion ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-[1cqw] font-display text-[2.4cqw] italic text-sand">
                    {scene.caption}
                  </motion.p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {view?.status === "ended" && (
        <div className="stage-glow absolute inset-0 grid place-items-center text-center" style={{ ["--illumination" as string]: 0.6 }}>
          <div>
            <p className="font-display text-[6cqw] text-gold-bright">Obrigado</p>
            <p className="mt-[1cqw] text-[1.8cqw] text-mist">As pistas abertas continuam no seu celular.</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {view?.paused && view.status === "running" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 grid place-items-center bg-night/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-[1.5cqw] text-mist">
              <Pause className="size-[5cqw] text-gold/80" aria-hidden />
              <p className="font-display text-[3cqw] italic">Pausa</p>
            </div>
          </motion.div>
        )}
        {view?.moment?.kind === "haja-luz" && !preview && <HajaLuzStage key={view.moment.startedAt} startedAt={view.moment.startedAt} />}
      </AnimatePresence>
      {view?.moment?.kind === "luzes" && (
        <div className="pointer-events-none absolute inset-x-0 top-[3cqh] z-10 text-center">
          <p className="font-display text-[2.6cqw] italic text-gold-bright [text-shadow:0_0_2cqw_rgba(0,0,0,0.9)]">Acenda a sua luz pelo celular</p>
          <p className="text-[1.6cqw] tabular-nums text-sand">{view.lightsCount} de {view.participantCount}</p>
        </div>
      )}
    </div>
  )
}
