"use client"

import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { CATEGORIAS, type CategoriaId } from "@/content/bible-show/cartas"
import { CORES, ESTILOS, LIMITES, SEGUNDOS, TRILHAS, type Config, type Estilo, type Modo, type ShowAction, type ShowState } from "@/domain/bible-show"
import { cn } from "@/lib/utils"
import { useBibleShow } from "@/stores/bible-show"
import { CartaSecreta, Cronometro, Fim, Passa, QuemAcertou, Resultado, Vez } from "./Telas"
import { ESTILO, ICONE } from "./Trilha"

/** Bible Show: configuração e partida (o estado fica salvo no aparelho). */
export function BibleShow() {
  const [state, dispatch] = useBibleShow()
  if (!state) return <p className="grid min-h-dvh place-items-center text-mist">Carregando…</p>
  if (state.fase === "config") return <Configurar inicial={state.config} onStart={(config) => dispatch({ type: "comecar", config })} />
  return <Partida state={state} dispatch={dispatch} />
}

const REGRAS = [
  "Na sua vez, quem vai representar vê a carta em segredo.",
  "Toque em Valendo! e faça mímica ou desenhe, sem falar e sem letras.",
  "Perguntas: todos veem a carta, menos quem adivinha. Essa pessoa faz perguntas e o grupo só responde sim ou não. Em equipes, se o tempo acabar, a equipe seguinte tenta com metade do tempo, e assim por diante.",
  "Acertou antes do tempo acabar? Anda uma casa na trilha (Desafio: duas).",
  "Em equipes, a cada cinco casas há a Rodada de todos: um de cada equipe representa a mesma carta, ao mesmo tempo.",
  "Quem chegar primeiro ao fim da trilha vence.",
]

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border px-4 text-sm transition",
        ativo ? "border-gold bg-gold/20 text-parchment" : "border-border text-mist",
      )}
    >
      {children}
    </button>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs uppercase tracking-[0.3em] text-gold">{titulo}</h2>
      {children}
    </section>
  )
}

