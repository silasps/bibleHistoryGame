"use client"

import { Lock, Pause, Sparkles } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BlockList } from "@/components/story/BlockList"
import { ConnectionChips } from "@/components/story/ConnectionChips"
import { ConnectionStatus } from "@/components/story/ConnectionStatus"
import { DemoBadge } from "@/components/story/DemoBadge"
import { Button } from "@/components/ui/button"
import type { AudienceRoomApi, RoomMode } from "@/data/ports"
import type { ClueView } from "@/domain/projection"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { ParticleField } from "@/fx/ParticleField"
import { SealBreak } from "@/fx/SealBreak"
import { useStinger } from "@/fx/useSound"
import { cn } from "@/lib/utils"
import { useInventory } from "@/stores/inventory"
import { PhoneGame } from "../etapas/etapa-1/PhoneGame"
import { HajaLuzPhone } from "./Moments"
import { OverviewPhoneCard } from "./OverviewPhoneCard"
import { PollResults } from "./PollResults"

function Clue({ clue }: { clue: ClueView }) {
  const open = clue.status === "aberta"
  return (
    <article className={cn("rounded-2xl border p-4", open ? "border-gold/60 bg-[linear-gradient(180deg,rgb(216_169_72/0.14),transparent),var(--ink)]" : "border-dashed border-gold/40 bg-night")}>
      <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-gold">
        {open ? <Sparkles className="size-3.5" aria-hidden /> : <Lock className="size-3.5" aria-hidden />}
        {open ? "Pista aberta" : clue.status === "futura" ? "Conexão futura" : "Pista selada"}
      </div>
      <SealBreak open={open} hint={clue.lockedHint}>
        {open && (
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="font-display text-2xl text-gold-bright">{clue.title}</h3>
              <p className="text-sm text-sand">{clue.refs?.join(" · ")} <span className="text-mist">(NAA)</span></p>
            </div>
            {clue.synthesis && <BlockList blocks={clue.synthesis} stagger={0.25} />}
            {clue.classification && <ConnectionChips primary={clue.classification.primary} secondary={clue.classification.secondary} note={clue.classification.note} />}
          </div>
        )}
      </SealBreak>
    </article>
  )
}

