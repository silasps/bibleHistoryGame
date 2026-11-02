"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { useCallback, useEffect, useRef, useState } from "react"
import { castLiveVote, joinLiveRoom, liveHostCommand, lightLive } from "@/app/actions/live"
import type { LinkState } from "@/components/story/ConnectionStatus"
import type { AudienceView, ProjectorView } from "@/domain/projection"
import type { HostCommand, SessionState } from "@/domain/session"
import { joinUrlFor, siteOrigin, type AudienceRoomApi, type HostRoomApi, type ProjectorRoomApi } from "../ports"

type Scope = "stage" | "votes" | "people" | "lights"

let browserClient: SupabaseClient | null = null

/** Cliente anônimo, usado só para ouvir os avisos da sala (realtime). */
function realtime(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  browserClient ??= createClient(url, key, { auth: { persistSession: false } })
  return browserClient
}

/**
 * Busca a view da rota e a refaz quando chega um aviso da sala. Buscas
 * simultâneas são agrupadas; sem realtime, cai para polling.
 */
function useSyncedResource<T>(code: string, path: string, scopes: Scope[]) {
  const [data, setData] = useState<T | null>(null)
  const [link, setLink] = useState<LinkState>("conectando")
  const [error, setError] = useState<string | null>(null)
  const inflight = useRef(false)
  const pending = useRef(false)
  const scopeKey = scopes.join(",")

  const refetch = useCallback(async () => {
    if (inflight.current) {
      pending.current = true
      return
    }
    inflight.current = true
    try {
      do {
        pending.current = false
        try {
          const res = await fetch(`/api/rooms/${code}/${path}`, { cache: "no-store" })
          const body = await res.json()
          if (res.ok) {
            setData(body as T)
            setError(null)
          } else setError(body.error ?? "Erro ao carregar a sala")
        } catch {
          setLink("offline")
        }
      } while (pending.current)
    } finally {
      inflight.current = false
    }
  }, [code, path])

  useEffect(() => {
    const client = realtime()
    const wanted = new Set(scopeKey.split(","))
    void refetch()
    let poll: ReturnType<typeof setInterval> | undefined
    const startPolling = () => {
      poll ??= setInterval(() => void refetch(), 4000)
    }
    const stopPolling = () => {
      if (poll) clearInterval(poll)
      poll = undefined
    }
    const channel = client
      ?.channel(`room:${code}`)
      .on("broadcast", { event: "sync" }, ({ payload }) => {
        if (wanted.has((payload as { scope: Scope }).scope)) void refetch()
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setLink("conectado")
          stopPolling()
          void refetch() // pega o que mudou enquanto reconectava
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setLink("offline")
          startPolling()
        }
      })
    if (!channel) startPolling()
    const onWake = () => document.visibilityState === "visible" && void refetch()
    document.addEventListener("visibilitychange", onWake)
    window.addEventListener("online", onWake)
    return () => {
      stopPolling()
      document.removeEventListener("visibilitychange", onWake)
      window.removeEventListener("online", onWake)
      if (channel) void client?.removeChannel(channel)
    }
  }, [code, scopeKey, refetch])

  return { data, setData, link, error, refetch }
}

export function useLiveHost(code: string): HostRoomApi & { error: string | null } {
  const { data, setData, link, error } = useSyncedResource<SessionState>(code, "host", ["stage", "votes", "people", "lights"])
  const command = useCallback(
    async (cmd: HostCommand) => {
      const res = await liveHostCommand(code, cmd)
      const stage = res.state
      if (stage) {
        // O servidor devolve só o palco: preserva votos, participantes e luzes já conhecidos.
        setData((prev) =>
          prev
            ? {
                ...stage,
                participants: prev.participants,
                lights: prev.lights,
                polls: Object.fromEntries(Object.entries(stage.polls).map(([id, p]) => [id, { ...p, votes: prev.polls[id]?.votes ?? {} }])),
              }
            : stage,
        )
      }
      return res.error
    },
    [code, setData],
  )
  return { mode: "live", state: data, link, command, error }
}

export function useLiveProjector(code: string): ProjectorRoomApi & { error: string | null } {
  const { data, link, error } = useSyncedResource<ProjectorView>(code, "projector", ["stage", "votes", "people", "lights"])
  return { view: data, link, error, joinUrl: joinUrlFor(code, "live", siteOrigin()) }
}

export function useLiveAudience(code: string): AudienceRoomApi & { error: string | null } {
  // O público só refaz a busca em mudanças de palco e nas próprias ações:
  // votos dos outros não geram tráfego em todos os celulares.
  const { data, link, error, refetch } = useSyncedResource<AudienceView>(code, "audience", ["stage"])
  const join = useCallback(
    async (nickname?: string) => {
      const res = await joinLiveRoom(code, nickname)
      await refetch()
      return res.error
    },
    [code, refetch],
  )
  const vote = useCallback(
    async (pollId: string, optionId: string) => {
      const res = await castLiveVote(code, pollId, optionId)
      await refetch()
      return res.error
    },
    [code, refetch],
  )
  const light = useCallback(async () => {
    await lightLive(code)
    await refetch()
  }, [code, refetch])
  return { view: data, link, error, joined: !!data?.me, join, vote, light }
}
