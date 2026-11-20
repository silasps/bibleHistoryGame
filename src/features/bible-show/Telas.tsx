"use client"

import { BookOpen, Check, Dices, ExternalLink, Eye, Hand, Hourglass, Pause, Play, RotateCcw, Send, Shuffle, Trophy, Volume2, X } from "lucide-react"
import { motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { getCarta } from "@/content/bible-show/cartas"
import { escolheOutro, getSituacao, regraDoEfeito } from "@/content/bible-show/situacoes"
import { formatRef, linkNaa } from "@/content/refs"
import { casaDe, classificacao, emJogo, LETRA_CERTA_MS, LETRA_ERRADA_MS, lider, normalizar, painel, segundosDaVez, tempoLetras, tentando, tentandoCom, textoTempo, type Estilo, type ShowState } from "@/domain/bible-show"
import { PhoneSheet } from "@/features/presentation/PhoneDock"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { soundEngine } from "@/fx/sound"
import { useSoundState, useStinger } from "@/fx/useSound"
import { usePreferences } from "@/stores/preferences-store"
import { cn } from "@/lib/utils"
import { useJogo } from "./jogo"
import { Dado, Roleta } from "./Sorteio"
import { casaInfo, CategoriaTag, COR_TOM, ESTILO, Peao, Placar, Trilha } from "./Trilha"

type RefArg = Parameters<typeof formatRef>[0]

const BIG = "flex h-14 w-full items-center justify-center gap-2 rounded-full text-lg font-semibold transition active:scale-[0.98] disabled:opacity-40"

/** Aviso para quem espera o outro celular agir (quem criou a sala pode assumir a vez). */
function Aguarde({ children }: { children: React.ReactNode }) {
  const { anfitriao, assumir, sala } = useJogo()
  return (
    <div className="space-y-2">
      <p className="flex items-center justify-center gap-2 rounded-full border border-border bg-night/70 px-4 py-3 text-center text-sm text-mist">
        <Hourglass className="size-4 shrink-0 animate-pulse text-gold" aria-hidden /> {children}
      </p>
      {sala && anfitriao && assumir && (
        <button type="button" onClick={assumir} className="mx-auto block text-xs text-mist underline underline-offset-4">
          O outro celular saiu? Assumir esta vez
        </button>
      )}
    </div>
  )
}

/** Conferir a referência: a passagem na NAA, para quem quiser checar. */
export function Conferir({ refs, titulo, className }: { refs: RefArg[]; titulo: string; className?: string }) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full border border-gold/40 px-3 text-xs text-gold-bright", className)}>
        <BookOpen className="size-3.5" aria-hidden /> Conferir na Bíblia
      </button>
      <PhoneSheet title="Conferir" open={aberto} onClose={() => setAberto(false)}>
        <p className="font-display text-2xl leading-tight text-parchment">{titulo}</p>
        <ul className="space-y-2">
          {refs.map((r) => (
            <li key={formatRef(r)} className="space-y-2 rounded-2xl border border-border bg-night/60 p-3">
              <p className="text-sm text-sand">
                {formatRef(r, "long")} <span className="text-mist">· Bíblia NAA</span>
              </p>
              <a href={linkNaa(r)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-gold px-4 text-sm font-semibold text-night">
                Ler a passagem <ExternalLink className="size-4" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-mist">O link abre o texto da NAA no site bible.com.</p>
      </PhoneSheet>
    </>
  )
}

const nomesEstilos = (lista: Estilo[]) => {
  const n = lista.map((e) => ESTILO[e].nome.toLowerCase())
  return n.length > 1 ? `${n.slice(0, -1).join(", ")} ou ${n[n.length - 1]}` : n[0]
}

/** O que fazer na rodada, conforme o jeito (se já se sabe) e o modo. */
function instrucao(state: ShowState, estilo: Estilo | null): string {
  const equipes = state.config.modo === "equipes"
  const quem = lider(state).nome
  if (estilo === "letras")
    return equipes
      ? `Palavra escondida. Cada equipe tem ${textoTempo(tempoLetras(state.config) / 1000)}: letra certa dá 10 s, errada tira 5 s. A vez só passa quando o tempo acaba ou quando erram a palavra.`
      : `Palavra escondida. Cada um tem ${textoTempo(tempoLetras(state.config) / 1000)}: letra certa dá 10 s, errada tira 5 s. A vez só passa quando o tempo acaba ou quando erra a palavra.`
  if (state.rodada?.todos)
    return estilo === "perguntas"
      ? "Cada equipe manda alguém para perguntar, todos ao mesmo tempo. Essas pessoas não veem a carta. Quem acertar primeiro anda."
      : `${quem} escolhe quem representa para todas as equipes. Quem acertar primeiro anda.`
  if (!estilo) return `A roleta decide: ${nomesEstilos(state.config.estilos)}.`
  if (estilo === "perguntas")
    return equipes ? "Cada equipe escolhe quem vai adivinhar. Essas pessoas não veem a carta." : `${quem} adivinha fazendo perguntas. Os outros veem a carta.`
  return equipes ? "Escolham quem vai representar. Só essa pessoa vê a carta." : `${quem} representa. Quem acertar anda junto.`
}

/** Vez: a trilha e a roleta; depois a roleta grande, o sorteio de casas e a carta. */
export function Vez() {
  const { state, dispatch, conduz } = useJogo()
  const rodada = state.rodada!
  const quem = lider(state)
  const roleta = state.config.estilos.length > 1
  const comecou = (roleta && !!rodada.estilo) || !!rodada.passos
  const casa = casaDe(state, quem)
  const chave = `${state.vez}-${state.usadas.length}-${quem.id}-${state.lados.map((l) => l.casa).join(".")}`
  const [girou, setGirou] = useState(false)
  const pronto = !roleta || girou
  const fimRoleta = useCallback(() => setGirou(true), [])

  const cabeca = (
    <div className="flex items-center gap-3">
      <Peao lado={quem} className="size-9 text-base" />
      <div className="min-w-0 text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-mist">{rodada.todos ? "Todo o arraial · conduz" : "Vez de"}</p>
        <p className="truncate font-display text-2xl leading-tight text-parchment">{quem.nome}</p>
      </div>
    </div>
  )

  if (!comecou)
    return (
      <div className="flex min-h-full flex-col gap-3">
        <Placar state={state} />
        <Trilha state={state} />
        <section className="mt-auto space-y-3 rounded-3xl border border-gold/30 bg-night/80 p-4">
          {cabeca}
          {casa?.tipo === "categoria" ? (
            <CategoriaTag id={casa.categoria} />
          ) : (
            <p className="rounded-2xl border border-border px-3 py-2 text-sm text-sand">{quem.casa === 0 ? "Na partida, a categoria é sorteada." : "Casa especial: a categoria é sorteada."}</p>
          )}
          <p className="text-sm text-mist">{instrucao(state, rodada.estilo)}</p>
          {conduz ? (
            <button
              type="button"
              onClick={() => dispatch(roleta ? { type: "girar", r: Math.random() } : { type: "rolar", r: Math.random() })}
              className={cn(BIG, "bg-gold text-night")}
            >
              <Dices className="size-5" aria-hidden /> {roleta ? "Girar a roleta" : "Sortear as casas"}
            </button>
          ) : (
            <Aguarde>
              Aguardando {quem.nome} {roleta ? "girar a roleta" : "sortear as casas"}
            </Aguarde>
          )}
        </section>
      </div>
    )

  return (
    <div className="flex min-h-full flex-col items-center gap-4 pt-2 text-center">
      <div className="w-full">{cabeca}</div>
      {roleta && rodada.estilo && <Roleta opcoes={state.config.estilos} resultado={rodada.estilo} chave={`r-${chave}`} onFim={fimRoleta} />}
      {pronto && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex w-full flex-col items-center gap-3">
          <Dado key={rodada.passos ?? "?"} valor={rodada.passos} chave={`d-${chave}`} />
          <p className="max-w-sm text-sm text-mist">{instrucao(state, rodada.estilo)}</p>
        </motion.div>
      )}
      <div className="mt-auto w-full max-w-md">
        {!conduz ? (
          <Aguarde>Aguardando {quem.nome}</Aguarde>
        ) : !rodada.passos ? (
          <button type="button" disabled={!pronto} onClick={() => dispatch({ type: "rolar", r: Math.random() })} className={cn(BIG, "bg-gold text-night")}>
            <Dices className="size-5" aria-hidden /> Sortear as casas
          </button>
        ) : (
          <button type="button" onClick={() => dispatch({ type: "sortear", r1: Math.random(), r2: Math.random() })} className={cn(BIG, "bg-gold text-night")}>
            <Eye className="size-5" aria-hidden /> Ver a carta
          </button>
        )}
      </div>
    </div>
  )
}

/** A carta: só quem pode vê, segurando o dedo. */
export function CartaSecreta() {
  const { state, dispatch, agora, conduz, ve } = useJogo()
  const fx = useFx()
  const stinger = useStinger()
  const [aberta, setAberta] = useState(false)
  const [viu, setViu] = useState(false)
  const carta = getCarta(state.carta!.id)!
  const cor = casaInfo({ tipo: "categoria", categoria: carta.categoria }).cor
  const estilo = ESTILO[state.carta!.estilo]
  const EstiloIcone = estilo.icone
  const perguntas = state.carta!.estilo === "perguntas"
  const quem = lider(state)
  const passos = (state.rodada?.passos ?? 1) + (carta.categoria === "desafio" ? 1 : 0)
  const quemOlha = perguntas
    ? state.config.modo === "equipes"
      ? "Quem vai adivinhar, de cada equipe, não olha. Todos os outros veem a carta."
      : `${tentando(state).nome} vai adivinhar e não olha. Os outros veem a carta.`
    : state.carta!.todos
      ? "Só quem vai representar para todos pode olhar."
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
      {ve ? (
        <>
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
            className="relative aspect-[3/4] w-full max-w-xs touch-none select-none [-webkit-touch-callout:none] [perspective:1200px]"
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
                  <p className="text-xs text-mist">{estilo.regra}</p>
                  <p className="text-xs text-sand">
                    {formatRef(carta.ref as RefArg, "long")} · vale {passos} {passos === 1 ? "casa" : "casas"}
                  </p>
                </div>
              </div>
            </motion.div>
          </button>
        </>
      ) : (
        <div className="grid w-full max-w-xs flex-1 place-items-center rounded-3xl border-2 border-dashed border-gold/30 p-6">
          <p className="text-sm text-sand">A carta está com {quem.nome}. Preparem-se!</p>
        </div>
      )}
      <div className="mt-auto grid w-full max-w-md gap-2">
        {conduz ? (
          <>
            <button
              type="button"
              disabled={ve && !viu}
              onClick={() => {
                stinger("vote")
                dispatch({ type: "valendo", agora: agora() })
              }}
              className={cn(BIG, "bg-gold text-night")}
            >
              <Play className="size-5 fill-current" aria-hidden /> Valendo! ({textoTempo(segundosDaVez(state))})
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
          </>
        ) : (
          <Aguarde>Aguardando {quem.nome} tocar em Valendo!</Aguarde>
        )}
      </div>
    </div>
  )
}

/** "52", "1:05", "3:00". */
const relogioTexto = (seg: number) => (seg < 60 ? String(seg) : `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")}`)

/** Cronômetro grande: o grupo vê o tempo, nunca a palavra. */
export function Cronometro() {
  const { state, dispatch, agora, conduz, ve } = useJogo()
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
      const ms = relogio?.prazo ? Math.max(0, relogio.prazo - agora()) : (relogio?.restante ?? total)
      setRestante(ms)
      const seg = Math.ceil(ms / 1000)
      if (relogio?.prazo && seg !== ultimoSeg.current) {
        ultimoSeg.current = seg
        // Alerta dos últimos 10 segundos: um bipe por segundo, mais forte no fim.
        if (seg <= 10 && seg > 0) {
          stinger("beep", 1 - seg / 10)
          if (seg <= 3) vibrate(HAPTIC.tap)
        }
      }
      if (relogio?.prazo && ms <= 0 && !fim.current && state.fase === "tempo") {
        fim.current = true
        stinger("buzzer")
        vibrate(HAPTIC.seal)
        // Todos os celulares avisam; o servidor só aceita o primeiro aviso deste relógio.
        dispatch({ type: "errou", prazo: relogio.prazo })
      }
    }
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [relogio, total, dispatch, stinger, state.fase, agora, conduz])

  const seg = Math.ceil(restante / 1000)
  const frac = restante / total
  const urgente = seg <= 10
  const correndo = !!relogio?.prazo
  const carta = getCarta(state.carta!.id)!
  const estilo = ESTILO[state.carta!.estilo]
  const EstiloIcone = estilo.icone
  const perguntas = state.carta!.estilo === "perguntas"
  const todos = state.carta!.todos
  const quem = tentando(state)
  const passa = perguntas && !todos && state.config.modo === "equipes" && state.carta!.tentativa + 1 < emJogo(state).length
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
          {todos && <span className="rounded-full border border-parchment/40 px-3 py-1 text-parchment">Todo o arraial</span>}
          {perguntas && !todos && (
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
            <p className={cn("font-display leading-none tabular-nums", seg >= 60 ? "text-[min(22vw,15dvh)]" : "text-[min(30vw,20dvh)]", urgente ? "text-[#ff9f80]" : "text-parchment")}>{relogioTexto(seg)}</p>
            {!correndo && state.fase === "tempo" && <p className="text-sm uppercase tracking-[0.3em] text-mist">Pausado</p>}
          </div>
        </motion.div>
      </div>

      <div className="mt-auto grid w-full max-w-md gap-2">
        {conduz ? (
          <>
            <button
              type="button"
              onClick={() => {
                stinger("reveal")
                vibrate(HAPTIC.light)
                dispatch({ type: "acertaram", agora: agora() })
              }}
              className={cn(BIG, "h-16 bg-[#6fbf73] text-xl text-night")}
            >
              <Check className="size-6" aria-hidden /> {perguntas && !todos ? "Acertou!" : "Acertaram!"}
            </button>
            <div className={cn("grid gap-2", perguntas || !ve ? "grid-cols-2" : "grid-cols-3")}>
              <button
                type="button"
                onClick={() => dispatch(correndo ? { type: "pausar", agora: agora() } : { type: "continuar", agora: agora() })}
                className={cn(BIG, "h-12 border border-border text-sm text-parchment")}
              >
                {correndo ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />} {correndo ? "Pausar" : "Seguir"}
              </button>
              {!perguntas && ve && (
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
          </>
        ) : (
          <Aguarde>Quem conduz é {lider(state).nome}</Aguarde>
        )}
      </div>
    </div>
  )
}

/** Quem acertou? (individual: a pessoa; todo o arraial: a equipe). */
export function QuemAcertou() {
  const { state, dispatch, agora, conduz } = useJogo()
  const ator = lider(state)
  const individual = state.config.modo === "individual" && !state.carta?.todos
  const opcoes = individual ? emJogo(state).filter((l) => l.id !== ator.id) : emJogo(state)
  if (!conduz)
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4">
        <p className="font-display text-3xl text-parchment">Alguém acertou!</p>
        <Aguarde>{ator.nome} está marcando quem foi</Aguarde>
      </div>
    )
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
        <button type="button" onClick={() => dispatch({ type: "voltar", agora: agora() })} className={cn(BIG, "h-12 text-base text-mist")}>
          <RotateCcw className="size-4" aria-hidden /> Voltar ao tempo
        </button>
      </div>
    </div>
  )
}

