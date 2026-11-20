import { z } from "zod"
import { ref } from "../refs"

// Bible Show: casas especiais da trilha. Quem para nelas cumpre o que a casa
// diz. `texto` é o fato bíblico (paráfrase conferida com a NAA no bible.com);
// a regra do jogo vem do `efeito`. A cada partida, a trilha sorteia quais
// entram e em que ordem. STATUS: rascunho — aguarda a revisão do autor.

const Efeito = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("andar"), casas: z.number().int().min(1).max(3) }),
  z.object({ tipo: z.literal("voltar"), casas: z.number().int().min(1).max(3) }),
  /** Fica de fora na próxima vez. */
  z.object({ tipo: z.literal("exilio") }),
  /** Joga mais uma vez em seguida. */
  z.object({ tipo: z.literal("denovo") }),
  /** Rodada para todos, conduzida por quem parou aqui. */
  z.object({ tipo: z.literal("arraial") }),
  /** Quem parou escolhe outra equipe (ou pessoa) para voltar casas. */
  z.object({ tipo: z.literal("escolher"), casas: z.number().int().min(1).max(3) }),
  /** Quem parou escolhe outra equipe para andar junto com ela. */
  z.object({ tipo: z.literal("junto"), casas: z.number().int().min(1).max(3) }),
  /** Quem parou escolhe outra equipe para andar (só a outra anda). */
  z.object({ tipo: z.literal("dar"), casas: z.number().int().min(1).max(3) }),
])
export type Efeito = z.infer<typeof Efeito>

const Situacao = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(2).max(28),
  texto: z.string().min(10).max(120),
  ref: z.object({ book: z.string(), chapter: z.number(), verseStart: z.number().optional(), verseEnd: z.number().optional() }),
  efeito: Efeito,
})
export type Situacao = z.infer<typeof Situacao>

type S = Situacao
const s = (id: string, nome: string, texto: string, r: S["ref"], efeito: Efeito): S => ({ id, nome, texto, ref: r, efeito })

export const SITUACOES: Situacao[] = z.array(Situacao).parse([
  // Rodada para todos (uma é sorteada para cada casa de "todos").
  s("arraial", "Todo o arraial", "Moisés levou o povo para fora do arraial ao encontro de Deus, e eles ficaram ao pé do monte.", ref("Exod", 19, 17), { tipo: "arraial" }),
  s("siquem", "Reunião em Siquém", "Josué reuniu todas as tribos de Israel em Siquém.", ref("Josh", 24, 1), { tipo: "arraial" }),
  s("lei", "A leitura da Lei", "Todo o povo se reuniu na praça, e Esdras leu o Livro da Lei em voz alta.", ref("Neh", 8, 1, 3), { tipo: "arraial" }),

  // Andar
  s("ezequias", "A oração de Ezequias", "Deus ouviu a oração de Ezequias e acrescentou quinze anos à vida dele.", ref("2Kgs", 20, 5, 6), { tipo: "andar", casas: 1 }),
  s("jordao", "Travessia do Jordão", "Os sacerdotes pararam com a arca no meio do Jordão, e o povo passou a pé enxuto.", ref("Josh", 3, 17), { tipo: "andar", casas: 2 }),
  s("mar-vermelho", "O mar Vermelho", "Os filhos de Israel entraram pelo meio do mar em seco.", ref("Exod", 14, 22), { tipo: "andar", casas: 2 }),
  s("jerico", "Muralhas de Jericó", "O povo gritou, as muralhas de Jericó ruíram, e eles subiram à cidade e a tomaram.", ref("Josh", 6, 20), { tipo: "andar", casas: 2 }),
  s("golias", "Davi e Golias", "Davi derrotou o filisteu com uma funda e com uma pedra.", ref("1Sam", 17, 50), { tipo: "andar", casas: 1 }),
  s("carmelo", "Fogo no Carmelo", "No monte Carmelo, caiu fogo do SENHOR e consumiu o holocausto.", ref("1Kgs", 18, 19, 38), { tipo: "andar", casas: 1 }),
  s("muralha", "A muralha terminada", "A reconstrução da muralha foi terminada em cinquenta e dois dias.", ref("Neh", 6, 15), { tipo: "andar", casas: 1 }),
  s("daniel", "Daniel e os leões", "Deus enviou o seu anjo e fechou a boca dos leões, e eles não fizeram mal a Daniel.", ref("Dan", 6, 22), { tipo: "andar", casas: 1 }),

  // Jogar de novo
  s("sol", "O sol parou", "Na batalha contra os amorreus, o sol parou no meio do céu quase um dia inteiro.", ref("Josh", 10, 12, 13), { tipo: "denovo" }),
  s("mana", "Pão do céu", "Deus disse que faria chover do céu pão para o povo no deserto.", ref("Exod", 16, 4), { tipo: "denovo" }),

  // Voltar
  s("ai", "Derrota em Ai", "Acã, da tribo de Judá, pegou coisas condenadas, e os homens de Israel fugiram diante dos de Ai.", ref("Josh", 7, 1, 5), { tipo: "voltar", casas: 1 }),
  s("quarenta-anos", "Quarenta anos no deserto", "O povo murmurou contra Deus, e os filhos deles seriam pastores no deserto por quarenta anos.", ref("Num", 14, 27, 34), { tipo: "voltar", casas: 2 }),
  s("bezerro", "O bezerro de metal", "O povo fez um bezerro de metal fundido e o adorou.", ref("Exod", 32, 4, 8), { tipo: "voltar", casas: 2 }),
  s("sansao", "Sansão sem força", "Dalila mandou rapar as tranças de Sansão, e ele perdeu a sua força.", ref("Judg", 16, 19, 20), { tipo: "voltar", casas: 1 }),
  s("saul", "Saul rejeitado", "Saul rejeitou a palavra do SENHOR, e o SENHOR o rejeitou como rei.", ref("1Sam", 15, 23), { tipo: "voltar", casas: 1 }),

  // Ficar de fora
  s("exilio", "Levados cativos", "Nebuzaradã, o chefe da guarda, incendiou Jerusalém e levou cativo o resto do povo.", ref("2Kgs", 25, 9, 11), { tipo: "exilio" }),
  s("jonas", "Jonas no grande peixe", "Jonas tentou fugir da presença do SENHOR e ficou três dias e três noites no ventre do grande peixe.", ref("Jonah", 1, 3, 17), { tipo: "exilio" }),

  // Escolher outra equipe
  s("babel", "Torre de Babel", "Deus confundiu a língua dos construtores e os espalhou pela terra.", ref("Gen", 11, 7, 8), { tipo: "escolher", casas: 1 }),
  s("rute", "Rute e Noemi", "Rute disse a Noemi que iria aonde ela fosse, e as duas chegaram a Belém.", ref("Ruth", 1, 16, 19), { tipo: "junto", casas: 1 }),
  s("davi-saul", "Davi poupa Saul", "Na caverna, Davi poupou Saul.", ref("1Sam", 24, 10), { tipo: "dar", casas: 1 }),
])

