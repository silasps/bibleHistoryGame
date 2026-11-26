"use client"

import { useEffect, useRef } from "react"
import type { GrupoId } from "@/content/janela-verde"
import { useGrupoJanela, useJanela } from "@/stores/janela-sala"
import { Equipe } from "./Equipe"
import { arteUrl, Fundo } from "./comum"

const GRUPOS_UI: { id: GrupoId; nome: string; cor: string }[] = [
  { id: "auren", nome: "Grupo Auren", cor: "#e0866c" },
  { id: "nair", nome: "Grupo Nair", cor: "#7fae8b" },
]

export function Sala({ code }: { code: string }) {
  const { state, agir, agora, erro } = useJanela(code)
  const [grupoRaw, setGrupo] = useGrupoJanela(code)
  const grupo: GrupoId | null = grupoRaw === "auren" || grupoRaw === "nair" ? grupoRaw : null
  const entrou = useRef<string | null>(null)

  useEffect(() => {
    if (!grupo || !state || entrou.current === grupo) return
    entrou.current = grupo
    agir({ type: "entrar", grupo, agora: Date.now() })
  }, [grupo, state, agir])

  if (!state) {
    return (
      <main className="grid min-h-dvh place-items-center bg-night px-6 text-center text-parchment">
        <p className={erro ? "text-[#f3a493]" : "text-sand"} role={erro ? "alert" : "status"}>
          {erro ?? "Entrando na sala…"}
        </p>
      </main>
    )
  }

  if (!grupo) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-night px-4 py-8 text-parchment">
        <Fundo arte="capa" celular escuro={0.7} />
        <div className="relative z-10 mx-auto flex max-w-sm flex-col gap-4">
          <h1 className="text-center font-display text-3xl text-gold-bright">Qual é o seu grupo?</h1>
          {GRUPOS_UI.map((g) => {
            const img = arteUrl(g.id, true)
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setGrupo(g.id)
                  agir({ type: "entrar", grupo: g.id, agora: Date.now() })
                }}
                className="relative flex min-h-36 w-full items-end overflow-hidden rounded-2xl border-2 bg-ink text-left"
                style={{ borderColor: g.cor }}
              >
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="absolute inset-0 size-full object-cover" />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
                <span className="relative p-4 font-display text-2xl" style={{ color: g.cor }}>
                  Somos o {g.nome}
                </span>
              </button>
            )
          })}
          <p className="text-center text-sm text-mist">Basta um celular por grupo. Uma pessoa toca e as outras acompanham.</p>
        </div>
      </main>
    )
  }

  return <Equipe state={state} agir={agir} agora={agora} grupo={grupo} />
}
