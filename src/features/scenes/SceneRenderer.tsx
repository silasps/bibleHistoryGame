"use client"

import type { ComponentType } from "react"
import type { SceneType } from "@/content/schema"
import { CanonicalReveal } from "./renderers/CanonicalReveal"
import { ChoicePanel } from "./renderers/ChoicePanel"
import { Cliffhanger } from "./renderers/Cliffhanger"
import { EvidenceUnlock } from "./renderers/EvidenceUnlock"
import { Hypothetical } from "./renderers/Hypothetical"
import { Investigation } from "./renderers/Investigation"
import { Narrative } from "./renderers/Narrative"
import { Reflection } from "./renderers/Reflection"
import type { RendererProps } from "./types"

const RENDERERS: Record<SceneType, ComponentType<RendererProps>> = {
  cinematic_intro: Narrative,
  historical_context: Narrative,
  character_perspective: Narrative,
  theological_dilemma: Narrative,
  analogy: Narrative,
  choice: ChoicePanel,
  hypothetical_consequence: Hypothetical,
  canonical_reveal: CanonicalReveal,
  investigation: Investigation,
  evidence_unlock: EvidenceUnlock,
  presenter_pause: Narrative,
  audience_poll: Narrative,
  reflection: Reflection,
  chapter_cliffhanger: Cliffhanger,
}

export function SceneRenderer(props: RendererProps) {
  const Renderer = RENDERERS[props.scene.type]
  return <Renderer {...props} />
}
