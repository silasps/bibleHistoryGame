import { allPresenterNotes } from "@/content/private"
import { allReleasedSyntheses } from "@/content/released"
import { getSceneEntry, sequences } from "@/content"
import type { Scene } from "@/content/schema"
import { createSession, reduceAudience, reduceHost, type Ctx, type HostCommand, type SessionState } from "@/domain/session"

/** Todo texto server-only: não pode aparecer em telão, palco ou celular antes da hora. */
export const secretTexts = [
  ...allReleasedSyntheses().flatMap((s) => [s.classificationNote, ...s.blocks.map((b) => b.text)]),
  ...allPresenterNotes().flatMap((n) => [...n.talkingPoints, n.transitionHint ?? ""]).filter(Boolean),
]

/** Gera estados representativos de cada cena: inicial, enquete aberta/fechada/resultado, liberado, pausado, momento. */
export function* everyState(sequenceId: string): Generator<{ state: SessionState; scenes: Scene[] }> {
  const seq = sequences.find((s) => s.id === sequenceId)!
  const scenes = seq.sceneIds.map((id) => getSceneEntry(id)!.scene)
  const ctx = (now: number): Ctx => ({ now, narrative: { scenes } })
  let state = createSession({ roomCode: "TESTE1", sequenceId, sceneIds: seq.sceneIds, now: 0 })
  yield { state, scenes }
  state = reduceHost(state, { type: "start" }, ctx(1)).state
  state = reduceAudience(state, { type: "join", participantId: "p1" }, ctx(1)).state
  for (let i = 0; i < scenes.length; i++) {
    state = reduceHost(state, { type: "goto", index: i }, ctx(i * 10)).state
    yield { state, scenes }
    const scene = scenes[i]
    const cmds: HostCommand[] = []
    if (scene.poll) {
      cmds.push({ type: "open_poll", pollId: scene.poll.id })
      cmds.push({ type: "close_poll", pollId: scene.poll.id })
      cmds.push({ type: "show_results", pollId: scene.poll.id })
    }
    if (scene.releases) cmds.push({ type: "release", evidenceId: scene.releases })
    cmds.push(...(scene.steps ?? []).map(() => ({ type: "step", delta: 1 }) as const))
    if (scene.visual === "yard-train") cmds.push({ type: "cue", kind: "muro" }, { type: "cue", kind: "trem" })
    cmds.push({ type: "moment", kind: "haja-luz" }, { type: "pause" }, { type: "resume" })
    for (const cmd of cmds) {
      state = reduceHost(state, cmd, ctx(i * 10 + 1)).state
      if (cmd.type === "open_poll" && scene.poll) {
        state = reduceAudience(
          state,
          { type: "vote", participantId: "p1", pollId: scene.poll.id, optionId: scene.poll.options[0].id },
          ctx(i * 10 + 1),
        ).state
      }
      yield { state, scenes }
    }
  }
}

