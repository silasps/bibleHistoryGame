"use client"

import {
  BarChart3,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Footprints,
  Lightbulb,
  MonitorPlay,
  Pause,
  Play,
  Plus,
  Power,
  Smartphone,
  Sparkle,
  TrainFront,
  Unlock,
  Users,
  Vote,
  BrickWall,
  X,
} from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { getEvidence, sequenceScenes } from "@/content"
import { getCharacter } from "@/content/characters"
import { getEtapa } from "@/content/etapas"
import { getItem, getWeek } from "@/content/overview"
import { formatRef } from "@/content/refs"
import { ConfirmDialog } from "@/components/app/ConfirmDialog"
import { ExitLink } from "@/components/app/ExitLink"
import { FullscreenButton } from "@/components/app/FullscreenButton"
import { useFullscreen } from "@/components/app/useFullscreen"
import { ConnectionStatus } from "@/components/story/ConnectionStatus"
import { DemoBadge } from "@/components/story/DemoBadge"
import { Button, buttonVariants } from "@/components/ui/button"
import type { HostRoomApi } from "@/data/ports"
import { tally } from "@/domain/poll"
import { toProjectorView } from "@/domain/projection"
import type { HostCommand } from "@/domain/session"
import { cn } from "@/lib/utils"
import { SilentSound } from "@/fx/useSound"
import { clickerAction } from "./clicker"
import { ProjectorStage } from "./ProjectorStage"
import { RehearsalTimer } from "./RehearsalTimer"

/** Ícone discreto dos momentos de conexão: um fio dourado, sem texto explicativo. */
function ThreadMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} role="img" aria-label="Momento de conexão">
      <path d="M2 16 C 7 4, 11 20, 16 9 S 21 6, 22 8" fill="none" stroke="#d8a948" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="22" cy="8" r="1.8" fill="#f4d27a" />
    </svg>
  )
}

const CUE_ICON = { conexao: ThreadMark, votacao: Vote, historia: null, pausa: Pause } as const

interface Props {
  room: HostRoomApi
  code: string
  joinUrl: string
  projectorUrl: string
  onDelete?: () => void
}

/**
 * Painel do apresentador. Mostra o roteiro da sequência, controles e tempos.
 * Não importa notas privadas: o conteúdo do PRD é falado de memória, e o
 * roteiro fica na Área de preparação.
 */
