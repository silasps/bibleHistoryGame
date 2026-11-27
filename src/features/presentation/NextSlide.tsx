"use client"

import { ChevronsRight, Minimize2 } from "lucide-react"
import { useState } from "react"
import type { ProjectorView } from "@/domain/projection"
import { SilentSound } from "@/fx/useSound"
import { ProjectorStage } from "./ProjectorStage"

const KEY = "bph-proximo-slide"

function readOpen() {
  try {
    return localStorage.getItem(KEY) !== "fechado"
  } catch {
    return true
  }
}

/**
 * Miniatura do próximo slide, no canto da prévia do telão (só no painel).
 * Sem som e sem efeitos: só para o apresentador saber para onde está indo.
 */
export function NextSlide({ view, joinUrl, title }: { view: ProjectorView; joinUrl: string; title: string }) {
  const [open, setOpen] = useState(readOpen)
  const toggle = (v: boolean) => {
    setOpen(v)
    try {
      localStorage.setItem(KEY, v ? "aberto" : "fechado")
    } catch {
      // ignorado: só lembra a escolha neste navegador
    }
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => toggle(true)}
        className="absolute bottom-3 right-3 z-40 inline-flex items-center gap-1.5 rounded-full border border-border bg-night/90 px-3 py-1.5 text-xs text-parchment backdrop-blur hover:border-gold/60"
      >
        <ChevronsRight className="size-4 text-gold" aria-hidden /> Ver o próximo slide
      </button>
    )
  }
  return (
    <aside className="absolute bottom-3 right-3 z-40 w-[30%] min-w-44 overflow-hidden rounded-xl border-2 border-gold/60 bg-night shadow-[0_8px_30px_rgba(0,0,0,0.6)]" aria-label="Próximo slide">
      <div className="flex items-center justify-between gap-2 bg-night/95 px-2 py-1">
        <p className="min-w-0 truncate text-[0.7rem] text-parchment">
          <span className="font-semibold uppercase tracking-[0.2em] text-gold">A seguir</span> · {title}
        </p>
        <button type="button" onClick={() => toggle(false)} className="shrink-0 rounded p-0.5 text-mist hover:text-parchment" aria-label="Esconder o próximo slide">
          <Minimize2 className="size-3.5" />
        </button>
      </div>
      {/* Só imagem: fora da leitura de tela e sem foco. */}
      <div aria-hidden inert>
        <SilentSound.Provider value>
          <ProjectorStage view={view} joinUrl={joinUrl} preview surface="proximo" />
        </SilentSound.Provider>
      </div>
    </aside>
  )
}
