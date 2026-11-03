import { z } from "zod"

// Espaços de pausa para o AUTOR escrever (perguntas, Caráter e Natureza de
// Deus, revelação pessoal, aplicação). O app só cria os espaços: o conteúdo é
// dele. Espaço vazio: pulado no jogo; pausa só com imagem na apresentação.
export const ReflectionSlot = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** Posição, só para o /editor e a Área de preparação. */
  label: z.string(),
  scope: z.enum(["apresentacao", "jogo", "ambos"]),
  position: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("abertura") }),
    z.object({ kind: z.literal("semana"), week: z.number().int(), moment: z.enum(["caráter-e-natureza", "revelação-pessoal"]) }),
    z.object({ kind: z.literal("conclusao") }),
    z.object({ kind: z.literal("bloco"), episodeId: z.string(), afterMovementId: z.string() }),
  ]),
  /** Pergunta curta para o telão/jogo (até 140 caracteres). */
  pergunta: z.string().max(140).optional(),
  /** Comentário para o modo jogo. */
  textoSolo: z.array(z.string().min(1)).default([]),
  /** Conexão com a vida. */
  aplicacao: z.string().optional(),
})
export type ReflectionSlot = z.infer<typeof ReflectionSlot>
export type ReflectionSlotInput = z.input<typeof ReflectionSlot>

export function isFilled(slot: ReflectionSlot): boolean {
  return !!(slot.pergunta?.trim() || slot.textoSolo.length || slot.aplicacao?.trim())
}
