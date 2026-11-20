"use client"

import { NotebookPen } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { loadPresenterNotes, savePresenterNote } from "@/app/actions/notes"

type Status = "carregando" | "pronto" | "salvando" | "salvo" | "erro" | "sem-nuvem"

const STATUS_TEXT: Record<Status, string> = {
  carregando: "Carregando…",
  pronto: "Salvo na nuvem",
  salvando: "Salvando…",
  salvo: "Salvo na nuvem",
  erro: "Não foi possível salvar agora. Tente de novo.",
  "sem-nuvem": "Notas indisponíveis aqui (sem Supabase ou sem acesso de apresentador).",
}

/**
 * "Minhas notas": o quadro fixo do painel, um por cena. O que o apresentador
 * digita fica salvo na nuvem (Supabase) e aparece em qualquer computador.
 * Só no painel: nunca vai ao telão nem ao celular.
 */
export function PresenterNotes({ sequenceId, sceneId, sceneTitle }: { sequenceId: string; sceneId: string; sceneTitle?: string }) {
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>("carregando")
  const timer = useRef<number | undefined>(undefined)
  const pending = useRef<{ sceneId: string; body: string } | null>(null)

  useEffect(() => {
    let alive = true
    loadPresenterNotes(sequenceId)
      .then((r) => {
        if (!alive) return
        setNotes(r.notes)
        setStatus(r.ok ? "pronto" : "sem-nuvem")
      })
      .catch(() => alive && setStatus("sem-nuvem"))
    return () => {
      alive = false
    }
  }, [sequenceId])

  const flush = async () => {
    const p = pending.current
    pending.current = null
    timer.current = undefined
    if (!p) return
    const r = await savePresenterNote(sequenceId, p.sceneId, p.body).catch(() => ({ ok: false }))
    setStatus(r.ok ? "salvo" : "erro")
  }

  // Ao trocar de cena, o que estava pendente é salvo na hora.
  useEffect(
    () => () => {
      if (pending.current) {
        clearTimeout(timer.current)
        void flush()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sceneId],
  )

  const change = (body: string) => {
    setNotes((n) => ({ ...n, [sceneId]: body }))
    pending.current = { sceneId, body }
    setStatus("salvando")
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void flush(), 900)
  }

  const disabled = status === "carregando" || status === "sem-nuvem"
  return (
    <section className="space-y-2 rounded-2xl border border-sky-300/30 bg-ink p-4" aria-labelledby="minhas-notas">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="minhas-notas" className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-sky-200">
          <NotebookPen className="size-4" aria-hidden /> Minhas notas · só você vê
        </h2>
        <p className={`text-xs ${status === "erro" ? "text-[#f6c3ad]" : "text-mist"}`} role="status">
          {STATUS_TEXT[status]}
        </p>
      </div>
      <textarea
        value={notes[sceneId] ?? ""}
        onChange={(e) => change(e.target.value)}
        disabled={disabled}
        maxLength={6000}
        rows={6}
        placeholder={disabled ? "" : `Escreva aqui o que quiser lembrar em “${sceneTitle ?? "esta cena"}”. Fica salvo para qualquer computador.`}
        className="min-h-40 w-full resize-y rounded-xl border border-border bg-night/70 p-3 text-base leading-relaxed text-parchment placeholder:text-mist/70 focus:border-sky-300/60 disabled:opacity-60"
        aria-label={`Minhas notas: ${sceneTitle ?? "cena atual"}`}
      />
    </section>
  )
}
