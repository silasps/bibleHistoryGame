import type { VisualId } from "@/content/schema"
import { cn } from "@/lib/utils"
import { CliffRoad } from "./CliffRoad"
import { Creation, NightSky, QuestionMark, StarsPromise } from "./Cosmic"
import { FallenGarden, Garden, ReflectionPool, SerpentFruit } from "./Garden"
import { Crossroads, SealedScroll, SeedThread } from "./Moments"
import { YardTrain } from "./YardTrain"

export { CliffRoad, YardTrain }

const VISUALS: Record<VisualId, () => React.ReactNode> = {
  "night-sky": NightSky,
  creation: Creation,
  "question-mark": QuestionMark,
  garden: Garden,
  "serpent-fruit": SerpentFruit,
  "choice-crossroads": Crossroads,
  rewind: Crossroads,
  "fallen-garden": FallenGarden,
  "seed-thread": SeedThread,
  "sealed-scroll": SealedScroll,
  "reflection-pool": ReflectionPool,
  "stars-promise": StarsPromise,
  "yard-train": () => <YardTrain />,
  "cliff-road": () => <CliffRoad />,
  timeline: NightSky,
}

/** Ilustração autoral da cena (SVG/CSS, sem assets externos). */
export function SceneVisual({ id, className }: { id: VisualId; className?: string }) {
  const Visual = VISUALS[id]
  return (
    <div className={cn("absolute inset-0", className)}>
      <Visual />
    </div>
  )
}
