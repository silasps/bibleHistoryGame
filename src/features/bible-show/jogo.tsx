"use client"

import { createContext, useContext, type ReactNode } from "react"
import { controla, veCarta, type ShowAction, type ShowState } from "@/domain/bible-show"

// O que as telas da partida precisam saber, num celular só ou numa sala com
// um celular por equipe: o estado, como agir, a hora (acertada com o servidor)
// e quem é este aparelho.

export interface Jogo {
  state: ShowState
  dispatch: (a: ShowAction) => void
  /** Hora "da partida": a do aparelho ou a do servidor, na sala. */
  agora: () => number
  /** Lado deste aparelho na sala; nulo num celular só. */
  eu: string | null
  /** Quem criou a sala: pode assumir a vez de outro celular (se ele sair). */
  anfitriao: boolean
  /** O anfitrião assumiu a vez em curso. */
  assumiu?: boolean
  assumir?: () => void
}

const Ctx = createContext<Jogo | null>(null)

export function JogoProvider({ value, children }: { value: Jogo; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useJogo() {
  const j = useContext(Ctx)
  if (!j) throw new Error("useJogo fora do JogoProvider")
  return {
    ...j,
    /** Este aparelho conduz a vez agora. */
    conduz: controla(j.state, j.eu) || (j.anfitriao && !!j.assumiu),
    /** Este aparelho pode mostrar a carta. */
    ve: veCarta(j.state, j.eu),
    sala: j.eu !== null,
  }
}
