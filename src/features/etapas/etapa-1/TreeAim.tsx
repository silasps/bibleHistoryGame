"use client"

import { motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { artFile } from "@/components/art/art-files"
import { ETAPA1_LABELS, FORBIDDEN_FRUIT, GARDEN_TARGETS } from "@/content/etapas/etapa-1"
import { formatRef } from "@/content/refs"
import { launchVelocity, MAX_SHOTS, PULL_BY_SHOT, simulateShot, velocityToward, type Point, type Target } from "@/domain/aim"
import { HAPTIC, vibrate } from "@/fx/haptics"
import { useFx } from "@/fx/useFx"
import { useStinger } from "@/fx/useSound"

// Posições na tela (0–1). O fruto fica no meio, fácil de mirar; os alvos bons ao redor.
const FRUIT: Target = { id: "fruto", x: 0.5, y: 0.34, r: 0.075 }
const SPOTS: Point[] = [
  { x: 0.2, y: 0.13 },
  { x: 0.8, y: 0.13 },
  { x: 0.13, y: 0.38 },
  { x: 0.87, y: 0.38 },
  { x: 0.24, y: 0.62 },
  { x: 0.76, y: 0.62 },
]
const TARGETS: Target[] = GARDEN_TARGETS.map((t, i) => ({ id: t.id, ...SPOTS[i], r: 0.095 }))
const START: Point = { x: 0.5, y: 0.86 }

interface Props {
  onProgress: (goodHits: number, done: boolean) => void
  onConquest: (id: string) => void
}

/**
 * Diante da árvore: puxar e soltar para acertar os alvos bons. A cada jogada
 * a mira entorta mais para o fruto; a última sempre termina nele (Gn 3:6).
 */
export function TreeAim({ onProgress, onConquest }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hits, setHits] = useState<string[]>([])
  const [shot, setShot] = useState(0)
  const [fruitHit, setFruitHit] = useState(false)
  const flying = useRef(false)
  const drag = useRef<Point | null>(null)
  const anim = useRef<{ path: Point[]; i: number } | null>(null)
  const raf = useRef(0)
  const stinger = useStinger()
  const fx = useFx()
  const bgImg = useRef<HTMLImageElement | null>(null)
  const fruitImg = useRef<HTMLImageElement | null>(null)
  const serpentImg = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(0)

  // Imagens do autor (fundo, fruto e serpente); o canvas redesenha quando chegam.
  useEffect(() => {
    const load = (src: string | undefined, ref: React.RefObject<HTMLImageElement | null>) => {
      if (!src) return
      const img = new Image()
      img.onload = () => setLoaded((n) => n + 1)
      img.src = src
      ref.current = img
    }
    load(artFile("cenas", "eden-fundo"), bgImg)
    load(artFile("objetos", "fruto"), fruitImg)
    load(artFile("personagens", "serpente"), serpentImg)
  }, [])

  const draw = useCallback(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext("2d")!
    const W = c.width
    const H = c.height
    const s = Math.min(W, H)
    const X = (p: Point) => p.x * W
    const Y = (p: Point) => p.y * H

    if (bgImg.current?.complete) {
      ctx.drawImage(bgImg.current, 0, 0, W, H)
      ctx.fillStyle = "rgba(5,7,13,0.45)"
      ctx.fillRect(0, 0, W, H)
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, "#1b3a2a")
      g.addColorStop(1, "#0a0f1c")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
    }

    // O fruto brilha mais a cada jogada.
    const glow = 0.4 + 0.6 * (Math.min(shot, MAX_SHOTS - 1) / (MAX_SHOTS - 1))
    const fg = ctx.createRadialGradient(X(FRUIT), Y(FRUIT), 0, X(FRUIT), Y(FRUIT), FRUIT.r * s * (2.2 + glow * 2))
    fg.addColorStop(0, `rgba(255,170,100,${0.55 * glow + 0.2})`)
    fg.addColorStop(1, "rgba(255,170,100,0)")
    ctx.fillStyle = fg
    ctx.beginPath()
    ctx.arc(X(FRUIT), Y(FRUIT), FRUIT.r * s * (2.2 + glow * 2), 0, Math.PI * 2)
    ctx.fill()
    const serpent = serpentImg.current
    if (serpent?.complete && serpent.naturalWidth) {
      const w = FRUIT.r * s * 3.4
      ctx.drawImage(serpent, X(FRUIT) + FRUIT.r * s * 0.2, Y(FRUIT) - FRUIT.r * s * 2.4, w, (w * serpent.naturalHeight) / serpent.naturalWidth)
    }
    const fruit = fruitImg.current
    if (fruit?.complete && fruit.naturalWidth) {
      const w = FRUIT.r * s * 2.6
      const h = (w * fruit.naturalHeight) / fruit.naturalWidth
      ctx.drawImage(fruit, X(FRUIT) - w / 2, Y(FRUIT) - h / 2, w, h)
    } else {
      ctx.fillStyle = "#e0533a"
      ctx.strokeStyle = "#ffd27a"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(X(FRUIT), Y(FRUIT), FRUIT.r * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    // Alvos bons.
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    for (const [i, t] of TARGETS.entries()) {
      const hit = hits.includes(t.id)
      ctx.beginPath()
      ctx.arc(X(t), Y(t), t.r * s, 0, Math.PI * 2)
      ctx.fillStyle = hit ? "rgba(244,210,122,0.35)" : "rgba(15,24,43,0.75)"
      ctx.fill()
      ctx.lineWidth = hit ? 3 : 1.5
      ctx.strokeStyle = hit ? "#f4d27a" : "rgba(216,190,140,0.6)"
      ctx.stroke()
      ctx.fillStyle = hit ? "#fff6d8" : "#d9c7a7"
      ctx.font = `600 ${Math.round(s * 0.03)}px system-ui, sans-serif`
      wrap(ctx, GARDEN_TARGETS[i].label, X(t), Y(t), t.r * s * 1.6, s * 0.034)
    }

    // Estilingue e elástico.
    ctx.strokeStyle = "#8a6a44"
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(X(START) - s * 0.05, Y(START) - s * 0.06)
    ctx.lineTo(X(START), Y(START) + s * 0.02)
    ctx.lineTo(X(START) + s * 0.05, Y(START) - s * 0.06)
    ctx.moveTo(X(START), Y(START) + s * 0.02)
    ctx.lineTo(X(START), Y(START) + s * 0.1)
    ctx.stroke()
    const stone = anim.current ? anim.current.path[Math.min(anim.current.i, anim.current.path.length - 1)] : drag.current ? { x: START.x + drag.current.x, y: START.y + drag.current.y } : START
    if (drag.current) {
      ctx.strokeStyle = "rgba(244,210,122,0.8)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(X(START) - s * 0.05, Y(START) - s * 0.06)
      ctx.lineTo(X(stone), Y(stone))
      ctx.lineTo(X(START) + s * 0.05, Y(START) - s * 0.06)
      ctx.stroke()
    }
    if (!fruitHit) {
      ctx.fillStyle = "#fff6d8"
      ctx.shadowColor = "#f4d27a"
      ctx.shadowBlur = 14
      ctx.beginPath()
      ctx.arc(X(stone), Y(stone), s * 0.022, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }
  }, [hits, shot, fruitHit])

  // Tamanho do canvas acompanha a tela.
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const fit = () => {
      const r = c.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      c.width = Math.round(r.width * dpr)
      c.height = Math.round(r.height * dpr)
      draw()
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(c)
    return () => ro.disconnect()
  }, [draw])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  useEffect(() => draw(), [loaded, draw])

  const fire = useCallback(
    (velocity: Point) => {
      if (flying.current || fruitHit) return
      flying.current = true
      const pull = PULL_BY_SHOT[Math.min(shot, MAX_SHOTS - 1)]
      const result = simulateShot({ start: START, velocity, fruit: FRUIT, targets: TARGETS, pull, ignore: hits })
      stinger("whoosh")
      const land = () => {
        anim.current = null
        flying.current = false
        const nextShot = shot + 1
        setShot(nextShot)
        if (result.hit === "fruto") {
          setFruitHit(true)
          vibrate(HAPTIC.seal)
          stinger("heartbeat")
          onProgress(hits.length, true)
        } else if (result.hit) {
          const next = [...hits, result.hit]
          setHits(next)
          vibrate(HAPTIC.light)
          stinger("light")
          onConquest(result.hit)
          onProgress(next.length, false)
        }
      }
      if (!fx.motion) {
        land()
        return
      }
      anim.current = { path: result.path, i: 0 }
      const step = () => {
        if (!anim.current) return
        anim.current.i += 1
        draw()
        if (anim.current.i >= anim.current.path.length) land()
        else raf.current = requestAnimationFrame(step)
      }
      raf.current = requestAnimationFrame(step)
    },
    [draw, fruitHit, fx.motion, hits, onConquest, onProgress, shot, stinger],
  )

  const point = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
  }

  /** Sem gesto: lança na direção do próximo alvo bom (a atração da jogada continua valendo). */
  const autoShot = () => {
    const target = TARGETS.find((t) => !hits.includes(t.id)) ?? FRUIT
    fire(velocityToward(START, target))
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-night">
      <canvas
        ref={canvas}
        className="absolute inset-0 h-full w-full touch-none"
        role="img"
        aria-label={`${ETAPA1_LABELS.aim}. Alvos: ${GARDEN_TARGETS.map((t) => t.label).join(", ")}; no meio, ${FORBIDDEN_FRUIT.label.toLowerCase()}.`}
        onPointerDown={(e) => {
          if (flying.current || fruitHit) return
          e.currentTarget.setPointerCapture(e.pointerId)
          const p = point(e)
          drag.current = { x: p.x - START.x, y: p.y - START.y }
          draw()
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          const p = point(e)
          drag.current = { x: p.x - START.x, y: Math.max(-0.05, p.y - START.y) }
          draw()
        }}
        onPointerUp={() => {
          const d = drag.current
          drag.current = null
          if (d && Math.hypot(d.x, d.y) > 0.03) fire(launchVelocity(d))
          else draw()
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-2 text-center text-xs text-sand">
        {fruitHit ? null : `${ETAPA1_LABELS.aim} · jogada ${Math.min(shot + 1, MAX_SHOTS)} de ${MAX_SHOTS}`}
      </div>
      {fruitHit ? (
        <motion.div
          initial={fx.motion ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center"
          role="status"
        >
          <div className="space-y-2">
            <p className="font-display text-3xl text-[#ffb98a]">{FORBIDDEN_FRUIT.label}</p>
            <p className="text-sm text-sand">{formatRef(FORBIDDEN_FRUIT.ref, "long")}</p>
            <p className="text-sm text-mist">
              {hits.length} de {GARDEN_TARGETS.length} alvos bons
            </p>
          </div>
        </motion.div>
      ) : (
        <button onClick={autoShot} className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-black/50 px-4 py-2 text-sm text-white">
          Lançar
        </button>
      )}
    </div>
  )
}

/** Quebra o rótulo do alvo em até duas linhas. */
function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  const words = text.split(" ")
  const lines: string[] = []
  let line = ""
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > max && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  lines.push(line)
  lines.forEach((l, i) => ctx.fillText(l, x, y + (i - (lines.length - 1) / 2) * lh))
}
