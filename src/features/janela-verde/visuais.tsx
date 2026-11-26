"use client"

import { motion } from "motion/react"
import { BARREIRAS, MARCAS, ROTEIRO } from "@/content/janela-verde"
import { barreiraCaiu, etapaAtual, luzes, type JanelaState } from "@/domain/janela-verde"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"
import { arteUrl } from "./comum"

// Mapa da Janela Verde (faixa no equador com os 3 pontos reais), trilha das
// 4 barreiras e a barreira rachando conforme os grupos oram.

const PONTOS = [
  { r: "amazonia" as const, x: 330, nome: "Amazônia", sub: "Yanomami · Javari" },
  { r: "africa" as const, x: 535, nome: "África", sub: "Baka" },
  { r: "asia" as const, x: 880, nome: "Ásia", sub: "Sawi" },
]

/** Posições fixas das luzes ao redor de cada ponto. */
function luz(i: number) {
  const ang = i * 2.39996
  const rad = 14 + 7 * Math.sqrt(i)
  return { dx: Math.cos(ang) * rad * 1.6, dy: Math.sin(ang) * rad * 0.55 }
}

export function JanelaMapa({ state, className, todas }: { state: JanelaState; className?: string; todas?: boolean }) {
  const conta = luzes(state)
  const fx = useFx()
  return (
    <svg viewBox="0 0 1000 300" className={cn("w-full", className)} role="img" aria-label="Mapa da Janela Verde: faixa tropical com Amazônia, África e Ásia">
      <defs>
        <linearGradient id="jv-faixa" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7fae8b" stopOpacity="0" />
          <stop offset="0.5" stopColor="#3f8f5f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7fae8b" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="jv-luz">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.4" stopColor="#f4d27a" />
          <stop offset="1" stopColor="#f4d27a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="85" width="1000" height="130" fill="url(#jv-faixa)" />
      <line x1="0" x2="1000" y1="150" y2="150" stroke="#d9c7a7" strokeOpacity="0.35" strokeDasharray="4 8" />
      <text x="12" y="80" fill="#9aa4b8" fontSize="16">23,5° N</text>
      <text x="12" y="236" fill="#9aa4b8" fontSize="16">23,5° S</text>
      <text x="12" y="144" fill="#d9c7a7" fontSize="14" opacity="0.7">Equador</text>
      {PONTOS.map((p) => {
        const n = Math.min(60, conta[p.r] + (todas ? conta.todas : 0))
        return (
          <g key={p.r}>
            {Array.from({ length: n }, (_, i) => {
              const { dx, dy } = luz(i)
              return (
                <motion.circle
                  key={i}
                  cx={p.x + dx}
                  cy={150 + dy}
                  r={5}
                  fill="url(#jv-luz)"
                  initial={fx.motion ? { opacity: 0, scale: 0 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              )
            })}
            <circle cx={p.x} cy={150} r={9} fill="#f4d27a" />
            <circle cx={p.x} cy={150} r={18} fill="none" stroke="#f4d27a" strokeOpacity="0.5" />
            <text x={p.x} y={262} textAnchor="middle" fill="#f1e8d6" fontSize="24" fontWeight="600">
              {p.nome}
            </text>
            <text x={p.x} y={288} textAnchor="middle" fill="#9aa4b8" fontSize="17">
              {p.sub}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Estado de cada barreira: aberta, a atual (fechada) ou ainda à frente. */
export function estadoBarreira(state: JanelaState, n: number): "aberta" | "atual" | "frente" {
  const e = etapaAtual(state)
  if (e.bloco > n) return "aberta"
  if (e.bloco === n) {
    const oracaoFinal = ROTEIRO.filter((x) => x.bloco === n && x.tela.tipo === "oracao").at(-1)
    return oracaoFinal?.id === e.id && barreiraCaiu(state, e) ? "aberta" : "atual"
  }
  return "frente"
}

/** Rodapé: as 4 barreiras e as etapas coloridas pela marca. */
export function Trilha({ state, className }: { state: JanelaState; className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-4 gap-[1vw]">
        {BARREIRAS.map((b) => {
          const st = estadoBarreira(state, b.n)
          return (
            <div
              key={b.n}
              className={cn(
                "flex items-center gap-[0.6vw] rounded-full border px-[1vw] py-[0.4vw] text-[1vw]",
                st === "aberta" && "border-sage/60 bg-sage/15 text-[#bfe3c7]",
                st === "atual" && "border-gold/70 bg-gold/15 text-gold-bright",
                st === "frente" && "border-border text-mist/70",
              )}
            >
              <span className="font-semibold">{st === "aberta" ? "✓" : b.n}</span>
              <span className="truncate">{b.nome}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-[0.6vw] flex h-[0.45vw] gap-[0.15vw] overflow-hidden rounded-full">
        {ROTEIRO.map((e, i) => (
          <div
            key={e.id}
            className="h-full flex-1 rounded-full"
            style={{
              flexGrow: e.minutos,
              background: MARCAS[e.marca].cor,
              opacity: state.puladas.includes(e.id) ? 0.08 : i < state.etapa ? 0.85 : i === state.etapa ? 1 : 0.25,
              outline: i === state.etapa ? "2px solid #fff" : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}

const RACHAS = [
  "M50 0 L46 18 L54 30 L44 46 L52 60 L47 78 L53 100",
  "M46 18 L30 26 L22 40",
  "M54 30 L70 36 L80 52",
  "M44 46 L28 58 L18 74",
  "M52 60 L68 70 L76 88",
  "M47 78 L34 90",
  "M30 26 L24 12",
  "M70 36 L82 24",
]

/** A barreira do momento: racha conforme oram e se abre no fim. */
export function Barreira({ arte, rachadura, aberta, className, celular }: { arte: string; rachadura: number; aberta: boolean; className?: string; celular?: boolean }) {
  const url = arteUrl(arte, celular)
  const fx = useFx()
  const n = Math.round(rachadura * RACHAS.length)
  return (
    <div className={cn("relative overflow-hidden rounded-[1.4vw] border border-border bg-night", className)}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,#1c2b22_0_14px,#15221b_14px_28px)]" />
      )}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {RACHAS.slice(0, aberta ? RACHAS.length : n).map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="#ffe7a3"
            strokeWidth={aberta ? 1.6 : 1}
            vectorEffect="non-scaling-stroke"
            style={{ filter: "drop-shadow(0 0 4px #f4d27a)" }}
            initial={fx.motion ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9 }}
          />
        ))}
      </svg>
      {aberta && (
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgb(255_240_200/0.85),rgb(244_210_122/0.25)_45%,transparent_70%)]"
          initial={fx.motion ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6 }}
        />
      )}
    </div>
  )
}
