"use client"

import { LogIn, LogOut } from "lucide-react"
import { useState, type ReactNode } from "react"
import { emJogo } from "@/domain/bible-show"
import { PhoneSheet } from "@/features/presentation/PhoneDock"
import { cn } from "@/lib/utils"
import { useJogo } from "./jogo"
import { Peao } from "./Trilha"

// Quem está jogando: tirar alguém da partida (que segue com os outros) e
// trazer de volta, na mesma casa. Na sala, também o QR para entrar ou voltar.

export function Participantes({ open, onClose, convite }: { open: boolean; onClose: () => void; convite?: ReactNode }) {
  const { state, dispatch, eu, anfitriao } = useJogo()
  const [confirmar, setConfirmar] = useState<string | null>(null)
  const equipes = state.config.modo === "equipes"
  const ficam = emJogo(state).length
  const podeTirar = (id: string) => ficam > 2 && (eu === null || anfitriao || id === eu)
  const fechar = () => {
    setConfirmar(null)
    onClose()
  }
  return (
    <PhoneSheet title={equipes ? "Equipes" : "Jogadores"} open={open} onClose={fechar}>
      <div className="space-y-5">
        {convite && (
          <section className="space-y-2">
            <p className="text-center text-sm text-sand">Para entrar ou voltar à sala:</p>
            {convite}
          </section>
        )}
        <section className="space-y-2">
          <h2 className="text-xs uppercase tracking-[0.3em] text-gold">{equipes ? "Equipes na partida" : "Jogadores na partida"}</h2>
          <ul className="space-y-2">
            {state.lados.map((l) => (
              <li key={l.id} className={cn("rounded-2xl border px-3 py-2", l.fora ? "border-dashed border-border" : "border-border bg-night/60")}>
                <div className="flex items-center gap-2">
                  <Peao lado={l} className={cn("size-7 text-sm", l.fora && "opacity-40")} />
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-parchment", l.fora && "text-mist")}>
                      {l.nome}
                      {l.id === eu && <span className="text-xs text-mist"> (este celular)</span>}
                    </p>
                    <p className="text-xs text-mist">{l.fora ? `Saiu · casa ${l.casa}` : `Casa ${l.casa}`}</p>
                  </div>
                  {l.fora ? (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "voltou", id: l.id })}
                      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gold px-3 text-sm font-semibold text-night"
                    >
                      <LogIn className="size-4" aria-hidden /> Voltar
                    </button>
                  ) : (
                    podeTirar(l.id) &&
                    confirmar !== l.id && (
                      <button
                        type="button"
                        onClick={() => setConfirmar(l.id)}
                        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-sm text-mist"
                      >
                        <LogOut className="size-4" aria-hidden /> {l.id === eu ? "Sair" : "Tirar"}
                      </button>
                    )
                  )}
                </div>
                {confirmar === l.id && (
                  <div className="mt-2 space-y-2 border-t border-border pt-2">
                    <p className="text-sm text-sand">
                      {l.id === eu ? "Sair" : `Tirar ${l.nome}`} da partida? O jogo continua com {equipes ? "as outras equipes" : "os outros"}. Dá para voltar depois, na mesma casa.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setConfirmar(null)} className="h-11 rounded-full border border-border text-sm text-parchment">
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmar(null)
                          dispatch({ type: "sair", id: l.id })
                        }}
                        className="h-11 rounded-full bg-rose/80 text-sm font-semibold text-night"
                      >
                        {l.id === eu ? "Sair" : "Tirar"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {ficam <= 2 ? (
            <p className="text-xs text-mist">Com {equipes ? "2 equipes" : "2 jogadores"} na partida, ninguém pode sair. Para parar, encerrem a partida.</p>
          ) : (
            eu !== null &&
            !anfitriao && <p className="text-xs text-mist">Cada celular só tira a própria equipe. Quem criou a sala pode tirar qualquer uma.</p>
          )}
        </section>
      </div>
    </PhoneSheet>
  )
}
