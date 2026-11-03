"use client"

import { ArrowLeft, ArrowRight, Loader2, Map, Unlock } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { fetchConnectionSynthesis } from "@/app/actions/synthesis"
import { ITEM_COLORS } from "@/components/art/ItemArt"
import { ExitLink } from "@/components/app/ExitLink"
import { PreferencesMenu } from "@/components/app/PreferencesMenu"
import { BlockList } from "@/components/story/BlockList"
import { RefList } from "@/components/story/RefList"
import { Button } from "@/components/ui/button"
import { getEvidence } from "@/content"
import { getWeek, itemsOfWeek, weeks } from "@/content/overview"
import { weekEvidenceId } from "@/content/overview/sequence"
import { isFilled, reflectionSlots } from "@/content/reflections"
import { GoldThread } from "@/fx/GoldThread"
import { ParticleField } from "@/fx/ParticleField"
import { SealBreak } from "@/fx/SealBreak"
import { MOOD_FOR_WEEK } from "@/fx/sound"
import { useMood } from "@/fx/useSound"
import { useSolo } from "@/stores/solo-store"
import { journeyHref } from "./JourneyItem"

/** Fim da semana: a pista selada (versículo + texto do autor) e as pausas que o autor escreveu. */
export function WeekClue({ week }: { week: number }) {
  const info = getWeek(week)!
  const ev = getEvidence(weekEvidenceId(week))!
  const isOpen = useSolo((s) => !!s.openEvidence[ev.id])
  const synthesis = useSolo((s) => s.syntheses[ev.id])
  const openWeekSeal = useSolo((s) => s.openWeekSeal)
  const [pending, start] = useTransition()
  const [opening, setOpening] = useState(false)
  useMood(MOOD_FOR_WEEK[week] ?? "night")

  const list = itemsOfWeek(week)
  const nextWeek = weeks.find((w) => w.week === week + 1 && w.status === "com_material")
  // Só as pausas que o autor já escreveu; espaço vazio é pulado no jogo.
  const pauses = reflectionSlots.filter((s) => s.scope !== "apresentacao" && s.position.kind === "semana" && s.position.week === week && isFilled(s))

  const onOpen = () =>
    start(async () => {
      setOpening(true)
      const res = await fetchConnectionSynthesis(ev.id)
      if (!res.ok) {
        toast.error("Não foi possível abrir o selo agora.")
        setOpening(false)
        return
      }
      openWeekSeal(ev.id, res.synthesis)
    })

  const revealed = isOpen && synthesis

  return (
    <div className="relative min-h-dvh overflow-hidden bg-night">
      <div className="stage-glow pointer-events-none absolute inset-0" style={{ ["--illumination" as string]: revealed ? 0.6 : 0.3 }} />
      <ParticleField preset="embers" density={0.5} intensity={0.5} />
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <ExitLink href={`/solo?semana=${week}`} to="o mapa da jornada" />
          <p className="truncate text-xs uppercase tracking-[0.25em] text-mist">
            Semana {week}
            <span className="hidden sm:inline"> · {info.title}</span>
          </p>
        </div>
        <PreferencesMenu />
      </header>

      <main id="conteudo" className="relative z-10 mx-auto max-w-2xl space-y-10 px-4 pb-20 pt-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em]" style={{ color: ITEM_COLORS[info.color] }}>
            Pista da semana {week}
          </p>
          <RefList refs={info.memoryVerse} className="mt-2 justify-center font-display text-2xl text-parchment" />
        </div>

        <SealBreak open={!!revealed} hint={ev.lockedHint}>
          {revealed && (
            <div className="space-y-5">
              <GoldThread className="h-16 w-full" d="M 0 200 C 250 60 750 340 1000 200" />
              <h1 className="font-display text-3xl text-gold-gradient">{ev.title}</h1>
              <BlockList blocks={synthesis.blocks} stagger={0.3} />
            </div>
          )}
        </SealBreak>
        {!revealed && (
          <Button size="lg" onClick={onOpen} disabled={pending || opening} className="h-12 w-full rounded-full text-base">
            {pending ? <Loader2 className="animate-spin" /> : <Unlock />} Abrir o selo
          </Button>
        )}

        {revealed &&
          pauses.map((p) => (
            <section key={p.id} className="space-y-3 rounded-2xl border border-gold/30 bg-ink/80 p-6">
              {p.pergunta && <h2 className="font-display text-2xl text-gold-bright">{p.pergunta}</h2>}
              {p.textoSolo.length > 0 && <BlockList blocks={p.textoSolo.map((text) => ({ kind: "reflexao" as const, text, refs: [], quoteVerified: false }))} />}
              {p.aplicacao && <p className="font-display text-xl italic text-sand">{p.aplicacao}</p>}
            </section>
          ))}

        <nav className="flex flex-wrap justify-between gap-3">
          {list.at(-1) && (
            <Link href={journeyHref(week, list.at(-1)!.id)} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-5 text-sm text-mist hover:text-parchment">
              <ArrowLeft className="size-4" aria-hidden /> Voltar à linha do tempo
            </Link>
          )}
          {nextWeek ? (
            <Link href={`/solo/semana/${nextWeek.week}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-6 font-semibold text-primary-foreground hover:bg-gold-bright">
              Semana {nextWeek.week} · {nextWeek.title} <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <Link href="/solo" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-6 font-semibold text-primary-foreground hover:bg-gold-bright">
              Voltar ao mapa <Map className="size-4" aria-hidden />
            </Link>
          )}
        </nav>
      </main>
    </div>
  )
}
