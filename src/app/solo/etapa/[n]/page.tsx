import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getEtapa } from "@/content/etapas"
import { EtapaUmSolo } from "@/features/etapas/etapa-1/EtapaUmSolo"

type Params = Promise<{ n: string }>

/** Etapas jogáveis no modo solo (por enquanto, a Etapa 1). */
const PLAYABLE = [1]

export function generateStaticParams() {
  return PLAYABLE.map((n) => ({ n: String(n) }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const etapa = getEtapa(Number((await params).n))
  return { title: etapa ? `Etapa ${etapa.n} · ${etapa.title}` : "Etapa" }
}

export default async function EtapaPage({ params }: { params: Params }) {
  const n = Number((await params).n)
  if (!PLAYABLE.includes(n)) notFound()
  return <EtapaUmSolo />
}
