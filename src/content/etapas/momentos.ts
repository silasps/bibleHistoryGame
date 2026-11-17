import type { Linha } from "../overview/aprofundar"
import { ref } from "../refs"

// Momentos novos (Rodada 4): cenas com ilustração, como as falas do autor, mas
// com texto em RASCUNHO tirado da Bíblia (NAA, paráfrase) e do material do autor.
// `principal` vazio = o momento aparece só com a imagem (aguardando o autor).

export interface Momento {
  principal?: Linha
  passos: Linha[]
  /** Material de apoio (Área de preparação e "Para aprofundar" no solo), nunca no telão. */
  apoio?: Linha[]
}

const AULA_PENTATEUCO = "Aula Pentateuco (semana 2)"
const RESUMO_6 = "Seu resumo (semana 6, Prof. Diego)"

export const MOMENTOS: Record<string, Momento> = {
  // Briefing, item 5 (Êx 32).
  bezerro: {
    principal: { text: "Enquanto Moisés recebe as instruções de Deus no monte, o povo se cansa de esperar.", refs: [ref("Exod", 32, 1)], kind: "narracao", fonte: AULA_PENTATEUCO },
    passos: [
      { text: "Arão faz um bezerro de ouro, e o povo o adora e oferece sacrifícios a ele.", refs: [ref("Exod", 32, 2, 6)], kind: "narracao", fonte: AULA_PENTATEUCO },
      { text: "Pouco antes, o povo tinha prometido: faremos tudo o que o Senhor falou.", refs: [ref("Exod", 24, 3, 7)], kind: "narracao", fonte: AULA_PENTATEUCO },
      { text: "Moisés quebra as tábuas ao pé do monte: a aliança tinha sido quebrada.", refs: [ref("Exod", 32, 19)], kind: "interpretacao", fonte: AULA_PENTATEUCO },
      { text: "Moisés intercede, e Deus não destrói o povo: renova a aliança e se revela compassivo e paciente.", refs: [ref("Exod", 32, 11, 14), ref("Exod", 34, 6, 7)], kind: "narracao", fonte: AULA_PENTATEUCO },
    ],
  },
  // Briefing, item 20 (Dn 6): já sob Dario, o medo, depois da queda da Babilônia.
  "daniel-cova": {
    principal: { text: "Já sob Dario, o medo, Daniel continua orando três vezes por dia, mesmo proibido.", refs: [ref("Dan", 6, 1, 10)], kind: "narracao", fonte: RESUMO_6 },
    passos: [
      { text: "Os inimigos usam a lei do rei contra ele, e Daniel é lançado na cova dos leões.", refs: [ref("Dan", 6, 4, 16)], kind: "narracao", fonte: RESUMO_6 },
      { text: "Deus envia o seu anjo e fecha a boca dos leões.", refs: [ref("Dan", 6, 22)], kind: "narracao", fonte: RESUMO_6 },
      { text: "O rei reconhece: o Deus de Daniel é o Deus vivo, e o reino dele não será destruído.", refs: [ref("Dan", 6, 26)], kind: "narracao", fonte: RESUMO_6 },
    ],
  },
  // Briefing, item 3: o autor vai mandar o material de Jó. Até lá, só a imagem.
  jo: { passos: [] },
  // Complemento do briefing (item 6): fecho do Antigo Testamento. Jesus é dito por extenso só aqui (decisão do autor).
  plenitude: {
    principal: { text: "Reinos se levantaram. Impérios caíram. Gerações passaram. Mas Deus não havia esquecido sua promessa.", refs: [ref("Gal", 4, 4)], kind: "interpretacao", fonte: "Seu briefing (complemento, 16/11/2026)" },
    passos: [
      { text: "A história estava sendo preparada para a chegada daquele que mudaria tudo.", refs: [ref("Gal", 4, 4)], kind: "interpretacao", fonte: "Seu briefing (complemento, 16/11/2026)" },
      { text: "Persas, gregos e romanos: Deus estava preparando o mundo para a chegada do Messias.", refs: [ref("Gal", 4, 4)], kind: "interpretacao", fonte: "Aula do Prof. Diego (13/11) · Período Interbíblico" },
      { text: "Quando chegou a plenitude do tempo, Deus enviou o seu Filho, nascido de mulher.", refs: [ref("Gal", 4, 4)], kind: "parafrase", fonte: "Aula do Prof. Diego (13/11) · “a plenitude dos tempos”" },
      { text: "Então, Jesus nasce.", refs: [ref("Matt", 2, 1)], kind: "narracao", fonte: "Aula do Prof. Diego (13/11) · Período Interbíblico" },
    ],
  },
}
