import { expect, test } from "@playwright/test"

// Movimento reduzido: as animações viram instantâneas e o teste não depende de tempo.
test.use({ reducedMotion: "reduce" })

test("Etapa 1 no solo: Criação, jardim, árvore, Queda, vestes e a semente", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/solo")
  await page.getByRole("link", { name: /O começo/ }).click()
  await page.waitForURL(/\/solo\/etapa\/1$/)
  await expect(page.getByRole("heading", { name: "O começo" })).toBeVisible()
  await page.getByRole("button", { name: /Continuar/ }).click()

  await page.getByRole("button", { name: /haja luz/ }).click()
  for (let day = 2; day <= 8; day++) {
    await expect(page.getByText(`${day} de 8`)).toBeVisible()
    await page.getByRole("button", { name: "Revelar" }).click()
  }
  await page.getByRole("button", { name: /Continuar/ }).click()

  // Jardim: anda até a parede invisível do fim do caminho.
  const forward = page.getByRole("button", { name: "Andar para frente" })
  await expect(forward).toBeVisible()
  for (let i = 0; i < 20 && (await forward.isVisible()); i++) await forward.click()
  await page.getByRole("button", { name: /Continuar/ }).click()

  // Árvore: a última jogada sempre vai no fruto.
  const launch = page.getByRole("button", { name: "Lançar" })
  for (let i = 0; i < 5 && (await launch.isVisible()); i++) await launch.click()
  await expect(page.getByText("Eles se esconderam da presença do Senhor Deus")).toBeVisible()
  await expect(page.getByLabel("O caminho da árvore da vida ficou guardado")).toBeVisible()

  await page.getByRole("button", { name: /Continuar/ }).click()
  await expect(page.getByText(/Relíquia: As vestes de pele/)).toBeVisible()
  await expect(page.getByText(/primeiro sacrifício para vestir o homem/)).toBeVisible()
  // Material de apoio do autor: fechado até o jogador abrir.
  await page.getByText("Para aprofundar").click()
  await expect(page.getByText(/o Cordeiro de Deus/)).toBeVisible()
  await page.getByText("Para aprofundar").scrollIntoViewIfNeeded()
  await page.screenshot({ path: "test-results/vestes-aprofundar.png", fullPage: true })
  await page.getByRole("button", { name: /Continuar/ }).click()
  await expect(page.getByText("Fora do jardim")).toBeVisible()
  await page.getByRole("button", { name: /Continuar/ }).click()
  await expect(page.getByText("PRD · Plano Redentor de Deus")).toBeVisible()
  await expect(page.getByText(/Relíquia: A promessa/)).toBeVisible()
  await page.getByRole("button", { name: /Continuar/ }).click()
  await expect(page.getByText(/Etapa 1 concluída/)).toBeVisible()
  await expect(page.getByText(/As vestes de pele · A promessa/)).toBeVisible()
})

test("Etapa 1 na apresentação: o celular joga, o telão soma e a Queda apaga o celular", async ({ context }) => {
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

  const go = (title: RegExp) => host.getByRole("navigation", { name: "Roteiro da sequência" }).getByRole("button", { name: title }).click()
  await host.getByRole("button", { name: /Começar a apresentação/ }).click()
  await go(/^\d+\s*Criação/)
  await phone.getByRole("button", { name: /haja luz/ }).click()
  await phone.getByRole("button", { name: "Revelar" }).click()
  await expect(projector.getByText("1 pessoa criando")).toBeVisible({ timeout: 10_000 })

  await go(/Diante da árvore/)
  await expect(phone.getByRole("button", { name: "Lançar" })).toBeVisible()
  await expect(projector.locator("[data-surface=projector]")).toContainText("Acertos nos alvos bons")

  await go(/^\d+\s*Queda\s*~/)
  await expect(phone.getByText("Eles se esconderam da presença do Senhor Deus")).toBeVisible()
  await go(/Deus veste o homem/)
  await expect(projector.locator("[data-surface=projector]")).toContainText("primeiro sacrifício para vestir o homem")
  await expect(projector.locator("[data-surface=projector]")).not.toContainText(/\bPRD\b/)
})
