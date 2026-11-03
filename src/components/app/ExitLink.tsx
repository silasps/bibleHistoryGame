import { X } from "lucide-react"
import Link from "next/link"

/** Saída visível das telas imersivas (jornada, pista, episódio), no canto superior esquerdo. */
export function ExitLink({ href, to }: { href: string; to: string }) {
  return (
    <Link
      href={href}
      aria-label={`Sair para ${to}`}
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-ink/70 pl-3 pr-4 text-sm text-parchment backdrop-blur hover:bg-navy-2"
    >
      <X className="size-4" aria-hidden /> Sair
    </Link>
  )
}
