"use client"

import { useCallback, useRef, useState } from "react"
import type { ScratchGame } from "@/content/etapas/jogos"
import { formatRef } from "@/content/refs"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useStinger } from "@/fx/useSound"
import { Backdrop } from "../etapa-1/art"
import { Finale, GameHint } from "./Finale"
import { ScratchLayer } from "./ScratchLayer"

/** Raspar uma camada só: a cidade escura de Nínive ou o coração de pedra. */
export function Scratch({ game, onProgress }: { game: ScratchGame; onProgress: (value: number, done: boolean) => void }) {
  const stinger = useStinger()
  const [cleared, setCleared] = useState(false)
  const lastTenth = useRef(0)

  const finish = useCallback(() => {
    if (cleared) return
    setCleared(true)
    vibrate(HAPTIC.light)
    stinger("light")
    onProgress(100, true)
  }, [cleared, onProgress, stinger])

  const progress = (fraction: number) => {
    const tenth = Math.floor(fraction * 10)
    if (tenth === lastTenth.current) return
    lastTenth.current = tenth
    onProgress(Math.round(fraction * 100), false)
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Backdrop name={game.art} portrait palette={game.palette} />
      <ScratchLayer cover={game.cover} cleared={cleared} onCleared={finish} onProgress={progress} hint={game.instruction} label={game.title} />
      <GameHint>{formatRef(game.ref, "long")}</GameHint>
      {!cleared && (
        <button type="button" onClick={finish} className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-black/50 px-4 py-2 text-sm text-white">
          Revelar
        </button>
      )}
      {cleared && <Finale label={game.finale.label} refs={game.finale.ref} relic={game.relic} />}
    </div>
  )
}
