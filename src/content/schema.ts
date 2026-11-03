import { z } from "zod"
import { BOOK_IDS } from "./books"

// ─── Vocabulário editorial ───────────────────────────────────────────────

/** Natureza de cada bloco de texto exibido. Sempre visível ao usuário. */
export const ContentKind = z.enum([
  "texto_biblico", // citação literal verificada (só com quoteVerified)
  "parafrase", // paráfrase autoral fiel ao texto bíblico
  "interpretacao", // leitura teológica/literária, possivelmente contestável
  "analogia", // história ilustrativa, não é evento bíblico
  "hipotese_ficcional", // simulação reflexiva ou dramatização
  "narracao", // voz do jogo: enquadramento, instrução, sem afirmação factual
  "resumo_autor", // texto do resumo do autor (material da DBS)
  "reflexao", // reflexão escrita pelo autor/apresentador nos espaços de pausa
])
export type ContentKind = z.infer<typeof ContentKind>

export const ConnectionType = z.enum([
  "promessa_explicita",
  "profecia_direta",
  "tipologia_interpretativa",
  "tema_redentivo",
  "cumprimento_novo_testamento",
])
export type ConnectionType = z.infer<typeof ConnectionType>

export const SceneType = z.enum([
  "cinematic_intro",
  "historical_context",
  "character_perspective",
  "theological_dilemma",
  "analogy",
  "choice",
  "hypothetical_consequence",
  "canonical_reveal",
  "investigation",
  "evidence_unlock",
  "presenter_pause",
  "audience_poll",
  "reflection",
  "chapter_cliffhanger",
])
export type SceneType = z.infer<typeof SceneType>

export const PerspectiveMode = z.enum([
  "investigator",
  "biblical_character",
  "theological_dilemma",
  "historical_observer",
])
export type PerspectiveMode = z.infer<typeof PerspectiveMode>

export const SceneStatus = z.enum([
  "locked",
  "ready",
  "active",
  "awaiting_presenter",
  "revealed",
  "completed",
])
export type SceneStatus = z.infer<typeof SceneStatus>

export const ReviewStatus = z.enum(["rascunho", "em_revisao", "revisado", "pendente_fonte"])
export type ReviewStatus = z.infer<typeof ReviewStatus>

export const TheologicalCategory = z.enum([
  "criacao",
  "imagem_de_deus",
  "limite_e_liberdade",
  "pecado_e_queda",
  "graca",
  "promessa",
  "alianca",
  "santidade",
  "presenca",
  "realeza",
  "justica",
])
export type TheologicalCategory = z.infer<typeof TheologicalCategory>

/** Ilustrações SVG disponíveis em components/visuals. */
export const VisualId = z.enum([
  "night-sky",
  "creation",
  "question-mark",
  "garden",
  "serpent-fruit",
  "choice-crossroads",
  "rewind",
  "fallen-garden",
  "seed-thread",
  "sealed-scroll",
  "reflection-pool",
  "stars-promise",
  "yard-train",
  "cliff-road",
  "timeline",
])
export type VisualId = z.infer<typeof VisualId>

/** Deixas para a camada de efeitos (fx/). Nunca carregam texto. */
export const FxCue = z.enum([
  "stars",
  "creation-light",
  "question-pulse",
  "garden-breeze",
  "fruit-glow",
  "heartbeat",
  "rewind",
  "seed-thread",
  "seal",
  "embers",
  "train",
  "cliff",
])
export type FxCue = z.infer<typeof FxCue>

// ─── Referências ─────────────────────────────────────────────────────────

export const BibleRef = z
  .object({
    book: z.enum(BOOK_IDS),
    chapter: z.number().int().positive(),
    verseStart: z.number().int().positive().optional(),
    verseEnd: z.number().int().positive().optional(),
    chapterEnd: z.number().int().positive().optional(),
    translation: z.literal("NAA").default("NAA"),
  })
  .refine((r) => !(r.verseEnd && !r.verseStart), "verseEnd exige verseStart")
  .refine((r) => !(r.chapterEnd && r.chapterEnd < r.chapter), "chapterEnd anterior a chapter")
export type BibleRef = z.infer<typeof BibleRef>

// ─── Blocos de conteúdo ──────────────────────────────────────────────────

export const ContentBlock = z
  .object({
    kind: ContentKind,
    text: z.string().min(1),
    refs: z.array(BibleRef).default([]),
    /** Rótulo extra, ex.: "Dramatização". */
    label: z.string().optional(),
    /** Citação literal: só é exibida se verificada contra a NAA. */
    quoteVerified: z.boolean().default(false),
  })
  .refine((b) => b.kind !== "texto_biblico" || b.quoteVerified, {
    message: "texto_biblico exige citação verificada (quoteVerified)",
  })
  .refine((b) => b.kind !== "parafrase" || b.refs.length > 0, {
    message: "paráfrase precisa de referência bíblica",
  })
