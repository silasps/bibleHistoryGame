"use client"

import { Check, Eye, Hand, Pause, Play, RotateCcw, Shuffle, Trophy, X } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { getCarta } from "@/content/bible-show/cartas"
import { formatRef } from "@/content/refs"
import { classificacao, proximaCasa, segundosDaVez, tentando, type ShowAction, type ShowState } from "@/domain/bible-show"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"
import { cn } from "@/lib/utils"
import { casaInfo, CategoriaTag, ESTILO, Peao, Placar, TODOS, Trilha } from "./Trilha"

type Dispatch = (a: ShowAction) => void
type RefArg = Parameters<typeof formatRef>[0]

const BIG = "flex h-14 w-full items-center justify-center gap-2 rounded-full text-lg font-semibold transition active:scale-[0.98] disabled:opacity-40"

/** Vez: a trilha, quem joga e a casa que vale. */
export function Vez({ state, dispatch }: { state: ShowState; dispatch: Dispatch }) {
  const lado = state.lados[state.vez]
  const casa = proximaCasa(state)!
  const info = casaInfo(casa)
  const Icone = info.icone
  const equipes = state.config.modo === "equipes"
  const { estilos } = state.config
  const instrucao =
    casa.tipo === "todos"
      ? "Um representante de cada equipe vê a mesma carta. A equipe que acertar primeiro anda."
      : estilos.length > 1 && estilos.includes("perguntas")
        ? "Mímica, desenho ou perguntas: o jeito de jogar é sorteado com a carta."
        : estilos[0] === "perguntas"
          ? equipes
            ? "Cada equipe escolhe quem vai adivinhar. Essas pessoas não veem a carta."
            : `${lado.nome} adivinha fazendo perguntas. Os outros veem a carta.`
          : equipes
            ? "Escolham quem vai representar. Só essa pessoa vê a carta."
            : `${lado.nome} representa. Quem acertar anda junto.`
  return (
    <div className="flex min-h-full flex-col gap-3">
      <Placar state={state} />
      <Trilha state={state} />
      <section className="mt-auto space-y-3 rounded-3xl border border-gold/30 bg-night/80 p-4">
        <div className="flex items-center gap-3">
          <Peao lado={lado} className="size-9 text-base" />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-mist">Vez de</p>
            <p className="truncate font-display text-2xl leading-tight text-parchment">{lado.nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border p-3" style={{ borderColor: `${info.cor}80`, background: `${info.cor}1a` }}>
          <Icone className="size-7 shrink-0" style={{ color: info.cor }} aria-hidden />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-parchment">
              Casa {Math.min(lado.casa + 1, state.config.casas)}: {info.nome}
            </p>
            <p className="text-mist">{instrucao}</p>
          </div>
        </div>
        <button type="button" onClick={() => dispatch({ type: "sortear", r1: Math.random(), r2: Math.random() })} className={cn(BIG, "bg-gold text-night")}>
          <Eye className="size-5" aria-hidden /> Ver a carta
        </button>
      </section>
    </div>
  )
}

/** A carta: só quem representa vê, segurando o dedo. */
export function CartaSecreta({ state, dispatch }: { state: ShowState; dispatch: Dispatch }) {
  const fx = useFx()
  const stinger = useStinger()
  const [aberta, setAberta] = useState(false)
  const [viu, setViu] = useState(false)
  const carta = getCarta(state.carta!.id)!
  const cor = casaInfo({ tipo: "categoria", categoria: carta.categoria }).cor
  const estilo = ESTILO[state.carta!.estilo]
  const EstiloIcone = estilo.icone
  const perguntas = state.carta!.estilo === "perguntas"
  const quemOlha = state.carta!.todos
    ? `${TODOS.nome}: um representante de cada equipe olha junto.`
    : perguntas
      ? state.config.modo === "equipes"
        ? "Quem vai adivinhar, de cada equipe, não olha. Todos os outros veem a carta."
        : `${state.lados[state.vez].nome} vai adivinhar e não olha. Os outros veem a carta.`
      : "Só quem vai representar pode olhar."
  const mostrar = (v: boolean) => {
    setAberta(v)
    if (v) {
      setViu(true)
      vibrate(HAPTIC.tap)
    }
  }
  return (
    <div className="flex min-h-full flex-col items-center gap-3 text-center">
      <p className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 font-semibold text-gold-bright">
        <EstiloIcone className="size-4" aria-hidden /> {estilo.nome}
      </p>
      <p className="text-sm text-mist">{quemOlha}</p>
      <button
        type="button"
        onPointerDown={() => mostrar(true)}
        onPointerUp={() => mostrar(false)}
        onPointerLeave={() => mostrar(false)}
        onPointerCancel={() => mostrar(false)}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && mostrar(true)}
        onKeyUp={() => mostrar(false)}
        onContextMenu={(e) => e.preventDefault()}
        className="relative aspect-[3/4] w-full max-w-xs touch-none select-none [perspective:1200px] [-webkit-touch-callout:none]"
        aria-label="Segure para ver a carta"
      >
        <motion.div className="absolute inset-0 [transform-style:preserve-3d]" animate={{ rotateY: aberta ? 180 : 0 }} transition={{ duration: fx.motion ? 0.35 : 0 }}>
          {/* Verso */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-gold/50 bg-[radial-gradient(circle_at_50%_35%,rgba(216,169,72,0.3),transparent_60%),var(--night)] [backface-visibility:hidden]">
            <p className="font-display text-4xl text-gold-bright">Bible Show</p>
            <Hand className="size-10 text-gold" aria-hidden />
            <p className="text-sm text-sand">Segure para ver · solte para esconder</p>
          </div>
          {/* Frente */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-between rounded-3xl border-2 p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ borderColor: cor, background: `linear-gradient(170deg, ${cor}40, #0b0f19 55%)` }}
          >
            <CategoriaTag id={carta.categoria} className="bg-night/70" />
            <p className="font-display text-4xl leading-tight text-parchment [overflow-wrap:anywhere]">{carta.palavra}</p>
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full bg-night/80 px-3 py-1.5 text-sm font-semibold text-gold-bright">
                <EstiloIcone className="size-4" aria-hidden /> {estilo.nome}
              </p>
              <p className="text-xs text-mist">{estilo.regra}</p>
              <p className="text-xs text-sand">
                {formatRef(carta.ref as RefArg, "long")}
                {carta.categoria === "desafio" ? " · vale 2 casas" : ""}
              </p>
            </div>
          </div>
        </motion.div>
      </button>
      <div className="mt-auto grid w-full max-w-md gap-2">
        <button
          type="button"
          disabled={!viu}
          onClick={() => {
            stinger("vote")
            dispatch({ type: "valendo", agora: Date.now() })
          }}
          className={cn(BIG, "bg-gold text-night")}
        >
          <Play className="size-5 fill-current" aria-hidden /> Valendo! ({segundosDaVez(state)}s)
        </button>
        <button
          type="button"
          disabled={state.carta!.trocou}
          onClick={() => {
            setViu(false)
            dispatch({ type: "trocar", r: Math.random() })
          }}
          className={cn(BIG, "h-12 border border-border text-base text-parchment")}
        >
          <Shuffle className="size-4" aria-hidden /> {state.carta!.trocou ? "Carta já trocada" : "Trocar a carta (1 vez)"}
        </button>
      </div>
    </div>
  )
}

