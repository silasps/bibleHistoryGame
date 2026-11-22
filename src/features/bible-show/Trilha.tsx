"use client"

import { BrickWall, Castle, CloudRain, Drama, Droplets, Fish, Flag, Flame, Gem, Handshake, HandHeart, HeartHandshake, Hourglass, Keyboard, Lock, MapPin, Megaphone, MessageCircleQuestion, PawPrint, Scissors, ScrollText, ShieldCheck, Sparkles, Sun, Swords, PersonStanding, Target, Tent, TriangleAlert, User, Users, UserX, Waves, type LucideIcon } from "lucide-react"
import { motion } from "motion/react"
import { getCategoria, type CategoriaId } from "@/content/bible-show/cartas"
import { getSituacao, tomDoEfeito } from "@/content/bible-show/situacoes"
import { lider, trilhaDe, type Casa, type Estilo, type Lado, type ShowState } from "@/domain/bible-show"
import { cn } from "@/lib/utils"

export const ICONE: Record<CategoriaId, LucideIcon> = { quem: User, objeto: Gem, acontecimento: Sparkles, lugar: MapPin, bicho: PawPrint, acao: PersonStanding, desafio: Flame }

export const ESTILO: Record<Estilo, { icone: LucideIcon; nome: string; regra: string }> = {
  mimica: { icone: Drama, nome: "Mímica", regra: "Sem falar e sem fazer sons" },
  perguntas: { icone: MessageCircleQuestion, nome: "Perguntas", regra: "Só vale responder sim ou não" },
  letras: { icone: Keyboard, nome: "Letras", regra: "Escolham letras ou arrisquem a palavra" },
}

/** A classe da carta, no mesmo formato das categorias da configuração. */
/** `semCasas`: só brincar (sem trilha), sem o "vale 1 casa a mais" do Desafio. */
export function CategoriaTag({ id, className, semCasas }: { id: CategoriaId; className?: string; semCasas?: boolean }) {
  const c = getCategoria(id)
  const Icone = ICONE[id]
  return (
    <div className={cn("flex items-center gap-2.5 rounded-2xl border px-3 py-2 text-left", className)} style={{ borderColor: `${c.cor}99`, background: `${c.cor}1f` }}>
      <Icone className="size-5 shrink-0" style={{ color: c.cor }} aria-hidden />
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight text-parchment">{c.nome}</span>
        {!(semCasas && id === "desafio") && <span className="block truncate text-[0.7rem] text-mist">{c.sub}</span>}
      </span>
    </div>
  )
}

/** Ícone de cada casa especial. */
const ICONE_SITUACAO: Record<string, LucideIcon> = {
  arraial: Tent,
  siquem: Users,
  lei: ScrollText,
  ezequias: HandHeart,
  jordao: Droplets,
  "mar-vermelho": Waves,
  jerico: Megaphone,
  golias: Target,
  carmelo: Flame,
  muralha: BrickWall,
  daniel: ShieldCheck,
  sol: Sun,
  mana: CloudRain,
  ai: Swords,
  "quarenta-anos": Hourglass,
  bezerro: TriangleAlert,
  sansao: Scissors,
  saul: UserX,
  exilio: Lock,
  jonas: Fish,
  babel: Castle,
  rute: HeartHandshake,
  "davi-saul": Handshake,
}

/** Cor da casa especial pelo que ela faz. */
export const COR_TOM = { bom: "#8fdc93", ruim: "#ff8a7a", todos: "#f3e9d2", escolha: "#f0c75e" } as const

export function casaInfo(casa: Casa) {
  if (casa.tipo === "situacao") {
    const s = getSituacao(casa.situacao)
    return { nome: s.nome, sub: "Casa especial", cor: COR_TOM[tomDoEfeito(s.efeito)], icone: ICONE_SITUACAO[s.id] ?? Sparkles, especial: true }
  }
  const c = getCategoria(casa.categoria)
  return { nome: c.nome, sub: c.sub, cor: c.cor, icone: ICONE[casa.categoria], especial: false }
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
  const trilha = trilhaDe(state)
  const rows = Math.ceil(trilha.length / COLS)
  // Destaque: a casa de quem conduz (é dela que sai a categoria da carta).
  const alvo = destaque || !state.lados.length ? undefined : lider(state).casa
  const naCasa = (n: number) => state.lados.filter((l) => l.casa === n)

  return (
    <div className="space-y-2">
      <div className={cn("flex min-h-9 items-center gap-2 rounded-xl border border-border bg-night/60 px-3 py-1.5", alvo === 0 && "ring-2 ring-gold-bright")}>
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-mist">Partida</span>
        <div className="flex flex-wrap gap-1">
          {naCasa(0).map((l) => (
            <Peao key={l.id} lado={l} naTrilha className={l.fora ? "opacity-35" : undefined} />
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
              className={cn("relative flex aspect-square flex-col items-center justify-center rounded-xl border", info.especial && "border-2 border-dashed", n === alvo && "ring-2 ring-gold-bright")}
              aria-label={`Casa ${n}: ${info.nome}${chegada ? " (chegada)" : ""}`}
            >
              {n === alvo && (
                <motion.span aria-hidden className="absolute inset-0 rounded-xl bg-gold-bright/15" animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 1.6, repeat: Infinity }} />
              )}
              <span className="absolute left-1 top-0.5 text-[0.55rem] tabular-nums text-mist">{n}</span>
              {chegada ? <Flag className="size-5 text-gold-bright" aria-hidden /> : <Icone className="size-4" style={{ color: info.cor }} aria-hidden />}
              {peoes.length > 0 && (
                <div className="absolute inset-x-0.5 bottom-0.5 flex flex-wrap justify-center gap-0.5">
                  {peoes.map((l) => (
                    <Peao key={l.id} lado={l} naTrilha className={cn(peoes.length > 3 && "size-3.5 text-[0]", l.fora && "opacity-35")} />
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
          className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs", i === state.vez ? "border-gold bg-gold/15 text-parchment" : "border-border text-mist", l.fora && "border-dashed opacity-50")}
        >
          <span className="size-2.5 rounded-full" style={{ background: l.cor }} aria-hidden />
          <span className="max-w-24 truncate">{l.nome}</span>
          {l.fora && <span className="text-[0.65rem] uppercase tracking-wider">saiu</span>}
          {l.exilio && <Lock className="size-3 text-[#ff8a7a]" aria-label="no exílio" />}
          <span className="tabular-nums text-gold">{l.casa}</span>
        </span>
      ))}
    </div>
  )
}
