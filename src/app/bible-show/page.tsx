import type { Metadata } from "next"
import { BibleShow } from "@/features/bible-show/BibleShow"

export const metadata: Metadata = {
  title: "Bible Show",
  description: "Mímica, perguntas e letras em grupo com a história da Bíblia: equipes ou cada um por si, trilha na tela e cronômetro.",
}

export default function BibleShowPage() {
  return <BibleShow />
}
