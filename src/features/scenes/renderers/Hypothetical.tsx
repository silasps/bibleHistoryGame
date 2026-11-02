"use client"

import { FlaskConical } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { getSceneEntry, sceneHref } from "@/content"
import { BlockList } from "@/components/story/BlockList"
import { useStinger } from "@/fx/useSound"
import { useSolo } from "@/stores/solo-store"
import type { RendererProps } from "../types"

export function Hypothetical({ scene, setVisual }: RendererProps) {
  const h = scene.hypothetical!
  const optionId = useSolo((s) => s.choices[h.choiceSceneId])
  const origin = getSceneEntry(h.choiceSceneId)?.scene
  const option = origin?.choice?.options.find((o) => o.id === optionId)
  const stinger = useStinger()

  // Analogia do muro: levanta o muro (se for a escolha) e faz o trem passar.
  useEffect(() => {
    if (scene.visual !== "yard-train" || !optionId) return
    const kids = optionId === "proibir" ? "casa" : "quintal"
    setVisual({ wall: 0, kids })
    const build = setTimeout(() => setVisual({ wall: optionId === "muro" ? 1 : 0, kids }), 600)
    const train = setTimeout(() => {
      setVisual({ wall: optionId === "muro" ? 1 : 0, kids, trainKey: Date.now() })
      stinger("train")
    }, 1800)
    return () => (clearTimeout(build), clearTimeout(train))
  }, [scene.visual, optionId, setVisual, stinger])

  if (!optionId || !option) {
    return (
      <p className="text-mist">
        Você ainda não fez a escolha desta simulação.{" "}
        <Link className="text-gold underline" href={sceneHref(h.choiceSceneId)}>
          Voltar para escolher
        </Link>
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-rose/50 bg-rose/10 p-4" role="note">
        <FlaskConical className="mt-0.5 size-5 shrink-0 text-rose" aria-hidden />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-rose">Simulação reflexiva — não é texto bíblico</p>
          <p className="mt-1 text-sm text-parchment/80">
            Sua escolha: <strong className="text-parchment">{option.label}</strong>
          </p>
        </div>
      </div>
      <BlockList blocks={h.byOption[optionId]} />
      <BlockList blocks={scene.blocks} />
    </div>
  )
}
