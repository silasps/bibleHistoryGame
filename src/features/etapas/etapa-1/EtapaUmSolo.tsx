"use client"

import { ChevronRight, RotateCcw } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { ExitLink } from "@/components/app/ExitLink"
import { PreferencesMenu } from "@/components/app/PreferencesMenu"
import { Button } from "@/components/ui/button"
import { getEtapa } from "@/content/etapas"
import { APOIO, type Apoio } from "@/content/etapas/apoio"
import { FALAS } from "@/content/etapas/falas"
import { CREATION, RELICS } from "@/content/etapas/etapa-1"
import { excerpts, stageLineForItem } from "@/content/overview"
import { formatRefs } from "@/content/refs"
import { isFilled, reflectionSlots } from "@/content/reflections"
import type { Mood } from "@/fx/sound"
import { useFx } from "@/fx/useFx"
import { useMood } from "@/fx/useSound"
import { useInventory } from "@/stores/inventory"
import { PhoneVerse } from "../../presentation/OverviewPhoneCard"
import { AfterFallPhone, RelicBar } from "./AfterFall"
import { CreationReveal } from "./CreationReveal"
import { GardenWalk } from "./GardenWalk"
import { TreeAim } from "./TreeAim"

const STEPS = ["inicio", "criacao", "jardim", "arvore", "queda", "vestes", "fora", "semente", "pausa", "fim"] as const
type Step = (typeof STEPS)[number]
const SCOPE = "solo"

/** Música de cada passo: trilha de game nos jogos, clima da história no resto. */
const MOOD_FOR_STEP: Record<Step, Mood> = {
  inicio: "wonder",
  criacao: "play",
  jardim: "garden",
  arvore: "play-tense",
  queda: "sorrow",
  vestes: "hope",
  fora: "tension",
  semente: "hope",
  pausa: "warm",
  fim: "triumph",
}

/** Espaços do autor da semana 1 que ele já escreveu (vazios são pulados). */
const pauses = reflectionSlots.filter((s) => s.scope !== "apresentacao" && s.position.kind === "semana" && s.position.week === 1 && isFilled(s))

/**
 * Etapa 1 no modo solo: a mesma sequência da apresentação, com o jogador
 * andando pelo jardim. O relato não muda: a árvore sempre leva ao fruto.
 */
