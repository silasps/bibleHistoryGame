import { describe, expect, it } from "vitest"
import { getEpisode, getEvidence } from "@/content"
import type { Episode } from "@/content/schema"
import {
  answerPoll,
  canComplete,
  choose,
  completeScene,
  emptyProgress,
  enterScene,
  openSeal,
  resetEpisode,
  resumeSceneId,
  startEpisode,
  statusOf,
  type SoloProgress,
} from "./solo-progress"

const genesis = getEpisode("genesis-1-3") as Episode

/** Joga o episódio inteiro, escolhendo `choice` na cena de escolha. */
function playThrough(choice: string): SoloProgress {
  let p = startEpisode(emptyProgress(), genesis)
  for (const scene of genesis.scenes) {
    p = enterScene(p, genesis, scene, 1)
    if (scene.choice) p = choose(p, genesis, scene, choice, 2)
    else if (scene.poll) p = answerPoll(p, genesis, scene, scene.poll.options[0].id, 2)
    if (scene.releases) p = openSeal(p, scene, getEvidence, 3)
    expect(canComplete(p, scene)).toBe(true)
    p = completeScene(p, genesis, scene, getEvidence, 4)
  }
  return p
}

describe("progresso solo", () => {
  it("só a primeira cena começa disponível", () => {
    const p = startEpisode(emptyProgress(), genesis)
    expect(statusOf(p, genesis.scenes[0].id)).toBe("ready")
    expect(statusOf(p, genesis.scenes[1].id)).toBe("locked")
  })

  it("não deixa concluir escolha sem escolher", () => {
    let p = startEpisode(emptyProgress(), genesis)
    for (const scene of genesis.scenes) {
      p = enterScene(p, genesis, scene, 1)
      if (scene.choice) {
        expect(canComplete(p, scene)).toBe(false)
        return
      }
      if (scene.poll) p = answerPoll(p, genesis, scene, scene.poll.options[0].id, 1)
      p = completeScene(p, genesis, scene, getEvidence, 1)
    }
  })

  it("completa Gênesis 1–3 e desbloqueia as evidências previstas", () => {
    const p = playThrough("comer")
    expect(p.completedEpisodes).toContain("genesis-1-3")
    expect(Object.keys(p.openEvidence).sort()).toEqual(
      ["ev-criacao-boa", "ev-imagem", "ev-limite", "ev-suspeita", "ev-deus-procura", "ev-descendencia"].sort(),
    )
    // A conexão com Abraão fica selada como futura.
    expect(p.seenEvidence["ev-abraao-descendencia"]).toBeDefined()
    expect(p.openEvidence["ev-abraao-descendencia"]).toBeUndefined()
  })

  it("a evidência de conexão só abre depois do gatilho", () => {
    let p = startEpisode(emptyProgress(), genesis)
    const sealScene = genesis.scenes.find((s) => s.releases)!
    // Tentar abrir o selo antes de chegar à cena não tem efeito.
    p = openSeal(p, sealScene, getEvidence, 1)
    expect(p.openEvidence["ev-descendencia"]).toBeUndefined()
  })

  it("qualquer escolha leva ao mesmo relato canônico", () => {
    const options = genesis.scenes.find((s) => s.choice)!.choice!.options.map((o) => o.id)
    const results = options.map((o) => playThrough(o))
    for (const r of results) expect(r.openEvidence).toEqual(expect.objectContaining({ "ev-deus-procura": 4 }))
    const canonical = genesis.scenes.find((s) => s.type === "canonical_reveal")!
    // A cena canônica não depende da escolha: não tem variantes.
    expect(canonical.hypothetical).toBeUndefined()
    expect(new Set(results.map((r) => r.decisions.find((d) => d.kind === "escolha")?.optionId))).toEqual(new Set(options))
  })

  it("replay apaga só o episódio e retoma do início", () => {
    const p = resetEpisode(playThrough("lembrar"), genesis)
    expect(p.completedEpisodes).not.toContain("genesis-1-3")
    expect(Object.keys(p.openEvidence)).toEqual([])
    expect(resumeSceneId(startEpisode(p, genesis), genesis)).toBe(genesis.scenes[0].id)
  })
})
