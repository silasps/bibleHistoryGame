"use client"

import { useEffect } from "react"

const VIDEO_SRC = "/media/tela-acordada.mp4"

/**
 * Mantém a tela do celular acesa enquanto `active`, como um vídeo tocando.
 * Usa o bloqueio de tela do navegador (Screen Wake Lock) e, junto, um vídeo
 * mudo de 1,5 KB em loop: no modo de economia de bateria o navegador pode
 * recusar o bloqueio, mas não apaga a tela com um vídeo tocando.
 * O vídeo só pode começar com um toque: cada toque retoma o que tiver parado.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return
    let lock: WakeLockSentinel | null = null
    let asking = false
    let stopped = false

    const video = document.createElement("video")
    video.src = VIDEO_SRC
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.setAttribute("playsinline", "")
    video.setAttribute("muted", "")
    video.setAttribute("aria-hidden", "true")
    video.setAttribute("tabindex", "-1")
    Object.assign(video.style, { position: "fixed", left: "0", bottom: "0", width: "1px", height: "1px", opacity: "0.01", pointerEvents: "none", zIndex: "-1" })
    document.body.append(video)

    const requestLock = async () => {
      if (stopped || lock || asking || document.visibilityState !== "visible" || !("wakeLock" in navigator)) return
      asking = true
      try {
        const l = await navigator.wakeLock.request("screen")
        if (stopped) return void l.release().catch(() => {})
        lock = l
        l.addEventListener("release", () => {
          if (lock === l) lock = null
        })
      } catch {
        // Recusado (modo de economia, aba em segundo plano): o vídeo segura a tela.
      } finally {
        asking = false
      }
    }
    const kick = () => {
      void requestLock()
      if (video.paused) void video.play().catch(() => {})
    }
    const onVisible = () => {
      if (document.visibilityState === "visible") kick()
    }

    kick()
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("pointerdown", kick, { passive: true })
    window.addEventListener("keydown", kick)
    return () => {
      stopped = true
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("pointerdown", kick)
      window.removeEventListener("keydown", kick)
      void lock?.release().catch(() => {})
      video.pause()
      video.remove()
    }
  }, [active])
}
