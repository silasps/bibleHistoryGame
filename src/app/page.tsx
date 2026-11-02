import { MonitorPlay, Smartphone, Tv } from "lucide-react"
import { AppHeader } from "@/components/app/AppHeader"
import { HeroStage } from "@/features/home/HeroStage"
import { ActsTimeline } from "@/features/timeline/ActsTimeline"

const SURFACES = [
  { icon: Tv, title: "Telão", text: "Cenas, perguntas e resultados das votações. Nada de teleprompter: as conexões aparecem como imagens." },
  { icon: MonitorPlay, title: "Painel do apresentador", text: "Avança, pausa, abre votações e libera pistas. Cronômetro por cena e modo ensaio." },
  { icon: Smartphone, title: "Celular do público", text: "Entra por QR code, sem cadastro. Vota, recebe pistas seladas e monta seu Arquivo." },
]

export default function Home() {
  return (
    <>
      <div className="absolute inset-x-0 top-0 z-30">
        <AppHeader />
      </div>
      <main id="conteudo">
        <HeroStage />
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.4em] text-gold">A espinha dorsal</p>
            <h2 className="mt-3 font-display text-4xl text-parchment md:text-5xl">Onze atos, de Gênesis à nova criação</h2>
            <p className="mt-4 text-mist">
              Os atos são uma organização editorial. Livros poéticos e proféticos muitas vezes se sobrepõem historicamente aos
              acontecimentos narrados em outros livros — as sobreposições aparecem em cada ato.
            </p>
          </div>
          <ActsTimeline />
        </section>
        <section className="border-t border-border bg-ink/60">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:grid-cols-3 md:px-8">
            {SURFACES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-border p-6">
                <Icon className="size-6 text-gold" aria-hidden />
                <h3 className="mt-4 font-display text-2xl text-parchment">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{text}</p>
              </div>
            ))}
          </div>
        </section>
        <footer className="px-4 py-10 text-center text-xs text-mist/70">
          Referências bíblicas conferidas pela Nova Almeida Atualizada (NAA). Os textos do app são paráfrases autorais, identificadas em cada trecho.
        </footer>
      </main>
    </>
  )
}
