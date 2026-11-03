"use client"

import { FlaskConical, Vote } from "lucide-react"
import { useMemo } from "react"
import { getEpisode, getSceneEntry, playableEpisodes } from "@/content"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActsTimeline } from "@/features/timeline/ActsTimeline"
import { CharacterWeb } from "@/features/characters/CharacterWeb"
import { useHydrated } from "@/stores/hydration"
import { useSolo } from "@/stores/solo-store"
import { InvestigationBoard } from "./InvestigationBoard"

export function DiscoveryArchive() {
  const hydrated = useHydrated()
  const { seenEvidence, openEvidence, syntheses, decisions, notes } = useSolo()
  const evidence = useMemo(() => playableEpisodes().flatMap((e) => e.evidence), [])
  const seen = useMemo(() => new Set([...Object.keys(seenEvidence), ...Object.keys(openEvidence)]), [seenEvidence, openEvidence])
  const open = useMemo(() => new Set(Object.keys(openEvidence)), [openEvidence])
  const openCount = open.size

  if (!hydrated) return <p className="text-mist">Carregando seu Arquivo…</p>

  return (
    <Tabs defaultValue="quadro" className="gap-8">
      <TabsList className="w-full justify-start overflow-x-auto bg-ink sm:w-auto">
        <TabsTrigger value="quadro">Quadro ({openCount})</TabsTrigger>
        <TabsTrigger value="personagens">Personagens</TabsTrigger>
        <TabsTrigger value="decisoes">Decisões ({decisions.length})</TabsTrigger>
        <TabsTrigger value="linha">Linha do tempo</TabsTrigger>
        <TabsTrigger value="notas">Anotações</TabsTrigger>
      </TabsList>

      <TabsContent value="quadro">
        <InvestigationBoard evidence={evidence} seen={seen} open={open} syntheses={syntheses} />
      </TabsContent>

      <TabsContent value="personagens">
        <CharacterWeb />
      </TabsContent>

      <TabsContent value="decisoes">
        {decisions.length === 0 ? (
          <p className="text-mist">Nenhuma decisão registrada ainda.</p>
        ) : (
          <ol className="space-y-3">
            {decisions.map((d, i) => {
              const scene = getSceneEntry(d.sceneId)?.scene
              const isChoice = d.kind === "escolha"
              return (
                <li key={i} className="flex gap-4 rounded-2xl border border-border bg-ink p-4">
                  {isChoice ? <FlaskConical className="mt-1 size-5 shrink-0 text-rose" aria-hidden /> : <Vote className="mt-1 size-5 shrink-0 text-gold" aria-hidden />}
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.25em] text-mist">
                      {getEpisode(d.episodeId)?.title} · {isChoice ? "Escolha em simulação (não muda o relato)" : "Resposta de enquete"}
                    </p>
                    <p className="mt-1 text-parchment">{scene?.choice?.prompt ?? scene?.poll?.question ?? scene?.title}</p>
                    <p className="mt-1 font-display text-xl text-gold-bright">{d.label}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </TabsContent>

      <TabsContent value="linha">
        <ActsTimeline compact />
      </TabsContent>

      <TabsContent value="notas">
        {Object.entries(notes).filter(([, t]) => t.trim()).length === 0 ? (
          <p className="text-mist">Suas anotações das cenas de reflexão aparecem aqui. Elas ficam só neste aparelho.</p>
        ) : (
          <ul className="space-y-3">
            {Object.entries(notes)
              .filter(([, t]) => t.trim())
              .map(([sceneId, text]) => (
                <li key={sceneId} className="rounded-2xl border border-border bg-ink p-4">
                  <p className="text-xs uppercase tracking-widest text-mist">{getSceneEntry(sceneId)?.scene.title}</p>
                  <p className="mt-2 whitespace-pre-wrap text-parchment">{text}</p>
                </li>
              ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  )
}
