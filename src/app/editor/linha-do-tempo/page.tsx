import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { weeks } from "@/content/overview"
import { BibleTimeline } from "@/features/timeline/BibleTimeline"

export const metadata: Metadata = { title: "Prévia da linha do tempo", robots: { index: false } }
export const dynamic = "force-dynamic"

export default function TimelinePreviewPage() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_EDITOR !== "true") notFound()
  return (
    <main className="mx-auto max-w-[1600px] space-y-10 px-4 py-10">
      <h1 className="font-display text-4xl text-parchment">Prévia da linha do tempo (formato do telão)</h1>
      {weeks
        .filter((w) => w.status === "com_material")
        .map((w) => (
          <section key={w.week} id={`semana-${w.week}`} className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-night">
            <BibleTimeline week={w.week} />
          </section>
        ))}
    </main>
  )
}