/** Celular do público: sem cadastro, só apelido opcional. */
export function AudienceScreen({ room, mode, code }: { room: AudienceRoomApi & { error?: string | null }; mode: RoomMode; code: string }) {
  const { view, joined, link } = room
  const [nickname, setNickname] = useState("")
  const [busy, setBusy] = useState(false)
  const stinger = useStinger()
  const inventoryScope = `sala-${code}`
  const [, dispatchInventory] = useInventory(inventoryScope)
  const knot = view?.scene?.overview?.role === "versiculo" ? view.scene.overview.knot : undefined
  // O primeiro versículo do plano (Gn 3:15) entrega a relíquia da semente.
  useEffect(() => {
    if (knot === 1) dispatchInventory({ type: "relic", id: "semente" })
  }, [knot, dispatchInventory])

  const join = async () => {
    setBusy(true)
    const err = await room.join(nickname.trim() || undefined)
    setBusy(false)
    if (err) toast.error(err)
  }

  const vote = async (pollId: string, optionId: string) => {
    vibrate(HAPTIC.vote)
    stinger("vote")
    const err = await room.vote(pollId, optionId)
    if (err) toast.error(err)
  }

  const scene = view?.scene
  const poll = scene?.poll
  const canVote = poll?.status === "open"
  const opened = view?.clues.filter((c) => c.status === "aberta") ?? []
  const sealed = view?.clues.filter((c) => c.status !== "aberta") ?? []

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-night pb-24" style={{ ["--illumination" as string]: 0.35 }}>
      <div className="stage-glow pointer-events-none fixed inset-0" />
      <ParticleField preset="stars" density={0.4} intensity={0.4} className="fixed" />

      <header className="relative z-10 flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-display text-lg tracking-[0.18em] text-parchment">BÍBLIA</p>
          <p className="text-xs tracking-widest text-mist">Sala {code}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {mode === "demo" && <DemoBadge />}
          <ConnectionStatus state={link} />
        </div>
      </header>

      <main id="conteudo" className="relative z-10 mx-auto max-w-md space-y-6 px-4">
        {room.error && !view && <p className="rounded-xl border border-rose/40 bg-rose/10 p-4 text-rose">{room.error}</p>}

        {view?.status === "ended" && !joined && (
          <section className="glass rounded-3xl p-6 text-center">
            <p className="font-display text-3xl text-gold-bright">Obrigado por investigar!</p>
            <p className="mt-2 text-sm text-mist">A sala foi encerrada e os dados de participação foram apagados.</p>
          </section>
        )}

        {!joined && view?.status !== "ended" && !(room.error && !view) && (
          <section className="glass space-y-4 rounded-3xl p-5">
            <h1 className="font-display text-3xl text-parchment">Entrar na investigação</h1>
            <p className="text-sm text-mist">Sem cadastro. O apelido é opcional e só aparece para você.</p>
            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-widest text-mist">Apelido (opcional)</span>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 24))}
                maxLength={24}
                autoComplete="off"
                className="h-12 w-full rounded-xl border border-input bg-night/70 px-4 text-lg text-parchment focus:border-gold"
                placeholder="Como quer ser chamado?"
              />
            </label>
            <Button size="lg" className="h-14 w-full rounded-full text-lg" onClick={join} disabled={busy || !view}>
              Entrar
            </Button>
          </section>
        )}

        {joined && view && (
          <>
            {view.status === "lobby" && (
              <section className="glass rounded-3xl p-6 text-center">
                <p className="font-display text-3xl text-parchment">Você está dentro{view.me?.nickname ? `, ${view.me.nickname}` : ""}.</p>
                <p className="mt-2 text-mist">A investigação começa em instantes. Fique de olho no telão.</p>
              </section>
            )}

            {view.status === "running" && scene && (
              <section className="space-y-4" aria-live="polite">
                {scene.game ? (
                  <PhoneGame game={scene.game} line={scene.overview?.stageLine} scope={inventoryScope} play={room.play} />
                ) : (
                  scene.overview && <OverviewPhoneCard overview={scene.overview} />
                )}
                {!scene.overview && scene.title && <h1 className="font-display text-3xl leading-tight text-parchment">{scene.title}</h1>}
                {scene.prompt && (!scene.overview || scene.overview.role === "versiculo" || (scene.overview.role === "pista" && opened.length === 0)) && <p className="text-mist">{scene.prompt}</p>}

                {poll && poll.status !== "idle" && (
                  <div className="glass space-y-3 rounded-3xl p-4">
                    {canVote && !poll.resultsVisible ? (
                      <>
                        <p className="font-display text-2xl text-parchment">{poll.question}</p>
                        <div className="grid gap-2" role="group" aria-label={poll.question}>
                          {poll.options.map((o) => (
                            <motion.button
                              key={o.id}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => vote(poll.id, o.id)}
                              aria-pressed={poll.myVote === o.id}
                              className={cn(
                                "min-h-14 rounded-2xl border px-4 py-3 text-left text-lg transition-colors",
                                poll.myVote === o.id ? "border-gold bg-gold/20 text-parchment shadow-[0_0_24px_rgba(216,169,72,0.3)]" : "border-border bg-night/70 text-parchment/90",
                              )}
                            >
                              {o.label}
                            </motion.button>
                          ))}
                        </div>
                        <p className="text-xs text-mist">{poll.myVote ? "Voto registrado. Você pode mudar enquanto a votação estiver aberta." : "Toque para votar."}</p>
                      </>
                    ) : (
                      <PollResults poll={poll} size="phone" />
                    )}
                  </div>
                )}

                {view.moment?.kind === "luzes" && (
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    disabled={view.me?.lit}
                    onClick={async () => {
                      vibrate(HAPTIC.light)
                      stinger("light")
                      await room.light()
                    }}
                    className={cn(
                      "relative h-40 w-full overflow-hidden rounded-3xl border text-xl font-semibold transition-all",
                      view.me?.lit ? "border-gold bg-[radial-gradient(circle,#fff6d8,#f4d27a_35%,#d8a948_70%)] text-night shadow-[0_0_60px_rgba(244,210,122,0.6)]" : "border-gold/50 bg-night/70 text-gold-bright",
                    )}
                  >
                    {view.me?.lit ? "Sua luz está acesa" : "Acender minha luz"}
                  </motion.button>
                )}
              </section>
            )}

            {view.status === "ended" && (
              <section className="glass rounded-3xl p-6 text-center">
                <p className="font-display text-3xl text-gold-bright">Obrigado por investigar!</p>
                <p className="mt-2 text-sm text-mist">A sala foi encerrada e os dados de participação foram apagados. As pistas abaixo ficam só nesta tela.</p>
              </section>
            )}

            {(opened.length > 0 || sealed.length > 0) && (
              <section className="space-y-3">
                <h2 className="text-xs uppercase tracking-[0.35em] text-gold">Seu arquivo</h2>
                {[...sealed, ...opened].map((c) => (
                  <Clue key={c.evidenceId} clue={c} />
                ))}
              </section>
            )}
          </>
        )}
      </main>

      <AnimatePresence>
        {view?.paused && view.status === "running" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 bg-navy/95 py-3 text-sm text-mist backdrop-blur">
            <Pause className="size-4 text-gold" aria-hidden /> Pausa
          </motion.div>
        )}
        {view?.moment?.kind === "haja-luz" && <HajaLuzPhone key={view.moment.startedAt} startedAt={view.moment.startedAt} myOrder={view.moment.myOrder} total={view.moment.total} />}
      </AnimatePresence>
    </div>
  )
}
