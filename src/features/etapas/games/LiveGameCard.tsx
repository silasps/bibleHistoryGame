"use client"

import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { getRoomGame } from "@/content/etapas/jogos"
import { GAME_LIVE_SECONDS } from "@/content/etapas"
import type { GameView } from "@/domain/projection"
import { useFx } from "@/fx/useFx"
import { formatScore } from "../../presentation/Podium"

const MEDAL = ["🥇", "🥈", "🥉"]

/** Segundos desde o início do jogo (atualiza a cada meio segundo). */
export function useElapsed(startedAt?: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!startedAt) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [startedAt])
  return startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0
}

export const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

/**
 * Telão: o jogo roda enquanto o apresentador fala do tópico. Um cartão
 * compacto no canto mostra o relógio, quem está jogando e o pódio ao vivo.
 */
export function LiveGameCard({ game }: { game: GameView }) {
  const fx = useFx()
  const def = getRoomGame(game.id)
  const elapsed = useElapsed(game.phase === "on" ? game.startedAt : undefined)
  const over = elapsed >= GAME_LIVE_SECONDS
  return (
    <motion.aside
      initial={fx.motion ? { opacity: 0, y: 30 } : false}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-[7cqh] right-[3cqw] z-10 w-[27cqw] rounded-[1.4cqw] border border-gold/50 bg-night/85 p-[1.2cqw] backdrop-blur"
      aria-label="Jogo ao vivo"
    >
      <div className="flex items-baseline justify-between gap-[1cqw]">
        <p className="min-w-0 truncate font-display text-[1.9cqw] text-gold-bright">▶ {def?.title ?? "Jogo"}</p>
        <p className={`shrink-0 font-display text-[1.9cqw] tabular-nums ${over ? "text-[#ffb98a]" : "text-parchment"}`}>{clock(elapsed)}</p>
      </div>
      <p className="mt-[0.3cqw] text-[1.2cqw] text-sand">Jogue no celular · {game.players} {game.players === 1 ? "jogando" : "jogando"} · {game.done} terminaram</p>
      {game.top && game.top.length > 0 && (
        <ol className="mt-[0.6cqw] space-y-[0.3cqw]">
          {game.top.map((e) => (
            <motion.li key={e.name} layout className="flex items-center gap-[0.7cqw] text-[1.45cqw]">
              <span aria-hidden>{MEDAL[e.place - 1]}</span>
              <span className="min-w-0 flex-1 truncate text-parchment">{e.name}</span>
              <span className="shrink-0 tabular-nums text-gold-bright">{formatScore(e.value, game.max)}</span>
            </motion.li>
          ))}
        </ol>
      )}
    </motion.aside>
  )
}