/** Perguntas em equipes: ninguém acertou ainda e a próxima equipe tenta com menos tempo. */
export function Passa() {
  const { state, dispatch, agora, conduz } = useJogo()
  const stinger = useStinger()
  const quem = tentando(state)
  const antes = tentandoCom(state, state.carta!.tentativa - 1)
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
      <div className="mt-auto w-full max-w-md">
        {conduz ? (
          <button
            type="button"
            onClick={() => {
              stinger("vote")
              dispatch({ type: "valendo", agora: agora() })
            }}
            className={cn(BIG, "bg-gold text-night")}
          >
            <Play className="size-5 fill-current" aria-hidden /> Valendo! ({textoTempo(segundosDaVez(state))})
          </button>
        ) : (
          <Aguarde>Aguardando {lider(state).nome} tocar em Valendo!</Aguarde>
        )}
      </div>
    </div>
  )
}

/** Resultado da vez: a palavra, quem andou e a trilha. */
export function Resultado() {
  const { state, dispatch, conduz } = useJogo()
  const ultima = state.ultima!
  const carta = getCarta(ultima.cartaId)!
  const acertou = ultima.tipo === "acerto"
  const nome = (id: string) => state.lados.find((l) => l.id === id)?.nome ?? ""
  return (
    <div className="flex min-h-full flex-col gap-3">
      <div className="flex flex-col items-center text-center">
        <p className={cn("font-display text-4xl", acertou ? "text-[#8fdc93]" : "text-[#ff9f80]")}>{acertou ? "Acertou!" : "Tempo!"}</p>
        <p className="mt-1 text-sm text-mist">A palavra era</p>
        <p className="font-display text-3xl leading-tight text-parchment">{carta.palavra}</p>
        <p className="text-xs text-sand">{formatRef(carta.ref as RefArg, "long")}</p>
        <Conferir refs={[carta.ref as RefArg]} titulo={carta.palavra} className="mt-2" />
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
      <div className="mt-auto">
        {conduz ? (
          <button type="button" onClick={() => dispatch({ type: "proxima" })} className={cn(BIG, "bg-gold text-night")}>
            {state.pendentes.length ? "Casa especial! →" : "Próxima vez →"}
          </button>
        ) : (
          <Aguarde>Aguardando {lider(state).nome} seguir</Aguarde>
        )}
      </div>
    </div>
  )
}

