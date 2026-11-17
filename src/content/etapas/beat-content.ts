import type { ref } from "../refs"
import { FALAS, type FalaId } from "./falas"
import { MOMENTOS } from "./momentos"

type Ref = ReturnType<typeof ref>

/** O que um momento mostra, venha da fala do autor ou de um momento novo (rascunho). */
export interface BeatContent {
  origem: "fala" | "momento"
  stageLine?: string
  steps: string[]
  refs: Ref[]
  cn?: string
  emphasis?: string
  /** Fala completa do autor (só para a Área de preparação). */
  text?: string
  kind: string
  /** De onde veio cada linha do momento novo (material do autor). */
  fontes: string[]
}

export function beatContent(b: { fala?: FalaId; momento?: string }): BeatContent {
  if (b.fala) {
    const f = FALAS[b.fala]
    return {
      origem: "fala",
      stageLine: f.stageLine,
      steps: "steps" in f ? [...f.steps] : [],
      refs: f.refs,
      cn: "cn" in f ? f.cn : undefined,
      emphasis: "emphasis" in f ? f.emphasis : undefined,
      text: f.text,
      kind: f.kind,
      fontes: ["Sua fala"],
    }
  }
  const m = b.momento ? MOMENTOS[b.momento] : undefined
  const lines = [m?.principal, ...(m?.passos ?? [])].filter((l) => l !== undefined)
  return {
    origem: "momento",
    stageLine: m?.principal?.text,
    steps: (m?.passos ?? []).map((p) => p.text),
    refs: m?.principal?.refs ?? [],
    kind: m?.principal?.kind ?? "narracao",
    fontes: [...new Set(lines.map((l) => l.fonte))],
  }
}