/** Cronômetro grande: o grupo vê o tempo, nunca a palavra. */
export function Cronometro({ state, dispatch }: { state: ShowState; dispatch: Dispatch }) {
  const stinger = useStinger()
  const fx = useFx()
  const total = segundosDaVez(state) * 1000
  const relogio = state.relogio
  const [restante, setRestante] = useState(relogio?.restante ?? total)
  const fim = useRef(false)
  const ultimoSeg = useRef<number | null>(null)
  const [espiar, setEspiar] = useState(false)

  useEffect(() => {
    const tick = () => {
      const ms = relogio?.prazo ? Math.max(0, relogio.prazo - Date.now()) : (relogio?.restante ?? total)
      setRestante(ms)
      const seg = Math.ceil(ms / 1000)
      if (relogio?.prazo && seg !== ultimoSeg.current) {
        ultimoSeg.current = seg
        if (seg <= 5 && seg > 0) stinger("tap", 1 - seg / 6)
      }
      if (relogio?.prazo && ms <= 0 && !fim.current && state.fase === "tempo") {
        fim.current = true
        stinger("buzzer")
        vibrate(HAPTIC.seal)
        dispatch({ type: "errou" })
      }
    }
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [relogio, total, dispatch, stinger, state.fase])

  const seg = Math.ceil(restante / 1000)
  const frac = restante / total
  const urgente = seg <= 10
  const correndo = !!relogio?.prazo
  const carta = getCarta(state.carta!.id)!
  const estilo = ESTILO[state.carta!.estilo]
  const EstiloIcone = estilo.icone
  const perguntas = state.carta!.estilo === "perguntas"
  const quem = tentando(state)
  const passa = perguntas && state.config.modo === "equipes" && state.carta!.tentativa + 1 < state.lados.length
  const R = 46
  const C = 2 * Math.PI * R

  return (
    <div className="flex min-h-full flex-col items-center gap-4 text-center">
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <CategoriaTag id={carta.categoria} />
        <div className="flex flex-col items-start gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1 text-gold-bright">
            <EstiloIcone className="size-3.5" aria-hidden /> {estilo.nome}
          </span>
          {state.carta!.todos && <span className="rounded-full border border-parchment/40 px-3 py-1 text-parchment">{TODOS.nome}</span>}
          {perguntas && (
            <span className="inline-flex max-w-40 items-center gap-1.5 text-sand">
              <Peao lado={quem} className="size-4 text-[0.5rem]" />
              <span className="truncate">{quem.nome} pergunta</span>
            </span>
          )}
        </div>
      </div>

      <div className="relative aspect-square w-full max-w-[min(80vw,52dvh)]" role="timer" aria-live="off" aria-label={`${seg} segundos`}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={urgente ? "#e0736b" : "#d8a948"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - frac)}
            className="transition-[stroke-dashoffset] duration-100 ease-linear"
          />
        </svg>
        <motion.div
          className="absolute inset-0 grid place-items-center"
          animate={fx.motion && urgente && correndo ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div>
            <p className={cn("font-display text-[min(30vw,20dvh)] leading-none tabular-nums", urgente ? "text-[#ff9f80]" : "text-parchment")}>{seg}</p>
            {!correndo && state.fase === "tempo" && <p className="text-sm uppercase tracking-[0.3em] text-mist">Pausado</p>}
          </div>
        </motion.div>
      </div>

      <div className="mt-auto grid w-full max-w-md gap-2">
        <button
          type="button"
          onClick={() => {
            stinger("reveal")
            vibrate(HAPTIC.light)
            dispatch({ type: "acertaram", agora: Date.now() })
          }}
          className={cn(BIG, "h-16 bg-[#6fbf73] text-xl text-night")}
        >
          <Check className="size-6" aria-hidden /> {perguntas ? "Acertou!" : "Acertaram!"}
        </button>
        <div className={cn("grid gap-2", perguntas ? "grid-cols-2" : "grid-cols-3")}>
          <button
            type="button"
            onClick={() => dispatch(correndo ? { type: "pausar", agora: Date.now() } : { type: "continuar", agora: Date.now() })}
            className={cn(BIG, "h-12 border border-border text-sm text-parchment")}
          >
            {correndo ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />} {correndo ? "Pausar" : "Seguir"}
          </button>
          {!perguntas && (
            <button
              type="button"
              onPointerDown={() => setEspiar(true)}
              onPointerUp={() => setEspiar(false)}
              onPointerLeave={() => setEspiar(false)}
              onPointerCancel={() => setEspiar(false)}
              onContextMenu={(e) => e.preventDefault()}
              className={cn(BIG, "h-12 touch-none select-none border border-border text-sm text-parchment")}
              aria-label="Segure para rever a palavra"
            >
              <Eye className="size-4" aria-hidden /> {espiar ? carta.palavra : "Rever"}
            </button>
          )}
          <button type="button" onClick={() => dispatch({ type: "errou" })} className={cn(BIG, "h-12 border border-rose/40 text-sm text-rose")}>
            <X className="size-4" aria-hidden /> {passa ? "Passar" : "Desistir"}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Quem acertou? (individual: a pessoa; rodada de todos: a equipe). */
export function QuemAcertou({ state, dispatch }: { state: ShowState; dispatch: Dispatch }) {
  const ator = state.lados[state.vez]
  const individual = state.config.modo === "individual"
  const opcoes = individual ? state.lados.filter((l) => l.id !== ator.id) : state.lados
  return (
    <div className="flex min-h-full flex-col gap-4">
      <div className="text-center">
        <p className="font-display text-3xl text-parchment">{individual ? "Quem acertou?" : "Qual equipe acertou primeiro?"}</p>
        {individual && <p className="mt-1 text-sm text-mist">{ator.nome} e quem acertou andam juntos.</p>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {opcoes.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => dispatch({ type: "acertou", por: l.id })}
            className="flex min-h-14 items-center gap-2 rounded-2xl border border-border bg-night/70 px-3 text-left text-parchment active:scale-[0.98]"
          >
            <Peao lado={l} className="size-7 text-sm" />
            <span className="min-w-0 truncate">{l.nome}</span>
          </button>
        ))}
      </div>
      <div className="mt-auto grid gap-2">
        {!individual && (
          <button type="button" onClick={() => dispatch({ type: "errou" })} className={cn(BIG, "h-12 border border-border text-base text-parchment")}>
            Ninguém acertou
          </button>
        )}
        <button type="button" onClick={() => dispatch({ type: "voltar", agora: Date.now() })} className={cn(BIG, "h-12 text-base text-mist")}>
          <RotateCcw className="size-4" aria-hidden /> Voltar ao tempo
        </button>
      </div>
    </div>
  )
}

/** Perguntas em equipes: ninguém acertou ainda e a próxima equipe tenta com menos tempo. */
export function Passa({ state, dispatch }: { state: ShowState; dispatch: Dispatch }) {
  const stinger = useStinger()
  const quem = tentando(state)
  const n = state.lados.length
  const antes = state.lados[(state.vez + state.carta!.tentativa - 1 + n) % n]
  const carta = getCarta(state.carta!.id)!
  return (
    <div className="flex min-h-full flex-col items-center gap-4 text-center">
      <div>
        <p className="font-display text-4xl text-[#ff9f80]">Tempo!</p>
        <p className="mt-1 text-sm text-mist">{antes.nome} não acertou. A carta continua em segredo.</p>
      </div>
      <CategoriaTag id={carta.categoria} />
      <section className="w-full max-w-md space-y-3 rounded-3xl border border-gold/30 bg-night/80 p-4 text-left">
        <div className="flex items-center gap-3">
          <Peao lado={quem} className="size-9 text-base" />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-mist">Agora tenta</p>
            <p className="truncate font-display text-2xl leading-tight text-parchment">{quem.nome}</p>
          </div>
        </div>
        <p className="text-sm text-sand">Quem adivinha pela {quem.nome} pode usar as respostas que já ouviu. O tempo agora é menor.</p>
      </section>
      <button
        type="button"
        onClick={() => {
          stinger("vote")
          dispatch({ type: "valendo", agora: Date.now() })
        }}
        className={cn(BIG, "mt-auto max-w-md bg-gold text-night")}
      >
        <Play className="size-5 fill-current" aria-hidden /> Valendo! ({segundosDaVez(state)}s)
      </button>
    </div>
  )
}

/** Resultado da vez: a palavra, quem andou e a trilha. */
export function Resultado({ state, dispatch }: { state: ShowState; dispatch: Dispatch }) {
  const ultima = state.ultima!
  const carta = getCarta(ultima.cartaId)!
  const acertou = ultima.tipo === "acerto"
  const proximo = state.lados[(state.vez + 1) % state.lados.length]
  const nome = (id: string) => state.lados.find((l) => l.id === id)?.nome ?? ""
  return (
    <div className="flex min-h-full flex-col gap-3">
      <div className="text-center">
        <p className={cn("font-display text-4xl", acertou ? "text-[#8fdc93]" : "text-[#ff9f80]")}>{acertou ? "Acertou!" : "Tempo!"}</p>
        <p className="mt-1 text-sm text-mist">A palavra era</p>
        <p className="font-display text-3xl leading-tight text-parchment">{carta.palavra}</p>
        <p className="text-xs text-sand">{formatRef(carta.ref as RefArg, "long")}</p>
        {acertou && (
          <ul className="mt-2 space-y-0.5 text-sm text-gold-bright">
            {ultima.moveu.map((m) => (
              <li key={m.id}>
                {nome(m.id)} anda para a casa {m.para}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Trilha state={state} destaque="resultado" />
      <button type="button" onClick={() => dispatch({ type: "proxima" })} className={cn(BIG, "mt-auto bg-gold text-night")}>
        Vez de {proximo.nome} →
      </button>
    </div>
  )
}

/** Fim: quem chegou primeiro e a classificação. */
export function Fim({ state, dispatch }: { state: ShowState; dispatch: Dispatch }) {
  const fx = useFx()
  const stinger = useStinger()
  const vencedor = state.lados.find((l) => l.id === state.vencedor)!
  const ranking = classificacao(state.lados)
  useEffect(() => {
    stinger("reveal")
    vibrate(HAPTIC.seal)
  }, [stinger])
  return (
    <div className="flex min-h-full flex-col items-center gap-5 text-center">
      <motion.div initial={fx.motion ? { scale: 0.5, rotate: -10, opacity: 0 } : false} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 12 }}>
        <Trophy className="mx-auto size-20 text-gold-bright drop-shadow-[0_0_30px_rgba(244,210,122,0.6)]" aria-hidden />
      </motion.div>
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Chegou primeiro</p>
        <p className="font-display text-4xl leading-tight" style={{ color: vencedor.cor }}>
          {vencedor.nome}
        </p>
      </div>
      <ol className="w-full max-w-sm space-y-1.5">
        {ranking.map((l, i) => (
          <li key={l.id} className="flex items-center gap-3 rounded-2xl border border-border bg-night/70 px-3 py-2 text-left">
            <span className="w-6 text-center font-display text-xl text-gold">{i + 1}º</span>
            <Peao lado={l} />
            <span className="min-w-0 flex-1 truncate text-parchment">{l.nome}</span>
            <span className="text-xs tabular-nums text-mist">
              casa {l.casa} · {l.acertos} {l.acertos === 1 ? "acerto" : "acertos"}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-auto grid w-full max-w-md gap-2">
        <button type="button" onClick={() => dispatch({ type: "revanche" })} className={cn(BIG, "bg-gold text-night")}>
          <RotateCcw className="size-5" aria-hidden /> Revanche
        </button>
        <button type="button" onClick={() => dispatch({ type: "configurar" })} className={cn(BIG, "h-12 border border-border text-base text-parchment")}>
          Nova configuração
        </button>
      </div>
    </div>
  )
}