function Configurar({ inicial, onStart }: { inicial: Config; onStart: (c: Config) => void }) {
  const [c, setC] = useState<Config>(inicial)
  const { min, max } = LIMITES[c.modo]
  const set = (patch: Partial<Config>) => setC((x) => ({ ...x, ...patch }))
  const trocarModo = (modo: Modo) => {
    if (modo === c.modo) return
    set({ modo, nomes: modo === "equipes" ? ["Equipe 1", "Equipe 2"] : ["", "", ""] })
  }
  const toggleCat = (id: CategoriaId) => {
    const on = c.categorias.includes(id)
    if (on && c.categorias.length === 1) return
    set({ categorias: on ? c.categorias.filter((x) => x !== id) : [...c.categorias, id] })
  }
  const toggleEstilo = (e: Estilo) => {
    const on = c.estilos.includes(e)
    if (on && c.estilos.length === 1) return
    set({ estilos: ESTILOS.filter((x) => (x === e ? !on : c.estilos.includes(x))) })
  }
  const base = c.modo === "equipes" ? "Equipe" : "Jogador"

  return (
    <main id="conteudo" className="mx-auto min-h-dvh max-w-lg space-y-6 px-4 pb-28 pt-6">
      <header className="flex items-center gap-3">
        <Link href="/" className="grid size-10 place-items-center rounded-full border border-border text-mist" aria-label="Voltar ao início">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="font-display text-4xl leading-none text-gold-bright">Bible Show</h1>
          <p className="text-sm text-mist">Mímica e desenho com a história da Bíblia</p>
        </div>
      </header>

      <details className="rounded-2xl border border-border bg-night/60 p-4 text-sm text-sand open:space-y-2">
        <summary className="cursor-pointer font-semibold text-parchment">Como jogar</summary>
        <ol className="list-decimal space-y-1 pl-5">
          {REGRAS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </details>

      <Bloco titulo="Modo">
        <div className="grid grid-cols-2 gap-2">
          <Chip ativo={c.modo === "equipes"} onClick={() => trocarModo("equipes")}>
            Equipes
          </Chip>
          <Chip ativo={c.modo === "individual"} onClick={() => trocarModo("individual")}>
            Cada um por si
          </Chip>
        </div>
        <p className="text-xs text-mist">{c.modo === "equipes" ? "A equipe da vez adivinha o que um dos seus representa." : "Uma pessoa representa e todos os outros tentam adivinhar."}</p>
      </Bloco>

      <Bloco titulo={c.modo === "equipes" ? `Equipes (${min} a ${max})` : `Jogadores (${min} a ${max})`}>
        <ul className="space-y-2">
          {c.nomes.map((nome, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="size-4 shrink-0 rounded-full" style={{ background: CORES[i % CORES.length] }} aria-hidden />
              <input
                value={nome}
                maxLength={20}
                onChange={(e) => set({ nomes: c.nomes.map((n, j) => (j === i ? e.target.value : n)) })}
                placeholder={`${base} ${i + 1}`}
                aria-label={`Nome: ${base} ${i + 1}`}
                className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-night/70 px-3 text-parchment focus:border-gold"
              />
              <button
                type="button"
                disabled={c.nomes.length <= min}
                onClick={() => set({ nomes: c.nomes.filter((_, j) => j !== i) })}
                className="grid size-11 place-items-center rounded-xl border border-border text-mist disabled:opacity-30"
                aria-label={`Remover ${nome || `${base} ${i + 1}`}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={c.nomes.length >= max}
          onClick={() => set({ nomes: [...c.nomes, c.modo === "equipes" ? `Equipe ${c.nomes.length + 1}` : ""] })}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-dashed border-gold/50 px-4 text-sm text-gold disabled:opacity-30"
        >
          <Plus className="size-4" /> Adicionar
        </button>
      </Bloco>

      <Bloco titulo="Tempo por vez">
        <div className="flex flex-wrap gap-2">
          {SEGUNDOS.map((s) => (
            <Chip key={s} ativo={c.segundos === s} onClick={() => set({ segundos: s })}>
              {s}s
            </Chip>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Trilha">
        <div className="flex flex-wrap gap-2">
          {TRILHAS.map((t) => (
            <Chip key={t.casas} ativo={c.casas === t.casas} onClick={() => set({ casas: t.casas })}>
              {t.nome} · {t.casas} casas
            </Chip>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Como jogar a carta">
        <div className="flex flex-wrap gap-2">
          {ESTILOS.map((e) => {
            const Icone = ESTILO[e].icone
            return (
              <Chip key={e} ativo={c.estilos.includes(e)} onClick={() => toggleEstilo(e)}>
                <Icone className="size-4" aria-hidden />
                {ESTILO[e].nome}
              </Chip>
            )
          })}
        </div>
        <ul className="space-y-1 text-xs text-mist">
          {c.estilos.length > 1 && <li>Com mais de um ligado, cada vez sorteia o jeito.</li>}
          {c.estilos.includes("desenho") && <li>Para o desenho, tenham papel e caneta (ou um quadro) à mão.</li>}
          {c.estilos.includes("perguntas") && (
            <li>
              Perguntas: quem adivinha pergunta e os outros só respondem sim ou não.
              {c.modo === "equipes" ? " Se errar, a próxima equipe tenta com metade do tempo." : ""}
            </li>
          )}
        </ul>
      </Bloco>

      <Bloco titulo="Categorias">
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIAS.map((cat) => {
            const Icone = ICONE[cat.id]
            const on = c.categorias.includes(cat.id)
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleCat(cat.id)}
                className={cn("flex min-h-14 items-center gap-2 rounded-2xl border px-3 text-left transition", on ? "text-parchment" : "border-border text-mist opacity-50")}
                style={on ? { borderColor: `${cat.cor}99`, background: `${cat.cor}1f` } : undefined}
              >
                <Icone className="size-5 shrink-0" style={{ color: cat.cor }} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{cat.nome}</span>
                  <span className="block truncate text-[0.7rem] text-mist">{cat.sub}</span>
                </span>
              </button>
            )
          })}
        </div>
      </Bloco>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-night/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <button
          type="button"
          onClick={() => onStart(c)}
          className="mx-auto flex h-14 w-full max-w-lg items-center justify-center rounded-full bg-gold text-lg font-semibold text-night active:scale-[0.98]"
        >
          Começar
        </button>
      </div>
    </main>
  )
}

/** A partida em tela fixa, como um app: só o miolo rola. */
function Partida({ state, dispatch }: { state: ShowState; dispatch: (a: ShowAction) => void }) {
  const [sair, setSair] = useState(false)
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-night">
      <div className="stage-glow pointer-events-none absolute inset-0" style={{ ["--illumination" as string]: 0.3 }} />
      <header className="relative z-10 flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="font-display text-xl text-gold-bright">Bible Show</p>
        <button type="button" onClick={() => setSair(true)} className="rounded-full border border-border px-3 py-1.5 text-xs text-mist">
          Encerrar partida
        </button>
      </header>
      <main id="conteudo" className="relative z-10 min-h-0 flex-1 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="mx-auto flex min-h-full max-w-lg flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {state.fase === "vez" && <Vez state={state} dispatch={dispatch} />}
          {state.fase === "carta" && <CartaSecreta key={state.carta?.id} state={state} dispatch={dispatch} />}
          {state.fase === "tempo" && <Cronometro state={state} dispatch={dispatch} />}
          {state.fase === "quem" && <QuemAcertou state={state} dispatch={dispatch} />}
          {state.fase === "passa" && <Passa state={state} dispatch={dispatch} />}
          {state.fase === "resultado" && <Resultado state={state} dispatch={dispatch} />}
          {state.fase === "fim" && <Fim state={state} dispatch={dispatch} />}
        </div>
      </main>
      {sair && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6" role="alertdialog" aria-label="Encerrar a partida?">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-navy p-5 text-center">
            <p className="font-display text-2xl text-parchment">Encerrar a partida?</p>
            <p className="text-sm text-mist">A trilha e os pontos desta partida serão apagados.</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSair(false)} className="h-12 rounded-full border border-border text-parchment">
                Continuar
              </button>
              <button
                type="button"
                onClick={() => {
                  setSair(false)
                  dispatch({ type: "configurar" })
                }}
                className="h-12 rounded-full bg-rose/80 font-semibold text-night"
              >
                Encerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
