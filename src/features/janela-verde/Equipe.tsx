"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  BARREIRAS,
  COMPARACAO,
  COMPROMISSOS,
  CULTURAS,
  ISOLAMENTO,
  LINGUA_INTRO,
  LINHAS_CULTURA,
  MARCAS,
  MESMAS_PALAVRAS,
  NAO_SAO_INIMIGOS,
  ORACOES,
  RESPOSTAS,
  SAWI_REAL,
  VISITAS,
  visitaDoGrupo,
  type Etapa,
  type GrupoId,
  type Marca,
} from "@/content/janela-verde"
import { formatRef } from "@/content/refs"
import {
  barreiraCaiu,
  cardsDaOracao,
  etapaAtual,
  MAX_TEXTO,
  perguntasEscolhidas,
  primeiroItem,
  rachadura,
  type JanelaAction,
  type JanelaState,
} from "@/domain/janela-verde"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { cn } from "@/lib/utils"
import { arteUrl, Bloco, CardDeclaracao, CardFato, CardMensagem, IconeMarca, Relogio, SeloMarca, useRestante } from "./comum"
import { Barreira, JanelaMapa } from "./visuais"

type Agir = (a: JanelaAction) => void
interface Props {
  state: JanelaState
  agir: Agir
  agora: () => number
  grupo: GrupoId
}

const COR: Record<GrupoId, string> = { auren: "#e0866c", nair: "#7fae8b" }
const NOME: Record<GrupoId, string> = { auren: "Grupo Auren", nair: "Grupo Nair" }

