"use client"

import { useEffect } from "react"
import { BlockList } from "@/components/story/BlockList"
import type { RendererProps } from "../types"
import { SoloPoll } from "./SoloPoll"

/** cinematic_intro, historical_context, character_perspective, theological_dilemma, analogy, presenter_pause, audience_poll. */
export function Narrative({ scene, setVisual }: RendererProps) {
  useEffect(() => {
    if (scene.visual === "yard-train") setVisual({ wall: 0, kids: "quintal" })
    if (scene.visual === "cliff-road") setVisual({ edgeCm: undefined, safe: false })
  }, [scene.visual, setVisual])
  return (
    <div className="space-y-8">
      {scene.type === "presenter_pause" && (
        <p className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-sand">
          Momento de conexão. Na apresentação ao vivo, o telão fica só com a imagem enquanto o apresentador fala.
        </p>
      )}
      <BlockList blocks={scene.blocks} />
      {scene.poll && <SoloPoll scene={scene} />}
    </div>
  )
}
