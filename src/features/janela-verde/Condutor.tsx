"use client"

import { ChevronLeft, ChevronRight, Copy, Minus, Pause, Play, Plus, Square, Volume2, VolumeX } from "lucide-react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import {
  BARREIRAS,
  CULTURAS,
  LIMITE_MIN,
  LINGUA_INTRO,
  MARCAS,
  ORACOES,
  PERGUNTAS,
  RESPOSTAS,
  ROTEIRO,
  VISITAS,
  getDeclaracao,
  getFato,
  type Etapa,
  type VisitaId,
} from "@/content/janela-verde"
import {
  barreiraCaiu,
  cardsDaOracao,
  estadoDaEtapa,
  etapaAtual,
  itensDe,
  minutosDe,
  orcamento,
  perguntasEscolhidas,
  pessoasComprometidas,
  relogioDe,
  ritmo,
  tempoPorEtapa,
  type JanelaAction,
  type JanelaState,
} from "@/domain/janela-verde"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { cn } from "@/lib/utils"
import { useChaveJanela, useJanela } from "@/stores/janela-sala"
import { IconeMarca, Relogio, SeloMarca, mmss, useRestante } from "./comum"

// Condutor (Silas e Kézia, cada um no seu celular). Tempo fixo no topo,
// abas Palco · Panorama · Ficha do povo · Palavras.

type Aba = "palco" | "panorama" | "ficha" | "palavras"

function useAgora(agora: () => number, ms = 1000) {
  const [t, setT] = useState(() => agora())
  useEffect(() => {
    const id = setInterval(() => setT(agora()), ms)
    return () => clearInterval(id)
  }, [agora, ms])
  return t
}

const hora = (ms: number) => new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

