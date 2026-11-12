import { ref } from "../refs"
import type { FalaId } from "./falas"

// Material de apoio que o AUTOR enviou para um momento (revisão de 11/11/2026).
// Aparece na Área de preparação e no jogo solo ("Para aprofundar").
// Nunca no telão nem no painel de palco: liga o momento ao plano (Jo 1:29).

export interface Apoio {
  text: string
  refs: ReturnType<typeof ref>[]
  kind: "interpretacao"
}

export const APOIO: Partial<Record<FalaId, Apoio>> = {
  vestes: {
    text: "O próprio Deus providenciou uma cobertura duradoura para a vergonha causada pelo pecado. As peles exigiam a morte de animais, introduzindo o princípio de que o pecado traz a morte e que uma vida pode ser dada para cobrir a culpa. Embora o texto não descreva um sacrifício formal, a provisão de Deus antecipa os sacrifícios prescritos posteriormente sob a Lei Mosaica, onde o sangue fazia expiação porque a vida está no sangue (Lv 17:11). Em última análise, isso direciona a atenção para Jesus Cristo, o Cordeiro de Deus, cuja morte fornece a única cobertura suficiente para o pecado (Jo 1:29).",
    refs: [ref("Gen", 3, 21), ref("Lev", 17, 11), ref("John", 1, 29)],
    kind: "interpretacao",
  },
}
