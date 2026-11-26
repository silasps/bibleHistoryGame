import { COMPROMISSOS, ORACOES, PERGUNTAS, PERGUNTAS_PADRAO, ROTEIRO, VISITAS, type Etapa, type GrupoId, type RespostaId, type VisitaId } from "@/content/janela-verde"

// Janela Verde (seção temporária): estado da sala e reducer puro. A hora vem
// sempre nas ações (o servidor troca pela dele), então telão, condutores e
// celulares contam o mesmo tempo. Ações de palco exigem a chave do condutor
// (o servidor confere); as dos grupos e do compromisso são públicas.

export const GRUPOS: GrupoId[] = ["auren", "nair"]
export const MAX_PALAVRAS = 200
export const MAX_TEXTO = 500
export const MAX_APARELHOS = 400

export interface Palavra {
  id: string
  grupo: GrupoId
  etapa: string
  card?: string
  texto: string
  em: number
}

export interface Relogio {
  total: number
  prazo?: number
  restante: number
}

export interface JanelaState {
  jogo: "janela-verde"
  v: 1
  chaveHash: string
  etapa: number
  passo: number
  inicio: number | null
  fimEm: number | null
  historico: { etapa: string; em: number }[]
  relogio: Relogio | null
  som: { volume: number; mudo: boolean }
  puladas: string[]
  cortes: string[]
  perguntas: string[]
  conectados: Partial<Record<GrupoId, number>>
  oracoes: Record<string, Record<string, GrupoId[]>>
  compartilhou: GrupoId[]
  recebe: Partial<Record<VisitaId, string>>
  pistas: Partial<Record<VisitaId, string[]>>
  respostas: Partial<Record<VisitaId, RespostaId>>
  palavras: Palavra[]
  noTelao: string | null
  compromissos: Record<string, string[]>
}

export type Posicao = { etapa: number; passo: number }

export type PalcoAction =
  | { type: "comecar"; agora: number }
  | { type: "avancar"; de: Posicao; agora: number }
  | { type: "voltar"; de: Posicao; agora: number }
  | { type: "ir"; etapa: number; agora: number }
  | { type: "encerrar"; agora: number }
  | { type: "reiniciar"; agora: number }
  | { type: "relogio"; minutos: number; agora: number }
  | { type: "pausar"; agora: number }
  | { type: "continuar"; agora: number }
  | { type: "parar" }
  | { type: "som"; volume?: number; mudo?: boolean }
  | { type: "pular"; etapa: string; on: boolean }
  | { type: "corte"; id: string; on: boolean }
  | { type: "perguntas"; ids: string[] }
  | { type: "recebe"; visita: VisitaId; quem: string }
  | { type: "pista"; visita: VisitaId; id: string; usada: boolean }
  | { type: "mostrarPalavra"; id: string | null }

export type PublicoAction =
  | { type: "entrar"; grupo: GrupoId; agora: number }
  | { type: "orou"; grupo: GrupoId; etapa: string; card: string }
  | { type: "compartilhou"; grupo: GrupoId }
  | { type: "responder"; visita: VisitaId; grupo: GrupoId; valor: RespostaId }
  | { type: "palavra"; id: string; grupo: GrupoId; texto: string; agora: number }
  | { type: "comprometer"; aparelho: string; ops: string[] }
  | { type: "tempo"; prazo: number }

export type JanelaAction = PalcoAction | PublicoAction

export const ACOES_DE_PALCO = new Set<JanelaAction["type"]>([
  "comecar", "avancar", "voltar", "ir", "encerrar", "reiniciar", "relogio", "pausar", "continuar", "parar",
  "som", "pular", "corte", "perguntas", "recebe", "pista", "mostrarPalavra",
])

export function estadoInicial(chaveHash: string): JanelaState {
  return {
    jogo: "janela-verde",
    v: 1,
    chaveHash,
    etapa: 0,
    passo: 0,
    inicio: null,
    fimEm: null,
    historico: [],
    relogio: null,
    som: { volume: 0.7, mudo: false },
    puladas: [],
    cortes: [],
    perguntas: [...PERGUNTAS_PADRAO],
    conectados: {},
    oracoes: {},
    compartilhou: [],
    recebe: {},
    pistas: {},
    respostas: {},
    palavras: [],
    noTelao: null,
    compromissos: {},
  }
}

