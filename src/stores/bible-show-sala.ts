"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { jogarSalaShow, lerSalaShow } from "@/app/actions/show"
import { realtime } from "@/data/supabase/client"
import { reduceShow, type ShowAction, type ShowState } from "@/domain/bible-show"

// Bible Show em sala: o estado vem do servidor (ação + aviso do realtime) e a
// hora é a do servidor, para todos os celulares contarem o mesmo tempo.

type Snap = { state: ShowState; version: number }
type Resposta = Snap & { now: number }

export function useSalaShow(code: string) {
  const [snap, setSnap] = useState<Snap | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [online, setOnline] = useState(true)
  const versao = useRef(-1)
  const offset = useRef(0)

  /** `t0`: hora do pedido, para acertar o relógio pelo meio da ida e volta. */
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
    const r = await lerSalaShow(code)
    if ("error" in r) setErro(r.error)
    else aceitar(r, t0, true)
  }, [code, aceitar])

  useEffect(() => {
    const client = realtime()
    let poll: ReturnType<typeof setInterval> | undefined
    const t = setTimeout(() => void refetch(), 0)
    const channel = client
      ?.channel(`show:${code}`)
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

  const dispatch = useCallback(
    (a: ShowAction) => {
      // Mostra na hora; o servidor confirma (ou corrige) logo depois.
      setSnap((s) => (s ? { ...s, state: reduceShow(s.state, a) } : s))
      const t0 = Date.now()
      void jogarSalaShow(code, a).then((r) => {
        if ("error" in r) {
          setErro(r.error)
          void refetch()
        } else aceitar(r, t0, r.version >= versao.current)
      })
    },
    [code, aceitar, refetch],
  )

  return { state: snap?.state ?? null, dispatch, agora, erro, online }
}

const ouvintes = new Set<() => void>()

/** Valor guardado no aparelho (qual equipe é este celular, quem criou a sala). */
export function useNoAparelho(chave: string): [string | null, (v: string | null) => void] {
  const ler = () => {
    try {
      return localStorage.getItem(chave)
    } catch {
      return null
    }
  }
  const valor = useSyncExternalStore(
    (cb) => {
      ouvintes.add(cb)
      return () => ouvintes.delete(cb)
    },
    ler,
    () => null,
  )
  const set = useCallback(
    (v: string | null) => {
      try {
        if (v === null) localStorage.removeItem(chave)
        else localStorage.setItem(chave, v)
      } catch {
        // sem armazenamento
      }
      ouvintes.forEach((l) => l())
    },
    [chave],
  )
  return [valor, set]
}
