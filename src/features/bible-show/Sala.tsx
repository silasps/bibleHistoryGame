"use client"

import { LogIn, Share2, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { useMemo, useState, useSyncExternalStore } from "react"
import { emJogo } from "@/domain/bible-show"
import { useNoAparelho, useSalaShow } from "@/stores/bible-show-sala"
import { Partida } from "./BibleShow"
import type { Jogo } from "./jogo"
import { cn } from "@/lib/utils"
import { Peao } from "./Trilha"

const urlAtual = () => window.location.href.split("?")[0]

/** Código e QR para os outros celulares entrarem (ou voltarem). */
function Convite({ code }: { code: string }) {
  const url = useSyncExternalStore(
    () => () => {},
    urlAtual,
    () => "",
  )
  const [copiou, setCopiou] = useState(false)
  const compartilhar = async () => {
    try {
      if (navigator.share) return await navigator.share({ title: "Bible Show", text: `Entre na sala ${code} do Bible Show`, url })
      await navigator.clipboard.writeText(url)
      setCopiou(true)
      setTimeout(() => setCopiou(false), 2500)
    } catch {
      // Quem cancelou o compartilhamento não precisa de aviso.
    }
  }
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="rounded-2xl bg-parchment p-3">{url && <QRCodeSVG value={url} size={200} bgColor="#f1e8d6" fgColor="#05070d" level="M" aria-label={`QR code da sala ${code}`} />}</div>
      <p className="font-display text-4xl tracking-[0.2em] text-parchment">{code}</p>
      <p className="text-xs text-mist">Aponte a câmera do outro celular ou abra Bible Show e digite o código.</p>
      <button type="button" onClick={() => void compartilhar()} className="inline-flex h-11 items-center gap-2 rounded-full border border-gold/50 px-4 text-sm text-gold-bright">
        <Share2 className="size-4" aria-hidden /> {copiou ? "Link copiado" : "Compartilhar o link"}
      </button>
    </div>
  )
}

