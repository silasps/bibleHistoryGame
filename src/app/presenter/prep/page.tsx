import { AlertTriangle } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { unlockPresenter } from "@/app/actions/presenter"
import { getEvidence, getSceneEntry, getSequence, sequences, sequenceScenes } from "@/content"
import { CONNECTION_LABEL } from "@/content/labels"
import { getPresenterNotes } from "@/content/private"
import { formatRefs } from "@/content/refs"
import { getReleasedSynthesis } from "@/content/released"
import { presenterUnlocked } from "@/lib/presenter-access"

export const metadata: Metadata = { title: "Área de preparação", robots: { index: false } }
export const dynamic = "force-dynamic"

type Props = { searchParams: Promise<{ seq?: string }> }

/**
 * Roteiro privado para estudo ANTES da apresentação. Renderizado só no
 * servidor; nunca é aberto pelo painel de palco nem pelo telão.
 */
export default async function PrepPage({ searchParams }: Props) {
  const seq = getSequence((await searchParams).seq ?? "") ?? sequences[0]

  if (!(await presenterUnlocked())) {
    return (
      <main className="mx-auto max-w-md space-y-4 px-4 py-16">
        <h1 className="font-display text-4xl text-parchment">Área de preparação</h1>
        <form action={unlockPresenter} className="space-y-3">
          <input type="hidden" name="seq" value={seq.id} />
          <input name="code" type="password" required placeholder="Código do apresentador" aria-label="Código do apresentador" className="h-12 w-full rounded-xl border border-input bg-night/60 px-3" />
          <button className="h-12 w-full rounded-full bg-gold font-semibold text-primary-foreground">Entrar</button>
        </form>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div role="alert" className="flex items-start gap-3 rounded-2xl border-2 border-ember bg-ember/15 p-4 text-[#f6c3ad]">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>
          <strong>Não projete esta página.</strong> É o roteiro privado para estudo. Durante a apresentação, as conexões são faladas de memória; o telão mostra só as imagens.
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Área de preparação</p>
        <h1 className="mt-2 font-display text-5xl text-parchment">{seq.title}</h1>
        <nav className="mt-4 flex flex-wrap gap-2 text-sm">
          {sequences.map((s) => (
            <Link key={s.id} href={`/presenter/prep?seq=${s.id}`} className={s.id === seq.id ? "rounded-full bg-gold px-3 py-1 text-primary-foreground" : "rounded-full border border-border px-3 py-1 text-mist"}>
              {s.title}
            </Link>
          ))}
        </nav>
      </div>
      <ol className="space-y-4">
        {sequenceScenes(seq.id).map((scene, i) => {
          const notes = getPresenterNotes(scene.id)
          const ev = scene.releases ? getEvidence(scene.releases) : undefined
          const synthesis = ev ? getReleasedSynthesis(ev.id) : undefined
          return (
            <li key={scene.id} className="rounded-2xl border border-border bg-ink p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-mist">
                {i + 1} · {getSceneEntry(scene.id)?.episode.title} · ~{Math.round(scene.estimatedSeconds / 60)} min
              </p>
              <h2 className="mt-1 font-display text-2xl text-parchment">{scene.title}</h2>
              {notes ? (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-parchment/90">
                  {notes.talkingPoints.map((t, j) => (
                    <li key={j}>{t}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-mist">Sem notas para esta cena.</p>
              )}
              {notes?.transitionHint && <p className="mt-2 text-sm italic text-sand">Transição: {notes.transitionHint}</p>}
              {ev?.connection && synthesis && (
                <div className="mt-4 space-y-2 rounded-xl border border-gold/30 bg-night/60 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold">
                    Conexão · {CONNECTION_LABEL[ev.connection.primary].label} · {formatRefs(ev.connection.basis)}
                  </p>
                  <p className="text-parchment/90">{synthesis.classificationNote}</p>
                  <p className="text-mist">Liberada no celular só depois que você terminar de falar (botão “Liberar pista”).</p>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </main>
  )
}
