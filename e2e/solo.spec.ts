import { expect, test } from "@playwright/test"

test("completa Gênesis 1–3 no modo solo e retoma após recarregar", async ({ page }) => {
  await page.goto("/solo/ato-01/convite")
  const next = page.getByRole("button", { name: /Continuar|Concluir capítulo/ })

  for (let i = 0; i < 12; i++) {
    const url = page.url()
    if (await page.getByRole("button", { name: /^Uma$/ }).count()) await page.getByRole("button", { name: /^Uma$/ }).click()
    if (await page.getByRole("button", { name: /O ser humano fez uma escolha/ }).count()) await page.getByRole("button", { name: /O ser humano fez uma escolha/ }).click()
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
  await expect(page.getByText("12 de 12 cenas")).toBeVisible()
})

test("cena bloqueada redireciona para o ponto de retomada", async ({ page }) => {
  await page.goto("/solo/ato-01/relato")
  await page.waitForURL(/\/solo\/ato-01\/convite$/)
})
