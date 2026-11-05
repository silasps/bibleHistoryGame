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

test("Etapa 2 no solo: levar os pares à arca entrega o arco-íris", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/solo")
  await page.getByRole("link", { name: /O mundo se afasta/ }).click()
  await page.waitForURL(/\/solo\/etapa\/2$/)
  await untilGame(page)
  for (let i = 0; i < 7; i++) await page.getByRole("button", { name: "Juntar" }).first().click()
  await expect(page.getByText("O Senhor fecha a porta da arca")).toBeVisible()
  await expect(page.getByText(/Relíquia: O arco-íris/)).toBeVisible()
  await page.getByRole("button", { name: /Continuar/ }).click()
  // Depois do jogo vêm os momentos da fala do autor.
  await expect(page.getByRole("heading", { name: "A bondade de Deus no juízo" })).toBeVisible()
})

test("Etapa 8 no solo: a funda sempre acerta e a etapa termina com a relíquia", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/solo/etapa/8")
  await untilGame(page)
  await page.getByRole("button", { name: "Lançar" }).click()
  await expect(page.getByText("Davi vence com uma funda e uma pedra")).toBeVisible()
  const next = page.getByRole("button", { name: /Continuar/ })
  for (let i = 0; i < 40 && (await next.isVisible()); i++) await next.click()
  await expect(page.getByText(/Etapa 8 concluída/)).toBeVisible()
  await expect(page.getByText(/Relíquia: A funda e a pedra/)).toBeVisible()
})

test("na apresentação, o jogo da etapa 2 é opcional, roda no celular e soma no telão", async ({ context }) => {
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
  await phone.getByRole("button", { name: "Entrar" }).click()

  await host.getByRole("button", { name: /Começar a apresentação/ }).click()
  const scene = host.getByRole("navigation", { name: "Roteiro da sequência" }).getByRole("button", { name: /Para dentro da arca/ })
  await expect(scene).toContainText("opcional")
  await scene.click()
  await expect(projector.locator("[data-surface=projector]")).toContainText("Para dentro da arca")
  await phone.getByRole("button", { name: "Juntar" }).first().click()
  await expect(projector.getByText(/1 pessoa jogando/)).toBeVisible({ timeout: 10_000 })
})

test("todos os minijogos das etapas 3 a 11 chegam ao desfecho e entregam a relíquia", async ({ page }) => {
  test.setTimeout(240_000)
  await page.setViewportSize({ width: 390, height: 844 })
  const tap = async (name: string, times: number) => {
    for (let i = 0; i < times; i++) await page.getByRole("button", { name }).first().click()
  }
  const plays: Record<number, [string, () => Promise<void>]> = {
    3: ["Uma descendência que não se pode contar", () => tap("Juntar", 30)],
    4: ["A filha do faraó encontra o menino", async () => page.waitForTimeout(19_000)],
    5: ["O povo atravessa em terra seca", async () => {
      const hold = page.getByRole("button", { name: /Segure aqui/ })
      await hold.hover()
      await page.mouse.down()
      await page.waitForTimeout(6_800)
      await page.mouse.up()
    }],
    6: ["No sétimo dia, descanso", async () => {
      for (const n of [5, 5, 5, 5, 5, 10]) {
        await tap("Juntar", n)
        await page.waitForTimeout(1_800)
      }
    }],
    7: ["As muralhas caem", async () => {
      await tap("Dar uma volta", 13)
      await page.getByRole("button", { name: "Tocar as trombetas e gritar" }).click()
    }],
    9: ["O fogo do Senhor cai e consome tudo", async () => {
      for (let round = 0; round < 3; round++) {
        await tap("Juntar", 4)
        await page.waitForTimeout(900)
      }
    }],
    10: ["Nínive se arrepende, e Deus tem compaixão", () => tap("Revelar", 1)],
    11: ["Deus dá um coração novo", () => tap("Revelar", 1)],
  }
  for (const [n, [finale, play]] of Object.entries(plays)) {
    await page.goto(`/solo/etapa/${n}`)
    await untilGame(page)
    await play()
    await expect(page.getByText(finale), `etapa ${n}`).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/Relíquia:/).first(), `etapa ${n}`).toBeVisible()
  }
})
