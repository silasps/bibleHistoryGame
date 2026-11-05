"use client"

import { motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { clearedFraction, SCRATCH_DONE } from "@/domain/scratch"
import { useFx } from "@/fx/useFx"

/** Pinta a camada que será raspada: noite estrelada ou pedra. */
function paintCover(ctx: CanvasRenderingContext2D, w: number, h: number, cover: "escuro" | "pedra") {
  if (cover === "pedra") {
    ctx.fillStyle = "#5a5652"
    ctx.fillRect(0, 0, w, h)
    // Textura de pedra simples: manchas e rachaduras.
    for (let i = 0; i < 260; i++) {
      const x = (i * 131) % w
      const y = (i * 197) % h
      const r = 6 + ((i * 7) % 18)
      ctx.fillStyle = i % 3 ? "rgba(30,28,26,0.18)" : "rgba(200,195,185,0.12)"
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.strokeStyle = "rgba(20,18,16,0.5)"
    ctx.lineWidth = 2
    for (let i = 0; i < 9; i++) {
      ctx.beginPath()
      let x = ((i * 89) % w) * 1
      let y = 0
      ctx.moveTo(x, y)
      while (y < h) {
        x += ((i * 13 + y) % 30) - 15
        y += 24
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    return
  }
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, "#05070d")
  g.addColorStop(1, "#0f182b")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = "rgba(244,210,122,0.5)"
  for (let i = 0; i < 40; i++) ctx.fillRect((i * 97) % w, (i * 211) % h, 1.5, 1.5)
}

interface Props {
  cover: "escuro" | "pedra"
  /** Já revelado (pelo dedo ou pelo botão "Revelar"): a camada some. */
  cleared: boolean
  onCleared: () => void
  onProgress?: (fraction: number) => void
  hint: string
  label: string
}

/** Camada para raspar com o dedo: some quando boa parte foi limpa. */
export function ScratchLayer({ cover, cleared, onCleared, onProgress, hint, label }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const moves = useRef(0)
  const [touched, setTouched] = useState(false)
  const fx = useFx()

  // Máscara do tamanho da tela em pixels CSS: não precisa de retina.
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const { width, height } = c.getBoundingClientRect()
    c.width = Math.max(1, Math.round(width))
    c.height = Math.max(1, Math.round(height))
    paintCover(c.getContext("2d", { willReadFrequently: true })!, c.width, c.height, cover)
  }, [cover])

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvas.current
    if (!c || cleared || (e.pointerType === "mouse" && e.buttons === 0)) return
    const rect = c.getBoundingClientRect()
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const ctx = c.getContext("2d", { willReadFrequently: true })!
    ctx.globalCompositeOperation = "destination-out"
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = Math.min(c.width, c.height) * 0.22
    ctx.beginPath()
    ctx.moveTo(last.current?.x ?? p.x, last.current?.y ?? p.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (!touched) setTouched(true)
    if (++moves.current % 6 === 0) {
      const fraction = clearedFraction(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height, 10)
      onProgress?.(fraction)
      if (fraction >= SCRATCH_DONE) onCleared()
    }
  }

  return (
    <>
      <motion.canvas
        ref={canvas}
        className="absolute inset-0 h-full w-full touch-none"
        animate={{ opacity: cleared ? 0 : 1 }}
        transition={{ duration: fx.motion ? 0.8 : 0 }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          last.current = null
          scratch(e)
        }}
        onPointerMove={scratch}
        onPointerUp={() => (last.current = null)}
        aria-label={`${hint}: ${label}`}
        role="img"
      />
      {!touched && !cleared && <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center font-display text-2xl text-parchment/90">{hint}</p>}
    </>
  )
}