export type ContentBlock = z.infer<typeof ContentBlock>

// ─── Interações ──────────────────────────────────────────────────────────

export const Option = z.object({ id: z.string().min(1), label: z.string().min(1) })
export type Option = z.infer<typeof Option>

export const Poll = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(Option).min(2).max(6),
  kind: z.enum(["opiniao", "quiz"]),
  correctOptionId: z.string().optional(),
  /** Comentário exibido depois do resultado de um quiz. */
  afterResult: z.string().optional(),
})
export type Poll = z.infer<typeof Poll>

export const Choice = z.object({
  prompt: z.string().min(1),
  options: z.array(Option).min(2).max(5),
})
export type Choice = z.infer<typeof Choice>

/** Passos revelados um a um (ex.: os candidatos a motorista). */
export const RevealStep = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  text: z.string().min(1),
  /** Valor numérico opcional usado por visuais (ex.: distância da borda, em cm). */
  value: z.number().optional(),
})
export type RevealStep = z.infer<typeof RevealStep>

// ─── Cena ────────────────────────────────────────────────────────────────

export const Scene = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    type: SceneType,
    title: z.string().min(1),
    perspective: PerspectiveMode,
    /** Personagem assumido em character_perspective. */
    character: z.string().optional(),
    blocks: z.array(ContentBlock).default([]),
    visual: VisualId,
    fxCue: FxCue.optional(),
    /** 0..1: quanto a cena "acende" o palco. */
    illumination: z.number().min(0).max(1).default(0.3),
    /** Camada segura para o telão. Curta, nunca explicativa. */
    stage: z
      .object({
        caption: z.string().max(90).optional(),
        /** Mostra a referência no telão depois da liberação (sem explicação). */
        showRefsAfterRelease: z.boolean().default(false),
      })
      .default({ showRefsAfterRelease: false }),
    /** Texto curto para o celular do público nesta cena. */
    audiencePrompt: z.string().max(160).optional(),
    poll: Poll.optional(),
    choice: Choice.optional(),
    /** hypothetical_consequence: cena de escolha de origem + blocos por opção. */
    hypothetical: z
      .object({
        choiceSceneId: z.string(),
        byOption: z.record(z.string(), z.array(ContentBlock).min(1)),
      })
      .optional(),
    steps: z.array(RevealStep).optional(),
    reflection: z.object({ prompts: z.array(z.string().min(1)).min(1) }).optional(),
    /** Evidências desbloqueadas ao concluir a cena. */
    unlocks: z.array(z.string()).default([]),
    /** evidence_unlock: evidência de conexão aberta pelo apresentador (ao vivo) ou pelo jogador (solo). */
    releases: z.string().optional(),
    /** Cena da visão geral (linha do tempo + resumo do autor). */
    overview: z
      .object({
        role: z.enum(["abertura", "item", "versiculo", "pista", "reflexao", "conclusao"]),
        week: z.number().int().optional(),
        itemId: z.string().optional(),
        slotId: z.string().optional(),
        /** Linha de palco (do resumo do autor ou do espaço de reflexão). */
        stageLine: z.string().max(140).optional(),
      })
      .optional(),
    /** Marcador discreto (só ícone) no painel do apresentador. */
    presenterCue: z.enum(["conexao", "votacao", "historia", "pausa"]).optional(),
    estimatedSeconds: z.number().int().positive(),
  })
  .superRefine((s, ctx) => {
    const need = (cond: boolean, message: string) => {
      if (!cond) ctx.addIssue({ code: "custom", message: `${s.id}: ${message}` })
    }
    if (s.type === "choice") need(!!s.choice, "choice exige `choice`")
    if (s.type === "audience_poll") need(!!s.poll, "audience_poll exige `poll`")
    if (s.type === "hypothetical_consequence") {
      need(!!s.hypothetical, "hypothetical_consequence exige `hypothetical`")
      for (const blocks of Object.values(s.hypothetical?.byOption ?? {})) {
        need(
          blocks.every((b) => b.kind === "hipotese_ficcional" || b.kind === "analogia" || b.kind === "interpretacao"),
          "consequência hipotética só aceita hipótese, analogia ou interpretação",
        )
      }
    }
    if (s.type === "evidence_unlock") need(!!s.releases, "evidence_unlock exige `releases`")
    if (s.type === "reflection") need(!!s.reflection, "reflection exige `reflection`")
    if (s.type === "character_perspective") need(!!s.character, "character_perspective exige `character`")
  })
export type Scene = z.infer<typeof Scene>
export type SceneInput = z.input<typeof Scene>

// ─── Evidências ──────────────────────────────────────────────────────────

