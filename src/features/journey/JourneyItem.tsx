"use client"

import { ArrowLeft, ArrowRight, Map, ScrollText, Sparkles } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ITEM_COLORS, ItemArt } from "@/components/art/ItemArt"
import { PreferencesMenu } from "@/components/app/PreferencesMenu"
import { Button } from "@/components/ui/button"
import { getCharacter } from "@/content/characters"
import { formatSpan, getItem, getWeek, itemsOfWeek, stageLineForItem } from "@/content/overview"
import { ParticleField } from "@/fx/ParticleField"
import { SplitReveal } from "@/fx/SplitReveal"
import { MOOD_FOR_WEEK } from "@/fx/sound"
import { useMood } from "@/fx/useSound"
import { useFx } from "@/fx/useFx"
import { useHydrated } from "@/stores/hydration"
import { useSolo } from "@/stores/solo-store"
import { BibleTimeline } from "../timeline/BibleTimeline"
import { Dossier } from "./Dossier"

/** Itens com um episódio jogável "por dentro". */
const DEEP: Record<string, { href: string; label: string }> = {
  criacao: { href: "/solo/ato-01/convite", label: "Viver Gênesis 1–3 por dentro" },
  queda: { href: "/solo/ato-01/convite", label: "Viver Gênesis 1–3 por dentro" },
  "adao-eva": { href: "/solo/ato-01/convite", label: "Viver Gênesis 1–3 por dentro" },
}

export const journeyHref = (week: number, itemId: string) => `/solo/semana/${week}/${itemId}`

/** Cena de um item da jornada: imagem primeiro, uma linha do resumo, e o dossiê para aprofundar. */
export function JourneyItem({ itemId }: { itemId: string }) {
  const item = getItem(itemId)!
  const week = getWeek(item.week)!
  const list = useMemo(() => itemsOfWeek(item.week), [item.week])
  const index = list.findIndex((i) => i.id === item.id)
  const prev = list[index - 1]
  const next = list[index + 1]
  const line = stageLineForItem(item.id)?.stageLine
  const character = item.characterId ? getCharacter(item.characterId) : undefined
  const router = useRouter()
  const fx = useFx()
  const hydrated = useHydrated()
  const visitItem = useSolo((s) => s.visitItem)
  const visited = useSolo((s) => s.visitedItems)
  const [dossier, setDossier] = useState(false)
  useMood(MOOD_FOR_WEEK[item.week] ?? "night")

  useEffect(() => {
    if (hydrated) visitItem(item.id)
  }, [hydrated, item.id, visitItem])

  const nextHref = next ? journeyHref(item.week, next.id) : `/solo/semana/${item.week}/pista`
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, [role=dialog]")) return
      if (e.key === "ArrowRight") router.push(nextHref)
      if (e.key === "ArrowLeft" && prev) router.push(journeyHref(item.week, prev.id))
      if (e.key.toLowerCase() === "d") setDossier(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router, nextHref, prev, item.week])

  const visitedSet = useMemo(() => new Set(hydrated ? Object.keys(visited) : []), [visited, hydrated])
  const color = ITEM_COLORS[item.color]

  return (
    <div className="relative flex min-h-dvh flex-col overflow-clip bg-night" style={{ ["--illumination" as string]: 0.45 }}>
      <div className="stage-glow pointer-events-none absolute inset-0" />
      <ParticleField preset="stars" density={0.5} intensity={0.4} />

      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Link href={`/solo?semana=${item.week}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-mist hover:text-parchment">
          <Map className="size-4" aria-hidden /> Semana {week.week} · {week.title}
        </Link>
        <PreferencesMenu />
      </header>

      <main id="conteudo" className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-6 px-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={fx.motion ? { opacity: 0, scale: 0.9, rotate: -2 } : false}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={fx.motion ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.3, 0.7, 0.2, 1] }}
            className="mx-auto aspect-square w-full max-w-[min(60vh,520px)]"
            style={{ filter: `drop-shadow(0 0 40px ${color}55)` }}
          >
            <ItemArt art={item.art} color={item.color} title={item.label} className="h-full w-full" />
          </motion.div>
        </AnimatePresence>

        <div className="space-y-5 pb-4">
          <SplitReveal key={item.id} text={item.label} as="h1" by="words" className="font-display text-5xl leading-[1.02] text-parchment md:text-6xl" />
          <p className="text-xl font-semibold tabular-nums" style={{ color }}>
            {[item.sub, formatSpan(item)].filter(Boolean).join(" · ")}
          </p>
          {line && (
            <motion.p key={`${item.id}-line`} initial={fx.motion ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-display text-2xl leading-snug text-parchment/95 md:text-3xl">
              {line}
            </motion.p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="lg" className="h-12 rounded-full px-5" onClick={() => setDossier(true)}>
              <ScrollText /> Abrir dossiê
            </Button>
            {DEEP[item.id] && (
              <Link href={DEEP[item.id].href} className="inline-flex h-12 items-center gap-2 rounded-full border border-gold/50 px-5 text-sm text-gold hover:bg-gold/10">
                <Sparkles className="size-4" /> {DEEP[item.id].label}
              </Link>
            )}
          </div>
          {character && <p className="text-sm text-mist">No dossiê: a ficha de {character.name}, com o significado do nome e a skin explicada.</p>}
        </div>
      </main>

      <section className="sticky bottom-0 z-10 border-t border-border bg-night/85 backdrop-blur" aria-label="Linha do tempo da semana">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-2 py-2 md:px-6 md:py-0">
          <Button variant="ghost" size="lg" className="h-12 shrink-0 rounded-full" disabled={!prev} onClick={() => prev && router.push(journeyHref(item.week, prev.id))} aria-label="Item anterior">
            <ArrowLeft />
          </Button>
          <p className="text-sm tabular-nums text-mist md:hidden">
            {index + 1} / {list.length}
          </p>
          <div className="hidden h-[250px] flex-1 overflow-x-auto md:block">
            <div className="h-full min-w-[960px]">
              <BibleTimeline week={item.week} variant="trail" focusId={item.id} showTitle={false} visited={visitedSet} onSelect={(id) => router.push(journeyHref(item.week, id))} />
            </div>
          </div>
          <Button size="lg" className="h-12 shrink-0 rounded-full" onClick={() => router.push(nextHref)} aria-label={next ? "Próximo item" : "Pista da semana"}>
            {next ? <ArrowRight /> : <Sparkles />}
          </Button>
        </div>
      </section>

      <Dossier item={item} open={dossier} onOpenChange={setDossier} />
    </div>
  )
}
