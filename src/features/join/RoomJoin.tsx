"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { isRoomCode, normalizeRoomCode } from "@/data/room-code"

/** Entrada por código curto (alternativa ao QR code). */
export function RoomJoin() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const valid = isRoomCode(code)
  const go = () => {
    if (!valid) return
    // Salas de demonstração só existem neste navegador.
    let demo = false
    try {
      demo = !!localStorage.getItem(`bph-room-${code}-host`)
    } catch {}
    router.push(`/join/${code}${demo ? "?modo=demo" : ""}`)
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        go()
      }}
      className="glass space-y-4 rounded-3xl p-6"
    >
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-mist">Código da sala</span>
        <input
          value={code}
          onChange={(e) => setCode(normalizeRoomCode(e.target.value))}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={6}
          className="h-16 w-full rounded-2xl border border-input bg-night/70 text-center font-display text-4xl tracking-[0.4em] text-parchment focus:border-gold"
          placeholder="ABC234"
          aria-describedby="join-help"
        />
      </label>
      <p id="join-help" className="text-sm text-mist">
        Seis letras e números, mostrados no telão. Sem cadastro.
      </p>
      <Button type="submit" size="lg" className="h-14 w-full rounded-full text-lg" disabled={!valid}>
        Entrar
      </Button>
    </form>
  )
}