export const Connection = z.object({
  primary: ConnectionType,
  secondary: z.array(ConnectionType).default([]),
  /** Fundamento textual obrigatório. */
  basis: z.array(BibleRef).min(1),
})
export type Connection = z.infer<typeof Connection>

export const Evidence = z
  .object({
    id: z.string().regex(/^ev-[a-z0-9-]+$/),
    title: z.string().min(1),
    category: TheologicalCategory,
    actId: z.string(),
    refs: z.array(BibleRef).min(1),
    /** Resumo público. Proibido em evidências de conexão (a síntese é server-only). */
    summary: ContentBlock.optional(),
    /** Texto da pista selada (pode aparecer antes da liberação). */
    lockedHint: z.string().min(1),
    prerequisites: z.array(z.string()).default([]),
    /** Ids de evidências ligadas por fios no quadro de investigação. */
    links: z.array(z.string()).default([]),
    connection: Connection.optional(),
    /** "futura": aparece selada, será aberta em episódio ainda não implementado. */
    availability: z.enum(["disponivel", "futura"]).default("disponivel"),
    /** Mostrar o tipo de conexão (falso para as semanas da visão geral, que o autor não classificou). */
    showClassification: z.boolean().default(true),
  })
  .refine((e) => !(e.connection && e.summary), {
    message: "evidência de conexão não pode ter resumo público",
  })
export type Evidence = z.infer<typeof Evidence>
export type EvidenceInput = z.input<typeof Evidence>

// ─── Episódio ────────────────────────────────────────────────────────────

const Period = z.object({
  label: z.string().min(1),
  approximate: z.boolean(),
  debated: z.boolean(),
  note: z.string().optional(),
})

export const Episode = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  actId: z.string(),
  kind: z.enum(["narrativa", "analogia", "visao_geral"]),
  status: z.enum(["jogavel", "esboco_editorial", "fontes_pendentes"]),
  order: z.number().int(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  period: Period,
  references: z.array(BibleRef).min(1),
  events: z.array(z.string()).default([]),
  characters: z.array(z.string()).default([]),
  geography: z.string().optional(),
  historicalContext: z.array(ContentBlock).default([]),
  peoplesAndPowers: z.array(z.string()).default([]),
  theme: z.string().min(1),
  humanQuestion: z.string().min(1),
  godRevealed: z.array(ContentBlock).default([]),
  principles: z.array(ContentBlock).default([]),
  /** Ids das evidências de conexão do episódio. */
  connectionEvidence: z.array(z.string()).default([]),
  linksTo: z.array(z.object({ episodeId: z.string(), note: z.string() })).default([]),
  authorSummary: z.object({ status: ReviewStatus, source: z.string().optional() }),
  manualRequirement: z.object({ status: ReviewStatus, note: z.string().optional() }),
  gaps: z.array(z.string()).default([]),
  supportSources: z.array(z.string()).default([]),
  visualHook: z.string().optional(),
  reviewStatus: ReviewStatus,
  scenes: z.array(Scene).default([]),
  evidence: z.array(Evidence).default([]),
  /** Para scaffolds: ideia do dilema e cuidados editoriais. */
  draft: z
    .object({
      dilemma: z.string(),
      cautions: z.array(z.string()),
      proposedConnections: z.array(
        z.object({ type: ConnectionType, basis: z.array(BibleRef).min(1), note: z.string() }),
      ),
    })
    .optional(),
})
export type Episode = z.infer<typeof Episode>
export type EpisodeInput = z.input<typeof Episode>

// ─── Ato ─────────────────────────────────────────────────────────────────

export const Act = z.object({
  id: z.string().regex(/^ato-\d{2}$/),
  number: z.number().int().min(1).max(11),
  title: z.string().min(1),
  themes: z.array(z.string()).min(1),
  books: z.array(z.enum(BOOK_IDS)).min(1),
  period: Period,
  status: z.enum(["jogavel", "esboco_editorial", "fontes_pendentes"]),
  /** Livros que se sobrepõem historicamente a outros atos. */
  overlaps: z.array(z.object({ books: z.array(z.enum(BOOK_IDS)).min(1), note: z.string() })).default([]),
  note: z.string().optional(),
})
export type Act = z.infer<typeof Act>
export type ActInput = z.input<typeof Act>

// ─── Conteúdo server-only ────────────────────────────────────────────────

export const ReleasedSynthesis = z.object({
  evidenceId: z.string(),
  blocks: z.array(ContentBlock).min(1),
  classificationNote: z.string().optional(),
})
export type ReleasedSynthesis = z.infer<typeof ReleasedSynthesis>

export const PresenterNotes = z.object({
  sceneId: z.string(),
  /** Lembretes de fala, para estudo prévio. Nunca projetados. */
  talkingPoints: z.array(z.string()).min(1),
  transitionHint: z.string().optional(),
})
export type PresenterNotes = z.infer<typeof PresenterNotes>
