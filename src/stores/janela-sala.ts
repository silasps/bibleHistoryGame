"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { agirJanela, lerJanela } from "@/app/actions/janela"
import { realtime } from "@/data/supabase/client"
import { ACOES_DE_PALCO, reduceJanela, type JanelaAction, type JanelaState } from "@/domain/janela-verde"
import { useNoAparelho } from "@/stores/bible-show-sala"

// Janela Verde em sala: mesmo desenho do Bible Show (servidor manda, realtime
// avisa, hora do servidor), com a chave do condutor nas ações de palco.

type Snap = { state: JanelaState; version: number }
type Resposta = Snap & { now: number }

export function useJanela(code: string, chave?: string | null) {
  const [snap, setSnap] = useState<Snap | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [online, setOnline] = useState(true)
  const versao = useRef(-1)
  const offset = useRef(0)

  const aceitar = useCallback((r: Resposta, t0?: number, forcar = false) => {
    if (t0 !== undefined) offset.current = r.now - (t0 + Date.now()) / 2
    if (r.version > versao.current || forcar) {
      versao.current = Math.max(versao.current, r.version)
      setSnap({ state: r.state, version: r.version })
      setErro(null)
    }
  }, [])

  const refetch = useCallback(async () => {
    const t0 = Date.now()
    const r = await lerJanela(code)
    if ("error" in r) setErro(r.error)
    else aceitar(r, t0, true)
  }, [code, aceitar])

  useEffect(() => {
    const client = realtime()
    let poll: ReturnType<typeof setInterval> | undefined
    const t = setTimeout(() => void refetch(), 0)
    const channel = client
      ?.channel(`janela:${code}`)
      .on("broadcast", { event: "estado" }, ({ payload }) => aceitar(payload as Resposta))
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setOnline(true)
          if (poll) clearInterval(poll)
          poll = undefined
          void refetch()
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setOnline(false)
          poll ??= setInterval(() => void refetch(), 3000)
        }
      })
    if (!channel) poll = setInterval(() => void refetch(), 3000)
    const acordar = () => document.visibilityState === "visible" && void refetch()
    document.addEventListener("visibilitychange", acordar)
    window.addEventListener("online", acordar)
    return () => {
      clearTimeout(t)
      if (poll) clearInterval(poll)
      document.removeEventListener("visibilitychange", acordar)
      window.removeEventListener("online", acordar)
      if (channel) void client?.removeChannel(channel)
    }
  }, [code, refetch, aceitar])

  const agora = useCallback(() => Date.now() + offset.current, [])

  const agir = useCallback(
    (a: JanelaAction) => {
      // Mostra na hora (só o que este aparelho pode fazer); o servidor confirma ou corrige.
      if (!ACOES_DE_PALCO.has(a.type) || chave) setSnap((s) => (s ? { ...s, state: reduceJanela(s.state, a) } : s))
      const t0 = Date.now()
      void agirJanela(code, a, chave ?? null).then((r) => {
        if ("error" in r) {
          setErro(r.error)
          void refetch()
        } else aceitar(r, t0, r.version >= versao.current)
      })
    },
    [code, chave, aceitar, refetch],
  )

  return { state: snap?.state ?? null, agir, agora, erro, online }
}

/** Chave do condutor guardada neste aparelho. */
export function useChaveJanela(code: string) {
  return useNoAparelho(`jv-chave-${code}`)
}

/** Grupo ("auren" | "nair") deste aparelho. */
export function useGrupoJanela(code: string) {
  return useNoAparelho(`jv-grupo-${code}`)
}

let emMemoria: string | null = null

/** Id aleatório e persistente deste aparelho (para o compromisso). */
export function aparelhoId(): string {
  const novo = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36)
  try {
    let id = localStorage.getItem("jv-aparelho")
    if (!id) {
      id = novo()
      localStorage.setItem("jv-aparelho", id)
    }
    return id
  } catch {
    return (emMemoria ??= novo())
  }
}
