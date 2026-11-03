import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getWeek, weeks } from "@/content/overview"
import { WeekClue } from "@/features/journey/WeekClue"

type Params = Promise<{ week: string }>

export function generateStaticParams() {
  return weeks.filter((w) => w.status === "com_material").map((w) => ({ week: String(w.week) }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: `Pista da semana ${(await params).week}` }
}

export default async function WeekCluePage({ params }: { params: Params }) {
  const week = Number((await params).week)
  if (getWeek(week)?.status !== "com_material") notFound()
  return <WeekClue week={week} />
}
