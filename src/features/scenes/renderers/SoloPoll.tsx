"use client"

import { Check, X } from "lucide-react"
import { motion } from "motion/react"
import type { Scene } from "@/content/schema"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useStinger } from "@/fx/useSound"
import { cn } from "@/lib/utils"
import { useSolo } from "@/stores/solo-store"

/** Enquete/quiz no modo solo. Sem agregação: mostra a sua resposta (e a correta, num quiz). */
export function SoloPoll({ scene }: { scene: Scene }) {
  const poll = scene.poll!
  const answer = useSolo((s) => s.pollAnswers[poll.id])
  const respond = useSolo((s) => s.answer)
  const stinger = useStinger()

  const pick = (optionId: string) => {
    if (answer) return
    respond(scene.id, optionId)
    vibrate(HAPTIC.vote)
    stinger(poll.kind === "quiz" && optionId !== poll.correctOptionId ? "heartbeat" : "vote")
  }

  return (
    <fieldset className="space-y-3 rounded-2xl border border-gold/25 bg-night/40 p-4">
      <legend className="px-1 text-xs uppercase tracking-[0.25em] text-gold">{poll.kind === "quiz" ? "Quiz" : "Sua hipótese"}</legend>
      <p className="font-display text-2xl text-parchment">{poll.question}</p>
      <div className="grid gap-2">
        {poll.options.map((o) => {
          const chosen = answer === o.id
          const correct = poll.kind === "quiz" && answer && o.id === poll.correctOptionId
          const wrong = poll.kind === "quiz" && chosen && o.id !== poll.correctOptionId
          return (
            <motion.button
              key={o.id}
              whileTap={answer ? undefined : { scale: 0.98 }}
              onClick={() => pick(o.id)}
              disabled={!!answer}
              aria-pressed={chosen}
              className={cn(
                "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-base transition-colors",
                !answer && "border-border bg-navy/60 hover:border-gold/60 hover:bg-navy-2",
                answer && !chosen && !correct && "border-transparent bg-navy/30 text-mist/60",
                chosen && !wrong && "border-gold bg-gold/15 text-parchment",
                correct && !chosen && "border-sage/60 bg-sage/10",
                wrong && "border-rose/60 bg-rose/10",
              )}
            >
              {o.label}
              {correct && <Check className="size-5 text-sage" aria-label="Resposta correta" />}
              {wrong && <X className="size-5 text-rose" aria-label="Resposta incorreta" />}
            </motion.button>
          )
        })}
      </div>
      {answer && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-mist" role="status">
          {poll.kind === "quiz" ? poll.afterResult : "Resposta registrada no seu Arquivo. Na apresentação ao vivo, aqui aparece o resultado do grupo."}
        </motion.p>
      )}
    </fieldset>
  )
}
