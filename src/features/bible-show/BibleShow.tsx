"use client"

import { ArrowLeft, Plus, QrCode, Smartphone, Tv, Users, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, type ReactNode } from "react"
import { criarSalaShow } from "@/app/actions/show"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { CATEGORIAS, type CategoriaId } from "@/content/bible-show/cartas"
import { comoJogar } from "@/content/bible-show/como-jogar"
import { CORES, ESTILOS, LIMITES, nivelDe, NIVEIS, SEGUNDOS, SEGUNDOS_LETRAS, SEGUNDOS_PERGUNTAS, textoTempo, TRILHAS, type Config, type Estilo, type Modo } from "@/domain/bible-show"
import { cn } from "@/lib/utils"
import { useBibleShow } from "@/stores/bible-show"
import { JogoProvider, type Jogo } from "./jogo"
import { Participantes } from "./Participantes"
import { COR_ESTILO } from "./Sorteio"
import { AvisoSom, CartaSecreta, Cronometro, Fim, Letras, Passa, QuemAcertou, Resultado, Situacao, Vez } from "./Telas"
import { ESTILO, ICONE } from "./Trilha"

/** Bible Show: configuração e partida (o estado fica salvo no aparelho). */
export function BibleShow() {
  const [state, dispatch] = useBibleShow()
  const jogo = useMemo<Jogo | null>(() => (state ? { state, dispatch, agora: Date.now, eu: null, anfitriao: true } : null), [state, dispatch])
  if (!jogo) return <p className="grid min-h-dvh place-items-center text-mist">Carregando…</p>
  if (jogo.state.fase === "config") return <Configurar inicial={jogo.state.config} onStart={(config) => dispatch({ type: "comecar", config })} />
  return <Partida jogo={jogo} sair={{ rotulo: "Encerrar partida", aviso: "A trilha e os pontos desta partida serão apagados.", acao: () => dispatch({ type: "configurar" }) }} />
}

const REGRAS = [
  "Na sua vez, girem a roleta: ela decide se a carta é de mímica, perguntas ou letras.",
  "Depois, joguem o dado: ele diz quantas casas a carta vale, de 1 a 6.",
  "A categoria da carta é a da casa em que vocês estão. Na partida e nas casas especiais, ela é sorteada.",
  "Mímica: só quem representa vê a carta. Nada de falar nem fazer sons.",
  "Perguntas: todos veem a carta, menos quem adivinha. Essa pessoa faz perguntas e o grupo só responde sim ou não. Em equipes, se o tempo acabar, a equipe seguinte tenta com metade do tempo.",
  "Letras: a palavra aparece escondida para todos. Cada equipe começa a vez com o tempo do jogo e escolhe letras: se a letra estiver na palavra, aparece e o tempo ganha 10 s; se não estiver, perde 5 s. A vez só passa quando o tempo acaba ou quando a equipe arrisca e erra a palavra. Ao tocar em Arriscar, o tempo para e não tem volta. Quem abrir a última letra ou acertar a palavra anda.",
  "O tempo de cada jogo é escolhido no começo: Fácil, Normal ou Difícil, ou ajustado um a um. No Normal, mímica e letras têm 1 minuto e perguntas, 3 minutos.",
  "Acertou antes do tempo acabar? Anda as casas sorteadas (Desafio: uma a mais).",
  "Casas especiais: quem para nelas cumpre o que a casa diz, como voltar casas, ficar uma vez de fora ou reunir todo o arraial numa rodada para todos.",
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

/** Opção grande, com ícone, para a escolha principal da tela. */
function Opcao({ ativo, onClick, icone, titulo, sub, className }: { ativo: boolean; onClick: () => void; icone: ReactNode; titulo: string; sub: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-3xl border-2 p-3 text-center transition active:scale-[0.98]",
        ativo ? "border-gold bg-gold/15 text-gold-bright" : "border-border bg-night/60 text-mist",
        className,
      )}
    >
      {icone}
      <span className={cn("text-base font-semibold leading-tight", ativo ? "text-parchment" : "text-sand")}>{titulo}</span>
      <span className="text-xs leading-tight">{sub}</span>
    </button>
  )
}

