"use client"

import type { ProjectorView } from "@/domain/projection"
import type { ProjectorControl } from "../ports"

// Atalho entre o painel e o telão abertos no MESMO navegador (o caso comum:
// notebook com o telão no segundo monitor). O painel manda a view pronta e o
// telão troca de slide na hora, sem esperar servidor + banco + aviso + busca.
// A rede continua valendo: ela confirma (e corrige) logo depois.

export type RelayMessage = { t: "host" } | { t: "view"; view: ProjectorView } | { t: "control"; cmd: ProjectorControl }

export interface Relay {
  post: (m: RelayMessage) => void
  close: () => void
}

export function openRelay(code: string, onMessage: (m: RelayMessage) => void): Relay | null {
  if (typeof BroadcastChannel === "undefined") return null
  const channel = new BroadcastChannel(`biblia-relay-${code}`)
  channel.onmessage = (e: MessageEvent<RelayMessage>) => onMessage(e.data)
  return { post: (m) => channel.postMessage(m), close: () => channel.close() }
}

/** O telão só aceita uma view igual ou mais nova do que a que já mostra. */
export const newerView = <T extends { version: number }>(prev: T | null, next: T) => !prev || next.version >= prev.version
