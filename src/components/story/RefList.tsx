import { formatRef } from "@/content/refs"
import type { BibleRef } from "@/content/schema"
import { cn } from "@/lib/utils"

export function RefList({ refs, className }: { refs: Pick<BibleRef, "book" | "chapter" | "verseStart" | "verseEnd" | "chapterEnd">[]; className?: string }) {
  if (!refs.length) return null
  return (
    <p className={cn("text-xs tracking-wide text-sand/80", className)}>
      <span className="sr-only">Referências: </span>
      {refs.map((r, i) => (
        <span key={i}>
          {i > 0 && <span aria-hidden> · </span>}
          {formatRef(r, "short")}
        </span>
      ))}
      <span className="ml-1.5 text-mist/70">(NAA)</span>
    </p>
  )
}
