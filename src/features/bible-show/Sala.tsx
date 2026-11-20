"use client"

import { QrCode, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { useMemo, useState, useSyncExternalStore } from "react"
import { PhoneSheet } from "@/features/presentation/PhoneDock"
import { useNoAparelho, useSalaShow } from "@/stores/bible-show-sala"
import { Partida } from "./BibleShow"
import type { Jogo } from "./jogo"
import { Peao } from "./Trilha"

const urlAtual = () => window.location.href.split("?")[0]

/** Código e QR para os outros celulares entrarem. */
function Convite({ code }: { code: string }) {
  const url = useSyncExternalStore(
    () => () => {},
    urlAtual,
    () => "",
  )
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="rounded-2xl bg-parchment p-3">{url && <QRCodeSVG value={url} size={200} bgColor="#f1e8d6" fgColor="#05070d" level="M" aria-label={`QR code da sala ${code}`} />}</div>
      <p className="font-display text-4xl tracking-[0.2em] text-parchment">{code}</p>
      <p className="text-xs text-mist">Aponte a câmera do outro celular ou abra Bible Show e digite o código.</p>
    </div>
  )
}

export function SalaShow({ code }: { code: string }) {
  const router = useRouter()
  const { state, dispatch, agora, erro, online } = useSalaShow(code)
  const [eu, setEu] = useNoAparelho(`bph-show-eu-${code}`)
  const [anf] = useNoAparelho(`bph-show-anf-${code}`)
  const [convite, setConvite] = useState(false)
  const anfitriao = anf === "1"
  const meu = state?.lados.find((l) => l.id === eu) ?? null
  const jogo = useMemo<Jogo | null>(() => (state && meu ? { state, dispatch, agora, eu: meu.id, anfitriao } : null), [state, dispatch, agora, meu, anfitriao])

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
                onClick={() => setEu(l.id)}
                className="flex min-h-14 items-center gap-2 rounded-2xl border border-border bg-night/70 px-3 text-left text-parchment active:scale-[0.98]"
              >
                <Peao lado={l} className="size-7 text-sm" />
                <span className="min-w-0 truncate">{l.nome}</span>
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

  const topo = (
    <>
      <span className={online ? "text-[#8fdc93]" : "text-rose"} title={online ? "Conectado" : "Sem conexão"}>
        {online ? <Wifi className="size-4" aria-label="Conectado" /> : <WifiOff className="size-4" aria-label="Sem conexão" />}
      </span>
      <button type="button" onClick={() => setEu(null)} className="flex min-w-0 items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs text-parchment" aria-label={`Este celular: ${meu!.nome}. Trocar`}>
        <Peao lado={meu!} className="size-4 text-[0.5rem]" />
        <span className="max-w-20 truncate">{meu!.nome}</span>
      </button>
      <button type="button" onClick={() => setConvite(true)} className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-mist" aria-label="Convidar">
        <QrCode className="size-4" />
      </button>
      <PhoneSheet title="Convidar" open={convite} onClose={() => setConvite(false)}>
        <Convite code={code} />
      </PhoneSheet>
    </>
  )

  return (
    <Partida
      jogo={jogo}
      topo={topo}
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
          : { rotulo: "Sair", aviso: "Você pode voltar depois pelo mesmo link ou código.", acao: () => router.push("/bible-show") }
      }
    />
  )
}
