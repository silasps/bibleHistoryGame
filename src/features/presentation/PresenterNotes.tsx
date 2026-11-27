"use client"

import { NotebookPen } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
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

export interface NotesApi {
  notes: Record<string, string>
  status: Status
  change: (sceneId: string, body: string) => void
}

/**
 * As notas do apresentador da sequência inteira (carregadas uma vez). O painel
 * usa para o quadro "Minhas notas" e para avisar, na prévia e no roteiro,
 * as cenas que têm nota.
 */
export function usePresenterNotes(sequenceId: string, currentSceneId: string | undefined): NotesApi {
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>("carregando")
  const timer = useRef<number | undefined>(undefined)
  const pending = useRef<{ sceneId: string; body: string } | null>(null)

  useEffect(() => {
    if (!sequenceId) return
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
    [currentSceneId],
  )

  const change = (sceneId: string, body: string) => {
    setNotes((n) => ({ ...n, [sceneId]: body }))
    pending.current = { sceneId, body }
    setStatus("salvando")
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void flush(), 900)
  }

  return { notes, status, change }
}

/**
 * "Minhas notas": o quadro fixo do painel, um por cena. O que o apresentador
 * digita fica salvo na nuvem (Supabase) e aparece em qualquer computador.
 * Só no painel: nunca vai ao telão nem ao celular.
 */
export function PresenterNotes({ notes: api, sceneId, sceneTitle }: { notes: NotesApi; sceneId: string; sceneTitle?: string }) {
  const { notes, status } = api
  const change = (body: string) => api.change(sceneId, body)
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

/**
 * Botão "Nota" na barra do slide: abre um quadro para ler ou escrever a nota
 * desta cena sem rolar a tela. É a mesma nota do quadro "Minhas notas".
 */
export function NoteButton({ notes: api, sceneId, sceneTitle, open, onOpenChange }: { notes: NotesApi; sceneId: string; sceneTitle?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const body = api.notes[sceneId] ?? ""
  const has = !!body.trim()
  const disabled = api.status === "carregando" || api.status === "sem-nuvem"
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11", has && "border-sky-300/70 bg-sky-300/15 text-sky-100 hover:bg-sky-300/25")}
        aria-label={has ? "Ver a minha nota desta cena" : "Escrever uma nota para esta cena"}
      >
        <NotebookPen aria-hidden /> {has ? "Minha nota" : "Nota"}
        {has && <span className="size-2 rounded-full bg-sky-200" aria-hidden />}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(34rem,92vw)] gap-3 border border-sky-300/40 bg-navy p-4">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-sky-200">
          <NotebookPen className="size-4" aria-hidden /> Minha nota · só você vê
        </p>
        <textarea
          autoFocus
          value={body}
          onChange={(e) => api.change(sceneId, e.target.value)}
          disabled={disabled}
          maxLength={6000}
          rows={8}
          placeholder={disabled ? "" : `O que você quer lembrar em “${sceneTitle ?? "esta cena"}”.`}
          className="w-full resize-y rounded-xl border border-border bg-night/70 p-3 text-base leading-relaxed text-parchment placeholder:text-mist/70 focus:border-sky-300/60 disabled:opacity-60"
          aria-label={`Minha nota: ${sceneTitle ?? "cena atual"}`}
        />
        <p className={`text-xs ${api.status === "erro" ? "text-[#f6c3ad]" : "text-mist"}`} role="status">
          {STATUS_TEXT[api.status]}
        </p>
      </PopoverContent>
    </Popover>
  )
}
