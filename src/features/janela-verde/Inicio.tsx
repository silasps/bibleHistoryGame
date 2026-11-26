"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { criarJanela } from "@/app/actions/janela"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"
import { Fundo } from "./comum"

export function Inicio() {
  const router = useRouter()
  const [codigo, setCodigo] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [criando, setCriando] = useState(false)

  async function criar() {
    setErro(null)
    setCriando(true)
    const r = await criarJanela()
    if ("error" in r) {
      setErro(r.error)
      setCriando(false)
      return
    }
    try {
      localStorage.setItem(`jv-chave-${r.code}`, r.chave)
    } catch {
      // sem armazenamento: o condutor entra pelo link com a chave
    }
    router.push(`/janela-verde/telao/${r.code}`)
  }

  function entrar() {
    const c = normalizeRoomCode(codigo)
    if (!isRoomCode(c)) {
      setErro("Esse código não parece certo. Confira no telão.")
      return
    }
    router.push(`/janela-verde/sala/${c.toUpperCase()}`)
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-night px-4 py-10 text-parchment">
      <Fundo arte="capa" celular escuro={0.6} />
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <header className="text-center">
          <h1 className="font-display text-5xl leading-tight text-gold-bright">Janela Verde</h1>
          <p className="mt-2 text-base text-sand">Intercessão pelos povos da Janela Verde</p>
        </header>
        <section className="rounded-2xl border border-border bg-ink/80 p-4 backdrop-blur">
          <button
            type="button"
            onClick={() => void criar()}
            disabled={criando}
            className="min-h-12 w-full rounded-full bg-gold px-4 py-3 font-semibold text-night disabled:opacity-60"
          >
            {criando ? "Criando…" : "Criar a sala neste computador"}
          </button>
          <p className="mt-2 text-center text-sm text-mist">Este computador vira o telão.</p>
        </section>
        <section className="rounded-2xl border border-border bg-ink/80 p-4 backdrop-blur">
          <label htmlFor="jv-codigo" className="text-sm text-sand">
            Código da sala
          </label>
          <input
            id="jv-codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            maxLength={8}
            autoCapitalize="characters"
            autoComplete="off"
            className="mt-1 min-h-12 w-full rounded-xl border border-border bg-night px-3 text-center text-xl uppercase tracking-[0.3em] text-parchment"
          />
          <button
            type="button"
            onClick={entrar}
            className="mt-3 min-h-12 w-full rounded-full border border-gold/60 px-4 py-3 font-semibold text-gold-bright"
          >
            Entrar com o celular do grupo
          </button>
        </section>
        {erro && (
          <p role="alert" className="rounded-xl border border-[#e0715c]/50 bg-night/80 p-3 text-center text-sm text-[#f3a493]">
            {erro}
          </p>
        )}
      </div>
    </main>
  )
}
