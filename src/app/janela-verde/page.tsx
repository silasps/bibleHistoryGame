import type { Metadata } from "next"
import { Inicio } from "@/features/janela-verde/Inicio"

export const metadata: Metadata = { title: "Janela Verde" }

export default function JanelaVerdePage() {
  return <Inicio />
}
