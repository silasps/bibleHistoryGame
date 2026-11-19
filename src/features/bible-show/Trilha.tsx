"use client"

import { Drama, Flag, Flame, Gem, MapPin, PawPrint, Pencil, Sparkles, User, Users, type LucideIcon } from "lucide-react"
import { motion } from "motion/react"
import { getCategoria, type CategoriaId } from "@/content/bible-show/cartas"
import { montarTrilha, type Casa, type Estilo, type Lado, type ShowState } from "@/domain/bible-show"
import { cn } from "@/lib/utils"

export const ICONE: Record<CategoriaId, LucideIcon> = {
  quem: User,
  objeto: Gem,
  acontecimento: Sparkles,
  lugar: MapPin,
  bicho: PawPrint,
  desafio: Flame,
}

export const ESTILO: Record<Estilo, { icone: LucideIcon; nome: string; regra: string }> = {
  mimica: { icone: Drama, nome: "Mímica", regra: "Sem falar e sem fazer sons" },
  desenho: { icone: Pencil, nome: "Desenho", regra: "No papel, sem letras e sem números" },
}

export const TODOS = { nome: "Rodada de todos", cor: "#f3e9d2" }

export function casaInfo(casa: Casa) {
  if (casa.tipo === "todos") return { nome: TODOS.nome, sub: "Todas as equipes ao mesmo tempo", cor: TODOS.cor, icone: Users }
  const c = getCategoria(casa.categoria)
  return { nome: c.nome, sub: c.sub, cor: c.cor, icone: ICONE[casa.categoria] }
}

const COLS = 5

/** "Equipe 2" → "2"; "Ana" → "A". */
const sigla = (nome: string) => nome.trim().match(/(\d+)$/)?.[1] ?? nome.trim()[0]?.toUpperCase() ?? ""

/** Peão de um lado: bolinha com a cor e a inicial (ou o número). */
export function Peao({ lado, className, naTrilha = false }: { lado: Lado; className?: string; naTrilha?: boolean }) {
  return (
    <motion.span
      layoutId={naTrilha ? `peao-${lado.id}` : undefined}
      title={lado.nome}
      className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2 border-night text-[0.6rem] font-bold text-night shadow-[0_2px_6px_rgba(0,0,0,0.6)]", className)}
      style={{ background: lado.cor }}
    >
      {sigla(lado.nome)}
    </motion.span>
  )
}

/** A trilha no lugar do tabuleiro: casas em zigue-zague, da partida à chegada. */
export function Trilha({ state, destaque }: { state: ShowState; destaque?: string }) {
  const trilha = montarTrilha(state.config)
  const rows = Math.ceil(trilha.length / COLS)
  const daVez = state.lados[state.vez]
  const alvo = destaque ? undefined : daVez ? Math.min(daVez.casa + 1, trilha.length) : undefined
  const naCasa = (n: number) => state.lados.filter((l) => l.casa === n)

  return (
    <div className="space-y-2">
      <div className="flex min-h-9 items-center gap-2 rounded-xl border border-border bg-night/60 px-3 py-1.5">
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-mist">Partida</span>
        <div className="flex flex-wrap gap-1">
          {naCasa(0).map((l) => (
            <Peao key={l.id} lado={l} naTrilha />
          ))}
        </div>
      </div>
      <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, auto)` }} aria-label="Trilha">
        {trilha.map((casa, i) => {
          const n = i + 1
          const row = Math.floor(i / COLS)
          const col = row % 2 === 0 ? i % COLS : COLS - 1 - (i % COLS)
          const info = casaInfo(casa)
          const Icone = info.icone
          const chegada = n === trilha.length
          const peoes = naCasa(n)
          return (
            <li
              key={n}
              style={{ gridRow: row + 1, gridColumn: col + 1, borderColor: `${info.cor}66`, background: `linear-gradient(160deg, ${info.cor}33, ${info.cor}0d)` }}
              className={cn("relative flex aspect-square flex-col items-center justify-center rounded-xl border", n === alvo && "ring-2 ring-gold-bright")}
              aria-label={`Casa ${n}: ${info.nome}${chegada ? " (chegada)" : ""}`}
            >
              {n === alvo && <motion.span aria-hidden className="absolute inset-0 rounded-xl bg-gold-bright/15" animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 1.6, repeat: Infinity }} />}
              <span className="absolute left-1 top-0.5 text-[0.55rem] tabular-nums text-mist">{n}</span>
              {chegada ? <Flag className="size-5 text-gold-bright" aria-hidden /> : <Icone className="size-4" style={{ color: info.cor }} aria-hidden />}
              {peoes.length > 0 && (
                <div className="absolute inset-x-0.5 bottom-0.5 flex flex-wrap justify-center gap-0.5">
                  {peoes.map((l) => (
                    <Peao key={l.id} lado={l} naTrilha className={peoes.length > 3 ? "size-3.5 text-[0]" : undefined} />
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Placar: cada lado com a casa em que está. */
export function Placar({ state }: { state: ShowState }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
      {state.lados.map((l, i) => (
        <span
          key={l.id}
          className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs", i === state.vez ? "border-gold bg-gold/15 text-parchment" : "border-border text-mist")}
        >
          <span className="size-2.5 rounded-full" style={{ background: l.cor }} aria-hidden />
          <span className="max-w-24 truncate">{l.nome}</span>
          <span className="tabular-nums text-gold">{l.casa}</span>
        </span>
      ))}
    </div>
  )
}