export function PresenterConsole({ room, code, joinUrl, projectorUrl, onDelete }: Props) {
  const { state } = room
  const [confirming, setConfirming] = useState<"end" | "delete" | null>(null)
  const scenes = useMemo(() => (state ? sequenceScenes(state.sequenceId) : []), [state])
  const scene = state ? scenes[state.index] : undefined
  const next = state ? scenes[state.index + 1] : undefined
  const poll = scene?.poll
  const pollState = poll && state ? state.polls[poll.id] : undefined
  const released = !!(scene?.releases && state?.released.includes(scene.releases))
  const preview = useMemo(() => (state ? toProjectorView(state, { scenes }, getEvidence) : null), [state, scenes])
  const counts = poll ? tally(pollState?.votes ?? {}, poll) : null
  const participants = state ? Object.keys(state.participants).length : 0
  const itemCharacter = scene?.overview?.itemId ? getCharacter(getItem(scene.overview.itemId)?.characterId ?? "") : undefined
  const verse = useMemo(() => {
    const o = scene?.overview
    if (o?.role !== "versiculo" || !o.week) return null
    const w = getWeek(o.week)
    const text = w?.memoryVerseText?.[o.refIndex ?? 0]
    return text && w ? { words: text.split(/\s+/), ref: formatRef(w.memoryVerse[o.refIndex ?? 0], "long") } : null
  }, [scene])
  // Lembrete do versículo: só no painel, uma palavra por clique (o público vê o texto inteiro).
  const [verseShown, setVerseShown] = useState({ sceneId: "", count: 0 })
  const shownWords = verseShown.sceneId === scene?.id ? verseShown.count : 0
  const revealVerse = useCallback(
    (all: boolean) => {
      if (!scene || !verse) return
      setVerseShown((v) => ({ sceneId: scene.id, count: all ? verse.words.length : Math.min(verse.words.length, (v.sceneId === scene.id ? v.count : 0) + 1) }))
    },
    [scene, verse],
  )

  const { toggle: toggleFullscreen } = useFullscreen()
  const send = useCallback(
    async (cmd: HostCommand) => {
      const err = await room.command(cmd)
      if (err) toast.error(err)
    },
    [room],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return
      // Passador de slides: Page Down/Page Up ou setas; B/ponto = tela preta (pausa); F5 = tela cheia.
      const action = clickerAction(e)
      if (action === "fullscreen") {
        e.preventDefault()
        return toggleFullscreen()
      }
      if (!state || state.status !== "running") return
      const k = e.key.toLowerCase()
      if (action === "next") {
        e.preventDefault()
        void send({ type: "next" })
      }
      else if (action === "prev") {
        e.preventDefault()
        void send({ type: "prev" })
      }
      else if (action === "blank" || k === "p") void send({ type: state.paused ? "resume" : "pause" })
      else if (k === "v" && poll) void send({ type: pollState?.status === "open" ? "close_poll" : "open_poll", pollId: poll.id })
      else if (k === "v" && verse) revealVerse(e.shiftKey)
      else if (k === "r" && poll && pollState) void send({ type: pollState.resultsVisible ? "hide_results" : "show_results", pollId: poll.id })
      else if (k === "l" && scene?.releases) void send({ type: "release", evidenceId: scene.releases })
      else if (k === "d" && scene?.steps && state.step < scene.steps.length) void send({ type: "step", delta: 1 })
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [state, poll, pollState, scene, send, verse, revealVerse, toggleFullscreen])

  if (!state) {
    return <p className="p-8 text-mist" role="status">Carregando a sala…</p>
  }

  const Cue = scene?.presenterCue ? CUE_ICON[scene.presenterCue] : null

  return (
    <div className="min-h-dvh bg-night text-parchment">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <ExitLink href="/presenter" to="o lobby do apresentador" />
          <p className="font-display text-2xl tracking-[0.18em]">{code}</p>
          {room.mode === "demo" ? <DemoBadge /> : <span className="rounded-full border border-sage/50 bg-sage/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sage">Ao vivo · Supabase</span>}
          {room.mode === "live" && <ConnectionStatus state={room.link} />}
          {state.rehearsal && <span className="rounded-full border border-sky-300/40 px-3 py-1 text-xs uppercase tracking-wider text-sky-200">Ensaio</span>}
          <span className="inline-flex items-center gap-1.5 text-sm text-mist">
            <Users className="size-4" aria-hidden /> {participants}
          </span>
        </div>
        <RehearsalTimer state={state} scenes={scenes} compact />
        <div className="flex flex-wrap gap-2">
          <FullscreenButton className="h-11 border border-border bg-transparent text-parchment hover:bg-navy-2" />
          <Button variant="outline" size="lg" onClick={() => window.open(projectorUrl, `bph-projector-${code}`)}>
            <MonitorPlay /> Abrir telão
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.open(joinUrl, "_blank")}>
            <Smartphone /> Simular celular
          </Button>
          {state.status !== "ended" ? (
            <Button variant="destructive" size="lg" onClick={() => setConfirming("end")}>
              <Power /> Encerrar
            </Button>
          ) : (
            <>
              {onDelete && (
                <Button variant="destructive" size="lg" onClick={() => setConfirming("delete")}>
                  <X /> Apagar sala
                </Button>
              )}
              <Link href="/presenter" className={buttonVariants({ size: "lg" })}>
                <Plus /> Nova apresentação
              </Link>
            </>
          )}
        </div>
      </header>

      <ConfirmDialog
        open={confirming === "end"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Encerrar a sessão?"
        description="Os dados de participação serão apagados."
        confirmLabel="Encerrar"
        onConfirm={() => void send({ type: "end" })}
      />
      {onDelete && (
        <ConfirmDialog
          open={confirming === "delete"}
          onOpenChange={(open) => !open && setConfirming(null)}
          title="Apagar a sala?"
          description="A sala será apagada definitivamente."
          confirmLabel="Apagar sala"
          onConfirm={onDelete}
        />
      )}

      <div className="grid grid-cols-1 gap-6 p-4 md:p-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-border">
            <SilentSound.Provider value>
              <ProjectorStage view={preview} joinUrl={joinUrl} preview />
            </SilentSound.Provider>
          </div>

          {state.status === "lobby" && (
            <Button size="lg" className="h-16 w-full rounded-2xl text-xl" onClick={() => send({ type: "start" })}>
              <Play /> Começar a apresentação
            </Button>
          )}

          {state.status === "running" && scene && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-ink p-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-mist">
                    Cena {state.index + 1} de {scenes.length}
                    {Cue && <Cue className="size-4 text-gold" />}
                  </p>
                  <h1 className="mt-1 font-display text-3xl">{scene.title}</h1>
                  {next && <p className="mt-1 text-sm text-mist">A seguir: {next.title}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="lg" className="h-14 w-14" onClick={() => send({ type: "prev" })} disabled={state.index === 0} aria-label="Cena anterior">
                    <ChevronLeft className="size-6" />
                  </Button>
                  <Button size="lg" className="h-14 px-6 text-lg" onClick={() => send({ type: "next" })} disabled={!next}>
                    Próxima <ChevronRight className="size-6" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Button variant={state.paused ? "default" : "outline"} size="lg" className="h-12" onClick={() => send({ type: state.paused ? "resume" : "pause" })}>
                  {state.paused ? <Play /> : <Pause />} {state.paused ? "Retomar" : "Pausar telão"}
                </Button>

                {poll && (
                  <>
                    <Button
                      variant={pollState?.status === "open" ? "default" : "outline"}
                      size="lg"
                      className="h-12"
                      onClick={() => send({ type: pollState?.status === "open" ? "close_poll" : "open_poll", pollId: poll.id })}
                    >
                      <Vote /> {pollState?.status === "open" ? "Fechar votação" : pollState?.status === "closed" ? "Reabrir votação" : "Abrir votação"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12"
                      disabled={!pollState}
                      onClick={() => pollState && send({ type: pollState.resultsVisible ? "hide_results" : "show_results", pollId: poll.id })}
                    >
                      {pollState?.resultsVisible ? <EyeOff /> : <BarChart3 />} {pollState?.resultsVisible ? "Ocultar resultado" : "Revelar resultado"}
                    </Button>
                  </>
                )}

                {scene.releases && (
                  <Button size="lg" className="h-12" disabled={released} onClick={() => send({ type: "release", evidenceId: scene.releases! })}>
                    <Unlock /> {released ? "Pista liberada" : "Liberar pista"}
                  </Button>
                )}

                {scene.steps && scene.steps.length > 0 && (
                  <>
                    <Button size="lg" className="h-12" disabled={state.step >= scene.steps.length} onClick={() => send({ type: "step", delta: 1 })}>
                      <Footprints /> {scene.overview ? "Aprofundar" : "Próximo candidato"} ({state.step}/{scene.steps.length})
                    </Button>
                    <Button variant="outline" size="lg" className="h-12" disabled={state.step === 0} onClick={() => send({ type: "step", delta: -1 })}>
                      {scene.overview ? "Voltar linha" : "Voltar candidato"}
                    </Button>
                  </>
                )}

                {scene.visual === "yard-train" && (
                  <>
                    <Button variant="outline" size="lg" className="h-12" onClick={() => send({ type: "cue", kind: "muro" })}>
                      <BrickWall /> Levantar o muro
                    </Button>
                    <Button variant="outline" size="lg" className="h-12" onClick={() => send({ type: "cue", kind: "trem" })}>
                      <TrainFront /> Passar o trem
                    </Button>
                  </>
                )}
              </div>

              {verse && (
                <div className="space-y-3 rounded-2xl border border-gold/30 bg-ink p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold">Lembrete do versículo · {verse.ref} · só você vê</p>
                  <p className="min-h-[3.5rem] font-display text-2xl leading-snug" aria-live="polite">
                    {verse.words.map((w, i) => (
                      <span key={i} className={i < shownWords ? "text-parchment" : "rounded bg-mist/15 text-transparent"}>
                        {w}{" "}
                      </span>
                    ))}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="lg" className="h-12" disabled={shownWords >= verse.words.length} onClick={() => revealVerse(false)}>
                      <BookOpenText /> Lembrar o versículo
                    </Button>
                    <Button variant="outline" size="lg" className="h-12" disabled={shownWords >= verse.words.length} onClick={() => revealVerse(true)}>
                      Mostrar tudo
                    </Button>
                    {shownWords > 0 && (
                      <Button variant="ghost" size="lg" className="h-12" onClick={() => setVerseShown({ sceneId: scene.id, count: 0 })}>
                        Esconder
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {counts && (
                <div className="rounded-2xl border border-border bg-ink p-4">
                  <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-mist">
                    {pollState?.resultsVisible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    Votos ({counts.total}) {pollState?.resultsVisible ? "· visíveis no telão" : "· só você vê"}
                  </p>
                  <ul className="space-y-1.5">
                    {counts.rows.map((r) => (
                      <li key={r.optionId} className="flex items-center gap-3 text-sm">
                        <span className="w-10 text-right font-mono tabular-nums text-gold">{r.count}</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-navy-3">
                          <span className="block h-full rounded-full bg-gold" style={{ width: `${r.pct}%` }} />
                        </span>
                        <span className="w-1/2 truncate text-parchment/80">{r.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {itemCharacter && itemCharacter.skin.length > 0 && (
                <div className="flex flex-wrap gap-2 rounded-2xl border border-gold/30 bg-ink p-4">
                  <p className="w-full text-xs uppercase tracking-[0.25em] text-gold">Destacar na skin de {itemCharacter.name}</p>
                  {itemCharacter.skin.map((s) => (
                    <Button key={s.id} variant={state.spotlight === s.id ? "default" : "outline"} onClick={() => send({ type: "spotlight", skinId: state.spotlight === s.id ? null : s.id })}>
                      ✦ {s.label}
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-ink p-4">
                <p className="w-full text-xs uppercase tracking-[0.25em] text-mist">Momentos</p>
                <Button variant="outline" onClick={() => send({ type: "moment", kind: "haja-luz" })}>
                  <Sparkle /> Haja luz
                </Button>
                <Button variant="outline" onClick={() => send({ type: "moment", kind: "luzes" })}>
                  <Lightbulb /> Luzes do público
                </Button>
                {state.moment && (
                  <Button variant="ghost" onClick={() => send({ type: "clear_moment" })}>
                    Encerrar momento
                  </Button>
                )}
              </div>
            </>
          )}

          {room.simulation && state.status !== "ended" && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-ember/50 bg-ember/5 p-4">
              <p className="w-full text-xs uppercase tracking-[0.25em] text-[#f2a27e]">Simulação local (participantes fictícios)</p>
              <Button variant="outline" onClick={() => room.simulation!.addParticipants(8)}>
                <Users /> +8 participantes
              </Button>
              <Button variant="outline" disabled={pollState?.status !== "open"} onClick={() => room.simulation!.voteRandomly()}>
                <Vote /> Simular votos
              </Button>
              <Button variant="outline" disabled={state.moment?.kind !== "luzes"} onClick={() => room.simulation!.lightAll()}>
                <Lightbulb /> Simular luzes
              </Button>
            </div>
          )}

          <p className="text-xs text-mist">
            Atalhos: → , espaço ou Page Down avança · ← ou Page Up volta · D aprofunda · P ou B pausa · F tela cheia · V abre/fecha votação ou lembra o versículo (Shift+V: tudo) · R revela resultado · L libera pista. O passador de slides funciona aqui e na janela do telão.
          </p>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-ink p-4">
            <RehearsalTimer state={state} scenes={scenes} />
          </div>
          <nav aria-label="Roteiro da sequência" className="rounded-2xl border border-border bg-ink p-2">
            <ol className="max-h-[60dvh] overflow-y-auto">
              {scenes.map((s, i) => {
                const SCue = s.presenterCue ? CUE_ICON[s.presenterCue] : null
                const spent = state.timing.sceneMs[s.id]
                const newEtapa = s.overview?.etapa !== undefined && s.overview.etapa !== scenes[i - 1]?.overview?.etapa
                return (
                  <li key={s.id}>
                    {newEtapa && <p className="px-3 pb-1 pt-3 text-[0.65rem] uppercase tracking-[0.3em] text-gold">Etapa {s.overview!.etapa} · {getEtapa(s.overview!.etapa!)?.title}</p>}
                    <button
                      onClick={() => state.status === "running" && send({ type: "goto", index: i })}
                      disabled={state.status !== "running"}
                      aria-current={i === state.index ? "step" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                        i === state.index ? "bg-gold/15 text-parchment" : "text-mist hover:bg-navy-2 hover:text-parchment",
                      )}
                    >
                      <span className="w-6 text-right font-mono text-xs tabular-nums text-mist">{i + 1}</span>
                      <span className="flex-1 truncate">{s.title}</span>
                      {s.optional && <span className="rounded-full border border-border px-1.5 text-[0.6rem] uppercase tracking-wider text-mist" title="Pode pular quando faltar tempo">opcional</span>}
                      {SCue && <SCue className="size-3.5 shrink-0 text-gold/80" />}
                      <span className="w-12 text-right font-mono text-xs tabular-nums text-mist/70">
                        {spent ? `${Math.round(spent / 1000)}s` : `~${Math.round(s.estimatedSeconds / 60)}m`}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>
          <p className="text-xs leading-relaxed text-mist">
            O roteiro de fala fica na Área de preparação, nunca neste painel.
          </p>
        </aside>
      </div>
    </div>
  )
}
