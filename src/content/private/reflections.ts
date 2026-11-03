import "server-only"

// Notas faladas do apresentador para cada espaço de reflexão (privadas:
// aparecem só na Área de preparação). Chave = id do espaço em
// src/content/reflections/index.ts. Vazio até o autor escrever.
export const REFLECTION_NOTES: Record<string, string[]> = {}

export function getReflectionNotes(slotId: string): string[] {
  return REFLECTION_NOTES[slotId] ?? []
}
