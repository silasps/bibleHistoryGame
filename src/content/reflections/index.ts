import { z } from "zod"
import { ReflectionSlot, type ReflectionSlotInput } from "./schema"

export * from "./schema"

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  ESPAÇOS PARA O AUTOR. Preencha `pergunta`, `textoSolo` e `aplicacao`  ║
// ║  de cada espaço quando quiser. Veja docs/reflexoes.md.                 ║
// ║  As notas faladas (privadas) ficam em src/content/private/reflections. ║
// ╚══════════════════════════════════════════════════════════════════════╝

const semana = (week: number): ReflectionSlotInput[] => [
  {
    id: `s${week}-carater-natureza`,
    label: `Semana ${week} · Caráter e Natureza de Deus`,
    scope: "ambos",
    position: { kind: "semana", week, moment: "caráter-e-natureza" },
  },
  {
    id: `s${week}-revelacao-pessoal`,
    label: `Semana ${week} · Revelação pessoal`,
    scope: "ambos",
    position: { kind: "semana", week, moment: "revelação-pessoal" },
  },
]

const SLOTS: ReflectionSlotInput[] = [
  { id: "abertura", label: "Abertura · o propósito da apresentação", scope: "apresentacao", position: { kind: "abertura" } },
  ...[1, 2, 3, 4, 5, 6].flatMap(semana),
  { id: "conclusao", label: "Conclusão", scope: "apresentacao", position: { kind: "conclusao" } },
  // Jogo · Gênesis 1–3 (fim de cada bloco)
  { id: "gn-criacao-jardim", label: "Gênesis · fim de “Criação e jardim”", scope: "jogo", position: { kind: "bloco", episodeId: "genesis-1-3", afterMovementId: "criacao-jardim" } },
  { id: "gn-tentacao-queda", label: "Gênesis · fim de “Tentação e queda”", scope: "jogo", position: { kind: "bloco", episodeId: "genesis-1-3", afterMovementId: "tentacao-queda" } },
  { id: "gn-promessa", label: "Gênesis · fim de “A promessa”", scope: "jogo", position: { kind: "bloco", episodeId: "genesis-1-3", afterMovementId: "promessa" } },
  { id: "gn-hoje", label: "Gênesis · fim de “Hoje” (aplicação)", scope: "jogo", position: { kind: "bloco", episodeId: "genesis-1-3", afterMovementId: "hoje" } },
  { id: "muro-fim", label: "Analogia do muro · fim", scope: "jogo", position: { kind: "bloco", episodeId: "analogia-muro-trem", afterMovementId: "muro" } },
  { id: "motoristas-fim", label: "Analogia dos motoristas · fim", scope: "jogo", position: { kind: "bloco", episodeId: "analogia-cinco-motoristas", afterMovementId: "motoristas" } },
]

export const reflectionSlots: ReflectionSlot[] = z.array(ReflectionSlot).parse(SLOTS)

export function getSlot(id: string): ReflectionSlot | undefined {
  return reflectionSlots.find((s) => s.id === id)
}
