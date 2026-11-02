"use client"

import { BlockList } from "@/components/story/BlockList"
import { useSolo } from "@/stores/solo-store"
import type { RendererProps } from "../types"

export function Reflection({ scene }: RendererProps) {
  const note = useSolo((s) => s.notes[scene.id] ?? "")
  const setNote = useSolo((s) => s.setNote)
  return (
    <div className="space-y-6">
      <BlockList blocks={scene.blocks} />
      <ol className="space-y-3">
        {scene.reflection!.prompts.map((p, i) => (
          <li key={i} className="flex gap-3 rounded-2xl border border-border bg-navy/50 p-4">
            <span className="font-display text-2xl leading-none text-gold">{i + 1}</span>
            <p className="text-parchment/90">{p}</p>
          </li>
        ))}
      </ol>
      <div className="space-y-2">
        <label htmlFor={`note-${scene.id}`} className="text-xs uppercase tracking-widest text-mist">
          Anotação pessoal (fica só neste aparelho)
        </label>
        <textarea
          id={`note-${scene.id}`}
          value={note}
          onChange={(e) => setNote(scene.id, e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-input bg-night/60 p-3 text-parchment placeholder:text-mist/50 focus:border-gold"
          placeholder="O que você percebeu?"
        />
      </div>
    </div>
  )
}