export function Equipe({ state, agir, agora, grupo }: Props) {
  const etapa = etapaAtual(state)
  const [aberto, setAberto] = useState(false)
  const transicao = useTransicao(etapa.marca)

  return (
    <div className="min-h-dvh bg-night text-parchment">
      <header className="sticky top-0 z-20 border-b border-border bg-night/95 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: COR[grupo] }}>
            <span className="size-2.5 rounded-full" style={{ background: COR[grupo] }} aria-hidden />
            {NOME[grupo]}
          </span>
          <SeloMarca marca={etapa.marca} />
        </div>
        <h1 className="mt-1 text-balance font-display text-lg leading-tight text-parchment">{etapa.titulo}</h1>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-28 pt-4">
        <Conteudo state={state} agir={agir} agora={agora} grupo={grupo} etapa={etapa} />
        <Palavras state={state} grupo={grupo} />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-night/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="mx-auto block min-h-12 w-full max-w-md rounded-full border border-gold/60 bg-gold/15 px-4 font-semibold text-gold-bright"
        >
          ✍️ Palavra recebida
        </button>
      </div>

      {aberto && <FolhaPalavra grupo={grupo} agir={agir} onClose={() => setAberto(false)} />}

      {transicao && (
        <div
          role="status"
          className="fixed inset-0 z-50 grid place-items-center bg-night/95 px-6 text-center"
          style={{ color: MARCAS[transicao].cor }}
        >
          <div className="flex flex-col items-center gap-4">
            <IconeMarca marca={transicao} className="size-16" />
            <p className="text-balance font-display text-4xl">{transicao === "oracao" ? "Hora de orar" : MARCAS[transicao].rotulo}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/** Cartão de transição por ~2,5 s quando a marca da etapa muda. */
function useTransicao(marca: Marca): Marca | null {
  const [mostrar, setMostrar] = useState<Marca | null>(null)
  const antes = useRef<Marca | null>(null)
  useEffect(() => {
    if (antes.current === null) {
      antes.current = marca
      return
    }
    if (antes.current === marca) return
    antes.current = marca
    vibrate(HAPTIC.light)
    const t0 = setTimeout(() => setMostrar(marca), 0)
    const t1 = setTimeout(() => setMostrar(null), 2500)
    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
    }
  }, [marca])
  return mostrar
}

function Palavras({ state, grupo }: { state: JanelaState; grupo: GrupoId }) {
  const minhas = state.palavras.filter((p) => p.grupo === grupo)
  if (!minhas.length) return null
  return (
    <details className="rounded-2xl border border-border bg-ink/80 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-gold">Palavras do nosso grupo ({minhas.length})</summary>
      <ul className="mt-3 flex flex-col gap-2">
        {minhas.map((p) => (
          <li key={p.id} className="rounded-xl bg-night/70 p-3 text-sm leading-snug text-parchment [overflow-wrap:anywhere]">
            {p.texto}
          </li>
        ))}
      </ul>
    </details>
  )
}

function FolhaPalavra({ grupo, agir, onClose }: { grupo: GrupoId; agir: Agir; onClose: () => void }) {
  const [texto, setTexto] = useState("")
  const [enviada, setEnviada] = useState(false)
  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/60" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Palavra recebida"
        className="max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-ink p-4 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto max-w-md">
          <h2 className="font-display text-xl text-gold-bright">Palavra recebida</h2>
          <p className="mt-1 text-sm text-mist">Uma palavra, impressão ou versículo que alguém recebeu orando por esses povos ou pelos pedidos.</p>
          {enviada ? (
            <p role="status" className="mt-4 rounded-xl border border-sage/50 bg-sage/10 p-3 text-center text-parchment">
              Enviada aos condutores.
            </p>
          ) : null}
          <textarea
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value)
              setEnviada(false)
            }}
            maxLength={MAX_TEXTO}
            rows={5}
            className="mt-3 w-full resize-none rounded-xl border border-border bg-night p-3 text-base text-parchment"
          />
          <p className="mt-1 text-right text-xs text-mist">
            {texto.length}/{MAX_TEXTO}
          </p>
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={onClose} className="min-h-12 flex-1 rounded-full border border-border px-4 text-sand">
              Fechar
            </button>
            <button
              type="button"
              disabled={!texto.trim()}
              onClick={() => {
                agir({ type: "palavra", id: crypto.randomUUID(), grupo, texto, agora: Date.now() })
                vibrate(HAPTIC.tap)
                setTexto("")
                setEnviada(true)
              }}
              className="min-h-12 flex-1 rounded-full bg-gold px-4 font-semibold text-night disabled:opacity-40"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Grande = ({ children }: { children: ReactNode }) => (
  <p className="text-balance font-display text-2xl leading-snug text-parchment [overflow-wrap:anywhere]">{children}</p>
)
const Telao = () => <p className="rounded-2xl border border-border bg-ink/80 p-4 text-center text-sand">Acompanhem no telão.</p>

function Conteudo({ state, agir, agora, grupo, etapa }: Props & { etapa: Etapa }) {
  const t = etapa.tela
  const passo = state.passo
  const minhaVisita = visitaDoGrupo(grupo)

  switch (t.tipo) {
    case "grupos":
    case "abertura": {
      const img = arteUrl(grupo, true)
      return (
        <>
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" className="h-40 w-full rounded-2xl object-cover" />
          )}
          {t.tipo === "abertura" && passo >= 1 && <JanelaMapa state={state} />}
          <Telao />
        </>
      )
    }

    case "isolamento":
      return passo === 0 ? (
        <Grande>{BARREIRAS[0].antes}</Grande>
      ) : (
        <>
          {ISOLAMENTO.slice(0, passo).map((g) => (
            <Bloco key={g.titulo} titulo={g.titulo}>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-base leading-snug text-parchment">
                {g.itens.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </Bloco>
          ))}
        </>
      )

    case "fatos":
      return (
        <>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{t.titulo}</p>
          {(t.fatos[passo] ?? []).map((id) => (
            <CardFato key={id} id={id} />
          ))}
        </>
      )

    case "oracao":
      return <Oracao state={state} agir={agir} grupo={grupo} etapa={etapa} oracao={t.oracao} />

    case "lingua":
      return passo === 0 ? (
        <Grande>{BARREIRAS[1].antes}</Grande>
      ) : (
        <>
          {LINGUA_INTRO.slice(0, passo - 1).map((p) => (
            <p key={p} className="text-sm leading-snug text-mist">
              {p}
            </p>
          ))}
          <Grande>{LINGUA_INTRO[passo - 1]}</Grande>
        </>
      )

    case "conhecer":
      return <Conhecer state={state} agir={agir} agora={agora} grupo={grupo} />

    case "encontro":
      return <Encontro state={state} agir={agir} agora={agora} grupo={grupo} />

    case "comparacao": {
      const ultimo = passo >= COMPARACAO.length
      const desde = primeiroItem(state, etapa)
      const linhas = desde > 0 ? [] : COMPARACAO.slice(0, Math.min(passo + 1, COMPARACAO.length))
      return (
        <>
          {linhas.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <p className="text-center text-xs font-semibold uppercase tracking-wider" style={{ color: COR.auren }}>
                Auren
              </p>
              <p className="text-center text-xs font-semibold uppercase tracking-wider" style={{ color: COR.nair }}>
                Nair
              </p>
              {linhas.map((l) => (
                <div key={l.tema} className="col-span-2 rounded-xl border border-border bg-ink/80 p-3">
                  <p className="mb-2 text-center text-xs uppercase tracking-[0.2em] text-gold">{l.tema}</p>
                  <div className="grid grid-cols-2 gap-2 text-center text-sm text-parchment">
                    <span>{l.auren}</span>
                    <span>{l.nair}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {ultimo && (
            <>
              <Bloco titulo="As palavras">
                <p className="font-display text-xl leading-relaxed text-parchment">
                  Aru = Sena · Meka = Veli · Tovan = Kor
                </p>
              </Bloco>
              <Grande>{MESMAS_PALAVRAS}</Grande>
            </>
          )}
        </>
      )
    }

    case "reflexao":
      return (
        <>
          <Grande>{perguntasEscolhidas(state)[passo]?.texto}</Grande>
          <p className="text-sand">Conversem no grupo.</p>
        </>
      )

    case "cultura":
      return (
        <>
          <Grande>{LINHAS_CULTURA.virada}</Grande>
          {passo >= 1 && (
            <>
              <p className="text-base leading-snug text-sand">{LINHAS_CULTURA.desafio}</p>
              <p className="text-base leading-snug text-parchment">{LINHAS_CULTURA.ideia}</p>
            </>
          )}
          {passo >= 2 && (
            <p className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-lg text-gold-bright">
              Vocês visitam os {VISITAS[minhaVisita].povo}.
            </p>
          )}
        </>
      )

    case "preparo":
      return <Preparo state={state} agir={agir} agora={agora} minha={minhaVisita} />

    case "visita":
      return <Visita state={state} agir={agir} agora={agora} grupo={grupo} visita={t.visita} />

    case "revelacao":
      return <Telao />

    case "sawi": {
      const s = SAWI_REAL[passo]
      return (
        <>
          <Telao />
          {s && (
            <>
              <Grande>{s.titulo}</Grande>
              {"declaracao" in s && <CardDeclaracao id={s.declaracao} />}
              {"fato" in s && <CardFato id={s.fato} />}
            </>
          )}
        </>
      )
    }

    case "permanencia":
      return (
        <>
          <Telao />
          {passo >= 1 && <CardFato id="sawi-50" />}
        </>
      )

    case "compromisso": {
      const ap = `grupo:${grupo}`
      const marcados = state.compromissos[ap] ?? []
      return (
        <>
          <ul className="flex flex-col gap-3">
            {COMPROMISSOS.map((c) => {
              const on = marcados.includes(c.id)
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => agir({ type: "comprometer", aparelho: ap, ops: on ? marcados.filter((x) => x !== c.id) : [...marcados, c.id] })}
                    className={cn("flex min-h-14 w-full items-start gap-3 rounded-2xl border p-4 text-left", on ? "border-gold bg-gold/15" : "border-border bg-ink/80")}
                  >
                    <span className="mt-0.5 text-lg" aria-hidden>
                      {on ? "☑" : "☐"}
                    </span>
                    <span className="text-base leading-snug text-parchment">
                      {c.texto}
                      {"ref" in c && <span className="mt-1 block text-sm text-gold">{formatRef(c.ref)}</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="text-sm text-mist">Cada pessoa também pode marcar no próprio celular pelo QR do telão.</p>
        </>
      )
    }

    case "fim":
      return (
        <>
          <JanelaMapa state={state} todas />
          <Grande>Obrigado por orar.</Grande>
        </>
      )
  }
}

function Oracao({ state, agir, grupo, etapa, oracao }: { state: JanelaState; agir: Agir; grupo: GrupoId; etapa: Etapa; oracao: keyof typeof ORACOES }) {
  const cards = cardsDaOracao(state, etapa)
  const card = cards[state.passo]
  const caiu = barreiraCaiu(state, etapa)
  const arte = BARREIRAS[etapa.bloco - 1]?.arte ?? "barreira-rio"
  const orou = !!card && !!state.oracoes[etapa.id]?.[card.id]?.includes(grupo)
  return (
    <>
      <Barreira arte={arte} rachadura={caiu ? 1 : rachadura(state)} aberta={caiu} celular className="h-28" />
      {caiu || !card ? (
        <Grande>{ORACOES[oracao].quebra}</Grande>
      ) : (
        <>
          {card.declaracao && <CardDeclaracao id={card.declaracao} />}
          {card.fato && <CardFato id={card.fato} />}
          {card.texto && (
            <div className="rounded-2xl border border-gold/30 bg-night/75 p-4">
              <p className="text-base italic leading-snug text-parchment">{card.texto.texto}</p>
              {card.texto.ref && <p className="mt-2 text-sm text-gold">{formatRef(card.texto.ref)}</p>}
            </div>
          )}
          <Grande>{card.pedido}</Grande>
          <button
            type="button"
            disabled={orou}
            onClick={() => {
              vibrate(HAPTIC.tap)
              agir({ type: "orou", grupo, etapa: etapa.id, card: card.id })
            }}
            className={cn("min-h-16 rounded-full px-4 text-xl font-semibold", orou ? "border border-sage/60 bg-sage/20 text-[#bfe3c7]" : "bg-gold text-night")}
          >
            {orou ? "✓ Oramos" : "Oramos"}
          </button>
        </>
      )}
    </>
  )
}

function CartaCultura({ grupo, compacta }: { grupo: GrupoId; compacta?: boolean }) {
  const c = CULTURAS[grupo]
  return (
    <div className="flex flex-col gap-3">
      {!compacta && (
        <>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: COR[grupo] }}>
            Segredo do {NOME[grupo]}
          </p>
          <h2 className="font-display text-2xl leading-tight text-parchment">{c.titulo}</h2>
          <p className="text-base leading-snug text-sand">{c.visao}</p>
        </>
      )}
      <ul className="flex flex-col gap-2">
        {c.regras.map((r) => (
          <li key={r.nome} className="rounded-xl border border-border bg-ink/80 p-3 text-sm leading-snug text-parchment">
            <b className="text-gold-bright">{r.nome}:</b> {r.texto}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {c.palavras.map((p) => (
          <span key={p.palavra} className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-sm text-gold-bright">
            {p.palavra} = {p.sentido}
          </span>
        ))}
      </div>
      {!compacta && <p className="text-sm leading-snug text-mist">{c.resto}</p>}
      <p className="text-sm font-semibold leading-snug text-parchment">{c.semPortugues}</p>
      <p className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm leading-snug text-gold-bright">{c.missao}</p>
    </div>
  )
}

function RelogioDaSala({ state, agir, agora }: Pick<Props, "state" | "agir" | "agora">) {
  const restante = useRestante(state.relogio, agora, (prazo) => agir({ type: "tempo", prazo }))
  if (!state.relogio) return null
  return <Relogio relogio={state.relogio} restante={restante} />
}

function Conhecer({ state, agir, agora, grupo }: Props) {
  return (
    <>
      <CartaCultura grupo={grupo} />
      <RelogioDaSala state={state} agir={agir} agora={agora} />
    </>
  )
}

function Encontro({ state, agir, agora, grupo }: Props) {
  const fez = state.compartilhou.includes(grupo)
  return (
    <>
      <Grande>{NAO_SAO_INIMIGOS}</Grande>
      <CartaCultura grupo={grupo} compacta />
      <button
        type="button"
        disabled={fez}
        onClick={() => agir({ type: "compartilhou", grupo })}
        className={cn("min-h-14 rounded-full px-4 py-2 font-semibold", fez ? "border border-sage/60 bg-sage/20 text-[#bfe3c7]" : "bg-gold text-night")}
      >
        {fez ? "✓ O outro povo compartilhou o objeto conosco" : "O outro povo compartilhou o objeto conosco"}
      </button>
      <RelogioDaSala state={state} agir={agir} agora={agora} />
    </>
  )
}

function Estudo({ visita }: { visita: keyof typeof VISITAS }) {
  return (
    <div className="flex flex-col gap-3">
      {VISITAS[visita].estudo.map((it, i) => (
        <div key={i}>{it.declaracao ? <CardDeclaracao id={it.declaracao} /> : it.fato ? <CardFato id={it.fato} /> : null}</div>
      ))}
    </div>
  )
}

function Preparo({ state, agir, agora, minha }: Pick<Props, "state" | "agir" | "agora"> & { minha: keyof typeof VISITAS }) {
  const [aba, setAba] = useState<"msg" | "estudo">("msg")
  const v = VISITAS[minha]
  return (
    <>
      <div role="tablist" className="grid grid-cols-2 gap-2">
        {([["msg", "Mensagens"], ["estudo", "Estudo do povo"]] as const).map(([id, rotulo]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            onClick={() => setAba(id)}
            className={cn("min-h-11 rounded-full border px-2 text-sm font-semibold", aba === id ? "border-gold bg-gold/15 text-gold-bright" : "border-border text-sand")}
          >
            {rotulo}
          </button>
        ))}
      </div>
      {aba === "msg" ? (
        <div className="flex flex-col gap-3">
          {v.mensagens.map((m) => (
            <CardMensagem key={m.id} m={m} />
          ))}
        </div>
      ) : (
        <Estudo visita={minha} />
      )}
      <RelogioDaSala state={state} agir={agir} agora={agora} />
      <p className="text-base text-parchment">Escolham quem vai falar com {v.lider}.</p>
    </>
  )
}

function Visita({ state, agir, agora, grupo, visita }: Props & { visita: keyof typeof VISITAS }) {
  const v = VISITAS[visita]
  const visitando = v.visitante === grupo
  const passo = state.passo
  const resp = state.respostas[visita]
  return (
    <>
      {visitando ? (
        <>
          <Grande>Vocês estão visitando os {v.povo}.</Grande>
          <div className="flex flex-col gap-3">
            {v.mensagens.map((m) => (
              <CardMensagem key={m.id} m={m} />
            ))}
          </div>
        </>
      ) : (
        <>
          <Grande>Ouçam como se vocês conhecessem os {v.povo}.</Grande>
          <Estudo visita={visita} />
          {passo >= 2 && (
            <Bloco titulo="Esse povo entenderia?">
              <div className="grid grid-cols-3 gap-2">
                {RESPOSTAS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={resp === r.id}
                    onClick={() => agir({ type: "responder", visita, grupo, valor: r.id })}
                    className={cn("min-h-14 rounded-xl border px-1 font-semibold", resp === r.id ? "border-gold bg-gold text-night" : "border-border bg-night text-parchment")}
                  >
                    {r.rotulo}
                  </button>
                ))}
              </div>
            </Bloco>
          )}
        </>
      )}
      <RelogioDaSala state={state} agir={agir} agora={agora} />
    </>
  )
}
