"use client"

import type { EtapaRoomGame } from "@/content/etapas/jogos"
import { Collect } from "./Collect"
import { Hold } from "./Hold"
import { Rhythm } from "./Rhythm"
import { Scratch } from "./Scratch"
import { Sling } from "./Sling"
import { Steer } from "./Steer"

type OnProgress = (value: number, done: boolean) => void

/** Minijogo das etapas 2–11 no celular (ao vivo) ou no modo solo. */
export function RoomGamePlay({ game, onProgress }: { game: EtapaRoomGame; onProgress: OnProgress }) {
  switch (game.mechanic) {
    case "juntar":
      return <Collect game={game} onProgress={onProgress} />
    case "segurar":
      return <Hold game={game} onProgress={onProgress} />
    case "ritmo":
      return <Rhythm game={game} onProgress={onProgress} />
    case "guiar":
      return <Steer game={game} onProgress={onProgress} />
    case "funda":
      return <Sling game={game} onProgress={onProgress} />
    case "raspar":
      return <Scratch game={game} onProgress={onProgress} />
  }
}