function BarraTempo({ state, agora, agir }: { state: JanelaState; agora: () => number; agir: (a: JanelaAction) => void }) {
  const t = useAgora(agora)
  const r = ritmo(state, t)
  const alertas = useRef(new Set<number>())
  useEffect(() => {
    if (!r.comecou) return
    for (const m of [40, 45, LIMITE_MIN]) {
      if (r.totalMs >= m * 60_000 && !alertas.current.has(m)) {
        alertas.current.add(m)
        vibrate(HAPTIC.seal)
      }
    }
  }, [r.comecou, r.totalMs])
  const etapaEstourou = r.comecou && r.etapaMs > r.etapaPrevistaMs
  const quaseEstoura = r.comecou && !etapaEstourou && r.etapaPrevistaMs - r.etapaMs < 30_000
  const totalCor = r.totalMs >= LIMITE_MIN * 60_000 ? "text-rose" : r.totalMs >= 45 * 60_000 ? "text-[#f0a25a]" : "text-parchment"
  return (
    <div className="sticky top-0 z-30 border-b border-border bg-night/95 px-3 py-2 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-mist">Total</p>
          <p className={cn("font-display text-2xl leading-none tabular-nums", totalCor)}>
            {mmss(r.totalMs)} <span className="text-sm text-mist">/ {LIMITE_MIN}:00</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-mist">Esta etapa</p>
          <p className={cn("font-display text-2xl leading-none tabular-nums", etapaEstourou ? "text-rose" : quaseEstoura ? "text-[#f0a25a]" : "text-[#9fd8ad]")}>
            {mmss(r.etapaMs)} <span className="text-sm text-mist">/ {mmss(r.etapaPrevistaMs)}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-mist">Ritmo</p>
          <p className={cn("text-sm font-semibold tabular-nums", r.atrasoMs > 30_000 ? "text-rose" : r.atrasoMs < -30_000 ? "text-[#9fd8ad]" : "text-sand")}>
            {!r.comecou ? "não começou" : Math.abs(r.atrasoMs) < 30_000 ? "em dia" : r.atrasoMs > 0 ? `+${mmss(r.atrasoMs)} atrasado` : `${mmss(-r.atrasoMs)} adiantado`}
          </p>
          <p className="text-[0.7rem] text-mist">
            {r.comecou && state.inicio ? `termina ~${hora(state.inicio + r.previsaoMs)} (${Math.round(r.previsaoMs / 60_000)} min)` : `previsto ${Math.round(r.orcamentoMs / 60_000)} min`}
          </p>
        </div>
      </div>
      {r.sugestoes.length > 0 && (
        <details className="mt-2 rounded-xl border border-rose/40 bg-rose/10 px-3 py-2 text-sm" open>
          <summary className="cursor-pointer font-semibold text-rose">Para recuperar o tempo</summary>
          <ul className="mt-2 space-y-1.5">
            {r.sugestoes.slice(0, 4).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2">
                <span className="min-w-0 text-sand">
                  {s.texto} <span className="text-mist">(−{s.economiza} min)</span>
                </span>
                <button type="button" onClick={() => agir({ type: "corte", id: s.id, on: true })} className="shrink-0 rounded-full bg-rose px-3 py-1 text-xs font-semibold text-night">
                  Aplicar
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

/** Uma linha sobre o que está na tela agora. */
function resumoItem(state: JanelaState, e: Etapa): string {
  const p = state.passo
  const t = e.tela
  switch (t.tipo) {
    case "oracao": {
      const cards = cardsDaOracao(state, e)
      return barreiraCaiu(state, e) ? `A barreira cai: ${ORACOES[t.oracao].quebra}` : `${cards.length} pedidos juntos na tela. Próximo toque: a barreira cai.`
    }
    case "lingua":
      return p === 0 ? BARREIRAS[1].antes : LINGUA_INTRO[p - 1]
    case "reflexao":
      return perguntasEscolhidas(state)[p]?.texto ?? ""
    case "fatos":
      return t.fatos[p]?.map((id) => getFato(id).povo)[0] ?? ""
    case "visita":
      return ["Chegada e quem recebe", "Os 2 min de fala (liguem o relógio)", "Respostas e pistas"][p] ?? ""
    case "revelacao":
      return p === 0 ? "Pistas dos Yanomami" : "Pistas dos Sawi"
    default:
      return ""
  }
}

function Botao({ children, onClick, className, disabled }: { children: React.ReactNode; onClick: () => void; className?: string; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-border px-3 text-sm text-parchment active:scale-[0.98] disabled:opacity-40", className)}>
      {children}
    </button>
  )
}

function Palco({ state, agir, agora }: { state: JanelaState; agir: (a: JanelaAction) => void; agora: () => number }) {
  const e = etapaAtual(state)
  const n = itensDe(state, e)
  const de = { etapa: state.etapa, passo: state.passo }
  const restante = useRestante(state.relogio, agora, (prazo) => agir({ type: "tempo", prazo }))
  const ultimo = state.passo >= n - 1
  let prox = state.etapa + 1
  while (prox < ROTEIRO.length && state.puladas.includes(ROTEIRO[prox].id)) prox++
  const proxima = ROTEIRO[prox]
  const minRelogio = relogioDe(state, e)
  const visita = e.tela.tipo === "visita" ? e.tela.visita : null
  const oracao = e.tela.tipo === "oracao" ? e : null
  return (
    <div className="space-y-3 p-3">
      <section className="rounded-2xl border border-border bg-ink p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SeloMarca marca={e.marca} />
          {e.conduz && <span className="text-xs text-mist">conduz: {e.conduz}</span>}
          <span className="ml-auto text-xs text-mist">
            item {state.passo + 1} de {n}
          </span>
        </div>
        <h2 className="mt-2 font-display text-2xl leading-tight text-parchment">{e.titulo}</h2>
        {resumoItem(state, e) && <p className="mt-1 text-sm leading-snug text-sand">{resumoItem(state, e)}</p>}
        {e.nota && <p className="mt-2 rounded-xl bg-navy/60 px-3 py-2 text-xs leading-snug text-mist">{e.nota}</p>}
      </section>

      {!state.inicio && (
        <Botao onClick={() => agir({ type: "comecar", agora: agora() })} className="w-full border-gold bg-gold text-base font-semibold text-night">
          <Play className="size-4" /> Começar (liga o relógio geral)
        </Botao>
      )}

      <div className="grid grid-cols-[1fr_2fr] gap-2">
        <Botao onClick={() => agir({ type: "voltar", de, agora: agora() })} disabled={state.etapa === 0 && state.passo === 0} className="h-16">
          <ChevronLeft className="size-5" /> Voltar
        </Botao>
        <Botao
          onClick={() => agir({ type: "avancar", de, agora: agora() })}
          disabled={ultimo && !proxima}
          className="h-16 border-gold bg-gold/15 text-base font-semibold text-gold-bright"
        >
          {ultimo ? (proxima ? "Próxima etapa" : "Fim") : "Próximo item"} <ChevronRight className="size-5" />
        </Botao>
      </div>
      {ultimo && proxima && (
        <p className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm" style={{ borderColor: `${MARCAS[proxima.marca].cor}66` }}>
          <IconeMarca marca={proxima.marca} className="size-4" />
          <span className="text-mist">Próximo:</span>
          <b style={{ color: MARCAS[proxima.marca].cor }}>{MARCAS[proxima.marca].rotulo}</b>
          <span className="truncate text-sand">· {proxima.titulo}</span>
        </p>
      )}
      {!proxima && ultimo && !state.fimEm && (
        <Botao onClick={() => agir({ type: "encerrar", agora: agora() })} className="w-full">
          Encerrar e parar o relógio geral
        </Botao>
      )}

      {(minRelogio || state.relogio) && (
        <section className="flex items-center gap-3 rounded-2xl border border-border bg-ink p-3">
          <Relogio relogio={state.relogio} restante={restante} />
          <div className="flex flex-1 flex-wrap gap-2">
            {!state.relogio && minRelogio && (
              <Botao onClick={() => agir({ type: "relogio", minutos: minRelogio, agora: agora() })} className="border-sage/60 text-[#bfe3c7]">
                <Play className="size-4" /> Iniciar {minRelogio} min
              </Botao>
            )}
            {(e.tela.tipo === "conhecer" || e.tela.tipo === "encontro" || e.tela.tipo === "preparo") &&
              [1, 2, 3, 5].map((m) => (
                <Botao key={m} onClick={() => agir({ type: "relogio", minutos: m, agora: agora() })} className="min-h-9 px-2.5 text-xs">
                  {m} min
                </Botao>
              ))}
            {state.relogio?.prazo && (
              <Botao onClick={() => agir({ type: "pausar", agora: agora() })}>
                <Pause className="size-4" /> Pausar
              </Botao>
            )}
            {state.relogio && !state.relogio.prazo && state.relogio.restante > 0 && (
              <Botao onClick={() => agir({ type: "continuar", agora: agora() })}>
                <Play className="size-4" /> Continuar
              </Botao>
            )}
            {state.relogio && (
              <Botao onClick={() => agir({ type: "parar" })}>
                <Square className="size-4" /> Tirar
              </Botao>
            )}
          </div>
        </section>
      )}

      {oracao && (
        <section className="rounded-2xl border border-border bg-ink p-3 text-sm">
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gold">Oramos</p>
          {cardsDaOracao(state, oracao).map((c) => (
            <p key={c.id} className="flex justify-between gap-2 text-parchment">
              <span className="truncate">{c.pedido}</span>
              <span className="shrink-0">
                {(["auren", "nair"] as const).map((g) => (state.oracoes[oracao.id]?.[c.id]?.includes(g) ? `✓${CULTURAS[g].nome[0]} ` : "· "))}
              </span>
            </p>
          ))}
        </section>
      )}

      {e.tela.tipo === "reflexao" && (
        <section className="rounded-2xl border border-border bg-ink p-3">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">Perguntas que vão para o telão</p>
          <ul className="space-y-2">
            {PERGUNTAS.map((q) => {
              const on = state.perguntas.includes(q.id)
              return (
                <li key={q.id}>
                  <label className="flex gap-2 text-sm leading-snug">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => agir({ type: "perguntas", ids: on ? state.perguntas.filter((x) => x !== q.id) : [...state.perguntas, q.id] })}
                      className="mt-1 size-4 shrink-0 accent-[#d8a948]"
                    />
                    <span className={on ? "text-parchment" : "text-mist"}>{q.texto}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {visita && <Recebe state={state} agir={agir} visita={visita} />}

      {e.tela.tipo === "encontro" && (
        <p className="rounded-2xl border border-border bg-ink p-3 text-sm text-sand">
          Objeto compartilhado: {(["auren", "nair"] as const).map((g) => `${CULTURAS[g].nome} ${state.compartilhou.includes(g) ? "✓" : "—"}`).join(" · ")}
        </p>
      )}
      {e.tela.tipo === "compromisso" && <p className="rounded-2xl border border-border bg-ink p-3 text-sm text-sand">{pessoasComprometidas(state)} compromissos marcados.</p>}

      <Som state={state} agir={agir} />
      <Sala state={state} agir={agir} agora={agora} />
      <p className="text-center text-xs text-mist">
        Grupos: {(["auren", "nair"] as const).map((g) => `${CULTURAS[g].nome} ${state.conectados[g] ? "✓" : "—"}`).join(" · ")} · {state.palavras.length} palavras recebidas
      </p>
    </div>
  )
}

function Recebe({ state, agir, visita }: { state: JanelaState; agir: (a: JanelaAction) => void; visita: VisitaId }) {
  const v = VISITAS[visita]
  const usadas = state.pistas[visita] ?? []
  const resposta = state.respostas[visita]
  return (
    <section className="space-y-2 rounded-2xl border border-gold/40 bg-ink p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Quem recebe os {v.povo}</p>
      <div className="flex gap-2">
        {["Silas", "Kézia"].map((q) => (
          <Botao key={q} onClick={() => agir({ type: "recebe", visita, quem: q })} className={cn("flex-1", state.recebe[visita] === q && "border-gold bg-gold/15 text-gold-bright")}>
            {q}
          </Botao>
        ))}
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Pistas que usaram</p>
      {v.pistas.map((p) => (
        <label key={p.id} className="flex gap-2 text-sm">
          <input type="checkbox" checked={usadas.includes(p.id)} onChange={() => agir({ type: "pista", visita, id: p.id, usada: !usadas.includes(p.id) })} className="mt-0.5 size-4 accent-[#7fae8b]" />
          <span className="text-parchment">{p.rotulo}</span>
        </label>
      ))}
      <p className="text-sm text-sand">Resposta do outro grupo: {resposta ? RESPOSTAS.find((r) => r.id === resposta)?.rotulo : "—"}</p>
    </section>
  )
}

function Sala({ state, agir, agora }: { state: JanelaState; agir: (a: JanelaAction) => void; agora: () => number }) {
  const router = useRouter()
  const fim = ROTEIRO.findIndex((e) => e.id === "fim")
  return (
    <section className="space-y-2 rounded-2xl border border-border bg-ink p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Sala</p>
      <div className="grid grid-cols-2 gap-2">
        <Botao
          onClick={() => {
            if (!window.confirm("Encerrar agora? O telão vai para o encerramento e o relógio geral para.")) return
            if (state.etapa !== fim) agir({ type: "ir", etapa: fim, agora: agora() })
            agir({ type: "encerrar", agora: agora() })
          }}
        >
          <Square className="size-4" /> Encerrar agora
        </Botao>
        <Botao
          onClick={() => {
            if (!window.confirm("Reiniciar do começo? Apaga as orações marcadas, as palavras recebidas e os compromissos desta sala. Copie as palavras antes, se quiser guardar.")) return
            agir({ type: "reiniciar", agora: agora() })
          }}
          className="border-rose/50 text-rose"
        >
          Reiniciar do começo
        </Botao>
      </div>
      <Botao onClick={() => router.push("/janela-verde")} className="w-full">
        Sair deste celular
      </Botao>
      <p className="text-xs text-mist">Sair não apaga nada: o telão continua onde está.</p>
    </section>
  )
}

function Som({ state, agir }: { state: JanelaState; agir: (a: JanelaAction) => void }) {
  const v = state.som.volume
  return (
    <section className="flex items-center gap-2 rounded-2xl border border-border bg-ink p-3">
      <span className="text-sm text-mist">Floresta</span>
      <Botao onClick={() => agir({ type: "som", volume: Math.round((v - 0.1) * 10) / 10 })} className="min-h-9 px-2.5">
        <Minus className="size-4" />
      </Botao>
      <span className="w-10 text-center text-sm tabular-nums text-parchment">{Math.round(v * 100)}%</span>
      <Botao onClick={() => agir({ type: "som", volume: Math.round((v + 0.1) * 10) / 10 })} className="min-h-9 px-2.5">
        <Plus className="size-4" />
      </Botao>
      <Botao onClick={() => agir({ type: "som", mudo: !state.som.mudo })} className={cn("ml-auto", state.som.mudo && "border-rose text-rose")}>
        {state.som.mudo ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />} {state.som.mudo ? "Mudo" : "Som"}
      </Botao>
    </section>
  )
}

function Panorama({ state, agir, agora }: { state: JanelaState; agir: (a: JanelaAction) => void; agora: () => number }) {
  const t = useAgora(agora, 5000)
  const real = tempoPorEtapa(state, t)
  return (
    <div className="space-y-3 p-3">
      <p className="text-sm text-mist">
        Previsto agora: <b className="text-parchment">{orcamento(state)} min</b> (limite {LIMITE_MIN}). Toque em <b>Ir</b> para pular direto, ou em <b>Pular</b> para tirar a etapa.
      </p>
      {[0, 1, 2, 3, 4].map((bloco) => (
        <section key={bloco} className="rounded-2xl border border-border bg-ink">
          <h3 className="border-b border-border px-3 py-2 text-xs uppercase tracking-[0.2em] text-gold">{bloco === 0 ? "Abertura" : `Barreira ${bloco}: ${BARREIRAS[bloco - 1].nome}`}</h3>
          <ul>
            {ROTEIRO.map((e, i) => ({ e, i }))
              .filter(({ e }) => e.bloco === bloco)
              .map(({ e, i }) => {
                const st = estadoDaEtapa(state, i)
                return (
                  <li key={e.id} className={cn("border-b border-border/60 px-3 py-2 last:border-0", st === "atual" && "bg-gold/10")}>
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-center text-sm">{st === "feita" ? "✓" : st === "atual" ? "▶" : st === "pulada" ? "⤼" : "○"}</span>
                      <IconeMarca marca={e.marca} className="size-4 shrink-0" />
                      <span className={cn("min-w-0 flex-1 truncate text-sm", st === "pulada" ? "text-mist line-through" : st === "feita" ? "text-mist" : "text-parchment")}>{e.titulo}</span>
                      <span className="shrink-0 text-xs tabular-nums text-mist">
                        {real[e.id] ? `${mmss(real[e.id])} / ` : ""}
                        {minutosDe(state, e)} min
                      </span>
                    </div>
                    {st !== "atual" && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5 pl-6">
                        {st !== "pulada" && (
                          <button type="button" onClick={() => agir({ type: "ir", etapa: i, agora: agora() })} className="rounded-full border border-border px-2.5 py-1 text-xs text-sand">
                            Ir
                          </button>
                        )}
                        {st !== "feita" && (
                          <button type="button" onClick={() => agir({ type: "pular", etapa: e.id, on: st !== "pulada" })} className="rounded-full border border-border px-2.5 py-1 text-xs text-sand">
                            {st === "pulada" ? "Incluir de novo" : "Pular"}
                          </button>
                        )}
                        {(e.cortes ?? []).map((c) => {
                          const on = state.cortes.includes(c.id)
                          return (
                            <button key={c.id} type="button" onClick={() => agir({ type: "corte", id: c.id, on: !on })} className={cn("rounded-full border px-2.5 py-1 text-xs", on ? "border-rose/60 text-rose" : "border-border text-mist")}>
                              {on ? "✓ " : ""}
                              {c.texto} (−{c.economiza})
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </li>
                )
              })}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Ficha({ state, agir }: { state: JanelaState; agir: (a: JanelaAction) => void }) {
  const [qual, setQual] = useState<VisitaId>("yanomami")
  const v = VISITAS[qual]
  return (
    <div className="space-y-3 p-3">
      <div className="flex gap-2">
        {(["yanomami", "sawi"] as const).map((id) => (
          <Botao key={id} onClick={() => setQual(id)} className={cn("flex-1", qual === id && "border-gold bg-gold/15 text-gold-bright")}>
            {VISITAS[id].povo}
          </Botao>
        ))}
      </div>
      <p className="text-sm text-sand">
        {v.quando}. Visitantes: Grupo {CULTURAS[v.visitante].nome}. Chefe: {v.lider}, {v.lugar}.
      </p>
      <Recebe state={state} agir={agir} visita={qual} />
      <section className="rounded-2xl border border-border bg-ink p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">Como reagir (só se travarem)</p>
        {v.reacoes.map((r) => (
          <p key={r.se} className="mb-2 text-sm leading-snug">
            <span className="text-mist">{r.se}: </span>
            <b className="text-parchment">&ldquo;{r.diga}&rdquo;</b>
          </p>
        ))}
      </section>
      <section className="rounded-2xl border border-border bg-ink p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">Estudo do povo (◆ = pista)</p>
        <ul className="space-y-2 text-sm leading-snug">
          {v.estudo.map((item, i) => {
            const texto = item.fato ? getFato(item.fato).texto : `“${getDeclaracao(item.declaracao!).texto}”`
            const pista = v.pistas.find((p) => p.id === item.pista)
            return (
              <li key={i} className={pista ? "text-gold-bright" : "text-sand"}>
                {pista ? "◆ " : ""}
                {texto}
                {pista && <span className="block text-xs text-mist">→ {pista.revelacao}</span>}
              </li>
            )
          })}
        </ul>
      </section>
      <section className="rounded-2xl border border-border bg-ink p-3 text-sm">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">Mensagens do grupo</p>
        {v.mensagens.map((m) => (
          <p key={m.id} className="mb-2 text-sand">
            {m.texto}
            {!m.completo && " …"}
          </p>
        ))}
      </section>
    </div>
  )
}

function textoDasPalavras(state: JanelaState): string {
  const linhas = ["Janela Verde · Palavras recebidas", ""]
  for (const e of ROTEIRO) {
    const lista = state.palavras.filter((p) => p.etapa === e.id)
    if (!lista.length) continue
    linhas.push(`## ${e.titulo}`)
    for (const p of lista) {
      const card = e.tela.tipo === "oracao" ? ORACOES[e.tela.oracao].cards.find((c) => c.id === p.card)?.pedido : undefined
      linhas.push(`- (${CULTURAS[p.grupo].nome}, ${hora(p.em)}${card ? ` · ${card}` : ""}) ${p.texto}`)
    }
    linhas.push("")
  }
  return linhas.join("\n")
}

function Palavras({ state, agir }: { state: JanelaState; agir: (a: JanelaAction) => void }) {
  const [copiou, setCopiou] = useState(false)
  const copiar = async () => {
    const texto = textoDasPalavras(state)
    try {
      if (navigator.share) await navigator.share({ title: "Palavras recebidas", text: texto })
      else {
        await navigator.clipboard.writeText(texto)
        setCopiou(true)
        setTimeout(() => setCopiou(false), 2500)
      }
    } catch {
      // cancelado
    }
  }
  const lista = [...state.palavras].reverse()
  return (
    <div className="space-y-3 p-3">
      <Botao onClick={() => void copiar()} className="w-full border-gold/50 text-gold-bright" disabled={!lista.length}>
        <Copy className="size-4" /> {copiou ? "Copiado" : "Copiar / compartilhar todas"}
      </Botao>
      <p className="text-xs text-mist">A sala apaga em 24 h: copiem hoje.</p>
      {!lista.length && <p className="text-sm text-mist">Nenhuma palavra ainda.</p>}
      {lista.map((p) => {
        const e = ROTEIRO.find((x) => x.id === p.etapa)
        const card = e?.tela.tipo === "oracao" ? ORACOES[e.tela.oracao].cards.find((c) => c.id === p.card)?.pedido : undefined
        const noTelao = state.noTelao === p.id
        return (
          <article key={p.id} className={cn("rounded-2xl border bg-ink p-3", noTelao ? "border-gold" : "border-border")}>
            <p className="text-xs text-mist">
              Grupo {CULTURAS[p.grupo].nome} · {hora(p.em)} · {e?.titulo}
              {card ? ` · ${card}` : ""}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-parchment">{p.texto}</p>
            <button type="button" onClick={() => agir({ type: "mostrarPalavra", id: noTelao ? null : p.id })} className={cn("mt-2 rounded-full border px-3 py-1 text-xs", noTelao ? "border-gold text-gold-bright" : "border-border text-sand")}>
              {noTelao ? "Tirar do telão" : "Mostrar no telão"}
            </button>
          </article>
        )
      })}
    </div>
  )
}

const urlAtual = () => `${window.location.origin}${window.location.pathname}`

export function CondutorJanela({ code }: { code: string }) {
  const [chave, setChave] = useChaveJanela(code)
  const { state, agir, agora, erro, online } = useJanela(code, chave)
  const [aba, setAba] = useState<Aba>("palco")
  const [parear, setParear] = useState(false)
  const url = useSyncExternalStore(() => () => {}, urlAtual, () => "")

  // A chave chega pelo QR (no # da URL) e fica guardada neste celular.
  useEffect(() => {
    const h = window.location.hash.slice(1)
    if (h) {
      setChave(decodeURIComponent(h))
      history.replaceState(null, "", window.location.pathname)
    }
  }, [setChave])

  if (!chave)
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <p className="max-w-xs text-mist">Para conduzir, leia o QR do condutor no computador do telão (tecla C).</p>
      </main>
    )
  if (!state)
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <p className="text-mist">{erro ?? "Entrando na sala…"}</p>
      </main>
    )

  const ABAS: { id: Aba; nome: string }[] = [
    { id: "palco", nome: "Palco" },
    { id: "panorama", nome: "Panorama" },
    { id: "ficha", nome: "Ficha do povo" },
    { id: "palavras", nome: `Palavras${state.palavras.length ? ` (${state.palavras.length})` : ""}` },
  ]
  return (
    <div className="min-h-dvh bg-night pb-24 text-parchment">
      <BarraTempo state={state} agora={agora} agir={agir} />
      {erro && <p className="mx-3 mt-2 rounded-xl bg-rose/15 px-3 py-2 text-sm text-rose">{erro}</p>}
      {!online && <p className="mx-3 mt-2 text-xs text-mist">Sem conexão em tempo real: atualizando a cada 3 s.</p>}
      {aba === "palco" && <Palco state={state} agir={agir} agora={agora} />}
      {aba === "panorama" && <Panorama state={state} agir={agir} agora={agora} />}
      {aba === "ficha" && <Ficha state={state} agir={agir} />}
      {aba === "palavras" && <Palavras state={state} agir={agir} />}
      <div className="px-3 pb-3">
        <button type="button" onClick={() => setParear((x) => !x)} className="text-xs text-mist underline">
          {parear ? "Esconder o QR" : "Passar o controle para outro celular (QR)"}
        </button>
        {parear && url && (
          <div className="mt-2 inline-block rounded-2xl bg-parchment p-3">
            <QRCodeSVG value={`${url}#${encodeURIComponent(chave)}`} size={200} bgColor="#f1e8d6" fgColor="#05070d" />
          </div>
        )}
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-night/95 backdrop-blur">
        {ABAS.map((a) => (
          <button key={a.id} type="button" onClick={() => setAba(a.id)} className={cn("min-h-14 px-1 text-xs", aba === a.id ? "text-gold-bright" : "text-mist")}>
            {a.nome}
          </button>
        ))}
      </nav>
    </div>
  )
}
