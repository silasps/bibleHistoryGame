"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { fetchConnectionSynthesis } from "@/app/actions/synthesis"
import { getEvidence, getSequence, sequenceScenes } from "@/content"
import type { ReleasedSynthesis } from "@/content/schema"
import { toAudienceView, toProjectorView } from "@/domain/projection"
import {
  createSession,
  reduceAudience,
  reduceHost,
  type AudienceCommand,
  type HostCommand,
  type SessionState,
} from "@/domain/session"
import type { HostRoomApi } from "../ports"
import { hostStateKey, openLocalChannel, projectorCacheKey, readJSON, writeJSON, type LocalChannel, type LocalMessage } from "./channel"

interface Saved {
  state: SessionState
  syntheses: Record<string, ReleasedSynthesis>
  tabs: string[]
}

export interface LocalRoomInit {
  sequenceId: string
  rehearsal: boolean
}

/**
 * Autoridade da sala na demonstração local. Vive na aba do apresentador,
 * recebe intenções das abas do público e publica só as views sanitizadas.
 */
export class LocalHostController {
  private state: SessionState | null
  private syntheses: Record<string, ReleasedSynthesis>
  private tabs: Set<string>
  private channel: LocalChannel | null = null
  private listeners = new Set<() => void>()
  private timers: ReturnType<typeof setTimeout>[] = []

  constructor(
    private code: string,
    init: LocalRoomInit | null,
  ) {
    const saved = readJSON<Saved>(hostStateKey(code))
    const seq = init ? getSequence(init.sequenceId) : undefined
    this.state =
      saved?.state ??
      (seq ? createSession({ roomCode: code, sequenceId: seq.id, sceneIds: seq.sceneIds, rehearsal: init?.rehearsal, now: Date.now() }) : null)
    this.syntheses = saved?.syntheses ?? {}
    this.tabs = new Set(saved?.tabs ?? [])
  }

  getSnapshot = () => this.state

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  connect() {
    this.channel = openLocalChannel(this.code, (msg) => this.onMessage(msg))
    this.persistAndPublish()
  }

  disconnect() {
    this.timers.forEach(clearTimeout)
    this.channel?.close()
    this.channel = null
  }

  private ctx() {
    return { now: Date.now(), narrative: { scenes: sequenceScenes(this.state!.sequenceId) } }
  }

  private apply(next: SessionState) {
    if (next === this.state) return
    this.state = next
    this.persistAndPublish()
    this.listeners.forEach((l) => l())
  }

  async command(cmd: HostCommand): Promise<string | undefined> {
    if (!this.state) return "Sala não encontrada"
    const { state, error } = reduceHost(this.state, cmd, this.ctx())
    if (error) return error
    this.apply(state)
    if (cmd.type === "release" && !this.syntheses[cmd.evidenceId]) {
      const res = await fetchConnectionSynthesis(cmd.evidenceId)
      if (res.ok) {
        this.syntheses = { ...this.syntheses, [cmd.evidenceId]: res.synthesis }
        this.persistAndPublish()
      }
    }
    return undefined
  }

  private audience(cmd: AudienceCommand) {
    if (!this.state) return
    this.apply(reduceAudience(this.state, cmd, this.ctx()).state)
  }

  private onMessage(msg: LocalMessage) {
    if (msg.t === "audience-cmd") {
      // Do público, só comandos de audiência são aceitos: nada de avançar cena ou liberar pista.
      if (msg.cmd.type === "join") this.tabs.add(msg.cmd.participantId)
      this.audience(msg.cmd)
      this.publish()
    } else if (msg.t === "hello") {
      if (msg.participantId) this.tabs.add(msg.participantId)
      this.publish()
    }
  }

  private persistAndPublish() {
    if (!this.state) return
    writeJSON(hostStateKey(this.code), { state: this.state, syntheses: this.syntheses, tabs: [...this.tabs] } satisfies Saved)
    this.publish()
  }

  private publish() {
    if (!this.state || !this.channel) return
    const narrative = { scenes: sequenceScenes(this.state.sequenceId) }
    const projector = toProjectorView(this.state, narrative, getEvidence)
    writeJSON(projectorCacheKey(this.code), projector)
    this.channel.post({ t: "projector-view", view: projector })
    for (const id of [null, ...this.tabs]) {
      this.channel.post({ t: "audience-view", participantId: id, view: toAudienceView(this.state, narrative, getEvidence, id, this.syntheses) })
    }
  }

  // ─── Simulação (rotulada na UI) ────────────────────────────────────────

  private simIds() {
    return Object.keys(this.state?.participants ?? {}).filter((id) => id.startsWith("sim-"))
  }

  addParticipants(n: number) {
    const start = this.simIds().length
    for (let i = 0; i < n; i++) {
      const delay = 150 + Math.random() * 1500
      this.timers.push(setTimeout(() => this.audience({ type: "join", participantId: `sim-${start + i + 1}` }), delay))
    }
  }

  voteRandomly() {
    const scene = this.state ? sequenceScenes(this.state.sequenceId)[this.state.index] : undefined
    const poll = scene?.poll
    if (!poll || this.state?.polls[poll.id]?.status !== "open") return
    // Pesos aleatórios por enquete deixam o resultado menos uniforme.
    const weights = poll.options.map(() => 0.3 + Math.random())
    const total = weights.reduce((a, b) => a + b, 0)
    for (const id of this.simIds()) {
      const delay = 300 + Math.random() * 4000
      this.timers.push(
        setTimeout(() => {
          let r = Math.random() * total
          const option = poll.options.find((_, i) => (r -= weights[i]) <= 0) ?? poll.options[0]
          this.audience({ type: "vote", participantId: id, pollId: poll.id, optionId: option.id })
        }, delay),
      )
    }
  }

  lightAll() {
    for (const id of this.simIds()) {
      this.timers.push(setTimeout(() => this.audience({ type: "light", participantId: id }), 200 + Math.random() * 5000))
    }
  }
}

export function useLocalHost(code: string, init: LocalRoomInit | null): HostRoomApi {
  const [controller] = useState(() => (typeof window === "undefined" ? null : new LocalHostController(code, init)))
  useEffect(() => {
    controller?.connect()
    return () => controller?.disconnect()
  }, [controller])
  const state = useSyncExternalStore(
    controller?.subscribe ?? (() => () => {}),
    controller?.getSnapshot ?? (() => null),
    () => null,
  )
  return {
    mode: "demo",
    state,
    link: "conectado",
    command: (cmd) => controller?.command(cmd) ?? Promise.resolve("Sala indisponível"),
    simulation: controller
      ? {
          addParticipants: (n) => controller.addParticipants(n),
          voteRandomly: () => controller.voteRandomly(),
          lightAll: () => controller.lightAll(),
        }
      : undefined,
  }
}
