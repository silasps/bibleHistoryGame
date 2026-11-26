"use client"

import { useState } from "react"
import { COMPROMISSOS } from "@/content/janela-verde"
import { formatRef } from "@/content/refs"
import { aparelhoId, useJanela } from "@/stores/janela-sala"
import { Fundo } from "./comum"

export function Compromisso({ code }: { code: string }) {
  const { state, agir, erro } = useJanela(code)
  const [ops, setOps] = useState<string[]>([])
  const [feito, setFeito] = useState(false)

  if (!state) {
    return (
      <main className="grid min-h-dvh place-items-center bg-night px-6 text-center text-parchment">
        <p className={erro ? "text-[#f3a493]" : "text-sand"}>{erro ?? "Abrindo…"}</p>
      </main>
    )
  }

  const alterna = (id: string) => setOps((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]))

  return (
    <main className="relative min-h-dvh overflow-hidden bg-night px-4 py-8 text-parchment">
      <Fundo arte="discipulado" celular escuro={0.75} />
      <div className="relative z-10 mx-auto flex max-w-sm flex-col gap-4">
        <h1 className="text-center font-display text-3xl text-gold-bright">Compromisso: eu fico</h1>
        {feito ? (
          <div className="rounded-2xl border border-gold/40 bg-ink/85 p-5 text-center">
            <p className="font-display text-2xl text-parchment">Obrigado por orar.</p>
            <p className="mt-2 text-sand">Seu compromisso foi marcado. Ninguém vê o seu nome.</p>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-mist">Marque o que você quer assumir. É anônimo.</p>
            <ul className="flex flex-col gap-3">
              {COMPROMISSOS.map((c) => {
                const on = ops.includes(c.id)
                return (
                  <li key={c.id}>
                    <label
                      className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border p-4 ${on ? "border-gold bg-gold/15" : "border-border bg-ink/85"}`}
                    >
                      <input type="checkbox" checked={on} onChange={() => alterna(c.id)} className="mt-1 size-5 shrink-0 accent-[#f4d27a]" />
                      <span className="text-base leading-snug text-parchment">
                        {c.texto}
                        {"ref" in c && <span className="mt-1 block text-sm text-gold">{formatRef(c.ref)}</span>}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <button
              type="button"
              onClick={() => {
                agir({ type: "comprometer", aparelho: aparelhoId(), ops })
                setFeito(true)
              }}
              className="min-h-12 rounded-full bg-gold px-4 py-3 font-semibold text-night"
            >
              Marcar meu compromisso
            </button>
          </>
        )}
      </div>
    </main>
  )
}
