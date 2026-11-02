import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { acts, allEvidence, episodes, validateNarrative } from "@/content"
import { CONNECTION_LABEL } from "@/content/labels"
import { allPresenterNotes } from "@/content/private"
import { formatRefs } from "@/content/refs"
import { allReleasedSyntheses } from "@/content/released"

export const metadata: Metadata = { title: "Ferramenta editorial", robots: { index: false } }
export const dynamic = "force-dynamic"

const REVIEW_TONE: Record<string, string> = {
  rascunho: "text-rose",
  em_revisao: "text-gold",
  revisado: "text-sage",
  pendente_fonte: "text-mist",
}

/** Inspeção do conteúdo (não é um CMS): cenas, referências, revisão e tempos. */
export default function EditorPage() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_EDITOR !== "true") notFound()
  const issues = validateNarrative()
  const notes = new Set(allPresenterNotes().map((n) => n.sceneId))
  const syntheses = new Set(allReleasedSyntheses().map((s) => s.evidenceId))

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-sm">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Ferramenta editorial interna</p>
        <h1 className="mt-2 font-display text-5xl text-parchment">Inspeção do conteúdo</h1>
        <p className="mt-2 text-mist">Somente leitura. Edite os módulos em <code>src/content</code>; a validação roda nos testes.</p>
      </header>

      <section className={issues.length ? "rounded-2xl border border-rose/50 bg-rose/10 p-4" : "rounded-2xl border border-sage/50 bg-sage/10 p-4"}>
        <h2 className="font-semibold">{issues.length ? `${issues.length} problema(s) de integridade` : "Integridade: nenhum problema"}</h2>
        {issues.length > 0 && (
          <ul className="mt-2 list-disc pl-5">
            {issues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-3xl text-parchment">Atos</h2>
        <table className="w-full border-collapse">
          <thead className="text-left text-xs uppercase tracking-wider text-mist">
            <tr><th className="p-2">#</th><th className="p-2">Título</th><th className="p-2">Status</th><th className="p-2">Período</th><th className="p-2">Episódios</th></tr>
          </thead>
          <tbody>
            {acts.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="p-2">{a.number}</td>
                <td className="p-2 text-parchment">{a.title}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2">{a.period.label}{a.period.debated && " (debatido)"}</td>
                <td className="p-2">{episodes.filter((e) => e.actId === a.id).map((e) => e.id).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {episodes.map((ep) => (
        <section key={ep.id} className="space-y-3 rounded-2xl border border-border bg-ink p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-3xl text-parchment">{ep.title}</h2>
            <p className={REVIEW_TONE[ep.reviewStatus]}>revisão: {ep.reviewStatus} · resumo autoral: {ep.authorSummary.status} · manual: {ep.manualRequirement.status}</p>
          </div>
          <p className="text-mist">{ep.humanQuestion} · {formatRefs(ep.references)} · {ep.status}</p>
          {ep.gaps.length > 0 && <p className="text-gold">Lacunas: {ep.gaps.join(" · ")}</p>}
          {ep.scenes.length > 0 && (
            <table className="w-full border-collapse">
              <thead className="text-left text-xs uppercase tracking-wider text-mist">
                <tr><th className="p-2">Cena</th><th className="p-2">Tipo</th><th className="p-2">Blocos (natureza)</th><th className="p-2">Refs</th><th className="p-2">Tempo</th><th className="p-2">Notas</th></tr>
              </thead>
              <tbody>
                {ep.scenes.map((s) => (
                  <tr key={s.id} className="border-t border-border align-top">
                    <td className="p-2 text-parchment">{s.id}</td>
                    <td className="p-2">{s.type}</td>
                    <td className="p-2">{s.blocks.map((b) => b.kind).join(", ")}</td>
                    <td className="p-2">{formatRefs(s.blocks.flatMap((b) => b.refs))}</td>
                    <td className="p-2">{Math.round(s.estimatedSeconds / 60)} min</td>
                    <td className="p-2">{notes.has(s.id) ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {ep.draft && (
            <div className="space-y-1 text-mist">
              <p><strong className="text-parchment">Dilema:</strong> {ep.draft.dilemma}</p>
              {ep.draft.cautions.map((c, i) => <p key={i}>⚠ {c}</p>)}
              {ep.draft.proposedConnections.map((c, i) => (
                <p key={i}>↳ {CONNECTION_LABEL[c.type].label}: {formatRefs(c.basis)} — {c.note}</p>
              ))}
            </div>
          )}
        </section>
      ))}

      <section>
        <h2 className="mb-3 font-display text-3xl text-parchment">Evidências e conexões</h2>
        <ul className="space-y-1">
          {allEvidence().map((e) => (
            <li key={e.id}>
              <span className="text-parchment">{e.id}</span> · {e.title} · {formatRefs(e.refs)}
              {e.connection && ` · ${CONNECTION_LABEL[e.connection.primary].label} · base: ${formatRefs(e.connection.basis)} · síntese ${syntheses.has(e.id) ? "✓" : "FALTANDO"}`}
              {e.availability === "futura" && " · futura"}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
