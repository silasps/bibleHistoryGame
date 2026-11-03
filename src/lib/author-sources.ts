import "server-only"

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

type TaskLinks = Record<string, { carater?: string; principios?: string }>

/**
 * Links locais para as tarefas do autor (Caráter e Natureza, Princípios), usados
 * só como referência na Área de preparação e no /editor. O arquivo fica em
 * content/sources/dbs-2026/ (fora do git); sem ele, nada é mostrado.
 */
export function authorTaskLinks(): TaskLinks {
  const file = join(process.cwd(), "content/sources/dbs-2026/tarefas.json")
  if (!existsSync(file)) return {}
  try {
    return JSON.parse(readFileSync(file, "utf8")) as TaskLinks
  } catch {
    return {}
  }
}
