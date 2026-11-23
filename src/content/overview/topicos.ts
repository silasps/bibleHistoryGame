import { getEtapa } from "../etapas"
import type { Scene } from "../schema"
import { excerpts, excerptsForItem } from "."

/**
 * Tópicos para falar: pontos do resumo do autor, por slide, SÓ no painel do
 * apresentador (nunca vão ao telão nem ao celular). Cada ponto é condensado das
 * palavras dele e aponta o trecho de origem (`de`). A chave é o id do item da
 * linha do tempo ou o id da abertura da etapa (`etapa-14`).
 *
 * Slides sem tópicos aqui usam as frases de palco do resumo daquele item
 * (as mesmas que aparecem no telão e no "Aprofundar").
 */
export type Topico = { text: string; de: string }

export const TOPICOS: Record<string, Topico[]> = {
  // ── Semana 8 · Jesus (Etapa 14) ──────────────────────────────────────────
  "etapa-14": [{ de: "r08-chegou", text: "Ele chegou: o anunciado desde o início, conhecido antes da fundação do mundo (1Pe 1:20)" }],
  augusto: [
    { de: "r08-plenitude", text: "Todo o cenário estava perfeitamente preparado para a chegada dele" },
    { de: "r08-plenitude", text: "A plenitude dos tempos: não havia momento mais propício na história (Profa. Ingrid)" },
  ],
  "nascimento-jesus": [
    { de: "r08-ministerio", text: "Anunciado a Maria e José (Lc 1:31–33)" },
    { de: "r08-reino", text: "Os Evangelhos mostram que um reino está chegando" },
    { de: "r08-reino", text: "Aos pastores: boas-novas de grande alegria para todo o povo; nasceu o Salvador, Cristo, o Senhor (Lc 2:10–11)" },
    { de: "r08-boas-novas", text: "“Boas-novas” era o anúncio de quando um rei vencia a guerra" },
    { de: "r08-boas-novas", text: "Este Rei veio para salvar; não tomou o trono, foi ungido (Cristo)" },
    { de: "r08-boas-novas", text: "Para os súditos do Reino, ele é Senhor (Kyrios): domínio total sobre a vida" },
    { de: "r08-ministerio", text: "Apresentado no templo (Lc 2:23)" },
  ],
  jesus: [
    { de: "r08-por-que", text: "Por que ele precisava vir? O maior problema ainda não tinha sido resolvido" },
    { de: "r08-por-que", text: "Depois do exílio, a idolatria acabou, mas o pecado continuava, na carne" },
    { de: "r08-por-que", text: "O salário do pecado é a morte: a morte de alguém perfeito precisava acontecer (Rm 6:23)" },
    { de: "r08-cristo", text: "Jesus é o Cristo, o Filho de Deus: sua vida e morte mudaram para sempre o curso da vida humana (Profa. Ingrid)" },
    { de: "r08-mateus", text: "Mateus, para o povo judeu: o Messias e Rei de Israel, que salva o seu povo dos pecados (Mt 1:21; 15:24)" },
    { de: "r08-marcos", text: "Marcos, para cristãos gentios em Roma, perseguidos: o Messias com autoridade e papel de servo (Mc 10:45)" },
    { de: "r08-lucas", text: "Lucas, um gentio, escreve a Teófilo (Lc 1:3): o Salvador compassivo que alcança os marginalizados" },
    { de: "r08-lucas", text: "Os pastores, a viúva (Lc 7:11–15) e a mulher pecadora que o ungiu com perfume (Lc 7:36–38)" },
  ],
  pilatos: [{ de: "r08-cruz", text: "A mensagem incomodou tanto os mestres da Lei que eles mandaram crucificar Jesus" }],
  "ministerio-jesus": [
    { de: "r08-ministerio", text: "Batizado (Mt 3:16), tentado (Mt 4:1), chama os primeiros discípulos (Mt 4:18–22)" },
    { de: "r08-ministerio", text: "Inicia o ministério com o primeiro sinal (Jo 2:9)" },
    { de: "r08-ministerio", text: "Ensina sobre o seu Reino (Mt 5–7)" },
    { de: "r08-ministerio", text: "Autoridade sobre a criação, as enfermidades e os demônios (Mt 8)" },
    { de: "r08-ministerio", text: "Os princípios do Reino chocam os estudiosos da Lei; os marginalizados os recebem de bom grado" },
  ],
  "morte-ressurreicao": [
    { de: "r08-cruz", text: "A mensagem incomodou os mestres da Lei, e eles mandaram crucificar Jesus" },
    { de: "r08-cruz", text: "O sacrifício necessário para que toda dívida fosse anulada de uma vez por todas" },
    { de: "r08-cruz", text: "Os discípulos ficam na dúvida: ele prometeu tudo aquilo… e agora?" },
    { de: "r08-ressurreicao", text: "O anjo às mulheres: “Não tenham medo! Ele não está aqui; ressuscitou, como tinha dito” (Mt 28:5–6)" },
    { de: "r08-ressurreicao", text: "Tenham calma: tudo o que foi anunciado e prometido está se realizando" },
  ],
  ascensao: [
    { de: "r08-fe", text: "Jesus chegou e apresentou um Reino eterno, que muda todas as expectativas" },
    { de: "r08-fe", text: "Ele chama a uma vida de fé, crendo no novo templo e no Reino, para tomar posse dele" },
  ],
}

const MAX = 10

const stageLines = (list: { stageLine?: string; pendingFact?: string }[]) =>
  list.filter((e) => e.stageLine && !e.pendingFact).map((e) => e.stageLine!)

/** Os tópicos do slide atual: os escritos aqui ou, sem eles, as frases de palco do resumo. */
export function topicosDaCena(scene: Scene): { linhas: string[]; proprios: boolean } {
  const o = scene.overview
  if (!o) return { linhas: [], proprios: false }
  let proprios = false
  let linhas: string[] = []
  if (o.role === "abertura") {
    if (TOPICOS[scene.id]) {
      proprios = true
      linhas = TOPICOS[scene.id].map((t) => t.text)
    } else if (o.etapa !== undefined) {
      const intros = getEtapa(o.etapa)?.intros ?? []
      linhas = stageLines(intros.map((id) => excerpts.find((e) => e.id === id)).filter((e) => !!e))
    }
  } else if (o.itemId) {
    for (const id of [o.itemId, ...(o.alsoItemIds ?? [])]) {
      const own = TOPICOS[id]
      if (own) proprios = true
      linhas.push(...(own ? own.map((t) => t.text) : stageLines(excerptsForItem(id))))
    }
  }
  linhas = linhas.filter((l, i) => linhas.indexOf(l) === i).slice(0, MAX)
  return { linhas, proprios }
}

/** Problemas de conteúdo dos tópicos (usado nos testes). */
export function validateTopicos(itemIds: Set<string>, openingIds: Set<string>): string[] {
  const issues: string[] = []
  const excerptIds = new Set(excerpts.map((e) => e.id))
  for (const [key, list] of Object.entries(TOPICOS)) {
    if (!itemIds.has(key) && !openingIds.has(key)) issues.push(`tópicos: chave inexistente ${key}`)
    for (const t of list) {
      if (!excerptIds.has(t.de)) issues.push(`tópicos de ${key}: trecho inexistente ${t.de}`)
      if (t.text.length > 120) issues.push(`tópicos de ${key}: passa de 120 caracteres: ${t.text}`)
      if (/\bPRD\b|plano redentivo/i.test(t.text)) issues.push(`tópicos de ${key}: fala do PRD`)
    }
  }
  return issues
}
