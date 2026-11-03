import { BookOpen, Feather, FlaskConical, Lightbulb, MessageCircle, NotebookPen, Quote, Sparkles } from "lucide-react"
import type { ContentKind } from "@/content/schema"
import { CONTENT_KIND_LABEL } from "@/content/refs"
import { cn } from "@/lib/utils"

const STYLE: Record<ContentKind, { icon: typeof BookOpen; className: string }> = {
  texto_biblico: { icon: Quote, className: "border-gold/50 bg-gold/10 text-gold-bright" },
  parafrase: { icon: BookOpen, className: "border-gold/35 bg-gold/5 text-gold" },
  interpretacao: { icon: Lightbulb, className: "border-sky-300/30 bg-sky-300/5 text-sky-200" },
  analogia: { icon: Feather, className: "border-sage/40 bg-sage/10 text-sage" },
  hipotese_ficcional: { icon: FlaskConical, className: "border-rose/40 bg-rose/10 text-rose" },
  narracao: { icon: MessageCircle, className: "border-mist/30 bg-transparent text-mist" },
  resumo_autor: { icon: NotebookPen, className: "border-sand/40 bg-sand/10 text-sand" },
  reflexao: { icon: Sparkles, className: "border-gold/50 bg-gold/10 text-gold-bright" },
}

/** Mostra a natureza do trecho: relato, interpretação, analogia ou hipótese. */
export function ContentKindBadge({ kind, label, className }: { kind: ContentKind; label?: string; className?: string }) {
  const { icon: Icon, className: tone } = STYLE[kind]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.12em]",
        tone,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {label ?? CONTENT_KIND_LABEL[kind]}
    </span>
  )
}
