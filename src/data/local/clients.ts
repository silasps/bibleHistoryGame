"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import type { AudienceView, ProjectorView } from "@/domain/projection"
import { joinUrlFor, siteOrigin, type AudienceRoomApi, type ProjectorRoomApi } from "../ports"
import { openLocalChannel, projectorCacheKey, readJSON, type LocalChannel } from "./channel"

/** Assinatura genérica de um valor que chega pelo canal local. */
class Mailbox<T> {
  value: T | null
  private listeners = new Set<() => void>()
  constructor(initial: T | null) {
    this.value = initial
  }
  get = () => this.value
  set(v: T) {
    this.value = v
    this.listeners.forEach((l) => l())
  }
  subscribe = (l: () => void) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }
}

function useMailbox<T>(box: Mailbox<T> | null): T | null {
  return useSyncExternalStore(box?.subscribe ?? (() => () => {}), box?.get ?? (() => null), () => null)
}

export function useLocalProjector(code: string): ProjectorRoomApi {
  const [box] = useState(() => (typeof window === "undefined" ? null : new Mailbox<ProjectorView>(readJSON(projectorCacheKey(code)))))
  useEffect(() => {
    if (!box) return
    const ch = openLocalChannel(code, (msg) => {
      if (msg.t === "projector-view") box.set(msg.view)
    })
    ch.post({ t: "hello", role: "projector" })
    return () => ch.close()
  }, [box, code])
  const view = useMailbox(box)
  return { view, link: view ? "conectado" : "conectando", joinUrl: joinUrlFor(code, "demo", siteOrigin()) }
}

function tabParticipantId(code: string): string | null {
  if (typeof window === "undefined") return null
  const key = `bph-demo-pid-${code}`
  try {
    const existing = sessionStorage.getItem(key)
    if (existing) return existing
    const id = `tab-${crypto.randomUUID().slice(0, 8)}`
    sessionStorage.setItem(key, id)
    return id
  } catch {
    return `tab-${Math.random().toString(36).slice(2, 10)}`
  }
}

/** O canal local só alcança abas do mesmo navegador: outro aparelho nunca recebe a sala. */
const DEMO_ELSEWHERE =
  "Esta sala é uma demonstração local: ela só funciona em abas do mesmo navegador do apresentador. Para entrar pelo celular, o apresentador precisa criar uma sala ao vivo."
const DEMO_WAIT_MS = 4000

export function useLocalAudience(code: string): AudienceRoomApi & { error: string | null } {
  const [pid] = useState(() => tabParticipantId(code))
  const [box] = useState(() => (typeof window === "undefined" ? null : new Mailbox<AudienceView>(null)))
  const channel = useRef<LocalChannel | null>(null)
  const [waited, setWaited] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setWaited(true), DEMO_WAIT_MS)
    return () => clearTimeout(t)
  }, [code])

  useEffect(() => {
    if (!box || !pid) return
    const ch = openLocalChannel(code, (msg) => {
      if (msg.t !== "audience-view") return
      // Antes de entrar, a aba usa a view anônima; depois, a própria.
      const mine = msg.participantId === pid
      const anon = msg.participantId === null && !box.value?.me
      if (mine || anon) box.set(msg.view)
    })
    ch.post({ t: "hello", role: "audience", participantId: pid })
    channel.current = ch
    return () => {
      ch.close()
      channel.current = null
    }
  }, [box, code, pid])

  const view = useMailbox(box)
  const join = useCallback(
    async (nickname?: string) => {
      if (!channel.current || !pid) return "Sem conexão com a sala"
      channel.current.post({ t: "audience-cmd", cmd: { type: "join", participantId: pid, nickname } })
      return undefined
    },
    [pid],
  )
  const vote = useCallback(
    async (pollId: string, optionId: string) => {
      if (!channel.current || !pid) return "Sem conexão com a sala"
      channel.current.post({ t: "audience-cmd", cmd: { type: "vote", participantId: pid, pollId, optionId } })
      return undefined
    },
    [pid],
  )
  const light = useCallback(async () => {
    if (channel.current && pid) channel.current.post({ t: "audience-cmd", cmd: { type: "light", participantId: pid } })
  }, [pid])

  const lost = !view && waited
  return { view, link: view ? "conectado" : lost ? "offline" : "conectando", joined: !!view?.me, join, vote, light, error: lost ? DEMO_ELSEWHERE : null }
}
