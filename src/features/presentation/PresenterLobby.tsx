"use client"

import { FlaskConical, Radio } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { createLiveRoom } from "@/app/actions/live"
import { Button } from "@/components/ui/button"
import { generateRoomCode } from "@/data/room-code"
import { cn } from "@/lib/utils"

interface Seq {
  id: string
  title: string
  description: string
  minutes: number
}

export function PresenterLobby({ sequences, liveAvailable, accessRequired }: { sequences: Seq[]; liveAvailable: boolean; accessRequired: boolean }) {
  const router = useRouter()
  const [sequenceId, setSequenceId] = useState(sequences[0].id)
  const [rehearsal, setRehearsal] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [pending, start] = useTransition()

  const demo = () => {
    const code = generateRoomCode()
    router.push(`/presenter/${code}?modo=demo&seq=${sequenceId}${rehearsal ? "&ensaio=1" : ""}`)
  }
  const live = () =>
    start(async () => {
      const res = await createLiveRoom({ sequenceId, rehearsal, accessCode: accessCode || undefined })
      if ("error" in res) toast.error(res.error)
      else router.push(`/presenter/${res.code}`)
    })

  return (
    <div className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">1 · Sequência</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {sequences.map((s) => (
            <label
              key={s.id}
              className={cn(
                "cursor-pointer rounded-2xl border p-4 transition-colors",
                sequenceId === s.id ? "border-gold bg-gold/10" : "border-border bg-ink hover:border-gold/40",
              )}
            >
              <input type="radio" name="seq" value={s.id} checked={sequenceId === s.id} onChange={() => setSequenceId(s.id)} className="sr-only" />
              <p className="font-display text-2xl text-parchment">{s.title}</p>
              <p className="mt-1 text-sm text-mist">{s.description}</p>
              <p className="mt-2 text-xs text-sand">Estimativa: ~{s.minutes} min</p>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-3 text-sm text-parchment">
        <input type="checkbox" checked={rehearsal} onChange={(e) => setRehearsal(e.target.checked)} className="size-5 accent-[var(--gold)]" />
        Modo ensaio (sem público; registra os tempos de cada cena)
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-3xl border border-sage/40 bg-sage/5 p-6">
          <Radio className="size-6 text-sage" aria-hidden />
          <h2 className="font-display text-3xl">Ao vivo</h2>
          <p className="text-sm text-mist">Celulares reais entram pelo QR code. Votos e pistas sincronizam pelo Supabase.</p>
          {liveAvailable ? (
            <>
              {accessRequired && (
                <input
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  type="password"
                  placeholder="Código do apresentador"
                  className="h-11 w-full rounded-xl border border-input bg-night/60 px-3"
                  aria-label="Código do apresentador"
                />
              )}
              <Button size="lg" className="h-12 w-full rounded-full" disabled={pending} onClick={live}>
                Criar sala ao vivo
              </Button>
            </>
          ) : (
            <p className="rounded-xl border border-border p-3 text-sm text-mist">Indisponível: configure o Supabase no servidor (veja o README).</p>
          )}
        </div>
        <div className="space-y-3 rounded-3xl border border-ember/40 bg-ember/5 p-6">
          <FlaskConical className="size-6 text-[#f2a27e]" aria-hidden />
          <h2 className="font-display text-3xl">Demonstração local</h2>
          <p className="text-sm text-mist">
            Tudo neste navegador: telão e “celulares” em outras abas, com participantes simulados. Não é multiusuário real.
          </p>
          <Button variant="outline" size="lg" className="h-12 w-full rounded-full" onClick={demo}>
            Abrir demonstração
          </Button>
        </div>
      </div>

      <p className="text-sm text-mist">
        Para estudar o roteiro antes de apresentar, use a{" "}
        <Link href={`/presenter/prep?seq=${sequenceId}`} className="text-gold underline">
          Área de preparação
        </Link>{" "}
        — nunca a projete.
      </p>
    </div>
  )
}
