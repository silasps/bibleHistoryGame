"use client"

import { BookOpen, ExternalLink, Library, NotebookPen, ScrollText, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { BlockList } from "@/components/story/BlockList"
import { RefList } from "@/components/story/RefList"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCharacter } from "@/content/characters"
import { bibleHubCommentaryUrl, naaUrl } from "@/content/links"
import { contextForItem, excerptsForItem, type TimelineItem } from "@/content/overview"
import { formatRef } from "@/content/refs"
import { useSolo } from "@/stores/solo-store"
import { CharacterCard } from "../characters/CharacterCard"

type Tab = "resumo" | "contexto" | "personagem" | "passagem"

/** Dossiê do item: o material do autor, a ficha do personagem e as passagens (NAA). */
export function Dossier({ item, open, onOpenChange }: { item: TimelineItem; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [tab, setTab] = useState<Tab>("resumo")
  const openDoc = useSolo((s) => s.openDoc)
  const excerpts = excerptsForItem(item.id)
  const notes = contextForItem(item.id)
  const character = item.characterId ? getCharacter(item.characterId) : undefined

  useEffect(() => {
    if (open) openDoc(`${item.id}:${tab}`)
  }, [open, tab, item.id, openDoc])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-0 top-0 h-dvh max-h-dvh w-full max-w-xl content-start gap-0 translate-x-0 translate-y-0 overflow-y-auto rounded-none border-l border-border bg-ink p-0 sm:max-w-xl data-open:slide-in-from-right">
        <div className="sticky top-0 z-10 border-b border-border bg-ink/95 px-6 pb-3 pt-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Dossiê</p>
          <DialogTitle className="mt-1 font-display text-3xl text-parchment">{item.label}</DialogTitle>
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="gap-4 px-6 pb-10 pt-4">
          <TabsList className="w-full justify-start overflow-x-auto bg-night">
            <TabsTrigger value="resumo">
              <NotebookPen className="size-3.5" /> Do resumo
            </TabsTrigger>
            {notes.length > 0 && (
              <TabsTrigger value="contexto">
                <Library className="size-3.5" /> Contexto
              </TabsTrigger>
            )}
            {character && (
              <TabsTrigger value="personagem">
                <UserRound className="size-3.5" /> Personagem
              </TabsTrigger>
            )}
            <TabsTrigger value="passagem">
              <ScrollText className="size-3.5" /> Passagens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4">
            {excerpts.length === 0 && <p className="text-mist">O resumo ainda não fala deste item.</p>}
            {excerpts.map((e) => (
              <div key={e.id} className="space-y-1">
                {(e.week !== item.week || e.pendingFact) && (
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-mist">
                    {e.week !== item.week && `Retomado na semana ${e.week}`}
                    {e.pendingFact && <span className="ml-2 rounded-full border border-ember/50 px-2 py-0.5 text-[#f2a27e]">em revisão</span>}
                  </p>
                )}
                <BlockList blocks={[{ kind: "resumo_autor", text: e.text, refs: e.refs, quoteVerified: false }]} stagger={0} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="contexto" className="space-y-5">
            {notes.map((n) => (
              <div key={n.id} className="space-y-1">
                <h3 className="font-display text-xl text-parchment">
                  {n.title}
                  {n.pendingFact && <span className="ml-2 align-middle text-xs text-[#f2a27e]">em revisão</span>}
                </h3>
                <p className="text-parchment/90">{n.text}</p>
                <RefList refs={n.refs} />
                {n.source && <p className="text-xs text-mist">Fonte: {n.source}</p>}
              </div>
            ))}
          </TabsContent>

          {character && (
            <TabsContent value="personagem">
              <CharacterCard character={character} />
            </TabsContent>
          )}

          <TabsContent value="passagem" className="space-y-3">
            <p className="text-sm text-mist">Leia as passagens na sua Bíblia ou na NAA online. Os comentários do Bible Hub ajudam a ver o contexto.</p>
            {item.refs.map((r, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-night/60 p-3">
                <span className="font-display text-xl text-parchment">{formatRef(r)}</span>
                <span className="flex gap-2">
                  <a href={naaUrl(r)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                    <BookOpen className="size-3.5" /> Ler na NAA
                  </a>
                  <a href={bibleHubCommentaryUrl(r)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold">
                    Bible Hub <ExternalLink className="size-3" />
                  </a>
                </span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