/** Entrar na sala que outro celular criou. */
/** Tempo de cada jogo: um nível (Fácil, Normal, Difícil) ou ajustado um a um. */
function Tempos({ c, set }: { c: Config; set: (patch: Partial<Config>) => void }) {
  const nivel = nivelDe(c)
  const [ajustar, setAjustar] = useState(!nivel)
  const jogos: { e: Estilo; chave: "segundos" | "perguntas" | "letras"; opcoes: readonly number[]; valor: number }[] = [
    { e: "mimica", chave: "segundos", opcoes: SEGUNDOS, valor: c.segundos },
    { e: "perguntas", chave: "perguntas", opcoes: SEGUNDOS_PERGUNTAS, valor: c.perguntas ?? 180 },
    { e: "letras", chave: "letras", opcoes: SEGUNDOS_LETRAS, valor: c.letras ?? 60 },
  ]
  const ligados = jogos.filter((j) => c.estilos.includes(j.e))
  return (
    <Bloco titulo="Tempo">
      <div className="grid grid-cols-3 gap-2">
        {NIVEIS.map((n) => (
          <Chip key={n.id} ativo={nivel?.id === n.id} onClick={() => set({ segundos: n.segundos, perguntas: n.perguntas, letras: n.letras })}>
            {n.nome}
          </Chip>
        ))}
      </div>
      {ajustar ? (
        <ul className="space-y-2">
          {ligados.map(({ e, chave, opcoes, valor }) => {
            const Icone = ESTILO[e].icone
            return (
              <li key={e} className="space-y-1.5">
                <p className="inline-flex items-center gap-1.5 text-sm text-sand">
                  <Icone className="size-4" aria-hidden /> {ESTILO[e].nome}
                </p>
                <div className="flex flex-wrap gap-2">
                  {opcoes.map((s) => (
                    <Chip key={s} ativo={valor === s} onClick={() => set({ [chave]: s })}>
                      {textoTempo(s)}
                    </Chip>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-xs text-mist">
          {ligados.map(({ e, valor }) => `${ESTILO[e].nome}: ${textoTempo(valor)}`).join(" · ")}
          {" · "}
          <button type="button" onClick={() => setAjustar(true)} className="text-gold underline underline-offset-2">
            Ajustar cada jogo
          </button>
        </p>
      )}
    </Bloco>
  )
}

function EntrarNaSala() {
  const router = useRouter()
  const [codigo, setCodigo] = useState("")
  const limpo = normalizeRoomCode(codigo)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (isRoomCode(limpo)) router.push(`/bible-show/sala/${limpo}`)
      }}
      className="flex items-center gap-2 rounded-2xl border border-border bg-night/60 p-2 pl-4"
    >
      <label htmlFor="codigo-sala" className="shrink-0 text-sm leading-tight text-sand">
        Recebeu
        <br />
        um código?
      </label>
      <input
        id="codigo-sala"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="CÓDIGO"
        autoCapitalize="characters"
        autoComplete="off"
        maxLength={8}
        className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-night/70 px-3 text-center uppercase tracking-[0.2em] text-parchment focus:border-gold"
      />
      <button type="submit" disabled={!isRoomCode(limpo)} className="h-11 shrink-0 rounded-xl bg-gold px-4 text-sm font-semibold text-night disabled:opacity-40">
        Entrar
      </button>
    </form>
  )
}

function Configurar({ inicial, onStart }: { inicial: Config; onStart: (c: Config) => void }) {
  const router = useRouter()
  const [c, setC] = useState<Config>(inicial)
  const [jeito, setJeito] = useState<"celular" | "sala" | "telao">("celular")
  const sala = jeito !== "celular"
  const [criando, setCriando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const comecar = async () => {
    if (!sala) return onStart(c)
    setCriando(true)
    setErro(null)
    const r = await criarSalaShow(c)
    if ("error" in r) {
      setErro(r.error)
      setCriando(false)
      return
    }
    try {
      localStorage.setItem(`bph-show-anf-${r.code}`, "1")
      // Com telão, este celular conduz tudo.
      if (jeito === "telao") localStorage.setItem(`bph-show-eu-${r.code}`, "*")
    } catch {
      // sem armazenamento: este celular entra como os outros
    }
    router.push(`/bible-show/sala/${r.code}`)
  }
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
          <p className="text-sm text-mist">Mímica, perguntas e letras com a história da Bíblia</p>
        </div>
      </header>

      <section className="space-y-2" aria-labelledby="como-jogam">
        <h2 id="como-jogam" className="text-xs uppercase tracking-[0.3em] text-gold">
          Como vão jogar?
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Opcao ativo={jeito === "celular"} onClick={() => setJeito("celular")} icone={<Smartphone className="size-7" aria-hidden />} titulo="Um celular só" sub="Passa de mão em mão" />
          <Opcao
            ativo={jeito === "sala"}
            onClick={() => setJeito("sala")}
            icone={<QrCode className="size-7" aria-hidden />}
            titulo="Criar uma sala"
            sub={c.modo === "equipes" ? "Um celular por equipe" : "Um celular por pessoa"}
          />
        </div>
        <Opcao ativo={jeito === "telao"} onClick={() => setJeito("telao")} icone={<Tv className="size-7" aria-hidden />} titulo="No telão" sub="Projetor ou TV, e este celular conduz" className="min-h-0 w-full py-3" />
        {jeito === "telao" && (
          <p className="rounded-2xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs leading-relaxed text-sand">
            Toquem em <b className="text-parchment">Criar a sala</b>. No computador ligado ao projetor, abram Bible Show, digitem o código e escolham <b className="text-parchment">Esta tela é o telão</b>. O jogo
            aparece grande para todos, e este celular conduz (passem para quem vai representar ver a carta). Precisa de internet.
          </p>
        )}
        {jeito === "sala" && (
          <p className="rounded-2xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs leading-relaxed text-sand">
            Escolham as {c.modo === "equipes" ? "equipes" : "pessoas"} e as regras abaixo e toquem em <b className="text-parchment">Criar a sala</b>. Vai aparecer um código e um QR code para os outros
            celulares entrarem. Todos veem a trilha, a roleta e o tempo juntos. Precisa de internet.
          </p>
        )}
      </section>

      <EntrarNaSala />

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
        <p className="text-sm text-mist">
          Liguem um ou mais jeitos de jogar.{c.estilos.length > 1 ? " Com mais de um ligado, a roleta sorteia qual vale em cada vez." : ""}
        </p>
        <div className="space-y-2">
          {ESTILOS.map((e) => {
            const Icone = ESTILO[e].icone
            const on = c.estilos.includes(e)
            const cor = COR_ESTILO[e]
            const info = comoJogar(e, c.modo === "equipes")
            return (
              <section key={e} className={cn("rounded-2xl border p-3 transition", on ? "bg-night/70" : "border-border opacity-60")} style={on ? { borderColor: `${cor}99` } : undefined}>
                <button type="button" role="switch" aria-checked={on} aria-label={ESTILO[e].nome} onClick={() => toggleEstilo(e)} className="flex w-full items-center gap-3 text-left">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl" style={{ background: `${cor}26`, color: cor }}>
                    <Icone className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-parchment">{ESTILO[e].nome}</span>
                    <span className="block text-xs leading-snug text-mist">{info.resumo}</span>
                  </span>
                  <span aria-hidden className={cn("relative h-6 w-11 shrink-0 rounded-full transition", on ? "bg-gold" : "bg-white/15")}>
                    <span className={cn("absolute top-0.5 size-5 rounded-full bg-parchment shadow transition-all", on ? "left-[1.375rem]" : "left-0.5")} />
                  </span>
                </button>
                {on && (
                  <ol className="mt-3 space-y-2 border-t border-border pt-3">
                    {info.passos.map((passo, i) => (
                      <li key={i} className="flex gap-2.5 text-sm leading-snug text-sand">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold text-night" style={{ background: cor }}>
                          {i + 1}
                        </span>
                        <span>{passo}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            )
          })}
        </div>
      </Bloco>

      <Tempos c={c} set={set} />

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
        {erro && <p className="mx-auto mb-2 max-w-lg text-center text-sm text-rose">{erro}</p>}
        <button
          type="button"
          disabled={criando}
          onClick={() => void comecar()}
          className="mx-auto flex h-14 w-full max-w-lg items-center justify-center rounded-full bg-gold text-lg font-semibold text-night active:scale-[0.98] disabled:opacity-60"
        >
          {criando ? "Criando a sala…" : sala ? "Criar a sala" : "Começar"}
        </button>
      </div>
    </main>
  )
}

/** A partida em tela fixa, como um app: só o miolo rola. Serve ao celular único e à sala. */
export function Partida({ jogo, topo, convite, sair }: { jogo: Jogo; topo?: ReactNode; convite?: ReactNode; sair?: { rotulo: string; aviso: string; acao: () => void } }) {
  const [confirmar, setConfirmar] = useState(false)
  const [quem, setQuem] = useState(false)
  const { state } = jogo
  return (
    <JogoProvider value={jogo}>
      <div className="fixed inset-0 flex flex-col overflow-hidden bg-night">
        <div className="stage-glow pointer-events-none absolute inset-0" style={{ ["--illumination" as string]: 0.3 }} />
        <header className="relative z-10 flex shrink-0 items-center justify-between gap-2 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <p className="shrink-0 font-display text-xl text-gold-bright">Bible Show</p>
          <div className="flex min-w-0 items-center gap-2">
            {topo}
            {state.fase !== "fim" && (
              <button
                type="button"
                onClick={() => setQuem(true)}
                className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-mist"
                aria-label={convite ? "QR da sala e equipes" : state.config.modo === "equipes" ? "Equipes" : "Jogadores"}
              >
                {convite ? <QrCode className="size-4" /> : <Users className="size-4" />}
              </button>
            )}
            {sair && (
              <button type="button" onClick={() => setConfirmar(true)} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs text-mist">
                {sair.rotulo}
              </button>
            )}
          </div>
        </header>
        <AvisoSom />
        <Participantes open={quem} onClose={() => setQuem(false)} convite={convite} />
        <main id="conteudo" className="relative z-10 min-h-0 flex-1 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="mx-auto flex min-h-full max-w-lg flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {state.fase === "vez" && <Vez key={`${state.vez}-${state.rodada?.lider}-${state.rodada?.todos}-${state.usadas.length}`} />}
            {state.fase === "carta" && <CartaSecreta key={state.carta?.id} />}
            {state.fase === "tempo" && <Cronometro key={`${state.carta?.id}-${state.carta?.tentativa}`} />}
            {state.fase === "letras" && <Letras key={state.carta?.id} />}
            {state.fase === "quem" && <QuemAcertou />}
            {state.fase === "passa" && <Passa />}
            {state.fase === "resultado" && <Resultado />}
            {state.fase === "situacao" && <Situacao key={`${state.pendentes[0]?.situacao}-${state.pendentes[0]?.lado}`} />}
            {state.fase === "fim" && <Fim />}
          </div>
        </main>
        {confirmar && sair && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6" role="alertdialog" aria-label={`${sair.rotulo}?`}>
            <div className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-navy p-5 text-center">
              <p className="font-display text-2xl text-parchment">{sair.rotulo}?</p>
              <p className="text-sm text-mist">{sair.aviso}</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setConfirmar(false)} className="h-12 rounded-full border border-border text-parchment">
                  Continuar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmar(false)
                    sair.acao()
                  }}
                  className="h-12 rounded-full bg-rose/80 font-semibold text-night"
                >
                  {sair.rotulo.split(" ")[0]}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </JogoProvider>
  )
}
