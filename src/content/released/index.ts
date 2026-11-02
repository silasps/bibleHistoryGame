import "server-only"

import { z } from "zod"
import { block, ref } from "../refs"
import { ReleasedSynthesis } from "../schema"

// Sínteses das conexões. Só saem do servidor depois da liberação (ao vivo)
// ou do "abrir o selo" (solo). Nunca importe este módulo em componente cliente.
const SYNTHESES = z.array(ReleasedSynthesis).parse([
  {
    evidenceId: "ev-descendencia",
    classificationNote:
      "O anúncio da vitória da descendência da mulher sobre a serpente está explícito no texto. A identificação dessa descendência com Cristo é uma leitura cristã apoiada em ecos do Novo Testamento — por isso está marcada como interpretação.",
    blocks: [
      block(
        "parafrase",
        "Dirigindo-se à serpente, Deus anuncia inimizade entre ela e a mulher, e entre a descendência de uma e a da outra. Um descendente da mulher ferirá a cabeça da serpente, e a serpente lhe ferirá o calcanhar.",
        [ref("Gen", 3, 14, 15)],
      ),
      block(
        "interpretacao",
        "É o primeiro anúncio, na narrativa bíblica, de que o mal será derrotado — e ele vem no meio das consequências da queda, antes de qualquer pedido de perdão.",
      ),
      block(
        "interpretacao",
        "No hebraico, “descendência” (literalmente, semente) pode indicar um grupo ou um indivíduo; o pronome que segue está no singular, o que alimenta a leitura de um descendente específico.",
      ),
      block(
        "interpretacao",
        "Na tradição cristã, este versículo ficou conhecido como “protoevangelho” — o primeiro anúncio do evangelho —, lido como apontando para Cristo.",
      ),
      block(
        "interpretacao",
        "O Novo Testamento não cita Gênesis 3:15 como cumprido, mas há ecos: Paulo fala do Deus da paz esmagando Satanás debaixo dos pés dos crentes; Hebreus diz que Jesus, por sua morte, destruiu aquele que tem o poder da morte; e o Apocalipse identifica a antiga serpente com o diabo.",
        [ref("Rom", 16, 20), ref("Heb", 2, 14), ref("Rev", 12, 9)],
      ),
    ],
  },
  {
    evidenceId: "ev-abraao-descendencia",
    classificationNote:
      "A bênção às famílias da terra é promessa explícita a Abraão. A leitura do “descendente” como Cristo é feita pelo próprio Paulo em Gálatas 3:16.",
    blocks: [
      block(
        "parafrase",
        "Deus promete a Abrão que, por meio dele, serão abençoadas todas as famílias da terra; mais tarde, que na sua descendência serão abençoadas todas as nações.",
        [ref("Gen", 12, 3), ref("Gen", 22, 18)],
      ),
      block(
        "parafrase",
        "Paulo argumenta que as promessas foram feitas a Abraão e ao seu descendente, no singular, e identifica esse descendente com Cristo.",
        [ref("Gal", 3, 16)],
      ),
    ],
  },
])

const byEvidence = new Map(SYNTHESES.map((s) => [s.evidenceId, s]))

export function getReleasedSynthesis(evidenceId: string): ReleasedSynthesis | undefined {
  return byEvidence.get(evidenceId)
}

/** Usado apenas pelo teste de vazamento e pelo verificador de bundle. */
export function allReleasedSyntheses(): ReleasedSynthesis[] {
  return SYNTHESES
}