export function SalaShow({ code }: { code: string }) {
  const router = useRouter()
  const { state, dispatch, agora, erro, online } = useSalaShow(code)
  const [eu, setEu] = useNoAparelho(`bph-show-eu-${code}`)
  const [anf] = useNoAparelho(`bph-show-anf-${code}`)
  const [assumida, setAssumida] = useState<string | null>(null)
  const anfitriao = anf === "1"
  const meu = state?.lados.find((l) => l.id === eu) ?? null
  // A vez em curso: quem conduz, a carta, quem tenta e quem cumpre a casa especial.
  const vez = state ? [state.vez, state.rodada?.lider, state.carta?.id, state.carta?.tentativa, state.fase === "situacao" ? state.pendentes[0]?.lado : ""].join("|") : ""
  const jogo = useMemo<Jogo | null>(
    () => (state && meu ? { state, dispatch, agora, eu: meu.id, anfitriao, assumiu: assumida === vez, assumir: () => setAssumida(vez) } : null),
    [state, dispatch, agora, meu, anfitriao, assumida, vez],
  )

  if (!state)
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <div className="space-y-3">
          <p className="text-mist">{erro ?? "Entrando na sala…"}</p>
          {erro && (
            <Link href="/bible-show" className="inline-flex h-11 items-center rounded-full border border-border px-4 text-parchment">
              Voltar ao Bible Show
            </Link>
          )}
        </div>
      </main>
    )

  if (state.fase === "config")
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <div className="space-y-3">
          <p className="font-display text-3xl text-parchment">A partida foi encerrada</p>
          <Link href="/bible-show" className="inline-flex h-11 items-center rounded-full bg-gold px-5 font-semibold text-night">
            Voltar ao Bible Show
          </Link>
        </div>
      </main>
    )

  if (!jogo) {
    const equipes = state.config.modo === "equipes"
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 py-6">
        <header>
          <p className="font-display text-3xl text-gold-bright">Bible Show</p>
          <p className="text-sm text-mist">Sala {code}</p>
        </header>
        <section className="space-y-2">
          <h1 className="text-xs uppercase tracking-[0.3em] text-gold">{equipes ? "Este celular é de qual equipe?" : "Quem é você?"}</h1>
          <div className="grid grid-cols-2 gap-2">
            {state.lados.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setEu(l.id)
                  if (l.fora) dispatch({ type: "voltou", id: l.id })
                }}
                className={cn("flex min-h-14 items-center gap-2 rounded-2xl border bg-night/70 px-3 text-left text-parchment active:scale-[0.98]", l.fora ? "border-dashed border-gold/50" : "border-border")}
              >
                <Peao lado={l} className="size-7 text-sm" />
                <span className="min-w-0">
                  <span className="block truncate">{l.nome}</span>
                  {l.fora && <span className="block text-xs text-gold">Saiu · tocar para voltar</span>}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-night/60 p-4">
          <p className="mb-3 text-center text-sm text-sand">Para chamar {equipes ? "as outras equipes" : "os outros"}:</p>
          <Convite code={code} />
        </section>
      </main>
    )
  }

  // A equipe deste celular saiu da partida: pode voltar (na mesma casa) ou trocar de equipe.
  if (meu?.fora)
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-4 py-6 text-center">
        <Peao lado={meu} className="size-14 text-xl opacity-60" />
        <div className="space-y-1">
          <p className="font-display text-3xl text-parchment">{meu.nome} saiu da partida</p>
          <p className="text-sm text-mist">O jogo continua com {state.config.modo === "equipes" ? "as outras equipes" : "os outros"}. Se voltarem, continuam de onde pararam.</p>
        </div>
        <div className="grid w-full gap-2">
          <button type="button" onClick={() => dispatch({ type: "voltou", id: meu.id })} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gold text-lg font-semibold text-night">
            <LogIn className="size-5" aria-hidden /> Voltar ao jogo
          </button>
          <button type="button" onClick={() => setEu(null)} className="h-12 rounded-full border border-border text-parchment">
            Escolher outra {state.config.modo === "equipes" ? "equipe" : "pessoa"}
          </button>
          <Link href="/bible-show" className="inline-flex h-12 items-center justify-center rounded-full text-mist">
            Sair da sala
          </Link>
        </div>
      </main>
    )

  const podeSair = emJogo(state).length > 2

  const topo = (
    <>
      <span className={online ? "text-[#8fdc93]" : "text-rose"} title={online ? "Conectado" : "Sem conexão"}>
        {online ? <Wifi className="size-4" aria-label="Conectado" /> : <WifiOff className="size-4" aria-label="Sem conexão" />}
      </span>
      <button type="button" onClick={() => setEu(null)} className="flex min-w-0 items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs text-parchment" aria-label={`Este celular: ${meu!.nome}. Trocar`}>
        <Peao lado={meu!} className="size-4 text-[0.5rem]" />
        <span className="max-w-20 truncate">{meu!.nome}</span>
      </button>
    </>
  )

  return (
    <Partida
      jogo={jogo}
      topo={topo}
      convite={<Convite code={code} />}
      sair={
        anfitriao
          ? {
              rotulo: "Encerrar",
              aviso: "A partida acaba para todos os celulares da sala.",
              acao: () => {
                dispatch({ type: "configurar" })
                router.push("/bible-show")
              },
            }
          : podeSair
            ? {
                rotulo: "Sair",
                aviso: `${meu!.nome} sai da partida e o jogo continua com os outros. Dá para voltar depois pelo QR ou pelo código, na mesma casa.`,
                acao: () => {
                  dispatch({ type: "sair", id: meu!.id })
                  router.push("/bible-show")
                },
              }
            : { rotulo: "Sair", aviso: "Você pode voltar depois pelo mesmo link ou código.", acao: () => router.push("/bible-show") }
      }
    />
  )
}