/** O que vai para os aparelhos: sem o hash da chave. */
export function publico(s: JanelaState): JanelaState {
  return s.chaveHash ? { ...s, chaveHash: "" } : s
}

export function ehJanela(s: unknown): s is JanelaState {
  return !!s && typeof s === "object" && (s as JanelaState).jogo === "janela-verde"
}

// ─── Etapas, itens e cortes ──────────────────────────────────────────────

export function etapaAtual(s: JanelaState): Etapa {
  return ROTEIRO[Math.min(s.etapa, ROTEIRO.length - 1)]
}

function cortesDe(s: JanelaState, etapa: Etapa) {
  return (etapa.cortes ?? []).filter((c) => s.cortes.includes(c.id))
}

export function perguntasEscolhidas(s: JanelaState) {
  const ids = s.perguntas.length ? s.perguntas : PERGUNTAS_PADRAO
  const lista = PERGUNTAS.filter((p) => ids.includes(p.id))
  return s.cortes.includes("reflexao-1") ? lista.slice(0, 1) : lista
}

/** Quantos itens a etapa tem agora (com cortes e perguntas escolhidas). */
export function itensDe(s: JanelaState, etapa: Etapa): number {
  if (etapa.tela.tipo === "reflexao") return Math.max(1, perguntasEscolhidas(s).length)
  const corte = cortesDe(s, etapa).find((c) => c.itens)
  return corte?.itens ?? etapa.itens
}

/** Primeiro item da etapa (ex.: a comparação só com as palavras). */
export function primeiroItem(s: JanelaState, etapa: Etapa): number {
  return cortesDe(s, etapa).find((c) => c.desde !== undefined)?.desde ?? 0
}

export function relogioDe(s: JanelaState, etapa: Etapa): number | undefined {
  return cortesDe(s, etapa).find((c) => c.relogio)?.relogio ?? etapa.relogio
}

/** Cards de oração da etapa, todos juntos (com o corte "só 2 pedidos"). */
export function cardsDaOracao(s: JanelaState, etapa: Etapa) {
  if (etapa.tela.tipo !== "oracao") return []
  const cards = ORACOES[etapa.tela.oracao].cards
  return cortesDe(s, etapa).some((c) => c.id.endsWith("-2cards")) ? cards.slice(0, 2) : cards
}

/** A oração está no último item: a barreira caiu. */
export function barreiraCaiu(s: JanelaState, etapa = etapaAtual(s)): boolean {
  return etapa.tela.tipo === "oracao" && s.passo >= itensDe(s, etapa) - 1
}

/** Com os pedidos juntos, a palavra fica marcada só com o momento. */
export function cardAtual(s: JanelaState): string | undefined {
  void s
  return undefined
}

function proxima(s: JanelaState, de: number, passo: 1 | -1): number {
  let i = de + passo
  while (i >= 0 && i < ROTEIRO.length && s.puladas.includes(ROTEIRO[i].id)) i += passo
  return i
}

function irPara(s: JanelaState, etapa: number, agora: number, fim = false): JanelaState {
  if (etapa < 0 || etapa >= ROTEIRO.length) return s
  const e = ROTEIRO[etapa]
  const passo = fim ? itensDe(s, e) - 1 : primeiroItem(s, e)
  return {
    ...s,
    etapa,
    passo,
    relogio: null,
    noTelao: null,
    inicio: s.inicio ?? agora,
    historico: [...s.historico, { etapa: e.id, em: agora }],
  }
}

const mesma = (s: JanelaState, de: Posicao) => s.etapa === de.etapa && s.passo === de.passo

// ─── Reducer ─────────────────────────────────────────────────────────────

