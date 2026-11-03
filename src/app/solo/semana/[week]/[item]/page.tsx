import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getItem, getWeek, items } from "@/content/overview"
import { JourneyItem } from "@/features/journey/JourneyItem"

type Params = Promise<{ week: string; item: string }>

export function generateStaticParams() {
  return items.filter((i) => getWeek(i.week)?.status === "com_material").map((i) => ({ week: String(i.week), item: i.id }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const item = getItem((await params).item)
  return { title: item ? `${item.label} — Semana ${item.week}` : "Linha do tempo" }
}

export default async function JourneyItemPage({ params }: { params: Params }) {
  const { week, item: itemId } = await params
  const item = getItem(itemId)
  if (!item || getWeek(item.week)?.status !== "com_material") notFound()
  if (String(item.week) !== week) redirect(`/solo/semana/${item.week}/${item.id}`)
  return <JourneyItem itemId={item.id} />
}
