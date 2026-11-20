"use client"

import { motion } from "motion/react"
import { QRCodeSVG } from "qrcode.react"
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import { getCarta } from "@/content/bible-show/cartas"
import { getSituacao, regraDoEfeito } from "@/content/bible-show/situacoes"
import { formatRef } from "@/content/refs"
import { classificacao, lider, normalizar, painel, segundosDaVez, tempoLetras, tentando, tentandoCom, type ShowAction, type ShowState } from "@/domain/bible-show"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useStinger } from "@/fx/useSound"
import { cn } from "@/lib/utils"
import { useSalaShow } from "@/stores/bible-show-sala"
import { Dado, Roleta } from "./Sorteio"
import { ALFABETO, AvisoSom, instrucao, relogioTexto } from "./Telas"
import { casaInfo, CategoriaTag, ESTILO, Peao, Placar, Trilha } from "./Trilha"

// Telão: a partida da sala numa tela grande (projetor ou TV). Só mostra o que
// todos podem ver; a palavra só aparece no resultado. Quem conduz é um celular.

type RefArg = Parameters<typeof formatRef>[0]

const urlSala = (code: string) => () => `${window.location.origin}/bible-show/sala/${code}`

/** Tempo que corre: o mesmo relógio da sala, com bipe nos últimos 10 s. Avisa o fim (só o primeiro aviso vale). */
function useRelogio(state: ShowState, agora: () => number, total: number, aoAcabar: (prazo: number) => void) {
  const stinger = useStinger()
  const relogio = state.relogio
  const [restante, setRestante] = useState(relogio?.restante ?? total)
  const ultimo = useRef<number | null>(null)
  const fim = useRef<number | null>(null)
  useEffect(() => {
    const id = setInterval(() => {
      const ms = relogio?.prazo ? Math.max(0, relogio.prazo - agora()) : (relogio?.restante ?? total)
      setRestante(ms)
      const seg = Math.ceil(ms / 1000)
      if (relogio?.prazo && seg !== ultimo.current) {
        ultimo.current = seg
        if (seg <= 10 && seg > 0) stinger("beep", 1 - seg / 10)
      }
      if (relogio?.prazo && ms <= 0 && fim.current !== relogio.prazo) {
        fim.current = relogio.prazo
        stinger("buzzer")
        vibrate(HAPTIC.no)
        aoAcabar(relogio.prazo)
      }
    }, 100)
    return () => clearInterval(id)
  }, [relogio, agora, total, stinger, aoAcabar])
  return restante
}

function Quem({ lado, rotulo }: { lado: ShowState["lados"][number]; rotulo: string }) {
  return (
    <div className="flex items-center gap-[1.2vw]">
      <Peao lado={lado} className="size-[4vw] border-4 text-[2vw]" />
      <div className="text-left">
        <p className="text-[1.1vw] uppercase tracking-[0.3em] text-mist">{rotulo}</p>
        <p className="font-display text-[4vw] leading-none text-parchment lining-nums">{lado.nome}</p>
      </div>
    </div>
  )
}

