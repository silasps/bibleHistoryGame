"use client"

import { AnimatePresence, motion } from "motion/react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { Volume2 } from "lucide-react"
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import {
  BARREIRAS,
  COMPARACAO,
  COMPROMISSOS,
  CULTURAS,
  DEFINICAO,
  ISOLAMENTO,
  LINGUA_INTRO,
  LINHAS_CULTURA,
  MARCAS,
  MESMAS_PALAVRAS,
  NAO_SAO_INIMIGOS,
  ORACOES,
  RESPOSTAS,
  SAWI_REAL,
  SEARA,
  VISITAS,
  getDeclaracao,
  getFato,
  type Etapa,
} from "@/content/janela-verde"
import { formatRef } from "@/content/refs"
import {
  barreiraCaiu,
  cardsDaOracao,
  contarCompromissos,
  etapaAtual,
  perguntasEscolhidas,
  pessoasComprometidas,
  rachadura,
  type JanelaAction,
  type JanelaState,
} from "@/domain/janela-verde"
import { soundEngine, type Mood } from "@/fx/sound"
import { useFx } from "@/fx/useFx"
import { useMood, useSoundState, useStinger } from "@/fx/useSound"
import { useFullscreen } from "@/components/app/useFullscreen"
import { usePreferences } from "@/stores/preferences-store"
import { useChaveJanela, useJanela } from "@/stores/janela-sala"
import { cn } from "@/lib/utils"
import { CardDeclaracao, CardFato, Fundo, IconeMarca, Relogio, SeloMarca, arteUrl, useRestante } from "./comum"
import { Barreira, JanelaMapa, Trilha } from "./visuais"

// Telão da Janela Verde: o que todos veem. Único aparelho com som (a
// floresta). Teclas: → / espaço avança, ← volta, F tela cheia, C mostra o QR
// do condutor (só para parear; não deixe no projetor).

const origem = () => window.location.origin
const useOrigem = () => useSyncExternalStore(() => () => {}, origem, () => "")

