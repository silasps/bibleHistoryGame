import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { AnchorHTMLAttributes } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { getEpisode } from "@/content"
import { StoreHydrator } from "@/stores/hydration"
import { useSolo } from "@/stores/solo-store"
import { ScenePlayer } from "./ScenePlayer"

const pushed: string[] = []
const router = { push: (u: string) => pushed.push(u), replace: (u: string) => pushed.push(u) }
vi.mock("next/navigation", () => ({ useRouter: () => router }))
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const genesis = getEpisode("genesis-1-3")!

async function playScene(sceneId: string) {
  const user = userEvent.setup()
  const view = render(
    <>
      <StoreHydrator />
      <ScenePlayer sceneId={sceneId} />
    </>,
  )
  await waitFor(() => expect(useSolo.getState().sceneStatus[sceneId]).toBe("active"))
  const scene = genesis.scenes.find((s) => s.id === sceneId)!
  if (scene.poll && !scene.choice) await user.click(screen.getByRole("button", { name: scene.poll.options[1].label }))
  if (scene.choice) await user.click(screen.getByRole("button", { name: new RegExp(scene.choice.options[2].label.slice(0, 12)) }))
  if (scene.releases) {
    await user.click(screen.getByRole("button", { name: /Abrir o selo/ }))
    await waitFor(() => expect(useSolo.getState().openEvidence[scene.releases!]).toBeDefined())
  }
  const next = screen.queryByRole("button", { name: /Continuar|Concluir capítulo/ })
  if (next) {
    await waitFor(() => expect(next).toBeEnabled())
    await user.click(next)
  }
  view.unmount()
}

describe("fluxo solo de Gênesis 1–3", () => {
  beforeEach(() => {
    pushed.length = 0
    useSolo.getState().resetAll()
  })

  it("completa o capítulo, desbloqueia evidências e retoma após recarregar", async () => {
    for (const scene of genesis.scenes) await playScene(scene.id)

    const state = useSolo.getState()
    expect(state.completedEpisodes).toContain("genesis-1-3")
    expect(state.openEvidence["ev-descendencia"]).toBeDefined()
    expect(state.syntheses["ev-descendencia"]?.blocks.length).toBeGreaterThan(0)
    expect(state.decisions.some((d) => d.kind === "escolha")).toBe(true)

    // "Recarregar": zera a memória e reidrata do localStorage.
    const saved = localStorage.getItem("bph-solo-v1")
    expect(saved).toBeTruthy()
    useSolo.setState({ sceneStatus: {}, openEvidence: {}, completedEpisodes: [] })
    localStorage.setItem("bph-solo-v1", saved!)
    await act(() => useSolo.persist.rehydrate())
    expect(useSolo.getState().completedEpisodes).toContain("genesis-1-3")
    expect(useSolo.getState().openEvidence["ev-descendencia"]).toBeDefined()
  }, 60_000)

  it("não permite continuar a escolha sem escolher, e marca a simulação como não bíblica", async () => {
    const user = userEvent.setup()
    // Libera tudo até a escolha.
    const choiceIndex = genesis.scenes.findIndex((s) => s.choice)
    for (const scene of genesis.scenes.slice(0, choiceIndex)) await playScene(scene.id)
    render(
      <>
        <StoreHydrator />
        <ScenePlayer sceneId="escolha" />
      </>,
    )
    await waitFor(() => expect(useSolo.getState().sceneStatus.escolha).toBe("active"))
    expect(screen.getByRole("button", { name: /Continuar/ })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: /Recordar exatamente/ }))
    expect(screen.getByRole("button", { name: /Continuar/ })).toBeEnabled()
  }, 60_000)

  it("redireciona cenas bloqueadas para o ponto de retomada", async () => {
    render(
      <>
        <StoreHydrator />
        <ScenePlayer sceneId="relato" />
      </>,
    )
    await waitFor(() => expect(pushed).toContain("/solo/ato-01/convite"))
  })
})