function Grande({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex h-full flex-col items-center justify-center gap-[2vh] text-center", className)}>{children}</div>
}

function Estilo({ state }: { state: ShowState }) {
  const e = state.carta?.estilo ?? state.rodada?.estilo
  if (!e) return null
  const I = ESTILO[e].icone
  return (
    <span className="inline-flex items-center gap-[0.6vw] rounded-full border-2 border-gold/50 px-[1.2vw] py-[0.4vw] text-[1.6vw] text-gold-bright">
      <I className="size-[1.8vw]" aria-hidden /> {ESTILO[e].nome}
      {state.carta?.todos || state.rodada?.todos ? " · todo o arraial" : ""}
    </span>
  )
}

function Vez({ state }: { state: ShowState }) {
  const r = state.rodada!
  const quem = lider(state)
  const roleta = state.config.estilos.length > 1
  const chave = `${state.vez}-${state.usadas.length}-${quem.id}-${state.lados.map((l) => l.casa).join(".")}`
  return (
    <Grande>
      <Quem lado={quem} rotulo={r.todos ? "Todo o arraial · conduz" : "Vez de"} />
      <p className="max-w-[48vw] text-[1.5vw] text-sand">{instrucao(state, r.estilo)}</p>
      <div className="flex items-center gap-[4vw]" style={{ zoom: 1.6 }}>
        {roleta && r.estilo && <Roleta key={chave} opcoes={state.config.estilos} resultado={r.estilo} chave={`telao-${chave}`} />}
        {(r.passos || r.estilo) && <Dado key={`${chave}-${r.passos}`} valor={r.passos} chave={`telao-d-${chave}`} />}
      </div>
    </Grande>
  )
}

function Carta({ state }: { state: ShowState }) {
  const carta = getCarta(state.carta!.id)!
  const perguntas = state.carta!.estilo === "perguntas"
  const passos = (state.rodada?.passos ?? 1) + (carta.categoria === "desafio" ? 1 : 0)
  return (
    <Grande>
      <Estilo state={state} />
      <Quem lado={perguntas ? tentando(state) : lider(state)} rotulo={perguntas ? "Vai perguntar" : "Vai representar"} />
      <CategoriaTag id={carta.categoria} className="scale-150" />
      <p className="mt-[2vh] text-[2vw] text-sand">{perguntas ? "Quem adivinha não olha a carta. Preparem as perguntas!" : "Só quem representa vê a carta. Preparem-se!"}</p>
      <p className="text-[1.4vw] text-mist">Vale {passos} {passos === 1 ? "casa" : "casas"}</p>
    </Grande>
  )
}

function Tempo({ state, agora, dispatch }: { state: ShowState; agora: () => number; dispatch: (a: ShowAction) => void }) {
  const total = segundosDaVez(state) * 1000
  const restante = useRelogio(state, agora, total, (prazo) => state.fase === "tempo" && dispatch({ type: "errou", prazo }))
  const seg = Math.ceil(restante / 1000)
  const carta = getCarta(state.carta!.id)!
  const perguntas = state.carta!.estilo === "perguntas"
  return (
    <Grande>
      <div className="flex items-center gap-[1.5vw]">
        <Estilo state={state} />
        <CategoriaTag id={carta.categoria} />
      </div>
      {!state.carta!.todos && <Quem lado={perguntas ? tentando(state) : lider(state)} rotulo={perguntas ? "Pergunta" : "Representa"} />}
      <motion.p
        animate={seg <= 10 && state.relogio?.prazo ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 1, repeat: Infinity }}
        className={cn("font-display text-[16vw] leading-none lining-nums tabular-nums", seg <= 10 ? "text-[#ff9f80]" : "text-parchment")}
      >
        {relogioTexto(seg)}
      </motion.p>
      <div className="h-[1.2vh] w-[50vw] overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full transition-[width] duration-100 ease-linear", seg <= 10 ? "bg-[#e0736b]" : "bg-gold")} style={{ width: `${(restante / total) * 100}%` }} />
      </div>
      {!state.relogio?.prazo && <p className="text-[1.6vw] uppercase tracking-[0.3em] text-mist">Pausado</p>}
    </Grande>
  )
}

