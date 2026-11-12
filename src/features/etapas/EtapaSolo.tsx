"use client"

import { BookOpen, ChevronRight, RotateCcw } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ExitLink } from "@/components/app/ExitLink"
import { PreferencesMenu } from "@/components/app/PreferencesMenu"
import { ITEM_COLORS, ItemArt } from "@/components/art/ItemArt"
import { Button } from "@/components/ui/button"
import { sequenceScenes } from "@/content"
import { getEtapa, presentableEtapas } from "@/content/etapas"
import { getRoomGame } from "@/content/etapas/jogos"
import { formatSpan, getItem } from "@/content/overview"
import { getSlot, isFilled } from "@/content/reflections"
import type { Scene } from "@/content/schema"
import { MOOD_FOR_ETAPA, moodForScene } from "@/fx/sound"
import { useFx } from "@/fx/useFx"
import { useMood } from "@/fx/useSound"
import { useInventory } from "@/stores/inventory"
import { useSolo } from "@/stores/solo-store"
import { journeyHref } from "../journey/JourneyItem"
import { BeatPhone } from "../presentation/BeatCard"
import { PhoneVerse } from "../presentation/OverviewPhoneCard"
import { RelicBar } from "./etapa-1/AfterFall"
import { RoomGamePlay } from "./games/RoomGamePlay"

const SCOPE = "solo"

/** Passos da etapa no jogo solo: a mesma ordem da apresentação, sem a pista (que fica na jornada) nem pausas vazias. */
function stepsOf(n: number): Scene[] {
  return sequenceScenes("visao-geral").filter((s) => {
    const o = s.overview
    if (o?.etapa !== n || o.role === "pista") return false
    if (o.role === "reflexao") {
      const slot = o.slotId ? getSlot(o.slotId) : undefined
      return !!slot && slot.scope !== "apresentacao" && isFilled(slot)
    }
    return true
  })
}

/**
 * Etapa no modo solo (2 a 11): o jogador passa pelos itens da linha do tempo,
 * pelos momentos da fala do autor, pelo minijogo e pelo versículo do plano.
 */
