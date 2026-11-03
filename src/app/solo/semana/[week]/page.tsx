import { notFound, redirect } from "next/navigation"
import { getWeek, itemsOfWeek, weeks } from "@/content/overview"

type Params = Promise<{ week: string }>

export function generateStaticParams() {
  return weeks.filter((w) => w.status === "com_material").map((w) => ({ week: String(w.week) }))
}

/** A semana começa no primeiro item da linha do tempo. */
export default async function WeekPage({ params }: { params: Params }) {
  const week = Number((await params).week)
  const info = getWeek(week)
  const first = itemsOfWeek(week)[0]
  if (!info || info.status !== "com_material" || !first) notFound()
  redirect(`/solo/semana/${week}/${first.id}`)
}
