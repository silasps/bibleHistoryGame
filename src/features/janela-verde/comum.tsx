"use client"

import { BookOpen, HandHeart, Users } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import manifest from "@/content/art-manifest.json"
import { getDeclaracao, getFato, MARCAS, type Fonte, type Marca } from "@/content/janela-verde"
import { formatRef, linkNaa } from "@/content/refs"
import type { Mensagem } from "@/content/janela-verde"
import type { Relogio } from "@/domain/janela-verde"
import { cn } from "@/lib/utils"

// Peças comuns das telas da Janela Verde (telão, condutor e celular do grupo).

const ARTE = ((manifest as Record<string, Record<string, string>>)["janela-verde"] ?? {}) as Record<string, string>

export function arteUrl(nome: string | undefined, celular = false): string | null {
  if (!nome) return null
  return (celular ? ARTE[`${nome}-celular`] : undefined) ?? ARTE[nome] ?? null
}

/** Imagem de fundo (ou um degradê de floresta, enquanto a imagem não existe). */
export function Fundo({ arte, celular, escuro = 0.55, className }: { arte?: string; celular?: boolean; escuro?: number; className?: string }) {
  const url = arteUrl(arte, celular)
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <div className="size-full bg-[radial-gradient(ellipse_at_30%_20%,#1f4d3a_0%,#0c2219_45%,#05070d_100%)]" />
      )}
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgb(5 7 13 / ${escuro * 0.7}) 0%, rgb(5 7 13 / ${escuro}) 55%, rgb(5 7 13 / ${Math.min(0.95, escuro + 0.3)}) 100%)` }} />
    </div>
  )
}

const ICONE: Record<Marca, typeof BookOpen> = { explicacao: BookOpen, dinamica: Users, oracao: HandHeart }

export function SeloMarca({ marca, className, grande }: { marca: Marca; className?: string; grande?: boolean }) {
  const m = MARCAS[marca]
  const I = ICONE[marca]
  return (
    <span
      className={cn("inline-flex items-center gap-2 rounded-full border font-semibold uppercase tracking-[0.18em]", grande ? "px-[1.2vw] py-[0.45vw] text-[1.15vw]" : "px-3 py-1 text-[0.7rem]", className)}
      style={{ color: m.cor, borderColor: `${m.cor}66`, background: `${m.cor}1a` }}
    >
      <I className={grande ? "size-[1.4vw]" : "size-3.5"} aria-hidden /> {m.rotulo}
    </span>
  )
}

export function IconeMarca({ marca, className }: { marca: Marca; className?: string }) {
  const I = ICONE[marca]
  return <I className={className} style={{ color: MARCAS[marca].cor }} aria-hidden />
}

export function LinhaFonte({ fonte, className }: { fonte: Fonte; className?: string }) {
  return (
    <p className={cn("text-mist/80", className)}>
      Fonte: {fonte.nome}
      {fonte.data ? `, ${fonte.data}` : ""}
    </p>
  )
}

/** Fato real com a fonte embaixo. */
export function CardFato({ id, grande }: { id: string; grande?: boolean }) {
  const f = getFato(id)
  return (
    <div className={cn("rounded-2xl border border-sage/30 bg-night/70 backdrop-blur", grande ? "p-[1.4vw]" : "p-4")}>
      <p className={cn("leading-snug text-parchment", grande ? "text-[1.9vw]" : "text-base")}>{f.texto}</p>
      <LinhaFonte fonte={f.fonte} className={grande ? "mt-[0.6vw] text-[0.95vw]" : "mt-2 text-xs"} />
    </div>
  )
}

/** Declaração real: a fala em destaque, quem disse e a fonte. */
export function CardDeclaracao({ id, grande, className }: { id: string; grande?: boolean; className?: string }) {
  const d = getDeclaracao(id)
  const citacao = d.kind === "citacao"
  return (
    <figure className={cn("rounded-2xl border border-gold/30 bg-night/75 backdrop-blur", grande ? "p-[1.6vw]" : "p-4", className)}>
      <blockquote className={cn("font-display leading-tight text-parchment", grande ? "text-[2.5vw]" : "text-xl")}>
        {citacao ? `“${d.texto}”` : d.texto}
      </blockquote>
      <figcaption className={cn("text-sand", grande ? "mt-[0.9vw] text-[1.2vw]" : "mt-3 text-sm")}>
        {citacao ? "" : "Segundo "}
        <b className="text-gold-bright">{d.quem}</b> · {d.papel}
        {d.original && <span className="block text-mist/70">(tradução livre)</span>}
      </figcaption>
      <LinhaFonte fonte={d.fonte} className={grande ? "mt-[0.4vw] text-[0.95vw]" : "mt-1 text-xs"} />
    </figure>
  )
}

/** Versículo NAA (inteiro ou só o começo conferido) ou história resumida. */
export function CardMensagem({ m, grande }: { m: Mensagem; grande?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-gold/30 bg-night/75", grande ? "p-[1.4vw]" : "p-4")}>
      <p className={cn("uppercase tracking-[0.2em] text-gold", grande ? "text-[0.9vw]" : "text-[0.7rem]")}>
        {m.tipo === "historia" ? "História" : "Versículo"} · {formatRef(m.ref)} · {m.kind === "parafrase" ? "resumo (paráfrase)" : "NAA"}
      </p>
      <p className={cn("mt-2 leading-snug text-parchment", grande ? "text-[1.7vw]" : "text-base")}>
        {m.texto}
        {!m.completo && " …"}
      </p>
      <a href={linkNaa(m.ref)} target="_blank" rel="noreferrer" className={cn("mt-3 inline-flex rounded-full border border-gold/40 text-gold-bright", grande ? "px-[1vw] py-[0.3vw] text-[0.9vw]" : "px-3 py-1.5 text-xs")}>
        Ler na NAA
      </a>
    </div>
  )
}

/** Tempo que resta no relógio da sala (hora do servidor). Avisa o fim uma vez. */
export function useRestante(relogio: Relogio | null, agora: () => number, aoAcabar?: (prazo: number) => void): number {
  const [ms, setMs] = useState(relogio?.restante ?? 0)
  const fim = useRef<number | null>(null)
  const cb = useRef(aoAcabar)
  useEffect(() => {
    cb.current = aoAcabar
  })
  useEffect(() => {
    const tick = () => {
      const r = relogio?.prazo ? Math.max(0, relogio.prazo - agora()) : (relogio?.restante ?? 0)
      setMs(r)
      if (relogio?.prazo && r <= 0 && fim.current !== relogio.prazo) {
        fim.current = relogio.prazo
        cb.current?.(relogio.prazo)
      }
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [relogio, agora])
  return ms
}

export function mmss(ms: number): string {
  const neg = ms < 0
  const t = Math.round(Math.abs(ms) / 1000)
  return `${neg ? "−" : ""}${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`
}

/** Relógio redondo das dinâmicas. */
export function Relogio({ relogio, restante, grande }: { relogio: Relogio | null; restante: number; grande?: boolean }) {
  if (!relogio) return null
  const frac = relogio.total ? restante / relogio.total : 0
  const fim = restante <= 0
  const pouco = restante <= 30_000
  const cor = fim ? "#e0715c" : pouco ? "#f0a25a" : "#7fae8b"
  return (
    <div className={cn("flex flex-col items-center", grande ? "gap-[0.5vw]" : "gap-1")}>
      <div className={cn("relative grid place-items-center", grande ? "size-[11vw]" : "size-28")}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="7" />
          <circle cx="50" cy="50" r="44" fill="none" stroke={cor} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${Math.max(0, frac) * 276.5} 276.5`} />
        </svg>
        <span className={cn("font-display tabular-nums lining-nums", grande ? "text-[3.4vw]" : "text-3xl")} style={{ color: fim ? cor : undefined }}>
          {fim ? "Tempo!" : mmss(restante)}
        </span>
      </div>
      {!relogio.prazo && !fim && <span className={cn("uppercase tracking-[0.25em] text-mist", grande ? "text-[0.9vw]" : "text-xs")}>Pausado</span>}
    </div>
  )
}

export function Bloco({ titulo, children, className }: { titulo?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-ink/80 p-4", className)}>
      {titulo && <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">{titulo}</h3>}
      {children}
    </section>
  )
}
