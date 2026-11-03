import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ItemArt } from "@/components/art/ItemArt"
import manifest from "@/content/art-manifest.json"
import { formatSpan, items, weeks } from "@/content/overview"

export const metadata: Metadata = { title: "Arte dos itens", robots: { index: false } }
export const dynamic = "force-dynamic"

/** Galeria das ilustrações, com o nome de arquivo para trocar cada uma por arte própria. */
export default function ArtGalleryPage() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_EDITOR !== "true") notFound()
  const custom = manifest.items as Record<string, string>
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Ferramenta editorial</p>
        <h1 className="mt-2 font-display text-5xl text-parchment">Arte dos itens da linha do tempo</h1>
        <p className="mt-3 max-w-3xl text-mist">
          Para trocar uma ilustração, salve a sua imagem em <code className="text-sand">public/art/items/&lt;nome&gt;.webp</code> (ou .png/.jpg/.svg) com o nome indicado e rode <code className="text-sand">npm run art:scan</code>. Fundo transparente, quadrada, ~800 px.
        </p>
      </header>
      {weeks
        .filter((w) => w.status === "com_material")
        .map((w) => (
          <section key={w.week}>
            <h2 className="mb-4 font-display text-3xl text-parchment">
              Semana {w.week} · {w.title}
            </h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {items
                .filter((i) => i.week === w.week)
                .map((i) => (
                  <li key={i.id} className="rounded-2xl border border-border bg-ink p-3">
                    <ItemArt art={i.art} color={i.color} title={i.label} className="mx-auto aspect-square w-full max-w-40" />
                    <p className="mt-2 text-sm text-parchment">{i.label}</p>
                    <p className="text-xs text-mist">{formatSpan(i) || "sem data (tema)"}</p>
                    <p className="mt-1 font-mono text-[0.7rem] text-sand">{i.art}{custom[i.art] ? " · arte própria" : ""}</p>
                  </li>
                ))}
            </ul>
          </section>
        ))}
    </main>
  )
}