function Letras({ state, agora, dispatch }: { state: ShowState; agora: () => number; dispatch: (a: ShowAction) => void }) {
  const total = tempoLetras(state.config)
  const restante = useRelogio(state, agora, total, (prazo) => dispatch({ type: "passar", agora: agora(), prazo }))
  const seg = Math.ceil(restante / 1000)
  const c = state.carta!
  const carta = getCarta(c.id)!
  const escolhidas = c.letras ?? []
  const naPalavra = new Set(painel(carta.palavra, []).filter((x) => x.letra).map((x) => normalizar(x.c)))
  const ultima = escolhidas.at(-1)
  const grupos = painel(carta.palavra, escolhidas).reduce<ReturnType<typeof painel>[]>(
    (acc, t) => {
      if (t.c === " ") acc.push([])
      else acc[acc.length - 1].push(t)
      return acc
    },
    [[]],
  )
  const maior = Math.max(...grupos.map((g) => g.length))
  const lado = `min(5.5vw, ${Math.floor(60 / maior)}vw)`
  return (
    <Grande className="gap-[3vh]">
      <div className="flex w-full items-center justify-between">
        <Quem lado={tentando(state)} rotulo="Vez de" />
        <div className="relative text-right">
          {ultima && (
            <motion.span
              key={escolhidas.length}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -30 }}
              transition={{ duration: 1.6 }}
              className={cn("absolute -top-[3vw] right-0 text-[2.4vw] font-semibold", naPalavra.has(ultima) ? "text-[#8fdc93]" : "text-[#ff9f80]")}
            >
              {naPalavra.has(ultima) ? "+10 s" : "−5 s"}
            </motion.span>
          )}
          <p className={cn("font-display text-[7vw] leading-none lining-nums tabular-nums", seg <= 10 && state.relogio?.prazo ? "text-[#ff9f80]" : "text-parchment")}>{relogioTexto(seg)}</p>
          <p className="text-[1.2vw] text-mist">{c.arriscando ? "Arriscando a palavra…" : !c.comecou ? "Esperando o Valendo!" : state.relogio?.prazo ? "Certa +10 s · errada −5 s" : "Pausado"}</p>
        </div>
      </div>
      <CategoriaTag id={carta.categoria} />
      <div className="flex flex-wrap justify-center gap-x-[2.5vw] gap-y-[1.5vh]">
        {grupos.map((g, w) => (
          <div key={w} className="flex gap-[0.5vw]">
            {g.map((t, i) => (
              <span
                key={i}
                className={cn("grid place-items-center rounded-[0.6vw] border-b-[0.5vw] font-display font-semibold", t.letra ? (t.aberta ? "border-gold bg-parchment text-night" : "border-gold/40 bg-navy") : "border-transparent")}
                style={{ width: lado, height: `calc(${lado} * 1.25)`, fontSize: `calc(${lado} * 0.7)` }}
              >
                {t.aberta ? t.c.toUpperCase() : ""}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="flex max-w-[60vw] flex-wrap justify-center gap-[0.5vw]">
        {ALFABETO.map((l) => {
          const usada = escolhidas.includes(l)
          return (
            <span
              key={l}
              className={cn(
                "grid size-[2.6vw] place-items-center rounded-[0.5vw] border text-[1.3vw] font-semibold",
                usada ? (naPalavra.has(l) ? "border-[#6fbf73]/60 bg-[#6fbf73]/20 text-[#8fdc93]" : "border-border text-mist/40 line-through") : "border-gold/30 text-parchment/80",
              )}
            >
              {l}
            </span>
          )
        })}
      </div>
    </Grande>
  )
}

function Resultado({ state }: { state: ShowState }) {
  const u = state.ultima!
  const carta = getCarta(u.cartaId)!
  const acertou = u.tipo === "acerto"
  const nome = (id: string) => state.lados.find((l) => l.id === id)?.nome ?? ""
  return (
    <Grande>
      <p className={cn("font-display text-[6vw] leading-none", acertou ? "text-[#8fdc93]" : "text-[#ff9f80]")}>{acertou ? "Acertou!" : "Tempo!"}</p>
      <p className="text-[1.6vw] text-mist">A palavra era</p>
      <p className="font-display text-[7vw] leading-none text-parchment">{carta.palavra}</p>
      <p className="text-[1.6vw] text-sand">{formatRef(carta.ref as RefArg, "long")}</p>
      {acertou && (
        <ul className="text-[2vw] text-gold-bright">
          {u.moveu.map((m) => (
            <li key={m.id}>
              {nome(m.id)} anda para a casa {m.para}
            </li>
          ))}
        </ul>
      )}
    </Grande>
  )
}

function Situacao({ state }: { state: ShowState }) {
  const p = state.pendentes[0]
  const s = getSituacao(p.situacao)
  const info = casaInfo({ tipo: "situacao", situacao: s.id })
  const Icone = info.icone
  const quem = state.lados.find((l) => l.id === p.lado)!
  return (
    <Grande>
      <p className="flex items-center gap-[0.8vw] text-[1.6vw] text-mist">
        <Peao lado={quem} className="size-[2.2vw] text-[1vw]" /> {quem.nome} parou numa casa especial
      </p>
      <motion.section
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        className="flex w-[46vw] flex-col items-center gap-[1.5vh] rounded-[2vw] border-4 p-[2.5vw]"
        style={{ borderColor: info.cor, background: `linear-gradient(170deg, ${info.cor}33, #0b0f19 60%)` }}
      >
        <Icone className="size-[6vw]" style={{ color: info.cor }} aria-hidden />
        <p className="font-display text-[4vw] leading-tight text-parchment">{s.nome}</p>
        <p className="text-[1.8vw] text-sand">{s.texto}</p>
        <p className="text-[1.3vw] text-mist">{formatRef(s.ref as RefArg, "long")}</p>
        <p className="w-full rounded-[1vw] bg-night/70 px-[1.5vw] py-[1vw] text-[2vw] font-semibold" style={{ color: info.cor }}>
          {regraDoEfeito(s.efeito, state.config.modo === "equipes")}
        </p>
      </motion.section>
    </Grande>
  )
}

function Fim({ state }: { state: ShowState }) {
  const vencedor = state.lados.find((l) => l.id === state.vencedor)!
  return (
    <Grande>
      <p className="text-[1.6vw] uppercase tracking-[0.4em] text-gold">Vitória</p>
      <Peao lado={vencedor} className="size-[8vw] border-4 text-[4vw]" />
      <p className="font-display text-[7vw] leading-none text-gold-bright">{vencedor.nome}</p>
      <ol className="mt-[2vh] space-y-[0.8vh] text-[2vw] text-parchment">
        {classificacao(state.lados).map((l, i) => (
          <li key={l.id}>
            {i + 1}º {l.nome} · casa {l.casa}
          </li>
        ))}
      </ol>
    </Grande>
  )
}

export function TelaoShow({ code }: { code: string }) {
  const { state, dispatch, agora, erro } = useSalaShow(code)
  const url = useSyncExternalStore(() => () => {}, urlSala(code), () => "")
  if (!state || state.fase === "config")
    return (
      <main className="grid min-h-dvh place-items-center bg-night text-center">
        <p className="text-[2vw] text-mist">{!state ? (erro ?? "Entrando na sala…") : "A partida foi encerrada."}</p>
      </main>
    )
  const antes = state.fase === "passa" ? tentandoCom(state, state.carta!.tentativa - 1) : null
  return (
    <div className="fixed inset-0 grid grid-cols-[minmax(0,1fr)_28vw] gap-[2vw] overflow-hidden bg-night p-[2vw]">
      <div className="stage-glow pointer-events-none absolute inset-0" style={{ ["--illumination" as string]: 0.35 }} />
      <section className="relative z-10 flex min-h-0 flex-col">
        <header className="flex items-center justify-between">
          <p className="font-display text-[2.4vw] text-gold-bright">Bible Show</p>
          <div className="w-[26vw]">
            <AvisoSom />
          </div>
        </header>
        <div className="min-h-0 flex-1">
          {state.fase === "vez" && <Vez state={state} />}
          {state.fase === "carta" && <Carta state={state} />}
          {state.fase === "tempo" && <Tempo key={`${state.carta?.id}-${state.carta?.tentativa}`} state={state} agora={agora} dispatch={dispatch} />}
          {state.fase === "letras" && <Letras key={state.carta?.id} state={state} agora={agora} dispatch={dispatch} />}
          {state.fase === "quem" && (
            <Grande>
              <p className="font-display text-[6vw] text-[#8fdc93]">Acertaram!</p>
              <p className="text-[2vw] text-mist">Marcando quem acertou primeiro…</p>
            </Grande>
          )}
          {state.fase === "passa" && antes && (
            <Grande>
              <p className="font-display text-[6vw] text-[#ff9f80]">Tempo!</p>
              <p className="text-[2vw] text-mist">{antes.nome} não acertou. A carta continua em segredo.</p>
              <Quem lado={tentando(state)} rotulo="Agora tenta" />
            </Grande>
          )}
          {state.fase === "resultado" && <Resultado state={state} />}
          {state.fase === "situacao" && <Situacao state={state} />}
          {state.fase === "fim" && <Fim state={state} />}
        </div>
      </section>
      <aside className="relative z-10 flex min-h-0 flex-col gap-[1.5vh]">
        <div className="flex items-center gap-[1vw] rounded-[1vw] border border-border bg-night/70 p-[0.8vw]">
          <div className="shrink-0 rounded-[0.5vw] bg-parchment p-[0.4vw]">{url && <QRCodeSVG value={url} size={96} bgColor="#f1e8d6" fgColor="#05070d" level="M" className="size-[5.5vw]" />}</div>
          <div className="min-w-0">
            <p className="text-[0.9vw] text-mist">Entrar ou voltar pelo celular</p>
            <p className="font-display text-[2.6vw] leading-none tracking-[0.15em] text-parchment">{code}</p>
          </div>
        </div>
        <div className="[zoom:1.3]">
          <Placar state={state} />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <Trilha state={state} destaque={state.fase === "resultado" ? "resultado" : undefined} />
        </div>
      </aside>
    </div>
  )
}