function Centro({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex h-full flex-col items-center justify-center gap-[2vh] text-center", className)}>{children}</div>
}

function Grande({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("max-w-[70vw] font-display text-[4.2vw] leading-[1.08] text-parchment", className)}>{children}</p>
}

const COR_GRUPO = { auren: "#e0866c", nair: "#7fae8b" }

function moodDe(state: JanelaState, e: Etapa): Mood {
  if (e.tela.tipo === "fim" || (e.tela.tipo === "oracao" && barreiraCaiu(state, e))) return "floresta"
  if (e.marca === "oracao") return "floresta-oracao"
  if (state.relogio?.prazo && (e.tela.tipo === "visita" || e.tela.tipo === "encontro" || e.tela.tipo === "preparo")) return "floresta-fala"
  return "floresta"
}

function Conteudo({ state, e, agora, agir, code }: { state: JanelaState; e: Etapa; agora: () => number; agir: (a: JanelaAction) => void; code: string }) {
  const p = state.passo
  const restante = useRestante(state.relogio, agora, (prazo) => agir({ type: "tempo", prazo }))
  const origemUrl = useOrigem()
  const t = e.tela
  switch (t.tipo) {
    case "grupos":
      return (
        <Centro>
          <p className="font-display text-[6vw] leading-none text-gold-bright">Janela Verde</p>
          <p className="text-[1.8vw] text-sand">Formem os grupos. Um celular por grupo lê o QR.</p>
          <div className="mt-[2vh] flex items-center gap-[3vw]">
            {(["auren", "nair"] as const).map((g) => (
              <div key={g} className="relative w-[20vw] overflow-hidden rounded-[1.5vw] border-2 bg-night/70 p-[1.2vw]" style={{ borderColor: COR_GRUPO[g] }}>
                {arteUrl(g) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={arteUrl(g)!} alt="" className="mb-[0.8vw] aspect-video w-full rounded-[0.8vw] object-cover" />
                )}
                <p className="font-display text-[2.6vw]" style={{ color: COR_GRUPO[g] }}>
                  Grupo {CULTURAS[g].nome}
                </p>
                <p className="text-[1.2vw] text-mist">{state.conectados[g] ? "✓ celular conectado" : "esperando o celular…"}</p>
              </div>
            ))}
            <div className="rounded-[1vw] bg-parchment p-[0.8vw]">
              {origemUrl && <QRCodeSVG value={`${origemUrl}/janela-verde/sala/${code}`} size={220} bgColor="#f1e8d6" fgColor="#05070d" className="size-[13vw]" />}
              <p className="mt-[0.4vw] font-display text-[2vw] tracking-[0.2em] text-night">{code}</p>
            </div>
          </div>
          <p className="text-[1vw] text-mist">Povos simulados para a dinâmica · os povos reais aparecem com fonte</p>
        </Centro>
      )
    case "abertura":
      return p === 0 ? (
        <Centro>
          <p className="font-display text-[7vw] leading-none text-gold-bright">Janela Verde</p>
          <p className="max-w-[62vw] text-[2.1vw] leading-snug text-parchment">{DEFINICAO}</p>
          <p className="mt-[2vh] font-display text-[2.6vw] text-sand">Hoje esta sala vira dois povos da Janela Verde.</p>
        </Centro>
      ) : (
        <Centro>
          <JanelaMapa state={state} className="max-w-[72vw]" />
          <div className="grid w-[78vw] grid-cols-3 gap-[1.2vw] text-left">
            {["jv-faixa", "jv-povos", "jv-regioes"].map((id) => (
              <CardFato key={id} id={id} grande />
            ))}
          </div>
        </Centro>
      )
    case "isolamento":
      return (
        <div className="grid h-full grid-cols-[1fr_1.1fr] items-center gap-[3vw]">
          <div className="flex flex-col gap-[2vh]">
            <p className="text-[1.3vw] uppercase tracking-[0.3em] text-gold">Barreira 1</p>
            <Grande className="text-[4vw]">{BARREIRAS[0].antes}</Grande>
            <Barreira arte="barreira-rio" rachadura={0} aberta={false} className="aspect-video w-full" />
          </div>
          <div className="flex flex-col gap-[2vh]">
            {ISOLAMENTO.slice(0, p).map((bloco) => (
              <motion.section key={bloco.titulo} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.2vw] border border-border bg-night/75 p-[1.4vw]">
                <h3 className="font-display text-[2.2vw] text-gold-bright">{bloco.titulo}</h3>
                <ul className="mt-[0.6vw] space-y-[0.4vw] text-[1.6vw] text-parchment">
                  {bloco.itens.map((i) => (
                    <li key={i}>• {i}</li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </div>
        </div>
      )
    case "fatos": {
      const grupo = t.fatos[Math.min(p, t.fatos.length - 1)]
      return (
        <Centro>
          <p className="text-[1.4vw] uppercase tracking-[0.3em] text-gold">{t.titulo}</p>
          <p className="font-display text-[4.4vw] leading-none text-parchment">{getFato(grupo[0]).povo}</p>
          <div className={cn("grid w-[80vw] gap-[1.2vw] text-left", grupo.length > 1 ? "grid-cols-3" : "max-w-[50vw] grid-cols-1")}>
            {grupo.map((id) => (
              <CardFato key={id} id={id} grande />
            ))}
          </div>
        </Centro>
      )
    }
    case "oracao": {
      const cards = cardsDaOracao(state, e)
      const barreira = BARREIRAS[e.bloco - 1]
      const caiu = barreiraCaiu(state, e)
      if (caiu)
        return (
          <div className="grid h-full grid-cols-[1.3fr_1fr] items-center gap-[3vw]">
            <motion.p initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} className="font-display text-[4.8vw] leading-[1.05] text-gold-bright">
              {ORACOES[t.oracao].quebra}
            </motion.p>
            <div className="flex flex-col gap-[1.5vh]">
              <Barreira arte={barreira.arte} rachadura={1} aberta className="aspect-[4/3] w-full" />
              <JanelaMapa state={state} todas={e.bloco === 4} />
            </div>
          </div>
        )
      return (
        <div className="grid h-full grid-cols-[minmax(0,1fr)_21vw] gap-[2vw]">
          <div className={cn("grid min-h-0 content-center gap-[1.2vw]", cards.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
            {cards.map((card) => (
              <PedidoTelao key={card.id} card={card} grupos={state.oracoes[e.id]?.[card.id] ?? []} />
            ))}
          </div>
          <div className="flex min-h-0 flex-col justify-center gap-[1.5vh]">
            <Barreira arte={barreira.arte} rachadura={rachadura(state, e)} aberta={false} className="aspect-[4/3] w-full" />
            <JanelaMapa state={state} todas={e.bloco === 4} />
          </div>
        </div>
      )
    }
    case "lingua":
      return p === 0 ? (
        <div className="grid h-full grid-cols-[1fr_1fr] items-center gap-[3vw]">
          <div>
            <p className="text-[1.3vw] uppercase tracking-[0.3em] text-gold">Barreira 2</p>
            <Grande>{BARREIRAS[1].antes}</Grande>
          </div>
          <Barreira arte="barreira-lingua" rachadura={0} aberta={false} className="aspect-[4/3] w-full" />
        </div>
      ) : (
        <Centro className="items-start text-left">
          {LINGUA_INTRO.slice(Math.max(0, p - 3), p - 1).map((l) => (
            <p key={l} className="max-w-[75vw] text-[1.6vw] text-mist">
              {l}
            </p>
          ))}
          <motion.p key={p} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-[75vw] font-display text-[3.4vw] leading-tight text-parchment">
            {LINGUA_INTRO[p - 1]}
          </motion.p>
          <p className="text-[1vw] uppercase tracking-[0.3em] text-mist">Povos simulados</p>
        </Centro>
      )
    case "conhecer":
      return (
        <Centro>
          <p className="font-display text-[3.4vw] text-parchment">Conheçam o seu povo</p>
          <p className="text-[1.6vw] text-sand">Leiam o card secreto no celular do grupo. Não contem para o outro grupo.</p>
          <div className="flex items-center gap-[4vw]">
            {(["auren", "nair"] as const).map((g) => (
              <div key={g} className="grid size-[14vw] place-items-center rounded-full border-4 bg-night/70 font-display text-[6vw]" style={{ borderColor: COR_GRUPO[g], color: COR_GRUPO[g] }}>
                ?
              </div>
            ))}
            <Relogio relogio={state.relogio} restante={restante} grande />
          </div>
        </Centro>
      )
    case "encontro":
      return (
        <Centro>
          <Grande className="text-[4.6vw]">{NAO_SAO_INIMIGOS}</Grande>
          <div className="flex items-center gap-[4vw]">
            {(["auren", "nair"] as const).map((g) => (
              <p key={g} className="text-[1.6vw]" style={{ color: state.compartilhou.includes(g) ? COR_GRUPO[g] : "#9aa4b8" }}>
                {state.compartilhou.includes(g) ? "✓" : "○"} {CULTURAS[g].nome}: o outro povo compartilhou o objeto
              </p>
            ))}
          </div>
          <Relogio relogio={state.relogio} restante={restante} grande />
        </Centro>
      )
    case "comparacao":
      return (
        <Centro>
          <p className="font-display text-[3.4vw] text-parchment">A revelação</p>
          <table className="w-[70vw] border-separate border-spacing-y-[0.5vw] text-[1.8vw]">
            <thead>
              <tr className="text-[1.2vw] uppercase tracking-[0.25em]">
                <th />
                <th style={{ color: COR_GRUPO.auren }}>Auren</th>
                <th style={{ color: COR_GRUPO.nair }}>Nair</th>
              </tr>
            </thead>
            <tbody>
              {COMPARACAO.slice(0, p + 1).map((l) => (
                <motion.tr key={l.tema} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-night/70">
                  <td className="rounded-l-[0.8vw] px-[1vw] py-[0.6vw] text-left text-mist">{l.tema}</td>
                  <td className="px-[1vw] text-parchment">{l.auren}</td>
                  <td className="rounded-r-[0.8vw] px-[1vw] text-parchment">{l.nair}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {p >= COMPARACAO.length && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-[1vh]">
              <p className="font-display text-[2.6vw] text-parchment">
                {CULTURAS.auren.palavras.map((w, i) => `${w.palavra} = ${CULTURAS.nair.palavras[i].palavra}`).join(" · ")}
              </p>
              <p className="text-[1.4vw] text-mist">{CULTURAS.auren.palavras.map((w) => w.sentido).join(" · ")}</p>
              <p className="font-display text-[3.4vw] text-gold-bright">{MESMAS_PALAVRAS}</p>
            </motion.div>
          )}
        </Centro>
      )
    case "reflexao": {
      const lista = perguntasEscolhidas(state)
      const q = lista[Math.min(p, lista.length - 1)]
      return (
        <Centro>
          <p className="text-[1.3vw] uppercase tracking-[0.3em] text-gold">
            {q?.grupo === "missionaria" ? "Fazendo a conexão missionária" : "Sobre a experiência"} · {p + 1} de {lista.length}
          </p>
          <Grande className="max-w-[78vw] text-[3.6vw]">{q?.texto}</Grande>
        </Centro>
      )
    }
    case "cultura":
      return (
        <div className="grid h-full grid-cols-[1.2fr_1fr] items-center gap-[3vw]">
          <div className="flex flex-col gap-[2vh]">
            <p className="text-[1.3vw] uppercase tracking-[0.3em] text-gold">Barreira 3</p>
            <Grande>{LINHAS_CULTURA.virada}</Grande>
            {p >= 1 && <p className="text-[2.2vw] leading-snug text-sand">{LINHAS_CULTURA.desafio}</p>}
            {p >= 1 && <p className="font-display text-[2.6vw] text-gold-bright">{LINHAS_CULTURA.ideia}</p>}
          </div>
          {p >= 2 ? (
            <div className="flex flex-col gap-[1.5vh]">
              {(Object.values(VISITAS) as (typeof VISITAS)[keyof typeof VISITAS][]).map((v) => (
                <div key={v.id} className="flex items-center gap-[1.2vw] rounded-[1.2vw] border border-border bg-night/75 p-[1.2vw]">
                  <span className="font-display text-[2.2vw]" style={{ color: COR_GRUPO[v.visitante] }}>
                    Grupo {CULTURAS[v.visitante].nome}
                  </span>
                  <span className="text-[2vw] text-mist">→</span>
                  <span className="font-display text-[2.6vw] text-parchment">{v.povo}</span>
                </div>
              ))}
              <p className="text-[1.1vw] text-mist">Povos reais. Ninguém faz o papel deles.</p>
            </div>
          ) : (
            <Barreira arte="barreira-cultura" rachadura={0} aberta={false} className="aspect-[4/3] w-full" />
          )}
        </div>
      )
    case "preparo":
      return (
        <Centro>
          <p className="font-display text-[3.4vw] text-parchment">Preparem a visita</p>
          <p className="text-[1.6vw] text-sand">Leiam as mensagens e o estudo do povo no celular. Escolham quem vai falar com o chefe.</p>
          <div className="flex items-center gap-[3vw]">
            {(Object.values(VISITAS) as (typeof VISITAS)[keyof typeof VISITAS][]).map((v) => (
              <div key={v.id} className="w-[22vw] rounded-[1.2vw] border border-border bg-night/75 p-[1.2vw]">
                <p className="font-display text-[2.6vw] text-parchment">{v.povo}</p>
                <p className="text-[1.2vw] text-mist">Grupo {CULTURAS[v.visitante].nome}</p>
              </div>
            ))}
            <Relogio relogio={state.relogio} restante={restante} grande />
          </div>
        </Centro>
      )
    case "visita": {
      const v = VISITAS[t.visita]
      const quem = state.recebe[v.id]
      const usadas = state.pistas[v.id]?.length ?? 0
      const resposta = state.respostas[v.id]
      return (
        <div className="grid h-full grid-cols-[1.3fr_1fr] items-center gap-[3vw]">
          <div className="flex flex-col gap-[2vh]">
            <p className="text-[1.3vw] uppercase tracking-[0.3em] text-gold">{v.quando}</p>
            <Grande className="text-[4vw]">
              Os missionários do Grupo {CULTURAS[v.visitante].nome} chegam aos {v.povo}.
            </Grande>
            {quem && (
              <p className="text-[2vw] leading-snug text-sand">
                Quem recebe vocês é <b className="text-gold-bright">{quem}</b>, que vive entre os {v.povo} há muitos anos.
              </p>
            )}
            {p >= 1 && p < 2 && <p className="font-display text-[2.4vw] text-parchment">Falem com {v.lider}.</p>}
            {p >= 2 && (
              <div className="rounded-[1.2vw] border border-border bg-night/75 p-[1.4vw]">
                <p className="text-[1.5vw] text-sand">Esse povo entenderia? (Grupo {CULTURAS[v.visitante === "auren" ? "nair" : "auren"].nome})</p>
                <p className="font-display text-[3.4vw] text-gold-bright">{resposta ? RESPOSTAS.find((r) => r.id === resposta)?.rotulo : "…"}</p>
                <p className="text-[1.5vw] text-parchment">
                  Pistas usadas: {usadas} de {v.pistas.length}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-[2vh]">
            {arteUrl(v.arte) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={arteUrl(v.arte)!} alt="" className="aspect-[4/5] w-[24vw] rounded-[1.4vw] object-cover" />
            )}
            <Relogio relogio={state.relogio} restante={restante} grande />
          </div>
        </div>
      )
    }
    case "revelacao": {
      const v = VISITAS[p === 0 ? "yanomami" : "sawi"]
      const usadas = state.pistas[v.id] ?? []
      return (
        <Centro>
          <p className="text-[1.3vw] uppercase tracking-[0.3em] text-gold">A revelação · {v.povo}</p>
          <p className="font-display text-[3vw] text-parchment">Estava no estudo do povo:</p>
          <ul className="grid w-[80vw] grid-cols-2 gap-[1.2vw] text-left">
            {v.pistas.map((pi) => (
              <li key={pi.id} className={cn("rounded-[1.2vw] border p-[1.2vw]", usadas.includes(pi.id) ? "border-sage/60 bg-sage/10" : "border-border bg-night/75")}>
                <p className="text-[1.2vw] text-mist">{usadas.includes(pi.id) ? "✓ vocês usaram" : "○ ficou de fora"}</p>
                <p className="text-[1.8vw] leading-snug text-parchment">{pi.revelacao}</p>
              </li>
            ))}
          </ul>
        </Centro>
      )
    }
    case "sawi": {
      const passo = SAWI_REAL[Math.min(p, SAWI_REAL.length - 1)]
      return (
        <div className="grid h-full grid-cols-[1.4fr_1fr] items-center gap-[3vw]">
          <div className="flex flex-col gap-[2vh]">
            <p className="text-[1.3vw] uppercase tracking-[0.3em] text-gold">Na vida real · Sawi, 1962 · {p + 1} de 3</p>
            <Grande className="text-[3.6vw]">{passo.titulo}</Grande>
            {"declaracao" in passo && passo.declaracao && <CardDeclaracao id={passo.declaracao} grande />}
            {"fato" in passo && passo.fato && <CardFato id={passo.fato} grande />}
            {"depois" in passo && passo.depois && <CardDeclaracao id={passo.depois} grande />}
            {p >= 2 && <p className="font-display text-[2.6vw] text-gold-bright">{LINHAS_CULTURA.naVidaReal}</p>}
          </div>
          {arteUrl(p >= 2 ? "sawi-filho-da-paz" : "sawi-paz") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={arteUrl(p >= 2 ? "sawi-filho-da-paz" : "sawi-paz")!} alt="" className="aspect-[4/5] w-full rounded-[1.4vw] object-cover" />
          ) : (
            <JanelaMapa state={state} />
          )}
        </div>
      )
    }
    case "permanencia":
      return (
        <div className="grid h-full grid-cols-[1.2fr_1fr] items-center gap-[3vw]">
          <div className="flex flex-col gap-[2vh]">
            <p className="text-[1.3vw] uppercase tracking-[0.3em] text-gold">Barreira 4</p>
            <Grande>{BARREIRAS[3].antes}</Grande>
            {p >= 1 && <CardFato id="sawi-50" grande />}
          </div>
          <Barreira arte="barreira-semente" rachadura={0} aberta={false} className="aspect-[4/3] w-full" />
        </div>
      )
    case "compromisso": {
      const conta = contarCompromissos(state)
      return (
        <div className="grid h-full grid-cols-[1.5fr_1fr] items-center gap-[3vw]">
          <div className="flex flex-col gap-[1.4vh]">
            <p className="font-display text-[3.4vw] text-parchment">Compromisso: eu fico</p>
            {COMPROMISSOS.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-[1vw] rounded-[1vw] border border-border bg-night/75 px-[1.4vw] py-[0.9vw]">
                <p className="text-[1.8vw] text-parchment">
                  {c.texto} {"ref" in c && c.ref && <span className="text-[1.1vw] text-mist">({formatRef(c.ref)})</span>}
                </p>
                <span className="font-display text-[2.6vw] tabular-nums text-gold-bright">{conta[c.id] ?? 0}</span>
              </div>
            ))}
            <p className="text-[1.3vw] text-mist">{pessoasComprometidas(state)} pessoas marcaram · anônimo</p>
          </div>
          <div className="flex flex-col items-center gap-[1vh] rounded-[1.4vw] bg-parchment p-[1.2vw] text-night">
            {origemUrl && <QRCodeSVG value={`${origemUrl}/janela-verde/compromisso/${code}`} size={260} bgColor="#f1e8d6" fgColor="#05070d" className="size-[18vw]" />}
            <p className="text-[1.3vw] font-semibold">Quem quiser, marque o seu compromisso</p>
          </div>
        </div>
      )
    }
    case "fim":
      return (
        <Centro>
          <JanelaMapa state={state} todas className="max-w-[70vw]" />
          <p className="font-display text-[6vw] leading-none text-gold-bright">Agora vocês sabem.</p>
          <p className="max-w-[60vw] font-display text-[2.6vw] text-parchment">{SEARA.texto}</p>
          <p className="text-[1.2vw] text-mist">{formatRef(SEARA.ref)} · NAA</p>
        </Centro>
      )
  }
}

type CardDeOracao = (typeof ORACOES)[keyof typeof ORACOES]["cards"][number]

/** Um pedido de oração, compacto, para caber junto com os outros. */
function PedidoTelao({ card, grupos }: { card: CardDeOracao; grupos: string[] }) {
  const d = card.declaracao ? getDeclaracao(card.declaracao) : null
  const f = card.fato ? getFato(card.fato) : null
  return (
    <section className="flex min-w-0 flex-col gap-[0.6vw] rounded-[1.2vw] border border-gold/25 bg-night/80 p-[1.2vw]">
      {d && (
        <figure>
          <blockquote className="font-display text-[1.5vw] leading-[1.2] text-parchment">{d.kind === "citacao" ? `\u201c${d.texto}\u201d` : d.texto}</blockquote>
          <figcaption className="mt-[0.3vw] text-[0.85vw] leading-snug text-sand">
            <b className="text-gold-bright">{d.quem}</b> · {d.papel} · <span className="text-mist/80">Fonte: {d.fonte.nome}</span>
          </figcaption>
        </figure>
      )}
      {f && (
        <p className="text-[1.15vw] leading-snug text-sand">
          {f.texto} <span className="text-[0.8vw] text-mist/80">Fonte: {f.fonte.nome}</span>
        </p>
      )}
      {card.texto && (
        <p className="font-display text-[1.5vw] leading-[1.2] text-parchment">
          {card.texto.texto}
          {card.texto.ref && <span className="ml-[0.5vw] font-sans text-[0.85vw] text-mist">{formatRef(card.texto.ref)} · NAA</span>}
        </p>
      )}
      <p className="mt-auto font-display text-[1.75vw] leading-tight text-gold-bright">{card.pedido}</p>
      <p className="text-[0.95vw] text-sand">
        {(["auren", "nair"] as const).map((g) => (
          <span key={g} className="mr-[1vw]" style={{ color: grupos.includes(g) ? COR_GRUPO[g] : "#5b6478" }}>
            {grupos.includes(g) ? "✓" : "○"} {CULTURAS[g].nome} orou
          </span>
        ))}
      </p>
    </section>
  )
}

/** Palavra recebida que os condutores escolheram mostrar. */
function PalavraNoTelao({ state }: { state: JanelaState }) {
  const w = state.palavras.find((p) => p.id === state.noTelao)
  if (!w) return null
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-[10vw] bottom-[8vw] z-30 rounded-[1.4vw] border border-gold/50 bg-night/90 p-[1.6vw] shadow-2xl">
      <p className="text-[1.1vw] uppercase tracking-[0.25em] text-gold">Palavra recebida pelo Grupo {CULTURAS[w.grupo].nome}</p>
      <p className="mt-[0.5vw] whitespace-pre-wrap font-display text-[2.6vw] leading-tight text-parchment">{w.texto}</p>
    </motion.div>
  )
}

/** Cartão de transição quando muda a marca (explicação, dinâmica, oração). */
function Transicao({ etapa }: { etapa: Etapa }) {
  const [visivel, setVisivel] = useState<Etapa["marca"] | null>(null)
  const anterior = useRef(etapa.marca)
  useEffect(() => {
    if (anterior.current === etapa.marca) return
    anterior.current = etapa.marca
    const abrir = setTimeout(() => setVisivel(etapa.marca), 0)
    const fechar = setTimeout(() => setVisivel(null), 3000)
    return () => {
      clearTimeout(abrir)
      clearTimeout(fechar)
    }
  }, [etapa.marca])
  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setVisivel(null)}
          className="absolute inset-0 z-40 grid place-items-center bg-night/90"
        >
          <div className="flex flex-col items-center gap-[2vh]">
            <IconeMarca marca={visivel} className="size-[9vw]" />
            <p className="font-display text-[7vw] leading-none" style={{ color: MARCAS[visivel].cor }}>
              {MARCAS[visivel].rotulo}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LigarSom() {
  const sound = usePreferences((s) => s.sound)
  const setSound = usePreferences((s) => s.setSound)
  const motor = useSoundState()
  if (sound && motor === "ready")
    return (
      <button
        type="button"
        title="Testar o som"
        onClick={() => soundEngine.stinger("light")}
        className="inline-flex items-center gap-2 rounded-full border border-sage/50 px-[0.9vw] py-[0.35vw] text-[0.9vw] text-[#bfe3c7]"
      >
        <Volume2 className="size-[1.1vw]" aria-hidden /> Floresta tocando
      </button>
    )
  return (
    <button
      type="button"
      onClick={() => {
        setSound(true)
        void soundEngine.start()
      }}
      className="inline-flex items-center gap-2 rounded-full bg-gold px-[1vw] py-[0.45vw] text-[1vw] font-semibold text-night"
    >
      <Volume2 className="size-[1.2vw]" aria-hidden /> Ligar o som da floresta
    </button>
  )
}

function QrCondutor({ code, chave, fechar }: { code: string; chave: string; fechar: () => void }) {
  const o = useOrigem()
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-night/95" onClick={fechar}>
      <div className="flex flex-col items-center gap-[1.5vh] rounded-[1.5vw] bg-parchment p-[2vw] text-night">
        {o && <QRCodeSVG value={`${o}/janela-verde/conduzir/${code}#${chave}`} size={320} bgColor="#f1e8d6" fgColor="#05070d" className="size-[22vw]" />}
        <p className="text-[1.4vw] font-semibold">QR do condutor (Silas e Kézia)</p>
        <p className="max-w-[30vw] text-center text-[1vw]">Quem ler este QR controla a apresentação. Não deixe no projetor. Toque para fechar (ou tecla C).</p>
      </div>
    </div>
  )
}

export function TelaoJanela({ code }: { code: string }) {
  const [chave] = useChaveJanela(code)
  const { state, agir, agora, erro } = useJanela(code, chave)
  const { toggle } = useFullscreen()
  const [qr, setQr] = useState(false)
  const router = useRouter()
  const stinger = useStinger()
  const fx = useFx()
  const e = state ? etapaAtual(state) : null
  const mood = state && e ? moodDe(state, e) : null
  useMood(mood)
  // Carrega o motor de som já na abertura, para o clique liberar o áudio na hora.
  useEffect(() => soundEngine.preload(), [])

  // Volume e mudo vêm do condutor.
  const volume = state?.som.volume
  const mudo = state?.som.mudo
  useEffect(() => {
    if (volume === undefined) return
    soundEngine.setVolume(volume)
    soundEngine.setMuted(!!mudo)
  }, [volume, mudo])

  // Som de revelação quando a barreira cai.
  const caiu = state && e ? barreiraCaiu(state, e) : false
  useEffect(() => {
    if (caiu) stinger("reveal")
  }, [caiu, stinger])

  // Teclado do computador do telão (com a chave).
  const etapaN = state?.etapa
  const passoN = state?.passo
  useEffect(() => {
    const posicao = etapaN === undefined || passoN === undefined ? null : { etapa: etapaN, passo: passoN }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) return
      if (ev.key === "f" || ev.key === "F") toggle()
      if ((ev.key === "c" || ev.key === "C") && chave) setQr((q) => !q)
      if (!posicao || !chave) return
      if (ev.key === "ArrowRight" || ev.key === " " || ev.key === "PageDown") {
        ev.preventDefault()
        agir({ type: "avancar", de: posicao, agora: agora() })
      }
      if (ev.key === "ArrowLeft" || ev.key === "PageUp") {
        ev.preventDefault()
        agir({ type: "voltar", de: posicao, agora: agora() })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [etapaN, passoN, chave, agir, agora, toggle])

  const o = useOrigem()
  if (!state || !e)
    return (
      <main className="grid min-h-dvh place-items-center bg-night text-center">
        <p className="text-[2vw] text-mist">{erro ?? "Entrando na sala…"}</p>
      </main>
    )

  return (
    <div className="fixed inset-0 overflow-hidden bg-night text-parchment">
      <Fundo arte={e.arte} escuro={e.marca === "oracao" ? 0.78 : 0.62} />
      {e.marca === "oracao" && <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgb(244_210_122/0.16),transparent_65%)]" />}
      <div className="relative z-10 flex h-full flex-col px-[3vw] py-[2vw]">
        <header className="flex items-center justify-between gap-[2vw]">
          <div className="flex items-center gap-[1.2vw]">
            <p className="font-display text-[2vw] text-gold-bright">Janela Verde</p>
            <SeloMarca marca={e.marca} grande />
            <p className="truncate text-[1.2vw] text-mist">{e.titulo}</p>
          </div>
          <div className="flex items-center gap-[1vw]">
            <LigarSom />
            <button
              type="button"
              onClick={() => window.confirm("Sair do telão? A sala continua; dá para voltar pelo mesmo link.") && router.push("/janela-verde")}
              className="rounded-full border border-border/60 px-[0.8vw] py-[0.3vw] text-[0.85vw] text-mist/70 hover:text-parchment"
            >
              Sair
            </button>
            {chave && (
              <button
                type="button"
                onClick={() => setQr(true)}
                title="Parear o celular de um condutor (tecla C)"
                className="rounded-full border border-border/60 px-[0.8vw] py-[0.3vw] text-[0.85vw] text-mist/70 hover:text-parchment"
              >
                Condutor
              </button>
            )}
            {e.tela.tipo !== "grupos" && o && (
              <div className="flex items-center gap-[0.7vw] rounded-[0.8vw] border border-border bg-night/80 p-[0.45vw] pr-[0.9vw]">
                <div className="rounded-[0.4vw] bg-parchment p-[0.25vw]">
                  <QRCodeSVG value={`${o}/janela-verde/sala/${code}`} size={96} bgColor="#f1e8d6" fgColor="#05070d" className="size-[4.6vw]" />
                </div>
                <div className="leading-tight">
                  <p className="text-[0.85vw] text-mist">Celular do grupo saiu?</p>
                  <p className="text-[0.95vw] font-semibold text-sand">Leia para voltar</p>
                  <p className="font-display text-[1.3vw] tracking-[0.15em] text-parchment">{code}</p>
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="min-h-0 flex-1 py-[1.5vw]">
          <AnimatePresence mode="wait">
            <motion.div key={`${e.id}`} className="h-full" initial={fx.motion ? { opacity: 0 } : false} animate={{ opacity: 1 }} exit={fx.motion ? { opacity: 0 } : undefined} transition={{ duration: 0.18 }}>
              <Conteudo state={state} e={e} agora={agora} agir={agir} code={code} />
            </motion.div>
          </AnimatePresence>
        </main>
        <Trilha state={state} />
      </div>
      <PalavraNoTelao state={state} />
      <Transicao etapa={e} />
      {qr && chave && <QrCondutor code={code} chave={chave} fechar={() => setQr(false)} />}

    </div>
  )
}
