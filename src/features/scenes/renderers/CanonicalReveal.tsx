"use client"

import { BookOpenCheck } from "lucide-react"
import { BlockList } from "@/components/story/BlockList"
import type { RendererProps } from "../types"
import { useEffect } from "react"

export function CanonicalReveal({ scene, setVisual }: RendererProps) {
  const isAnalogy = scene.blocks.every((b) => b.kind === "analogia" || b.kind === "narracao")
  useEffect(() => {
    if (scene.visual === "cliff-road") setVisual({ safe: true })
  }, [scene.visual, setVisual])
  return (
    <div className="space-y-6">
      {!isAnalogy && (
        <div className="flex items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4">
          <BookOpenCheck className="size-5 shrink-0 text-gold" aria-hidden />
          <p className="text-sm text-parchment">
            <strong className="font-semibold text-gold-bright">Relato canônico.</strong> Isto é o que o texto bíblico narra — igual para qualquer escolha feita antes.
          </p>
        </div>
      )}
      <BlockList blocks={scene.blocks} stagger={0.35} />
    </div>
  )
}
