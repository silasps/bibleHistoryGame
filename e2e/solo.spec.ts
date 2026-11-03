import { expect, test } from "@playwright/test"

test("completa Gênesis 1–3 no modo solo e retoma após recarregar", async ({ page }) => {
  await page.goto("/solo/ato-01/convite")
  const next = page.getByRole("button", { name: /Continuar|Concluir capítulo/ })

  for (let i = 0; i < 16; i++) {
    const url = page.url()
    if (await page.getByRole("button", { name: /^Uma$/ }).count()) await page.getByRole("button", { name: /^Uma$/ }).click()
    if (await page.getByRole("button", { name: /O ser humano fez uma escolha/ }).count()) await page.getByRole("button", { name: /O ser humano fez uma escolha/ }).click()
    if (await page.getByRole("button", { name: /Não vai acontecer nada/ }).count()) await page.getByRole("button", { name: /Não vai acontecer nada/ }).click()
    if (await page.getByRole("button", { name: /Provar o fruto/ }).count()) {
      // Antes de escolher, não dá para continuar.
      await expect(next).toBeDisabled()
      await page.getByRole("button", { name: /Provar o fruto/ }).click()
    }
    if (url.endsWith("/hipotese")) await expect(page.getByText("Simulação reflexiva — não é texto bíblico")).toBeVisible()
    if (await page.getByRole("button", { name: /Abrir o selo/ }).count()) {
      await page.getByRole("button", { name: /Abrir o selo/ }).click()
      await expect(page.getByText("A descendência prometida")).toBeVisible()
    }
    if (url.endsWith("/cliffhanger")) {
      await next.click()
      break
    }
    await expect(next).toBeEnabled()
    await next.click()
    await page.waitForURL((u) => u.toString() !== url)
  }

  await page.reload()
  await page.goto("/archive")
  await expect(page.getByRole("tab", { name: /Quadro \(6\)/ })).toBeVisible()
  await page.goto("/solo")
  await expect(page.getByText("13 de 13 cenas")).toBeVisible()
})

test("cena bloqueada redireciona para o ponto de retomada", async ({ page }) => {
  await page.goto("/solo/ato-01/relato")
  await page.waitForURL(/\/solo\/ato-01\/convite$/)
})

test("jornada da semana 1: itens, dossiê, pista e Arquivo", async ({ page }) => {
  await page.goto("/solo?semana=1")
  await page.getByRole("region", { name: "Origens e Cosmovisão" }).getByRole("link", { name: "Começar" }).click()
  await page.waitForURL(/\/solo\/semana\/1\/[a-z-]+$/)

  await page.getByRole("button", { name: "Abrir dossiê" }).click()
  await expect(page.getByRole("tab", { name: "Do resumo" })).toBeVisible()
  await page.getByRole("tab", { name: "Passagens" }).click()
  await expect(page.getByRole("link", { name: /Ler na NAA/ }).first()).toHaveAttribute("href", /bibliaonline\.com\.br\/naa\//)
  await page.keyboard.press("Escape")

  // Percorre a semana até a pista.
  for (let i = 0; i < 30 && !page.url().endsWith("/pista"); i++) {
    const url = page.url()
    await page.getByRole("button", { name: /Próximo item|Pista da semana/ }).click()
    await page.waitForURL((u) => u.toString() !== url)
  }
  await expect(page).toHaveURL(/\/solo\/semana\/1\/pista$/)
  await page.getByRole("button", { name: /Abrir o selo/ }).click()
  await expect(page.getByRole("heading", { name: "Semana 1 · Origens e Cosmovisão" })).toBeVisible()

  await page.getByRole("link", { name: "Sair para o mapa da jornada" }).click()
  await page.waitForURL(/\/solo\?semana=1$/)
  await expect(page.getByText(/^(\d+) de \1 itens$/)).toBeVisible()
  await expect(page.getByRole("link", { name: /Pista aberta/ })).toBeVisible()

  await page.goto("/archive")
  await page.getByRole("tab", { name: "Documentos" }).click()
  await expect(page.getByText("Semana 1 · Origens e Cosmovisão")).toBeVisible()
})