export function reduceJanela(s: JanelaState, a: JanelaAction): JanelaState {
  switch (a.type) {
    case "comecar":
      if (s.inicio !== null) return s
      return { ...s, inicio: a.agora, fimEm: null, historico: [{ etapa: etapaAtual(s).id, em: a.agora }] }

    case "avancar": {
      if (!mesma(s, a.de)) return s
      const etapa = etapaAtual(s)
      if (s.passo < itensDe(s, etapa) - 1) return { ...s, passo: s.passo + 1, noTelao: null, inicio: s.inicio ?? a.agora }
      return irPara(s, proxima(s, s.etapa, 1), a.agora)
    }

    case "voltar": {
      if (!mesma(s, a.de)) return s
      const etapa = etapaAtual(s)
      if (s.passo > primeiroItem(s, etapa)) return { ...s, passo: s.passo - 1, noTelao: null }
      return irPara(s, proxima(s, s.etapa, -1), a.agora, true)
    }

    case "ir":
      if (a.etapa === s.etapa) return s
      return irPara(s, a.etapa, a.agora)

    case "reiniciar":
      // Volta ao começo e apaga o andamento (mantém a chave e o volume).
      return { ...estadoInicial(s.chaveHash), som: s.som }

    case "encerrar":
      if (s.fimEm !== null) return s
      return { ...s, fimEm: a.agora, historico: [...s.historico, { etapa: "fim-da-sala", em: a.agora }] }

    case "relogio": {
      const total = Math.round(Math.min(Math.max(a.minutos, 0.25), 30) * 60_000)
      return { ...s, relogio: { total, prazo: a.agora + total, restante: total } }
    }

    case "pausar":
      if (!s.relogio?.prazo) return s
      return { ...s, relogio: { total: s.relogio.total, restante: Math.max(0, s.relogio.prazo - a.agora) } }

    case "continuar":
      if (!s.relogio || s.relogio.prazo || s.relogio.restante <= 0) return s
      return { ...s, relogio: { ...s.relogio, prazo: a.agora + s.relogio.restante } }

    case "parar":
      return s.relogio ? { ...s, relogio: null } : s

    case "tempo":
      // Todos os aparelhos avisam o fim; só o primeiro aviso deste relógio vale.
      if (!s.relogio?.prazo || s.relogio.prazo !== a.prazo) return s
      return { ...s, relogio: { total: s.relogio.total, restante: 0 } }

    case "som": {
      const volume = a.volume === undefined ? s.som.volume : Math.min(1, Math.max(0, a.volume))
      return { ...s, som: { volume, mudo: a.mudo ?? s.som.mudo } }
    }

    case "pular": {
      if (!ROTEIRO.some((e) => e.id === a.etapa) || ROTEIRO[s.etapa].id === a.etapa) return s
      const tem = s.puladas.includes(a.etapa)
      if (tem === a.on) return s
      return { ...s, puladas: a.on ? [...s.puladas, a.etapa] : s.puladas.filter((x) => x !== a.etapa) }
    }

    case "corte": {
      const etapa = ROTEIRO.find((e) => e.cortes?.some((c) => c.id === a.id))
      if (!etapa) return s
      const tem = s.cortes.includes(a.id)
      if (tem === a.on) return s
      const cortes = a.on ? [...s.cortes, a.id] : s.cortes.filter((x) => x !== a.id)
      const next = { ...s, cortes }
      // Se a etapa atual encolheu, o item atual não pode passar do fim.
      if (ROTEIRO[s.etapa].id === etapa.id) next.passo = Math.min(Math.max(s.passo, primeiroItem(next, etapa)), itensDe(next, etapa) - 1)
      return next
    }

    case "perguntas": {
      const validas = a.ids.filter((id, i, all) => PERGUNTAS.some((p) => p.id === id) && all.indexOf(id) === i)
      if (!validas.length) return s
      const ordenadas = PERGUNTAS.filter((p) => validas.includes(p.id)).map((p) => p.id)
      const next = { ...s, perguntas: ordenadas }
      if (etapaAtual(s).tela.tipo === "reflexao") next.passo = Math.min(s.passo, itensDe(next, etapaAtual(s)) - 1)
      return next
    }

    case "recebe": {
      const quem = a.quem.trim().slice(0, 30)
      if (!(a.visita in VISITAS) || s.recebe[a.visita] === quem) return s
      return { ...s, recebe: { ...s.recebe, [a.visita]: quem } }
    }

    case "pista": {
      if (!VISITAS[a.visita]?.pistas.some((p) => p.id === a.id)) return s
      const atuais = s.pistas[a.visita] ?? []
      if (atuais.includes(a.id) === a.usada) return s
      const lista = a.usada ? [...atuais, a.id] : atuais.filter((x) => x !== a.id)
      return { ...s, pistas: { ...s.pistas, [a.visita]: lista } }
    }

    case "mostrarPalavra":
      if (a.id !== null && !s.palavras.some((p) => p.id === a.id)) return s
      return s.noTelao === a.id ? s : { ...s, noTelao: a.id }

    case "entrar":
      if (!GRUPOS.includes(a.grupo)) return s
      return { ...s, conectados: { ...s.conectados, [a.grupo]: a.agora } }

    case "orou": {
      if (!GRUPOS.includes(a.grupo)) return s
      const etapa = ROTEIRO.find((e) => e.id === a.etapa)
      if (!etapa || etapa.tela.tipo !== "oracao") return s
      if (!ORACOES[etapa.tela.oracao].cards.some((c) => c.id === a.card)) return s
      const daEtapa = s.oracoes[a.etapa] ?? {}
      const grupos = daEtapa[a.card] ?? []
      if (grupos.includes(a.grupo)) return s
      return { ...s, oracoes: { ...s.oracoes, [a.etapa]: { ...daEtapa, [a.card]: [...grupos, a.grupo] } } }
    }

    case "compartilhou":
      if (!GRUPOS.includes(a.grupo) || s.compartilhou.includes(a.grupo)) return s
      return { ...s, compartilhou: [...s.compartilhou, a.grupo] }

    case "responder": {
      const visita = VISITAS[a.visita]
      // Responde o grupo que ouviu (não o que visitou).
      if (!visita || visita.visitante === a.grupo || s.respostas[a.visita] === a.valor) return s
      return { ...s, respostas: { ...s.respostas, [a.visita]: a.valor } }
    }

    case "palavra": {
      const texto = a.texto.replace(/\s+/g, " ").trim().slice(0, MAX_TEXTO)
      if (!texto || !GRUPOS.includes(a.grupo) || s.palavras.length >= MAX_PALAVRAS) return s
      if (s.palavras.some((p) => p.id === a.id)) return s
      const palavra: Palavra = { id: a.id, grupo: a.grupo, etapa: etapaAtual(s).id, card: cardAtual(s), texto, em: a.agora }
      return { ...s, palavras: [...s.palavras, palavra] }
    }

    case "comprometer": {
      const ops = COMPROMISSOS.map((c) => c.id as string).filter((id) => a.ops.includes(id))
      const antes = s.compromissos[a.aparelho]
      if (!a.aparelho || a.aparelho.length > 64) return s
      if (!antes && Object.keys(s.compromissos).length >= MAX_APARELHOS) return s
      if (antes && antes.length === ops.length && antes.every((o) => ops.includes(o))) return s
      return { ...s, compromissos: { ...s.compromissos, [a.aparelho]: ops } }
    }
  }
}

