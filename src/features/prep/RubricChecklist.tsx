import "server-only"

import { sequenceScenes } from "@/content"
import { etapaOfItem } from "@/content/etapas"
import { items, weeks } from "@/content/overview"
import { getReflectionNotes } from "@/content/private/reflections"
import { getWeekConnection } from "@/content/released/overview"
import { reflectionSlots, isFilled, type ReflectionSlot } from "@/content/reflections"
import { RUBRIC, RUBRIC_DATES, RUBRIC_SOURCE } from "@/content/rubric"
import { authorTaskLinks } from "@/lib/author-sources"
import { cn } from "@/lib/utils"
import { ManualChecks } from "./ManualChecks"

type Status = "ok" | "falta" | "lembrete"

const STATUS_STYLE: Record<Status, string> = {
  ok: "bg-sage/20 text-sage",
  falta: "bg-ember/20 text-[#f6c3ad]",
  lembrete: "bg-sand/15 text-sand",
}

/** Espaço do autor com conteúdo (texto do jogo ou notas faladas privadas). */
const written = (slot?: ReflectionSlot) => !!slot && (isFilled(slot) || getReflectionNotes(slot.id).length > 0)

function Pill({ status, children }: { status: Status; children: React.ReactNode }) {
  return <span className={cn("inline-block rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[status])}>{children}</span>
}

/**
 * Folha de notas do Manual: o que a apresentação pede e o que ainda falta.
 * Só aponta; nunca preenche nada pelo autor.
 */
export function RubricChecklist() {
  const slot = (id: string) => reflectionSlots.find((s) => s.id === id)
  const tasks = authorTaskLinks()
  const minutes = Math.round(sequenceScenes("visao-geral").reduce((n, s) => n + s.estimatedSeconds, 0) / 60)

  const weekRows = weeks.map((w) => {
    const has = w.status === "com_material"
    const etapas = [...new Set(items.filter((i) => i.week === w.week).map((i) => etapaOfItem(i.id)?.n))].filter(Boolean)
    return {
      week: w,
      etapas,
      stories: has && etapas.length > 0,
      verse: !!w.memoryVerseText?.length,
      prd: (getWeekConnection(w.week)?.blocks.length ?? 0) > 0,
      character: written(slot(`s${w.week}-carater-natureza`)),
      personal: written(slot(`s${w.week}-revelacao-pessoal`)),
      task: tasks[String(w.week)]?.carater,
    }
  })
  const withMaterial = weekRows.filter((r) => r.week.status === "com_material")
  const characterDone = withMaterial.filter((r) => r.character).length
  const personalDone = withMaterial.filter((r) => r.personal).length

  const rows: { label: string; points: string; status: Status; note: string }[] = [
    { ...RUBRIC.intro, status: written(slot("abertura")) ? "ok" : "falta", note: written(slot("abertura")) ? "Espaço da abertura preenchido." : "Falta o seu texto no espaço “abertura”." },
    {
      ...RUBRIC.weeks,
      status: withMaterial.every((r) => r.stories && r.verse && r.prd) ? "ok" : "falta",
      note: `Semanas com material: ${withMaterial.map((r) => r.week.week).join(", ")}. As semanas 7 a 11 aguardam material.`,
    },
    { ...RUBRIC.personal, status: personalDone > 0 ? "ok" : "falta", note: `${personalDone} de ${withMaterial.length} espaços de revelação pessoal preenchidos.` },
    { ...RUBRIC.character, status: characterDone === withMaterial.length ? "ok" : "falta", note: `${characterDone} de ${withMaterial.length} espaços de C&N preenchidos.` },
    { ...RUBRIC.conclusion, status: written(slot("conclusao")) ? "ok" : "falta", note: written(slot("conclusao")) ? "Espaço da conclusão preenchido." : "Falta o seu texto no espaço “conclusão”." },
    { ...RUBRIC.timeline, status: "ok", note: "A faixa da linha do tempo fica visível em todas as etapas." },
    { ...RUBRIC.time, status: minutes >= 30 && minutes <= 45 ? "ok" : "falta", note: `Estimativa atual: ${minutes} min. Confira no ensaio com o cronômetro.` },
    { ...RUBRIC.guests, status: "lembrete", note: "Convide com antecedência." },
  ]

  return (
    <section aria-labelledby="folha-de-notas" className="space-y-5 rounded-2xl border border-gold/30 bg-ink p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold">{RUBRIC_SOURCE}</p>
        <h2 id="folha-de-notas" className="mt-1 font-display text-3xl text-parchment">
          Folha de notas: o que ainda falta
        </h2>
        <p className="mt-1 text-sm text-mist">O app só confere. O conteúdo de cada item é seu.</p>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.label} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-4">
            <div className="min-w-0">
              <p className="text-parchment">
                {r.label} <span className="font-mono text-xs text-gold">({r.points})</span>
              </p>
              <p className="text-sm text-mist">{r.note}</p>
            </div>
            <Pill status={r.status}>{r.status === "ok" ? "ok" : r.status === "falta" ? "falta" : "lembrete"}</Pill>
          </li>
        ))}
      </ul>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="text-left text-[0.65rem] uppercase tracking-[0.2em] text-mist">
              <th className="py-2 pr-3 font-medium">Semana</th>
              <th className="py-2 pr-3 font-medium">Etapas</th>
              <th className="py-2 pr-3 font-medium">Histórias</th>
              <th className="py-2 pr-3 font-medium">Versículo</th>
              <th className="py-2 pr-3 font-medium">PRD</th>
              <th className="py-2 pr-3 font-medium">C&amp;N</th>
              <th className="py-2 pr-3 font-medium">Revelação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {weekRows.map((r) => {
              const mark = (ok: boolean) => (r.week.status === "com_material" ? <Pill status={ok ? "ok" : "falta"}>{ok ? "ok" : "falta"}</Pill> : <span className="text-mist">—</span>)
              return (
                <tr key={r.week.week}>
                  <td className="py-2 pr-3 text-parchment">
                    {r.week.week} · {r.week.title}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs text-mist">{r.etapas.join(", ") || "—"}</td>
                  <td className="py-2 pr-3">{mark(r.stories)}</td>
                  <td className="py-2 pr-3">{mark(r.verse)}</td>
                  <td className="py-2 pr-3">{mark(r.prd)}</td>
                  <td className="py-2 pr-3">
                    {mark(r.character)}
                    {!r.character && r.task && (
                      <a href={r.task} target="_blank" rel="noreferrer" className="ml-2 text-xs text-gold underline">
                        sua Task 3
                      </a>
                    )}
                  </td>
                  <td className="py-2 pr-3">{mark(r.personal)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ManualChecks items={[{ id: "convidado-1", label: "1º convidado de fora da escola" }, { id: "convidado-2", label: "2º convidado de fora da escola" }, { id: "ensaio-at", label: RUBRIC_DATES.rehearsal }]} />
      <p className="text-sm text-sand">{RUBRIC_DATES.final}.</p>
    </section>
  )
}
