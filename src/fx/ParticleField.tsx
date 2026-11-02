"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useFx } from "./useFx"

export type ParticlePreset = "stars" | "dust" | "embers" | "fireflies"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
  phase: number
  life: number
  maxLife: number
  burst: boolean
}

const PRESETS: Record<ParticlePreset, { count: number; color: string; speed: number; size: [number, number]; rise: number }> = {
  stars: { count: 160, color: "241, 232, 214", speed: 0.02, size: [0.4, 1.6], rise: 0 },
  dust: { count: 70, color: "217, 199, 167", speed: 0.12, size: [0.6, 1.8], rise: -0.02 },
  embers: { count: 55, color: "244, 170, 90", speed: 0.25, size: [0.8, 2.2], rise: -0.35 },
  fireflies: { count: 40, color: "244, 210, 122", speed: 0.3, size: [1, 2.6], rise: -0.05 },
}

interface Props {
  preset?: ParticlePreset
  /** 0..1, multiplica a quantidade. */
  density?: number
  /** 0..1, brilho geral (segue a iluminação da cena). */
  intensity?: number
  /** Mude o valor para disparar uma explosão de faíscas douradas no centro. */
  burstKey?: number | string
  /** Ponto de origem da explosão, em fração da largura/altura. */
  burstOrigin?: { x: number; y: number }
  className?: string
}

export function ParticleField({
  preset = "stars",
  density = 1,
  intensity = 0.6,
  burstKey,
  burstOrigin = { x: 0.5, y: 0.5 },
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const size = useRef({ w: 0, h: 0 })
  const fx = useFx()
  const cfg = PRESETS[preset]

  // Campo base
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !fx.particles) return

    const spawn = (w: number, h: number, randomY = true): Particle => ({
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 10,
      vx: (Math.random() - 0.5) * cfg.speed,
      vy: (Math.random() - 0.5) * cfg.speed + cfg.rise,
      r: cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]),
      a: 0.2 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      life: 0,
      maxLife: Infinity,
      burst: false,
    })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = canvas.getBoundingClientRect()
      size.current = { w: width, h: height }
      canvas.width = Math.max(1, width * dpr)
      canvas.height = Math.max(1, height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const target = Math.round(cfg.count * density * Math.min(1.5, (width * height) / (1280 * 720)))
      particles.current = density === 0 ? [] : Array.from({ length: Math.max(8, target) }, () => spawn(width, height))
    }

    const draw = (t: number) => {
      const { w, h } = size.current
      ctx.clearRect(0, 0, w, h)
      for (const p of particles.current) {
        const twinkle = preset === "stars" ? 0.55 + 0.45 * Math.sin(t / 900 + p.phase) : 1
        const fade = p.burst ? Math.max(0, 1 - p.life / p.maxLife) : 1
        const alpha = Math.min(1, p.a * twinkle * fade * (0.35 + intensity))
        ctx.beginPath()
        ctx.fillStyle = p.burst ? `rgba(244, 210, 122, ${alpha})` : `rgba(${cfg.color}, ${alpha})`
        if (preset !== "stars" || p.burst) {
          ctx.shadowBlur = p.burst ? 12 : 6
          ctx.shadowColor = p.burst ? "rgba(244,210,122,0.9)" : `rgba(${cfg.color}, 0.8)`
        } else ctx.shadowBlur = 0
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    if (!fx.motion) {
      draw(0)
      return () => ro.disconnect()
    }

    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      const dt = Math.min(48, t - last) / 16.7
      last = t
      const { w, h } = size.current
      const next: Particle[] = []
      for (const p of particles.current) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.life += dt
        if (preset === "fireflies") p.vx += Math.sin(t / 700 + p.phase) * 0.004
        if (p.burst) {
          p.vy += 0.03 * dt
          p.vx *= 0.985
          if (p.life < p.maxLife) next.push(p)
          continue
        }
        if (p.y < -10) Object.assign(p, spawn(w, h, false))
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y > h + 20) p.y = -10
        next.push(p)
      }
      particles.current = next
      draw(t)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    document.addEventListener("visibilitychange", onVis)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [preset, density, intensity, fx.particles, fx.motion, cfg])

  // Explosão de faíscas
  useEffect(() => {
    if (burstKey === undefined || !fx.motion) return
    const { w, h } = size.current
    const cx = w * burstOrigin.x
    const cy = h * burstOrigin.y
    const sparks = Array.from({ length: 90 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 1.5 + Math.random() * 5
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        r: 0.8 + Math.random() * 2.2,
        a: 1,
        phase: 0,
        life: 0,
        maxLife: 50 + Math.random() * 60,
        burst: true,
      }
    })
    particles.current = [...particles.current, ...sparks]
    // burstOrigin é lido no momento da explosão; não precisa reexecutar ao mudar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burstKey, fx.motion])

  if (!fx.particles) return null
  return <canvas ref={canvasRef} aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />
}