// ─── Contagens ───────────────────────────────────────────────────────────

/** Quanto a barreira da oração atual já rachou (0 a 1). */
export function rachadura(s: JanelaState, etapa = etapaAtual(s)): number {
  if (etapa.tela.tipo !== "oracao") return 0
  const cards = cardsDaOracao(s, etapa)
  if (!cards.length) return 0
  const marcados = cards.reduce((n, c) => n + (s.oracoes[etapa.id]?.[c.id]?.length ?? 0), 0)
  const palavras = s.palavras.filter((p) => p.etapa === etapa.id).length
  return Math.min(1, (marcados + palavras * 0.5) / (cards.length * GRUPOS.length))
}

const REGIAO_DO_BLOCO = { 1: "amazonia", 2: "africa", 3: "asia", 4: "todas" } as const
export type RegiaoLuz = (typeof REGIAO_DO_BLOCO)[keyof typeof REGIAO_DO_BLOCO]

/** Luzes do mapa: cada card orado e cada palavra recebida acendem uma luz. */
export function luzes(s: JanelaState): Record<RegiaoLuz, number> {
  const conta: Record<RegiaoLuz, number> = { amazonia: 0, africa: 0, asia: 0, todas: 0 }
  for (const etapa of ROTEIRO) {
    if (etapa.bloco === 0) continue
    const r = REGIAO_DO_BLOCO[etapa.bloco]
    for (const grupos of Object.values(s.oracoes[etapa.id] ?? {})) conta[r] += grupos.length
    conta[r] += s.palavras.filter((p) => p.etapa === etapa.id).length
  }
  return conta
}

export function contarCompromissos(s: JanelaState): Record<string, number> {
  const conta: Record<string, number> = Object.fromEntries(COMPROMISSOS.map((c) => [c.id, 0]))
  for (const ops of Object.values(s.compromissos)) for (const o of ops) conta[o] = (conta[o] ?? 0) + 1
  return conta
}

