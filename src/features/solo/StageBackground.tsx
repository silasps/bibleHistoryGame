"use client"

import { AnimatePresence, motion } from "motion/react"
import type { FxCue, Scene } from "@/content/schema"
import { CliffRoad, SceneVisual, YardTrain } from "@/components/visuals"
import { ParticleField, type ParticlePreset } from "@/fx/ParticleField"
import { ScreenShake } from "@/fx/ScreenShake"
import { useFx } from "@/fx/useFx"
import type { VisualState } from "../scenes/types"

const PARTICLES: Partial<Record<FxCue, ParticlePreset>> = {
  stars: "stars",
  "creation-light": "dust",
  "garden-breeze": "fireflies",
  "fruit-glow": "fireflies",
  "seed-thread": "dust",
  embers: "embers",
  seal: "dust",
  heartbeat: "dust",
  rewind: "dust",
}

/** Palco visual da cena: ilustração, partículas e iluminação. Usado no solo e no telão. */
export function StageBackground({ scene, visual = {}, className }: { scene: Pick<Scene, "id" | "visual" | "fxCue" | "illumination">; visual?: VisualState; className?: string }) {
  const fx = useFx()
  const preset = scene.fxCue ? PARTICLES[scene.fxCue] : undefined
  return (
    <div className={className} style={{ ["--illumination" as string]: scene.illumination }}>
      <div className="stage-glow grain absolute inset-0" />
      <AnimatePresence mode="sync">
        <motion.div
          key={scene.visual + (scene.visual === "yard-train" || scene.visual === "cliff-road" ? "" : scene.id)}
          className="absolute inset-0"
          initial={fx.motion ? { opacity: 0, scale: 1.06 } : { opacity: 0 }}
          animate={{ opacity: 0.55 + scene.illumination * 0.45, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fx.motion ? 1.4 : 0.2, ease: "easeOut" }}
        >
          <ScreenShake trigger={visual.trainKey} className="absolute inset-0">
            {scene.visual === "yard-train" ? (
              <YardTrain wall={visual.wall} trainKey={visual.trainKey} kids={visual.kids} />
            ) : scene.visual === "cliff-road" ? (
              <CliffRoad edgeCm={visual.edgeCm} safe={visual.safe} />
            ) : (
              <SceneVisual id={scene.visual} />
            )}
          </ScreenShake>
        </motion.div>
      </AnimatePresence>
      {preset && <ParticleField key={preset} preset={preset} intensity={scene.illumination} density={scene.fxCue === "stars" ? 1 : 0.7} />}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.6))]" />
    </div>
  )
}