/** Casa especial: o fato bíblico, a regra e quem cumpre. */
export function Situacao() {
  const { state, dispatch, conduz } = useJogo()
  const fx = useFx()
  const stinger = useStinger()
  const p = state.pendentes[0]
  const s = getSituacao(p.situacao)
  const info = casaInfo({ tipo: "situacao", situacao: s.id })
  const Icone = info.icone
  const quem = state.lados.find((l) => l.id === p.lado)!
  const equipes = state.config.modo === "equipes"
  const outros = emJogo(state).filter((l) => l.id !== quem.id)
  useEffect(() => {
    stinger("reveal")
    vibrate(HAPTIC.seal)
  }, [stinger, p.situacao, p.lado])
  return (
    <div className="flex min-h-full flex-col items-center gap-4 text-center">
      <p className="flex items-center gap-2 text-sm text-mist">
        <Peao lado={quem} /> {quem.nome} parou numa casa especial
      </p>
      <motion.section
        initial={fx.motion ? { rotateY: 90, opacity: 0 } : false}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-sm flex-col items-center gap-3 rounded-3xl border-2 p-5"
        style={{ borderColor: info.cor, background: `linear-gradient(170deg, ${info.cor}33, #0b0f19 60%)` }}
      >
        <Icone className="size-12" style={{ color: info.cor }} aria-hidden />
        <p className="font-display text-3xl leading-tight text-parchment">{s.nome}</p>
        <p className="text-sm text-sand">{s.texto}</p>
        <p className="text-xs text-mist">{formatRef(s.ref as RefArg, "long")}</p>
        <Conferir refs={[s.ref as RefArg]} titulo={s.nome} />
        <p className="w-full rounded-2xl bg-night/70 px-3 py-2.5 text-base font-semibold" style={{ color: info.cor }}>
          {regraDoEfeito(s.efeito, equipes)}
        </p>
      </motion.section>
      <div className="mt-auto grid w-full max-w-md gap-2">
        {!conduz ? (
          <Aguarde>Aguardando {quem.nome}</Aguarde>
        ) : escolheOutro(s.efeito) ? (
          <div className="grid grid-cols-2 gap-2">
            {outros.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => dispatch({ type: "cumprir", alvo: l.id })}
                className="flex min-h-14 items-center gap-2 rounded-2xl border px-3 text-left text-parchment active:scale-[0.98]"
                style={{ borderColor: `${COR_TOM.escolha}80` }}
              >
                <Peao lado={l} className="size-7 text-sm" />
                <span className="min-w-0 truncate">{l.nome}</span>
              </button>
            ))}
          </div>
        ) : (
          <button type="button" onClick={() => dispatch({ type: "cumprir" })} className={cn(BIG, "bg-gold text-night")}>
            {s.efeito.tipo === "arraial" ? "Começar a rodada para todos" : "Cumprir"}
          </button>
        )}
      </div>
    </div>
  )
}

