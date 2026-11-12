"use client"

import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { CREATION, FORBIDDEN_FRUIT, GARDEN_TARGETS } from "@/content/etapas/etapa-1"
import { formatRef } from "@/content/refs"
import type { GameView } from "@/domain/projection"
import { useFx } from "@/fx/useFx"
import { getRoomGame } from "@/content/etapas/jogos"
import { RoomGameStage } from "../games/RoomGameStage"
import { AfterFallStage } from "./AfterFall"
import { Backdrop, Fruit, Serpent } from "./art"
import { GardenWalk } from "./GardenWalk"

/** Telão durante um minijogo da Etapa 1: a sala jogando junta. */
export function GameStage({ game, line }: { game: GameView; line?: string }) {
  switch (game.kind) {
    case "criacao":
      return <CreationGallery game={game} line={line} />
    case "jardim":
      return (
        <div className="absolute inset-0">
          <GardenWalk />
          {line && <StageLine line={line} />}
        </div>
      )
    case "arvore":
      return <TreeStage game={game} />
    case "queda":
    case "vestes":
    case "fora":
      return <AfterFallStage kind={game.kind} line={line} />
    default: {
      const room = getRoomGame(game.id)
      return room ? <RoomGameStage game={room} view={game} /> : null
    }
  }
}

function StageLine({ line }: { line: string }) {
  return (
    <p className="absolute inset-x-[10cqw] bottom-[4cqh] rounded-[2cqw] bg-night/75 px-[3cqw] py-[1.4cqh] text-center font-display text-[2.6cqw] leading-snug text-parchment backdrop-blur">
      {line}
    </p>
  )
}

/** Quantos dias a sala já revelou: a média dos celulares (sem ninguém jogando, revela devagar sozinho). */
function useRevealed(game: GameView) {
  const fx = useFx()
  const [auto, setAuto] = useState(0)
  useEffect(() => {
    if (game.players > 0) return
    const t = setInterval(() => setAuto((n) => Math.min(game.max, n + 1)), fx.motion ? 5000 : 1)
    return () => clearInterval(t)
  }, [game.players, game.max, fx.motion])
  return game.players > 0 ? Math.ceil(game.total / game.players) : auto
}

function CreationGallery({ game, line }: { game: GameView; line?: string }) {
  const fx = useFx()
  const revealed = useRevealed(game)
  return (
    <div className="absolute inset-0 bg-black">
      <div className="absolute inset-x-[4cqw] top-[9cqh] grid h-[66cqh] grid-cols-4 gap-[1.2cqw]">
        {CREATION.map((c, i) => {
          const on = i < revealed
          return (
            <motion.div
              key={c.id}
              className="relative overflow-hidden rounded-[1.2cqw] border border-white/10"
              animate={{ opacity: on ? 1 : 0.12, filter: on ? "brightness(1)" : "brightness(0.2)" }}
              transition={{ duration: fx.motion ? 1.2 : 0 }}
            >
              <Backdrop name={c.art} portrait={false} palette={c.palette} />
              <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-[0.8cqw] text-center text-[1.5cqw] text-white">
                {c.label} <span className="text-white/70">· {formatRef(c.ref, "short")}</span>
              </p>
            </motion.div>
          )
        })}
      </div>
      <p className="absolute right-[4cqw] top-[3.6cqh] text-[1.5cqw] tabular-nums text-sand">
        {game.players > 0 ? `${game.players} ${game.players === 1 ? "pessoa criando" : "pessoas criando"}` : ""}
      </p>
      {line && <StageLine line={line} />}
    </div>
  )
}

/** Posições dos alvos bons no telão: três de cada lado, o centro livre para o fruto. */
const TARGET_SPOTS = [
  { x: 15, y: 24 },
  { x: 15, y: 44 },
  { x: 15, y: 64 },
  { x: 85, y: 24 },
  { x: 85, y: 44 },
  { x: 85, y: 64 },
]

function TreeStage({ game }: { game: GameView }) {
  const fx = useFx()
  const share = game.players > 0 ? game.done / game.players : 0
  return (
    <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_45%,#1b3a2a,#05070d)]">
      <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
        <motion.div animate={fx.motion ? { scale: [1, 1.06, 1] } : undefined} transition={{ duration: 2.4, repeat: Infinity }}>
          <Fruit glow={0.5 + share * 0.5} className="h-[30cqh] w-auto" />
        </motion.div>
        <Serpent className="absolute left-[62%] top-[-24%] h-[18cqh] w-auto max-w-none" />
      </div>
      <ul aria-label="Alvos bons">
        {GARDEN_TARGETS.map((t, i) => (
          <li
            key={t.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-gold/35 bg-night/80 px-[1.8cqw] py-[1.1cqh] text-[1.7cqw] leading-none text-sand"
            style={{ left: `${TARGET_SPOTS[i].x}%`, top: `${TARGET_SPOTS[i].y}%` }}
          >
            {t.label}
          </li>
        ))}
      </ul>
      <div className="absolute inset-x-0 bottom-[6cqh] space-y-[1cqh] text-center">
        <p className="text-[1.8cqw] tabular-nums text-sand">
          Acertos nos alvos bons: <span className="text-gold-bright">{game.total}</span>
        </p>
        <p className="text-[2.2cqw] tabular-nums text-[#ffb98a]">
          {game.players > 0 ? `${game.done} de ${game.players} chegaram ao fruto` : FORBIDDEN_FRUIT.label} · {formatRef(FORBIDDEN_FRUIT.ref, "long")}
        </p>
      </div>
    </div>
  )
}
