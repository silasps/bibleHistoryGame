import type { Episode, Scene } from "@/content/schema"

/** Estado dos visuais interativos (quintal, estrada), controlado pela cena. */
export interface VisualState {
  wall?: number
  trainKey?: number
  kids?: "casa" | "quintal" | "fundo"
  edgeCm?: number
  safe?: boolean
}

export interface RendererProps {
  scene: Scene
  episode: Episode
  setVisual: (v: VisualState) => void
}
