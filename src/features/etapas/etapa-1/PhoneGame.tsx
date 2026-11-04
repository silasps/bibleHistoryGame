"use client"

import { useCallback, useEffect, useRef } from "react"
import type { GameView } from "@/domain/projection"
import { useInventory } from "@/stores/inventory"
import { AfterFallPhone, RelicBar } from "./AfterFall"
import { CreationReveal } from "./CreationReveal"
import { GardenWalk } from "./GardenWalk"
import { TreeAim } from "./TreeAim"

interface Props {
  game: GameView
  line?: string
  /** Inventário por sala (cada sala começa do zero). */
  scope: string
  play: (gameId: string, value: number, done: boolean) => Promise<void>
}

/**
 * Celular durante um minijogo. O jogo roda no aparelho; a sala só recebe o
 * resultado (no máximo um envio por segundo). Quando o apresentador avança,
 * esta tela sai e a brincadeira acaba.
 */
export function PhoneGame({ game, line, scope, play }: Props) {
  const [inventory, dispatch] = useInventory(scope)
  const pending = useRef<{ value: number; done: boolean } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const flush = useCallback(() => {
    timer.current = undefined
    const p = pending.current
    pending.current = null
    if (p) play(game.id, p.value, p.done).catch(() => {})
  }, [game.id, play])

  const report = useCallback(
    (value: number, done: boolean) => {
      pending.current = { value, done }
      if (done) flush()
      else timer.current ??= window.setTimeout(flush, 1000)
    },
    [flush],
  )
  useEffect(() => () => {
    clearTimeout(timer.current)
  }, [])

  const conquest = useCallback((id: string) => dispatch({ type: "conquest", id }), [dispatch])

  // A Queda vale mesmo para quem entrou depois: o jardim se fecha.
  useEffect(() => {
    if (game.kind === "queda" || game.kind === "vestes" || game.kind === "fora") dispatch({ type: "fall" })
    if (game.kind === "vestes") dispatch({ type: "relic", id: "vestes" })
  }, [game.kind, dispatch])

  if (game.kind === "queda" || game.kind === "vestes" || game.kind === "fora") {
    return <AfterFallPhone kind={game.kind} line={line} inventory={inventory} />
  }

  return (
    <div className="space-y-3">
      <div className="relative h-[68dvh] overflow-hidden rounded-3xl border border-border">
        {game.kind === "criacao" && <CreationReveal onProgress={report} onConquest={conquest} />}
        {game.kind === "jardim" && <GardenWalk />}
        {game.kind === "arvore" && <TreeAim onProgress={report} onConquest={conquest} />}
      </div>
      {line && game.kind === "jardim" && <p className="text-center font-display text-xl text-parchment">{line}</p>}
      <RelicBar inventory={inventory} />
    </div>
  )
}
