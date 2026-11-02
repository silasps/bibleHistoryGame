import Link from "next/link"
import { cn } from "@/lib/utils"
import { PreferencesMenu } from "./PreferencesMenu"

const NAV = [
  { href: "/solo", label: "Jogar" },
  { href: "/archive", label: "Arquivo" },
  { href: "/catalog", label: "Catálogo" },
  { href: "/presenter", label: "Apresentar" },
]

export function AppHeader({ className, minimal = false }: { className?: string; minimal?: boolean }) {
  return (
    <header className={cn("relative z-30 flex items-center justify-between gap-4 px-4 py-3 md:px-8", className)}>
      <Link href="/" className="group flex items-baseline gap-2" aria-label="Início — Bíblia: por trás da história">
        <span className="font-display text-xl font-semibold tracking-[0.18em] text-parchment">BÍBLIA</span>
        <span className="hidden text-[0.65rem] uppercase tracking-[0.35em] text-gold sm:inline">por trás da história</span>
      </Link>
      <div className="flex items-center gap-1 md:gap-4">
        {!minimal && (
          <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full px-3 py-2 text-sm text-mist transition-colors hover:bg-navy-2 hover:text-parchment">
                {n.label}
              </Link>
            ))}
          </nav>
        )}
        <PreferencesMenu />
      </div>
    </header>
  )
}
