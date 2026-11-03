import Link from "next/link"
import { AppHeader } from "@/components/app/AppHeader"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-night">
      <AppHeader />
      <main id="conteudo" className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-5 px-4 pb-20 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">Página não encontrada</p>
        <h1 className="font-display text-4xl text-parchment">Esta pista não leva a lugar nenhum</h1>
        <p className="text-mist">O endereço pode estar errado ou a sala pode ter sido apagada. Confira o código com o apresentador.</p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-gold px-6 font-semibold text-primary-foreground hover:bg-gold-bright">
            Voltar ao início
          </Link>
          <Link href="/solo" className="inline-flex min-h-12 items-center rounded-full border border-border px-5 text-sm text-mist hover:text-parchment">
            Jogar
          </Link>
        </div>
      </main>
    </div>
  )
}
