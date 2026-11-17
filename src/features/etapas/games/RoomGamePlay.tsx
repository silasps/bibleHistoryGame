"use client"

import { useState } from "react"
import type { EtapaRoomGame } from "@/content/etapas/jogos"
import { AltarBuild } from "./AltarBuild"
import { Announce } from "./Announce"
import { Caulk } from "./Caulk"
import { Choose } from "./Choose"
import { Circle } from "./Circle"
import { Collect } from "./Collect"
import { GameIntro } from "./GameIntro"
import { HeartBreak } from "./HeartBreak"
import { Multiply } from "./Multiply"
import { SeaCrossing } from "./SeaCrossing"
import { Sling } from "./Sling"

type OnProgress = (value: number, done: boolean) => void

/**
 * Minijogo das etapas 2–11 no celular (ao vivo) ou no modo solo: primeiro a
 * tela "Como jogar"; depois o jogo, com tempo e pontos.
 * `stopped`: o apresentador mostrou o pódio; o jogo para e manda a pontuação final.
 */
export function RoomGamePlay({ game, onProgress, stopped = false }: { game: EtapaRoomGame; onProgress: OnProgress; stopped?: boolean }) {
  const [started, setStarted] = useState(false)
  if (!started) return <GameIntro game={game} onStart={() => setStarted(true)} />
  const props = { onProgress, stopped }
  switch (game.mechanic) {
    case "escolher":
      return <Choose game={game} {...props} />
    case "multiplicar":
      return <Multiply game={game} {...props} />
    case "juntar":
      return <Collect game={game} {...props} />
    case "vedar":
      return <Caulk game={game} {...props} />
    case "abrir-mar":
      return <SeaCrossing game={game} {...props} />
    case "circular":
      return <Circle game={game} {...props} />
    case "funda":
      return <Sling game={game} {...props} />
    case "altar":
      return <AltarBuild game={game} {...props} />
    case "anunciar":
      return <Announce game={game} {...props} />
    case "quebrar":
      return <HeartBreak game={game} {...props} />
  }
}