export function EtapaUmSolo() {
  const etapa = getEtapa(1)!
  const fx = useFx()
  const [step, setStep] = useState<Step>("inicio")
  const [ready, setReady] = useState(false)
  const [inventory, dispatch, reset] = useInventory(SCOPE)
  const intro = excerpts.find((e) => e.id === etapa.intros[0])?.stageLine
  useMood(MOOD_FOR_STEP[step])

  const go = useCallback((next: Step) => {
    setReady(false)
    setStep(next === "pausa" && pauses.length === 0 ? "fim" : next)
  }, [])
  const next = () => go(STEPS[STEPS.indexOf(step) + 1])

  useEffect(() => {
    if (step === "queda" || step === "vestes" || step === "fora") dispatch({ type: "fall" })
    if (step === "vestes") dispatch({ type: "relic", id: "vestes" })
    if (step === "semente") dispatch({ type: "relic", id: "semente" })
  }, [step, dispatch])

  const conquest = useCallback((id: string) => dispatch({ type: "conquest", id }), [dispatch])
  const creationDone = useCallback((_: number, done: boolean) => done && setReady(true), [])
  const treeDone = useCallback(
    (_: number, done: boolean) => {
      if (done) setTimeout(() => go("queda"), fx.motion ? 2600 : 0)
    },
    [fx.motion, go],
  )

  const restart = () => {
    reset()
    go("inicio")
  }

  // Momentos que o jogador lê no seu ritmo têm o botão "Continuar" já liberado.
  const canContinue = ready || ["inicio", "queda", "vestes", "fora", "semente", "pausa"].includes(step)

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
          {STEPS.slice(1, -1).map((s) => (
            <li key={s} className={`h-1 flex-1 rounded-full ${STEPS.indexOf(s) <= STEPS.indexOf(step) ? "bg-gold" : "bg-navy-3"}`} />
          ))}
        </ol>

        <AnimatePresence mode="wait">
          <motion.section key={step} initial={fx.motion ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: fx.motion ? 0.3 : 0 }} className="space-y-4">
            {step === "inicio" && (
              <div className="glass space-y-4 rounded-3xl p-6 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-gold">Etapa {etapa.n}</p>
                <h1 className="font-display text-5xl">{etapa.title}</h1>
                {intro && <p className="font-display text-xl text-sand">{intro}</p>}
                <RelicBar inventory={inventory} />
              </div>
            )}
            {step === "criacao" && (
              <div className="relative h-[68dvh] overflow-hidden rounded-3xl border border-border">
                <CreationReveal onProgress={creationDone} onConquest={conquest} />
              </div>
            )}
            {step === "jardim" && (
              <>
                <div className="relative h-[60dvh] overflow-hidden rounded-3xl border border-border">
                  <GardenWalk interactive onDone={() => setReady(true)} />
                </div>
                <p className="text-center font-display text-xl">{stageLineForItem("adao-eva")?.stageLine}</p>
              </>
            )}
            {step === "arvore" && (
              <div className="relative h-[68dvh] overflow-hidden rounded-3xl border border-border">
                <TreeAim onProgress={treeDone} onConquest={conquest} />
              </div>
            )}
            {step === "queda" && <AfterFallPhone kind="queda" line={stageLineForItem("queda")?.stageLine} inventory={inventory} />}
            {step === "vestes" && (
              <>
                <AfterFallPhone kind="vestes" line={FALAS.vestes.stageLine} inventory={inventory} />
                {APOIO.vestes && <Aprofundar apoio={APOIO.vestes} />}
              </>
            )}
            {step === "fora" && <AfterFallPhone kind="fora" line={FALAS.fora.stageLine} inventory={inventory} />}
            {step === "semente" && <PhoneVerse overview={{ role: "versiculo", week: 1, etapa: 1, refIndex: 0, knot: 1, depth: [], revealedItemIds: [] }} />}
            {step === "pausa" &&
              pauses.map((s) => (
                <div key={s.id} className="glass space-y-3 rounded-3xl p-6">
                  {s.pergunta && <p className="font-display text-2xl">{s.pergunta}</p>}
                  {s.textoSolo.map((t, i) => (
                    <p key={i} className="text-parchment/90">
                      {t}
                    </p>
                  ))}
                  {s.aplicacao && <p className="text-sand">{s.aplicacao}</p>}
                </div>
              ))}
            {step === "fim" && (
              <div className="glass space-y-4 rounded-3xl p-6 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-gold">Etapa {etapa.n} concluída · nível {etapa.n}</p>
                <h1 className="font-display text-4xl">{etapa.title}</h1>
                <p className="text-sand">
                  Relíquias: {inventory.relics.map((id) => RELICS[id as keyof typeof RELICS]?.label).filter(Boolean).join(" · ") || "nenhuma"}
                </p>
                <p className="text-sm text-mist">
                  Criação {CREATION.filter((c) => inventory.conquests.includes(c.id)).length}/{CREATION.length}
                </p>
                <RelicBar inventory={inventory} />
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/solo" className="inline-flex min-h-12 items-center rounded-full bg-gold px-6 font-semibold text-primary-foreground hover:bg-gold-bright">
                    Voltar ao mapa
                  </Link>
                  <Button variant="outline" size="lg" className="min-h-12 rounded-full" onClick={restart}>
                    <RotateCcw /> Jogar de novo
                  </Button>
                </div>
              </div>
            )}
          </motion.section>
        </AnimatePresence>

        {step !== "fim" && step !== "arvore" && (
          <Button size="lg" className="h-14 w-full rounded-full text-lg" disabled={!canContinue} onClick={next}>
            {canContinue ? (
              <>
                Continuar <ChevronRight />
              </>
            ) : step === "jardim" ? (
              "Ande até as árvores"
            ) : (
              "Revele a Criação"
            )}
          </Button>
        )}
      </main>
    </div>
  )
}

/** Material de apoio do autor para o momento, aberto só se o jogador quiser. */
function Aprofundar({ apoio }: { apoio: Apoio }) {
  return (
    <details className="glass rounded-3xl p-5 text-left">
      <summary className="cursor-pointer font-semibold text-gold-bright">Para aprofundar</summary>
      <p className="mt-3 leading-relaxed text-parchment/90">{apoio.text}</p>
      <p className="mt-2 text-sm text-sand">{formatRefs(apoio.refs, "long")}</p>
    </details>
  )
}