/** Fim: quem chegou primeiro e a classificação. */
export function Fim() {
  const { state, dispatch, sala, anfitriao } = useJogo()
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
      {(!sala || anfitriao) && (
        <div className="mt-auto grid w-full max-w-md gap-2">
          <button type="button" onClick={() => dispatch({ type: "revanche" })} className={cn(BIG, "bg-gold text-night")}>
            <RotateCcw className="size-5" aria-hidden /> Revanche
          </button>
          {!sala && (
            <button type="button" onClick={() => dispatch({ type: "configurar" })} className={cn(BIG, "h-12 border border-border text-base text-parchment")}>
              Nova configuração
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** Pede para ligar o som: sem ele, ninguém ouve o alerta dos últimos 10 segundos. */
export function AvisoSom() {
  const sound = usePreferences((p) => p.sound)
  const setSound = usePreferences((p) => p.setSound)
  const motor = useSoundState()
  const [fechado, setFechado] = useState(false)
  const [ligou, setLigou] = useState(false)
  if (fechado || (sound && !ligou)) return null
  return (
    <div role="status" className="relative z-20 mx-4 mb-2 flex items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-sand">
      <Volume2 className="size-5 shrink-0 text-gold-bright" aria-hidden />
      <p className="min-w-0 flex-1 leading-snug">
        {ligou ? "Som ligado. Tire o celular do silencioso e aumente o volume." : "Ligue o som para ouvir o alerta dos últimos 10 segundos."}
      </p>
      {ligou ? (
        <button type="button" onClick={() => setFechado(true)} className="grid size-9 shrink-0 place-items-center rounded-full text-mist" aria-label="Fechar">
          <X className="size-4" />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setSound(true)
              if (motor === "off") void soundEngine.start().then(() => soundEngine.stinger("beep", 1))
              setLigou(true)
              setTimeout(() => setFechado(true), 6000)
            }}
            className="h-9 shrink-0 rounded-full bg-gold px-3 text-xs font-semibold text-night"
          >
            Ligar o som
          </button>
          <button type="button" onClick={() => setFechado(true)} className="grid size-9 shrink-0 place-items-center rounded-full text-mist" aria-label="Agora não">
            <X className="size-4" />
          </button>
        </>
      )}
    </div>
  )
}

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

/** Letras: a palavra escondida, o teclado e o tempo da equipe. */
export function Letras() {
  const { state, dispatch, agora, conduz } = useJogo()
  const stinger = useStinger()
  const fx = useFx()
  const carta = getCarta(state.carta!.id)!
  const escolhidas = state.carta!.letras ?? []
  const quem = tentando(state)
  const relogio = state.relogio
  const correndo = !!relogio?.prazo
  const comecou = !!state.carta!.comecou
  const cheio = tempoLetras(state.config)
  const [restante, setRestante] = useState(relogio?.restante ?? cheio)
  const [chute, setChute] = useState("")
  const arriscando = !!state.carta!.arriscando
  const ultimoSeg = useRef<number | null>(null)
  const fim = useRef<number | null>(null)
  const naPalavra = new Set(painel(carta.palavra, []).filter((x) => x.letra).map((x) => normalizar(x.c)))
  const ultima = escolhidas.at(-1)

  useEffect(() => {
    const tick = () => {
      const ms = relogio?.prazo ? Math.max(0, relogio.prazo - agora()) : (relogio?.restante ?? cheio)
      setRestante(ms)
      const seg = Math.ceil(ms / 1000)
      if (relogio?.prazo && seg !== ultimoSeg.current) {
        ultimoSeg.current = seg
        if (seg <= 10 && seg > 0) stinger("beep", 1 - seg / 10)
      }
      // Acabou o tempo da equipe: a vez passa. Todos avisam; só o primeiro aviso deste relógio vale.
      if (relogio?.prazo && ms <= 0 && fim.current !== relogio.prazo) {
        fim.current = relogio.prazo
        stinger("buzzer")
        vibrate(HAPTIC.no)
        dispatch({ type: "passar", agora: agora(), prazo: relogio.prazo })
      }
    }
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [relogio, agora, conduz, dispatch, stinger, cheio])

  // A palavra em grupos (um por palavra), para quebrar a linha só entre palavras.
  const grupos = painel(carta.palavra, escolhidas).reduce<ReturnType<typeof painel>[]>(
    (acc, t) => {
      if (t.c === " ") acc.push([])
      else acc[acc.length - 1].push(t)
      return acc
    },
    [[]],
  )
  const maior = Math.max(...grupos.map((g) => g.length))
  const lado = Math.min(36, Math.floor((340 - (maior - 1) * 4) / maior))
  const seg = Math.ceil(restante / 1000)
  const urgente = correndo && seg <= 10

  return (
    <div className="flex min-h-full flex-col items-center gap-3 text-center">
      <div className="flex w-full items-center justify-between gap-2">
        <CategoriaTag id={carta.categoria} />
        <div className="flex min-w-0 items-center gap-2 text-left">
          <Peao lado={quem} className="size-8 text-sm" />
          <div className="min-w-0">
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-mist">Vez de</p>
            <p className="truncate font-display text-xl leading-tight text-parchment">{quem.nome}</p>
          </div>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10" role="timer" aria-label={`${seg} segundos`}>
        <div className={cn("h-full rounded-full transition-[width] duration-100 ease-linear", urgente ? "bg-[#e0736b]" : "bg-gold")} style={{ width: `${Math.min(1, restante / cheio) * 100}%` }} />
      </div>
      <div className="-mt-1 flex w-full items-center justify-between gap-2">
        <p className="text-left text-xs text-mist">
          <span className="text-[#8fdc93]">Certa +{LETRA_CERTA_MS / 1000} s</span> · <span className="text-[#ff9f80]">Errada −{LETRA_ERRADA_MS / 1000} s</span>
        </p>
        <div className="relative flex items-baseline gap-2">
          {ultima && (
            <motion.span
              key={escolhidas.length}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: fx.motion ? -18 : 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className={cn("pointer-events-none absolute -left-12 top-0 text-sm font-semibold", naPalavra.has(ultima) ? "text-[#8fdc93]" : "text-[#ff9f80]")}
              aria-hidden
            >
              {naPalavra.has(ultima) ? `+${LETRA_CERTA_MS / 1000} s` : `−${LETRA_ERRADA_MS / 1000} s`}
            </motion.span>
          )}
          {!correndo && <span className="text-xs text-mist">{arriscando ? "Arriscando…" : comecou ? "Pausado" : ""}</span>}
          <span className={cn("font-display text-3xl leading-none tabular-nums", urgente ? "text-[#ff9f80]" : "text-parchment")}>{relogioTexto(seg)}</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 py-2" aria-label="Palavra escondida">
        {grupos.map((g, w) => (
          <div key={w} className="flex gap-1">
            {g.map((t, i) => (
              <span
                key={i}
                className={cn("grid place-items-center rounded-md border-b-4 font-display font-semibold", t.letra ? (t.aberta ? "border-gold bg-parchment text-night" : "border-gold/40 bg-night") : "border-transparent text-parchment")}
                style={{ width: lado, height: lado * 1.25, fontSize: lado * 0.7 }}
              >
                {t.aberta ? t.c.toUpperCase() : ""}
              </span>
            ))}
          </div>
        ))}
      </div>

      {conduz ? (
        !comecou ? (
          <div className="mt-auto grid w-full max-w-md gap-2">
            {state.carta!.tentativa > 0 && <p className="text-sm text-sand">A vez passou para {quem.nome}. As letras abertas continuam.</p>}
            <button
              type="button"
              onClick={() => {
                stinger("vote")
                dispatch({ type: "valendo", agora: agora() })
              }}
              className={cn(BIG, "bg-gold text-night")}
            >
              <Play className="size-5 fill-current" aria-hidden /> Valendo! ({textoTempo(cheio / 1000)})
            </button>
          </div>
        ) : arriscando ? (
          <form
            className="mt-auto grid w-full max-w-md gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              dispatch({ type: "chutar", palavra: chute, agora: agora() })
              setChute("")
            }}
          >
            <p className="text-sm text-sand">O tempo parou. Digitem a resposta: se errarem, a vez passa.</p>
            <input
              autoFocus
              value={chute}
              onChange={(e) => setChute(e.target.value)}
              placeholder="Digite a resposta"
              maxLength={40}
              autoComplete="off"
              className="h-14 rounded-2xl border border-gold/50 bg-night/80 px-4 text-center text-lg text-parchment focus:border-gold"
              aria-label="Resposta"
            />
            <button type="submit" disabled={!chute.trim()} className={cn(BIG, "bg-gold text-night")}>
              <Send className="size-5" aria-hidden /> Confirmar a resposta
            </button>
          </form>
        ) : (
          <div className="mt-auto grid w-full max-w-md gap-2">
            <div className="grid grid-cols-7 gap-1.5" aria-label="Teclado">
              {ALFABETO.map((l) => {
                const usada = escolhidas.includes(l)
                return (
                  <button
                    key={l}
                    type="button"
                    disabled={usada || !correndo}
                    onClick={() => {
                      const certa = naPalavra.has(l)
                      vibrate(certa ? HAPTIC.tap : HAPTIC.no)
                      stinger(certa ? "reveal" : "tap")
                      dispatch({ type: "letra", l, agora: agora() })
                    }}
                    className={cn(
                      "h-11 rounded-xl border font-semibold transition active:scale-95",
                      usada ? (naPalavra.has(l) ? "border-[#6fbf73]/50 bg-[#6fbf73]/20 text-[#8fdc93]" : "border-border bg-night/40 text-mist/40 line-through") : "border-gold/40 bg-night/80 text-parchment",
                    )}
                  >
                    {l}
                  </button>
                )
              })}
            </div>
            <p className="text-center text-xs text-mist">A vez só passa quando o tempo acaba ou quando vocês arriscam e erram a palavra.</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => dispatch(correndo ? { type: "pausar", agora: agora() } : { type: "continuar", agora: agora() })} className={cn(BIG, "h-12 border border-border text-sm text-parchment")}>
                {correndo ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />} {correndo ? "Pausar" : "Seguir"}
              </button>
              <button
                type="button"
                disabled={!correndo}
                onClick={() => {
                  stinger("vote")
                  dispatch({ type: "arriscar", agora: agora() })
                }}
                className={cn(BIG, "h-12 bg-gold text-sm text-night")}
              >
                Arriscar
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="mt-auto w-full max-w-md">
          <Aguarde>
            {arriscando ? `${quem.nome} está arriscando a palavra!` : !comecou ? `Aguardando ${quem.nome} tocar em Valendo!` : correndo ? `${quem.nome} está escolhendo` : `${quem.nome} pausou o tempo`}
          </Aguarde>
        </div>
      )}
    </div>
  )
}
