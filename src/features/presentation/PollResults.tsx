"use client"

import { Check } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import type { PollView } from "@/domain/projection"
import { useStinger } from "@/fx/useSound"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"

/** Contagem regressiva antes de revelar o resultado (suspense). */
function useCountdown(active: boolean, key: string) {
  const fx = useFx()
  const [left, setLeft] = useState<{ key: string; n: number } | null>(null)
  const stinger = useStinger()
  useEffect(() => {
    if (!active || !fx.motion) return
    let n = 3
    const tick = () => {
      setLeft({ key, n })
      stinger("heartbeat")
      n -= 1
    }
    const first = setTimeout(tick, 0)
    const t = setInterval(() => {
      if (n === 0) {
        clearInterval(t)
        setLeft({ key, n: 0 })
        stinger("reveal")
        return
      }
      tick()
    }, 800)
    return () => (clearTimeout(first), clearInterval(t))
  }, [active, key, fx.motion, stinger])
  if (!active) return null
  if (!fx.motion) return 0
  return left?.key === key ? left.n : 3
}

/** Enquete no telão: opções, votos chegando e, quando liberado, as barras. */
export function PollResults({ poll, size = "stage" }: { poll: PollView; size?: "stage" | "phone" }) {
  const countdown = useCountdown(poll.resultsVisible, `${poll.id}-${poll.resultsVisible}`)
  const showBars = poll.resultsVisible && countdown === 0
  const max = Math.max(1, ...(poll.results?.map((r) => r.count) ?? [1]))
  const stage = size === "stage"

  return (
    <div className={cn("relative w-full", stage ? "space-y-[1.4cqw]" : "space-y-3")}>
      <div className="flex items-end justify-between gap-4">
        <p className={cn("font-display leading-tight text-parchment", stage ? "text-[3cqw]" : "text-2xl")}>{poll.question}</p>
        <motion.p
          key={poll.totalVotes}
          initial={{ scale: 1.4, color: "#f4d27a" }}
          animate={{ scale: 1, color: "#9aa4b8" }}
          className={cn("shrink-0 tabular-nums", stage ? "text-[1.6cqw]" : "text-sm")}
          aria-live="polite"
        >
          {poll.totalVotes} {poll.totalVotes === 1 ? "voto" : "votos"}
          {poll.status === "open" && <span className="ml-2 inline-block size-2 animate-pulse rounded-full bg-sage align-middle" aria-label="votação aberta" />}
        </motion.p>
      </div>
      <ul className={stage ? "space-y-[0.9cqw]" : "space-y-2"}>
        {poll.options.map((o, i) => {
          const row = poll.results?.find((r) => r.optionId === o.id)
          const correct = poll.correctOptionId === o.id && showBars
          const leader = showBars && row && row.count === max && row.count > 0
          return (
            <li key={o.id} className={cn("relative overflow-hidden rounded-[0.8cqw] border", stage ? "px-[1.6cqw] py-[1cqw]" : "rounded-xl px-4 py-3", correct ? "border-sage" : leader ? "border-gold" : "border-border", "bg-night/70")}>
              <motion.div
                className={cn("absolute inset-y-0 left-0", correct ? "bg-sage/30" : "bg-gold/25")}
                initial={false}
                animate={{ width: showBars && row ? `${(row.count / max) * 100}%` : "0%" }}
                transition={{ duration: 1.2, delay: i * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
              />
              <div className={cn("relative flex items-center justify-between gap-4", stage ? "text-[2cqw]" : "text-base")}>
                <span className="flex items-center gap-2 text-parchment">
                  {correct && <Check className={stage ? "size-[2cqw] text-sage" : "size-5 text-sage"} aria-label="correta" />}
                  {o.label}
                </span>
                {showBars && row && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.12 }} className="font-semibold tabular-nums text-gold-bright">
                    {row.pct}%
                  </motion.span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <AnimatePresence>
        {poll.resultsVisible && countdown !== null && countdown > 0 && (
          <motion.div
            key={countdown}
            initial={{ opacity: 0, scale: 2.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="absolute inset-0 grid place-items-center font-display text-gold-bright [text-shadow:0_0_40px_rgba(216,169,72,0.8)]"
            style={{ fontSize: stage ? "12cqw" : "5rem" }}
            aria-hidden
          >
            {countdown}
          </motion.div>
        )}
      </AnimatePresence>
      {showBars && poll.afterResult && <p className={cn("text-mist", stage ? "text-[1.6cqw]" : "text-sm")}>{poll.afterResult}</p>}
    </div>
  )
}