export function EtapaSolo({ n }: { n: number }) {
  const etapa = getEtapa(n)!
  const fx = useFx()
  const steps = useMemo(() => stepsOf(n), [n])
  const [index, setIndex] = useState(0)
  const [gameDone, setGameDone] = useState(false)
  const [inventory, dispatch] = useInventory(SCOPE)
  const visitItem = useSolo((s) => s.visitItem)
  const finished = index >= steps.length
  const scene = steps[index]
  const game = scene?.game ? getRoomGame(scene.game.id) : undefined
  const next = presentableEtapas.find((e) => e.n === n + 1)
  const relic = getRoomGame(etapa.games.find((g) => getRoomGame(g.id))?.id ?? "")?.relic
  useMood(finished ? MOOD_FOR_ETAPA[n] : moodForScene(scene))

  // Ver um item aqui conta como visita na jornada (abre a pista da semana).
  useEffect(() => {
    if (scene?.overview?.itemId) visitItem(scene.overview.itemId)
  }, [scene, visitItem])

  const go = (i: number) => {
    setGameDone(false)
    setIndex(i)
  }
  const blocked = !!game && !gameDone

  return (
    <div className="min-h-dvh bg-night text-parchment">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <ExitLink href="/solo" to="o modo solo" />
          <p className="truncate text-sm text-mist">
            Etapa {etapa.n} · {etapa.title}
          </p>
        </div>
        <PreferencesMenu />
      </header>

      <main id="conteudo" className="mx-auto max-w-md space-y-4 px-4 pb-10">
        <ol className="flex gap-1" aria-label="Progresso da etapa">
          {steps.map((s, i) => (
            <li key={s.id} className={`h-1 flex-1 rounded-full ${i <= index ? "bg-gold" : "bg-navy-3"}`} />
          ))}
        </ol>

        <AnimatePresence mode="wait">
          <motion.section
            key={finished ? "fim" : scene.id}
            initial={fx.motion ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fx.motion ? 0.3 : 0 }}
            className="space-y-4"
          >
            {finished ? (
              <div className="glass space-y-4 rounded-3xl p-6 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-gold">
                  Etapa {etapa.n} concluída · nível {etapa.n}
                </p>
                <h1 className="font-display text-4xl">{etapa.title}</h1>
                {relic && <p className="text-sand">{inventory.relics.includes(relic.id) ? `Relíquia: ${relic.label}` : "A relíquia desta etapa vem com o minijogo."}</p>}
                <RelicBar inventory={inventory} />
                <div className="flex flex-wrap justify-center gap-3">
                  {next ? (
                    <Link href={`/solo/etapa/${next.n}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-6 font-semibold text-primary-foreground hover:bg-gold-bright">
                      Etapa {next.n}: {next.title} <ChevronRight className="size-4" />
                    </Link>
                  ) : (
                    <Link href="/solo" className="inline-flex min-h-12 items-center rounded-full bg-gold px-6 font-semibold text-primary-foreground hover:bg-gold-bright">
                      Voltar ao mapa
                    </Link>
                  )}
                  <Button variant="outline" size="lg" className="min-h-12 rounded-full" onClick={() => go(0)}>
                    <RotateCcw /> Rever a etapa
                  </Button>
                </div>
              </div>
            ) : (
              <Step
                scene={scene}
                onGameDone={(relicId) => {
                  setGameDone(true)
                  dispatch({ type: "relic", id: relicId })
                }}
              />
            )}
          </motion.section>
        </AnimatePresence>

        {!finished && (
          <div className="flex gap-3">
            {index > 0 && (
              <Button variant="outline" size="lg" className="h-14 rounded-full" onClick={() => go(index - 1)} aria-label="Passo anterior">
                ←
              </Button>
            )}
            <Button size="lg" className="h-14 flex-1 rounded-full text-lg" disabled={blocked} onClick={() => go(index + 1)}>
              {blocked ? "Jogue para continuar" : (
                <>
                  Continuar <ChevronRight />
                </>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

function Step({ scene, onGameDone }: { scene: Scene; onGameDone: (relicId: string) => void }) {
  const o = scene.overview!
  const etapa = getEtapa(o.etapa!)!
  const depth = (scene.steps ?? []).map((s) => s.text)

  if (scene.game) {
    const game = getRoomGame(scene.game.id)
    if (!game) return null
    return (
      <div className="relative h-[68dvh] overflow-hidden rounded-3xl border border-border">
        <RoomGamePlay game={game} onProgress={(_, done) => done && onGameDone(game.relic.id)} />
      </div>
    )
  }

  if (o.role === "abertura") {
    return (
      <div className="glass space-y-4 rounded-3xl p-6 text-center">
        <p className="text-xs uppercase tracking-[0.35em]" style={{ color: ITEM_COLORS[etapa.color] }}>
          Etapa {etapa.n}
        </p>
        <h1 className="font-display text-5xl">{etapa.title}</h1>
        {o.stageLine && <p className="font-display text-xl text-sand">{o.stageLine}</p>}
        {depth.map((d) => (
          <p key={d} className="text-parchment/85">
            {d}
          </p>
        ))}
      </div>
    )
  }

  if (o.role === "item" && o.itemId) {
    const item = getItem(o.itemId)!
    return (
      <article className="glass space-y-3 rounded-3xl p-5 text-center">
        <ItemArt art={item.art} color={item.color} title={item.label} className="mx-auto aspect-square w-3/5" />
        <h2 className="font-display text-3xl" style={{ color: ITEM_COLORS[item.color] }}>
          {item.label}
        </h2>
        <p className="text-sm text-mist">{[item.sub, formatSpan(item)].filter(Boolean).join(" · ")}</p>
        {o.stageLine && <p className="font-display text-xl leading-snug">{o.stageLine}</p>}
        {depth.map((d) => (
          <p key={d} className="text-sand">
            {d}
          </p>
        ))}
        <Link href={journeyHref(item.week, item.id)} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm text-gold">
          <BookOpen className="size-4" aria-hidden /> Abrir o dossiê
        </Link>
      </article>
    )
  }

  if (o.role === "beat" && o.beatId) {
    return (
      <div className="space-y-3">
        <BeatPhone beatId={o.beatId} line={o.stageLine} />
        {depth.map((d) => (
          <p key={d} className="text-center text-sand">
            {d}
          </p>
        ))}
      </div>
    )
  }

  if (o.role === "versiculo") return <PhoneVerse overview={{ ...o, depth: [], revealedItemIds: [] }} />

  if (o.role === "reflexao" && o.slotId) {
    const slot = getSlot(o.slotId)!
    return (
      <div className="glass space-y-3 rounded-3xl p-6">
        {slot.pergunta && <p className="font-display text-2xl">{slot.pergunta}</p>}
        {slot.textoSolo.map((t, i) => (
          <p key={i} className="text-parchment/90">
            {t}
          </p>
        ))}
        {slot.aplicacao && <p className="text-sand">{slot.aplicacao}</p>}
      </div>
    )
  }
  return null
}
