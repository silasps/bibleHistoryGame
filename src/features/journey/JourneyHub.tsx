"use client"

import { Check, Lock, Play, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ITEM_COLORS } from "@/components/art/ItemArt"
import { RefList } from "@/components/story/RefList"
import { itemsOfWeek, weeks } from "@/content/overview"
import { weekEvidenceId } from "@/content/overview/sequence"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/stores/hydration"
import { useSolo } from "@/stores/solo-store"
import { BibleTimeline } from "../timeline/BibleTimeline"
import { journeyHref } from "./JourneyItem"

/** Mapa do jogo: escolha a semana e entre pela linha do tempo. */
export function JourneyHub({ week }: { week: number }) {
  const router = useRouter()
  const hydrated = useHydrated()
  const visited = useSolo((s) => s.visitedItems)
  const openEvidence = useSolo((s) => s.openEvidence)
  const info = weeks.find((w) => w.week === week)!
  const list = itemsOfWeek(week)
  const seen = hydrated ? list.filter((i) => visited[i.id]) : []
  const resume = list.find((i) => !hydrated || !visited[i.id]) ?? list[0]
  const allSeen = list.length > 0 && seen.length === list.length
  const sealOpen = hydrated && !!openEvidence[weekEvidenceId(week)]
  const color = ITEM_COLORS[info.color]

  return (
    <section className="space-y-6" aria-labelledby="jornada-titulo">
      <ol className="grid grid-cols-6 gap-2 sm:grid-cols-11" aria-label="Semanas">
        {weeks.map((w) => {
          const pending = w.status === "aguardando_material"
          const active = w.week === week
          const wList = itemsOfWeek(w.week)
          const done = hydrated && wList.length > 0 && wList.every((i) => visited[i.id])
          const c = ITEM_COLORS[w.color]
          const body = (
            <>
              <span className="text-lg font-semibold tabular-nums">{w.week}</span>
              <span className="text-[0.6rem] uppercase tracking-wider">{pending ? <span className="hidden sm:inline">em breve</span> : done ? <Check className="mx-auto size-3" aria-label="concluída" /> : " "}</span>
            </>
          )
          return (
            <li key={w.week}>
              {pending ? (
                <span className="flex h-14 flex-col items-center justify-center rounded-xl border border-dashed opacity-40" style={{ borderColor: `${c}66`, color: c }} title={`Semana ${w.week} · ${w.title} (em breve)`}>
                  {body}
                </span>
              ) : (
                <Link
                  href={`/solo?semana=${w.week}`}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  title={`Semana ${w.week} · ${w.title}`}
                  className={cn("flex h-14 flex-col items-center justify-center rounded-xl border transition", active ? "text-night" : "hover:bg-white/5")}
                  style={active ? { background: c, borderColor: c } : { borderColor: `${c}66`, color: c }}
                >
                  {body}
                </Link>
              )}
            </li>
          )
        })}
      </ol>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color }}>
            Semana {info.week}
          </p>
          <h1 id="jornada-titulo" className="mt-1 font-display text-4xl text-parchment md:text-6xl">
            {info.title}
          </h1>
          <RefList refs={info.memoryVerse} className="mt-1 text-sand" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm tabular-nums text-mist" aria-live="polite">
            {seen.length} de {list.length} itens
          </p>
          <Link href={journeyHref(week, resume.id)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-6 font-semibold text-primary-foreground hover:bg-gold-bright">
            <Play className="size-4" aria-hidden /> {seen.length ? (allSeen ? "Rever" : "Continuar") : "Começar"}
          </Link>
          {allSeen ? (
            <Link href={`/solo/semana/${week}/pista`} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-gold/60 px-5 text-sm text-gold hover:bg-gold/10">
              <Sparkles className="size-4" aria-hidden /> {sealOpen ? "Pista aberta" : "Abrir a pista"}
            </Link>
          ) : (
            <span className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-5 text-sm text-mist" title="Percorra todos os itens da semana">
              <Lock className="size-4" aria-hidden /> Pista selada
            </span>
          )}
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-3" role="progressbar" aria-valuemin={0} aria-valuemax={list.length} aria-valuenow={seen.length} aria-label="Itens visitados">
        <div className="h-full rounded-full transition-all" style={{ width: `${(seen.length / Math.max(1, list.length)) * 100}%`, background: color }} />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-ink/60">
        <div className="h-[440px] min-w-[1000px] md:h-[520px]">
          <BibleTimeline key={week} week={week} variant="trail" showTitle={false} visited={new Set(seen.map((i) => i.id))} onSelect={(id) => router.push(journeyHref(week, id))} />
        </div>
      </div>
    </section>
  )
}
