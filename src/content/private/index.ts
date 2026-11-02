import "server-only"

import { z } from "zod"
import { PresenterNotes } from "../schema"

// Roteiro privado do apresentador, para estudo na Área de preparação.
// Nunca aparece no telão nem no painel de palco.
const NOTES = z.array(PresenterNotes).parse([
  {
    sceneId: "convite",
    talkingPoints: [
      "Apresente a ideia de investigação: o público vai votar, receber pistas e montar um arquivo.",
      "Deixe claro desde o início: escolhas mudam a reflexão, não o relato bíblico.",
    ],
  },
  {
    sceneId: "prologo-criacao",
    talkingPoints: [
      "Ordem e bondade: Deus separa e preenche; o refrão “era bom” culmina em “muito bom” (Gn 1:31).",
      "Imagem de Deus (Gn 1:26–27): dignidade e responsabilidade.",
    ],
    transitionHint: "Termine perguntando: se o começo foi muito bom, o que aconteceu?",
  },
  {
    sceneId: "pergunta-mal",
    talkingPoints: [
      "Abra a votação e deixe o público responder sem comentar as opções.",
      "Revele o resultado só depois de fechar; não corrija ninguém — é uma hipótese inicial.",
    ],
  },
  {
    sceneId: "jardim",
    talkingPoints: [
      "Liberdade ampla, um único limite (Gn 2:16–17). Use o quiz para fixar o número: uma árvore.",
      "O limite aparece dentro de uma relação de confiança.",
    ],
  },
  {
    sceneId: "tentacao",
    talkingPoints: [
      "Mostre a estratégia: exagerar o limite (3:1), negar a consequência (3:4), suspeitar de Deus (3:5).",
      "Lembre que a fala dramatizada na tela é dramatização.",
    ],
  },
  {
    sceneId: "conexao-pausa",
    talkingPoints: [
      "Momento de conexão. Fale de memória sobre Gênesis 3:15: inimizade, descendência, cabeça e calcanhar.",
      "Distinga o que o texto diz (promessa de vitória sobre a serpente) da leitura cristã (Cristo como o descendente), apoiada em ecos do NT: Rm 16:20; Hb 2:14; Ap 12:9.",
      "Quando terminar, avance para a pista e só então libere nos celulares.",
    ],
  },
  {
    sceneId: "evidencia-descendencia",
    talkingPoints: ["Libere a pista depois de concluir a fala. O telão mostra só a referência, nunca a explicação."],
  },
  {
    sceneId: "cliffhanger",
    talkingPoints: [
      "Plante a pergunta: quem é essa descendência?",
      "Aponte para Abraão (Gn 12:3) sem antecipar Gálatas 3:16 — essa conexão fica selada para o próximo episódio.",
    ],
  },
  {
    sceneId: "muro-alianca",
    talkingPoints: [
      "Êxodo 20:2: Deus se apresenta como libertador antes de dar os mandamentos.",
      "Diga explicitamente os limites da analogia: santidade, culto, justiça, identidade e aliança.",
    ],
  },
  {
    sceneId: "motoristas-santidade",
    talkingPoints: [
      "Santidade não é medir a distância da borda, mas orientar a vida para Deus (Lv 19:2).",
      "Faça as duas ressalvas: não é salvação por esforço; nem toda proximidade com o difícil é pecado.",
    ],
  },
])

export function getPresenterNotes(sceneId: string) {
  return NOTES.find((n) => n.sceneId === sceneId)
}

export function allPresenterNotes() {
  return NOTES
}