export function pessoasComprometidas(s: JanelaState): number {
  return Object.values(s.compromissos).filter((o) => o.length > 0).length
}

// ─── Tempo ───────────────────────────────────────────────────────────────

const MIN = 60_000

/** Minutos previstos de uma etapa, com cortes (pulada = 0). */
export function minutosDe(s: JanelaState, etapa: Etapa): number {
  if (s.puladas.includes(etapa.id)) return 0
  const economia = cortesDe(s, etapa).reduce((n, c) => n + c.economiza, 0)
  return Math.max(0, etapa.minutos - economia)
}

export function orcamento(s: JanelaState): number {
  return ROTEIRO.reduce((n, e) => n + minutosDe(s, e), 0)
}

export interface Sugestao {
  tipo: "corte" | "pular"
  id: string
  etapa: string
  texto: string
  economiza: number
}

export interface Ritmo {
  comecou: boolean
  totalMs: number
  etapaMs: number
  etapaPrevistaMs: number
  /** Positivo: atrasado; negativo: adiantado. */
  atrasoMs: number
  previsaoMs: number
  orcamentoMs: number
  sugestoes: Sugestao[]
}

/** Entrada mais recente na etapa atual. */
function entradaAtual(s: JanelaState): number | null {
  const id = etapaAtual(s).id
  for (let i = s.historico.length - 1; i >= 0; i--) if (s.historico[i].etapa === id) return s.historico[i].em
  return s.inicio
}

export function ritmo(s: JanelaState, agora: number): Ritmo {
  const orcamentoMs = orcamento(s) * MIN
  const fim = s.fimEm ?? agora
  if (s.inicio === null) {
    return { comecou: false, totalMs: 0, etapaMs: 0, etapaPrevistaMs: minutosDe(s, etapaAtual(s)) * MIN, atrasoMs: 0, previsaoMs: orcamentoMs, orcamentoMs, sugestoes: [] }
  }
  const totalMs = Math.max(0, fim - s.inicio)
  const entrou = entradaAtual(s) ?? s.inicio
  const etapaMs = Math.max(0, fim - entrou)
  const atual = etapaAtual(s)
  const etapaPrevistaMs = minutosDe(s, atual) * MIN
  const previstoAntes = ROTEIRO.slice(0, s.etapa).reduce((n, e) => n + minutosDe(s, e), 0) * MIN
  const previstoDepois = ROTEIRO.slice(s.etapa + 1).reduce((n, e) => n + minutosDe(s, e), 0) * MIN
  const real = entrou - s.inicio
  const atrasoMs = real - previstoAntes + Math.max(0, etapaMs - etapaPrevistaMs)
  const previsaoMs = real + Math.max(etapaMs, etapaPrevistaMs) + previstoDepois

  const sugestoes: Sugestao[] = []
  if (atrasoMs > MIN) {
    for (const e of ROTEIRO.slice(s.etapa)) {
      if (s.puladas.includes(e.id)) continue
      for (const c of e.cortes ?? []) {
        if (!s.cortes.includes(c.id) && !(e.id === atual.id && s.passo > 0 && c.desde !== undefined)) {
          sugestoes.push({ tipo: "corte", id: c.id, etapa: e.id, texto: `${e.titulo}: ${c.texto.toLowerCase()}`, economiza: c.economiza })
        }
      }
    }
    sugestoes.sort((a, b) => b.economiza - a.economiza)
  }
  return { comecou: true, totalMs, etapaMs, etapaPrevistaMs, atrasoMs, previsaoMs, orcamentoMs, sugestoes }
}

/** Tempo real de cada etapa (soma das passagens), para o relatório. */
export function tempoPorEtapa(s: JanelaState, agora: number): Record<string, number> {
  const out: Record<string, number> = {}
  const fim = s.fimEm ?? agora
  s.historico.forEach((h, i) => {
    const ate = s.historico[i + 1]?.em ?? fim
    if (h.etapa === "fim-da-sala") return
    out[h.etapa] = (out[h.etapa] ?? 0) + Math.max(0, ate - h.em)
  })
  return out
}

export type EstadoEtapa = "feita" | "atual" | "falta" | "pulada"

export function estadoDaEtapa(s: JanelaState, i: number): EstadoEtapa {
  if (i === s.etapa) return "atual"
  if (s.puladas.includes(ROTEIRO[i].id)) return "pulada"
  return i < s.etapa ? "feita" : "falta"
}