export type SituacaoId = string

export function getSituacao(id: SituacaoId): Situacao {
  return SITUACOES.find((x) => x.id === id) ?? SITUACOES[0]
}

/** Casas especiais que precisam escolher outra equipe (ou pessoa). */
export const escolheOutro = (e: Efeito) => e.tipo === "escolher" || e.tipo === "junto" || e.tipo === "dar"

/** A regra que a casa aplica, dita para quem parou nela. */
export function regraDoEfeito(e: Efeito, equipes: boolean): string {
  const casas = (n: number) => (n === 1 ? "1 casa" : `${n} casas`)
  const outra = equipes ? "uma equipe" : "alguém"
  switch (e.tipo) {
    case "andar":
      return equipes ? `Andem mais ${casas(e.casas)}.` : `Ande mais ${casas(e.casas)}.`
    case "voltar":
      return equipes ? `Voltem ${casas(e.casas)}.` : `Volte ${casas(e.casas)}.`
    case "exilio":
      return equipes ? "Fiquem de fora na próxima vez." : "Fique de fora na próxima vez."
    case "denovo":
      return equipes ? "Joguem mais uma vez." : "Jogue mais uma vez."
    case "arraial":
      return "Rodada para todos: um de vocês representa e todas as equipes tentam. Em Perguntas, cada equipe manda alguém para perguntar. Quem acertar primeiro anda."
    case "escolher":
      return equipes ? `Escolham ${outra} para voltar ${casas(e.casas)}.` : `Escolha ${outra} para voltar ${casas(e.casas)}.`
    case "junto":
      return equipes ? `Escolham ${outra} para andar ${casas(e.casas)} junto com vocês.` : `Escolha ${outra} para andar ${casas(e.casas)} junto com você.`
    case "dar":
      return equipes ? `Escolham ${outra} para andar ${casas(e.casas)}.` : `Escolha ${outra} para andar ${casas(e.casas)}.`
  }
}

/** Bom, ruim, para todos ou de escolha: só para a cor da casa. */
export function tomDoEfeito(e: Efeito): "bom" | "ruim" | "todos" | "escolha" {
  if (e.tipo === "andar" || e.tipo === "denovo") return "bom"
  if (e.tipo === "voltar" || e.tipo === "exilio") return "ruim"
  return e.tipo === "arraial" ? "todos" : "escolha"
}
