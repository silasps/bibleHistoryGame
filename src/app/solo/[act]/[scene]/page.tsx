import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { allScenes, getSceneEntry } from "@/content"
import { ScenePlayer } from "@/features/solo/ScenePlayer"

type Params = Promise<{ act: string; scene: string }>

export function generateStaticParams() {
  return allScenes().map((s) => ({ act: getSceneEntry(s.id)!.episode.actId, scene: s.id }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { scene } = await params
  const entry = getSceneEntry(scene)
  return { title: entry ? `${entry.scene.title} — ${entry.episode.title}` : "Cena" }
}

export default async function ScenePage({ params }: { params: Params }) {
  const { act, scene } = await params
  const entry = getSceneEntry(scene)
  if (!entry || entry.episode.status !== "jogavel") notFound()
  if (entry.episode.actId !== act) redirect(`/solo/${entry.episode.actId}/${scene}`)
  return <ScenePlayer sceneId={scene} />
}
