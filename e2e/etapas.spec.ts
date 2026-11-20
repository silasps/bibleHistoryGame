import { expect, test, type Page } from "@playwright/test"

test.use({ reducedMotion: "reduce" })

/** Avança pelos passos da etapa até o minijogo (o botão trava em "Jogue para continuar"). */
async function untilGame(page: Page) {
  const next = page.getByRole("button", { name: /Continuar|Jogue para continuar/ })
  for (let i = 0; i < 40; i++) {
    if (/Jogue para continuar/.test((await next.textContent()) ?? "")) return
    await next.click()
  }
  throw new Error("o minijogo não apareceu")
}

/** Na tela "Como jogar", começa o jogo. */
async function play(page: Page) {
  await page.getByRole("button", { name: /^Começar/ }).click()
}

test("Etapa 2 no solo: o jogo da arca fica no slide de Noé, antes do Dilúvio, e entrega o arco-íris", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/solo")
  await page.getByRole("link", { name: /O mundo se afasta/ }).click()
  await page.waitForURL(/\/solo\/etapa\/2$/)
  await untilGame(page)
  await expect(page.getByRole("heading", { name: "Noé", exact: true })).toBeVisible()
  await expect(page.getByText(/75 segundos/)).toBeVisible()
  await play(page)
  for (let i = 0; i < 7; i++) await page.getByRole("button", { name: "Par de animais" }).first().click()
  await expect(page.getByText("O Senhor fecha a porta da arca")).toBeVisible()
  await expect(page.getByText(/Você fez \d/)).toBeVisible()
  await expect(page.getByText(/Relíquia: O arco-íris/)).toBeVisible()
  await page.getByRole("button", { name: /Continuar/ }).click()
  // Depois do jogo, o Dilúvio.
  await expect(page.getByRole("heading", { name: "Dilúvio" })).toBeVisible()
})

test("todos os minijogos das etapas 3 a 11 chegam ao desfecho, com pontos e relíquia", async ({ page }) => {
  test.setTimeout(300_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.clock.install()
  const tap = async (name: string | RegExp, times: number) => {
    for (let i = 0; i < times; i++) await page.getByRole("button", { name }).first().click()
  }
  const plays: Record<number, [string, () => Promise<void>]> = {
    // Estrelas: conta até o tempo acabar.
    3: ["Uma descendência que não se pode contar", async () => {
      await tap("Contar estrela", 6)
      await page.clock.runFor(76_000)
    }],
    4: ["A filha do faraó encontra o menino", async () => {
      await tap("Vedar uma fresta", 5)
      await page.clock.runFor(1_000)
      await tap("Colocar o menino", 1)
      await page.clock.runFor(1_500)
      await tap("Levar o cesto", 1)
      await page.clock.runFor(2_000)
    }],
    5: ["O mar volta e cobre o exército; o Senhor livra Israel", async () => {
      await tap("Estender o cajado", 1)
      await tap("Atravessar um grupo", 6)
      await page.clock.runFor(3_000)
    }],
    // Maná: se a máquina estiver lenta e os 75 s acabarem antes, o jogo termina no mesmo desfecho (com pontos e relíquia).
    6: ["No sétimo dia, descanso", async () => {
      const finale = page.getByText("No sétimo dia, descanso")
      for (const n of [5, 5, 5, 5, 5, 10]) {
        // Clique com limite: se o desfecho cobrir a tela no meio do clique, o laço só segue.
        for (let i = 0; i < n && !(await finale.isVisible()); i++) await page.getByRole("button", { name: "Juntar o maná" }).first().click({ timeout: 5_000 }).catch(() => {})
        if (await finale.isVisible()) break
        await page.clock.runFor(1_800)
      }
    }],
    7: ["As muralhas caem", async () => {
      await page.clock.runFor(1_500)
      await tap("Dar uma volta", 7)
      await tap("📯 Tocar as trombetas e gritar", 1)
      await page.clock.runFor(2_000)
    }],
    8: ["Davi vence com uma funda e uma pedra", async () => {
      await tap("Lançar", 1)
      await page.clock.runFor(76_000)
    }],
    9: ["O fogo do Senhor cai e consome tudo", async () => {
      await tap("Colocar pedra", 12)
      await tap("Colocar a lenha", 1)
      await tap("Colocar o novilho", 1)
      await tap("Derramar uma talha de água", 12)
      await tap(/Segure para orar/, 1)
      await page.clock.runFor(5_000)
    }],
    10: ["Nínive se arrepende, e Deus tem compaixão", async () => {
      for (let i = 0; i < 5; i++) {
        await tap("Próximo lugar", 1)
        await page.clock.runFor(2_000)
      }
      await page.clock.runFor(4_000)
    }],
    11: ["Deus dá um coração novo", async () => {
      await tap("Tocar no coração de pedra", 36)
      await page.clock.runFor(3_000)
    }],
  }
  for (const [n, [finale, run]] of Object.entries(plays)) {
    await page.goto(`/solo/etapa/${n}`)
    await untilGame(page)
    await play(page)
    await run()
    await expect(page.getByText(finale).first(), `etapa ${n}`).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/Você fez \d/), `etapa ${n}`).toBeVisible()
    await expect(page.getByText(/Relíquia:/).first(), `etapa ${n}`).toBeVisible()
  }
})

test("ao vivo: Jogar agora no slide do tópico, o celular joga, Próximo mostra o pódio e o segundo Próximo segue", async ({ context }) => {
  const host = await context.newPage()
  await host.goto("/presenter")
  await host.getByRole("button", { name: "Abrir demonstração" }).click()
  await host.waitForURL(/\/presenter\/[A-Z0-9]{6}\?modo=demo/)
  const code = host.url().match(/presenter\/([A-Z0-9]{6})/)![1]
  const projector = await context.newPage()
  await projector.setViewportSize({ width: 1600, height: 900 })
  await projector.goto(`/projector/${code}?modo=demo`)
  const phone = await context.newPage()
  await phone.setViewportSize({ width: 390, height: 844 })
  await phone.goto(`/join/${code}?modo=demo`)
  await phone.getByPlaceholder(/Como quer ser chamado/).fill("Ana")
  await phone.getByRole("button", { name: "Entrar" }).click()

  await host.getByRole("button", { name: /Começar a apresentação/ }).click()
  await host.getByRole("navigation", { name: "Roteiro da sequência" }).getByRole("button", { name: /^\d+ Noé 🎮/ }).click()
  // Antes do "Jogar agora", o celular mostra o tópico.
  await expect(phone.getByText(/Este tópico tem um jogo/)).toBeVisible()
  await host.getByRole("button", { name: "Jogar agora" }).click()
  await play(phone)
  await phone.getByRole("button", { name: "Par de animais" }).first().click()
  await expect(projector.getByLabel("Jogo ao vivo")).toContainText("1 jogando", { timeout: 10_000 })
  await expect(projector.getByLabel("Jogo ao vivo")).toContainText("Ana")
  await host.getByRole("button", { name: /Mostrar pódio/ }).click()
  await expect(projector.getByText("Fim do jogo")).toBeVisible({ timeout: 10_000 })
  await expect(phone.getByText(/Você ficou em 1º/)).toBeVisible({ timeout: 10_000 })
  // O pódio fica no próprio slide: o painel ainda está em Noé.
  await expect(host.getByRole("heading", { level: 1, name: "Noé", exact: true })).toBeVisible()
  await host.getByRole("button", { name: /Próxima/ }).click()
  await expect(projector.getByText("Fim do jogo")).toBeHidden()
  await expect(projector.locator("[data-surface=projector]")).toContainText("Dilúvio")
})
