import { expect, test, type Page } from "@playwright/test"

const FORBIDDEN = /\bPRD\b|plano redentivo/i
const SYNTHESIS = "Dirigindo-se à serpente"

async function gotoScene(host: Page, title: RegExp) {
  await host.getByRole("navigation", { name: "Roteiro da sequência" }).getByRole("button", { name: title }).click()
}

test("demonstração local: painel, telão e celular sincronizam e a pista só abre depois da liberação", async ({ context }) => {
  const host = await context.newPage()
  await host.goto("/presenter")
  await host.getByRole("button", { name: "Abrir demonstração" }).click()
  await host.waitForURL(/\/presenter\/[A-Z0-9]{6}\?modo=demo/)
  const code = host.url().match(/presenter\/([A-Z0-9]{6})/)![1]

  const projector = await context.newPage()
  await projector.goto(`/projector/${code}?modo=demo`)
  const phone = await context.newPage()
  await phone.setViewportSize({ width: 390, height: 844 })
  await phone.goto(`/join/${code}?modo=demo`)
  await phone.getByRole("button", { name: "Entrar" }).click()
  await expect(projector.getByText("1 pessoa conectada")).toBeVisible()
  await expect(projector.getByText("Demonstração local")).toBeVisible()

  await host.getByRole("button", { name: /Começar a apresentação/ }).click()
  await gotoScene(host, /Se Deus criou tudo bom/)
  await host.getByRole("button", { name: /Abrir votação/ }).click()
  await phone.getByRole("button", { name: /O ser humano fez uma escolha/ }).click()
  await host.getByRole("button", { name: /Fechar votação/ }).click()
  await host.getByRole("button", { name: /Revelar resultado/ }).click()
  await expect(projector.getByText("100%")).toBeVisible({ timeout: 10_000 })

  await gotoScene(host, /Uma frase no meio do juízo/)
  await expect(projector.locator("[data-surface=projector]")).not.toContainText(FORBIDDEN)
  await gotoScene(host, /A pista selada/)
  await expect(phone.getByText("Pista selada").first()).toBeVisible()
  await expect(phone.locator("body")).not.toContainText(SYNTHESIS)
  await host.getByRole("button", { name: /Liberar pista/ }).click()
  await expect(phone.getByText(SYNTHESIS, { exact: false })).toBeVisible({ timeout: 10_000 })
  await expect(projector.getByText("Gênesis 3:15")).toBeVisible()
  await expect(projector.locator("[data-surface=projector]")).not.toContainText(SYNTHESIS)
})

test.describe("ao vivo com Supabase", () => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY, "Supabase não configurado")

  test("dois celulares independentes votam e recebem a pista só depois da liberação", async ({ browser }) => {
    const host = await (await browser.newContext()).newPage()
    await host.goto("/presenter")
    await host.getByRole("button", { name: "Criar sala ao vivo" }).click()
    await host.waitForURL(/\/presenter\/[A-Z0-9]{6}$/)
    const code = host.url().match(/presenter\/([A-Z0-9]{6})/)![1]

    const phones = await Promise.all([browser.newContext(), browser.newContext()].map(async (c) => (await c).newPage()))
    for (const p of phones) {
      await p.goto(`/join/${code}`)
      await p.getByRole("button", { name: "Entrar" }).click()
    }
    await expect(host.locator("header")).toContainText("2")

    await host.getByRole("button", { name: /Começar a apresentação/ }).click()
    await gotoScene(host, /Se Deus criou tudo bom/)
    await host.getByRole("button", { name: /Abrir votação/ }).click()
    for (const p of phones) await p.getByRole("button", { name: /Ainda não sei/ }).click()
    await expect(host.getByText(/Votos \(2\)/)).toBeVisible({ timeout: 10_000 })

    await gotoScene(host, /A pista selada/)
    const before = await phones[0].evaluate(async (c) => (await fetch(`/api/rooms/${c}/audience`)).text(), code)
    expect(before).not.toContain(SYNTHESIS)
    await host.getByRole("button", { name: /Liberar pista/ }).click()
    for (const p of phones) await expect(p.getByText(SYNTHESIS, { exact: false })).toBeVisible({ timeout: 10_000 })

    const projector = await phones[1].evaluate(async (c) => (await fetch(`/api/rooms/${c}/projector`)).text(), code)
    expect(projector).not.toMatch(FORBIDDEN)
    expect(projector).not.toContain(SYNTHESIS)
    expect(await phones[0].evaluate(async (c) => (await fetch(`/api/rooms/${c}/host`)).status, code)).toBe(403)

    host.on("dialog", (d) => d.accept())
    await host.getByRole("button", { name: /Encerrar/ }).click()
    await expect(phones[1].getByText("Obrigado por investigar!")).toBeVisible({ timeout: 10_000 })
    await host.getByRole("button", { name: /Apagar sala/ }).click()
    await host.waitForURL(/\/presenter$/)
  })
})
