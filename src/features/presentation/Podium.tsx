"use client"

import { motion } from "motion/react"
import { useCallback, useEffect, useState } from "react"
import type { GameResults, PodiumEntry } from "@/domain/projection"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"

const MEDAL = ["🥇", "🥈", "🥉"]
/** Pausa de "Contando os pontos…" antes do pódio (chegam as últimas pontuações). */
export const COUNT_MS = 1800

/** Pontos dos jogos (até 1000); os jogos antigos em contagem mostram "8/8". */
export const formatScore = (value: number, max: number) => (max === 1000 ? `${value.toLocaleString("pt-BR")} pts` : max === 100 ? `${value}%` : `${value}/${max}`)

/**
 * Pódio do jogo do slide: depois de "Contando os pontos…", fica na tela até o
 * apresentador avançar. No celular, a pessoa pode fechar com um toque.
 * Devolve [pódio, fechar, contando].
 */
export function useFreshResults(results?: GameResults): [GameResults | undefined, () => void, boolean] {
  const key = results?.key
  const [readyKey, setReadyKey] = useState<string | null>(null)
  const [closedKey, setClosedKey] = useState<string | null>(null)
  useEffect(() => {
    if (!key) return
    const t = setTimeout(() => setReadyKey(key), COUNT_MS)
    return () => clearTimeout(t)
  }, [key])
  const dismiss = useCallback(() => setClosedKey(key ?? null), [key])
  if (!results || results.top.length === 0 || closedKey === key) return [undefined, dismiss, false]
  return readyKey === key ? [results, dismiss, false] : [undefined, dismiss, true]
}

/** "Contando os pontos…": a transição entre o jogo e o pódio. */
export function Counting({ size }: { size: "stage" | "phone" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("z-30 flex flex-col items-center justify-center gap-4 bg-night/90 text-center backdrop-blur-sm", size === "stage" ? "absolute inset-0" : "fixed inset-0")}
      role="status"
    >
      <motion.span
        className={cn("block rounded-full border-gold border-t-transparent", size === "stage" ? "size-[5cqw] border-[0.5cqw]" : "size-12 border-4")}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        aria-hidden
      />
      <p className={cn("font-display text-parchment", size === "stage" ? "text-[3cqw]" : "text-2xl")}>Contando os pontos…</p>
    </motion.div>
  )
}

/** Telão, durante o jogo: 1º, 2º e 3º lugares ao vivo. */
export function LivePodium({ entries, max }: { entries: PodiumEntry[]; max: number }) {
  return (
    <div className="pointer-events-none absolute right-[2.5cqw] top-[24cqh] z-10 w-[21cqw] rounded-[1.2cqw] border border-gold/40 bg-night/80 p-[1.2cqw] backdrop-blur">
      <p className="text-[1.1cqw] uppercase tracking-[0.3em] text-gold">Pódio</p>
      <ol className="mt-[0.6cqw] space-y-[0.5cqw]">
        {entries.map((e) => (
          <motion.li key={e.name} layout className="flex items-center gap-[0.8cqw] text-[1.6cqw]">
            <span aria-hidden>{MEDAL[e.place - 1]}</span>
            <span className="min-w-0 flex-1 truncate text-parchment">{e.name}</span>
            <span className="shrink-0 tabular-nums text-gold-bright">{formatScore(e.value, max)}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

/** Os três degraus: 2º, 1º, 3º. */
function Steps({ top, max, size }: { top: PodiumEntry[]; max: number; size: "stage" | "phone" }) {
  const fx = useFx()
  const order = [top[1], top[0], top[2]]
  const height = size === "stage" ? ["h-[14cqh]", "h-[22cqh]", "h-[9cqh]"] : ["h-16", "h-24", "h-12"]
  return (
    <div className={cn("flex items-end justify-center", size === "stage" ? "gap-[1.5cqw]" : "gap-2")}>
      {order.map((e, i) =>
        e ? (
          <motion.div
            key={e.place}
            initial={fx.motion ? { opacity: 0, y: 30 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: [0.4, 0.9, 0.1][i], duration: 0.5 }}
            className={cn("flex flex-col items-center", size === "stage" ? "w-[18cqw]" : "w-[30%]")}
          >
            <span className={size === "stage" ? "text-[4cqw]" : "text-3xl"} aria-hidden>
              {MEDAL[e.place - 1]}
            </span>
            <p className={cn("w-full truncate text-center font-display text-parchment", size === "stage" ? "text-[2.4cqw]" : "text-lg")}>{e.name}</p>
            <p className={cn("tabular-nums text-gold-bright", size === "stage" ? "text-[1.6cqw]" : "text-sm")}>{formatScore(e.value, max)}</p>
            <div
              className={cn(
                "mt-1 grid w-full place-items-center rounded-t-xl border border-b-0 border-gold/50 bg-[linear-gradient(180deg,rgba(216,169,72,0.45),rgba(216,169,72,0.08))] font-display text-gold-bright",
                height[i],
                size === "stage" ? "text-[3cqw]" : "text-2xl",
              )}
            >
              {e.place}º
            </div>
          </motion.div>
        ) : (
          <div key={`vazio-${i}`} className={size === "stage" ? "w-[18cqw]" : "w-[30%]"} />
        ),
      )}
    </div>
  )
}

/** Telão: "Fim do jogo" no próprio slide, até o apresentador avançar. */
export function ResultsStage({ results }: { results: GameResults }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-[3cqh] bg-night/92 px-[6cqw] text-center backdrop-blur-sm"
    >
      <div>
        <p className="text-[1.4cqw] uppercase tracking-[0.45em] text-gold">Fim do jogo</p>
        <h2 className="mt-[1cqh] font-display text-[4.4cqw] leading-tight text-parchment">{results.title}</h2>
      </div>
      <div className="w-[60cqw]">
        <Steps top={results.top} max={results.max} size="stage" />
      </div>
      <p className="text-[1.5cqw] text-sand">
        {results.players} {results.players === 1 ? "pessoa pontuou" : "pessoas pontuaram"}
      </p>
    </motion.div>
  )
}

/** Celular: o mesmo pódio e a colocação da pessoa. Toque para fechar. */
export function ResultsPhone({ results, onClose }: { results: GameResults; onClose: () => void }) {
  const fx = useFx()
  return (
    <motion.button
      type="button"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-night/95 px-5 text-center backdrop-blur"
      aria-label="Fechar o resultado"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Fim do jogo</p>
        <h2 className="mt-1 font-display text-3xl leading-tight text-parchment">{results.title}</h2>
      </div>
      <div className="w-full max-w-sm">
        <Steps top={results.top} max={results.max} size="phone" />
      </div>
      {results.me ? (
        <motion.p
          initial={fx.motion ? { scale: 0.8, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="rounded-full border border-gold/60 bg-gold/15 px-5 py-2 text-lg font-semibold text-gold-bright"
        >
          Você ficou em {results.me.place}º · {formatScore(results.me.value, results.max)}
        </motion.p>
      ) : (
        <p className="text-sm text-mist">Você não pontuou neste jogo.</p>
      )}
      <p className="text-xs text-mist">Toque para fechar</p>
    </motion.button>
  )
}
