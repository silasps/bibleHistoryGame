import { expect, test, type Page } from "@playwright/test"

const FORBIDDEN = /\bPRD\b|plano redentivo/i
// Trecho do parágrafo do PRD do autor (semana 1), liberado só depois da fala.
const AUTHOR_PRD = "ensinando um povo como exemplo"

/** Os toques que quebram o selo da pista no celular. */
async function tapSeal(phone: Page) {
  const seal = phone.getByRole("button", { name: /Quebrar o selo/ })
  for (let i = 0; i < 6; i++) await seal.click()
}

async function gotoScene(host: Page, title: RegExp) {
  await host.getByRole("navigation", { name: "Roteiro da sequência" }).getByRole("button", { name: title }).click()
}

test("demonstração local: a linha do tempo conduz e a pista da semana só abre depois da liberação", async ({ context }) => {
  const host = await context.newPage()
  await host.goto("/presenter")
  await expect(host.getByText("Visão Geral da Bíblia")).toBeVisible()
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
  await expect(projector.getByText("1 pessoa conectada")).toBeVisible()

  await host.getByRole("button", { name: /Começar a apresentação/ }).click()
  // Passador de slides: Page Down no painel e também com o foco na janela do telão.
  await expect(host.getByText(/^Cena 1 de/)).toBeVisible()
  await host.keyboard.press("PageDown")
  await expect(host.getByText(/^Cena 2 de/)).toBeVisible()
  await projector.keyboard.press("PageDown")
  await expect(host.getByText(/^Cena 3 de/)).toBeVisible()
  await projector.keyboard.press("PageUp")
  await expect(host.getByText(/^Cena 2 de/)).toBeVisible()
  await gotoScene(host, /Etapa 1 · O começo/)
  await expect(projector.getByText("O começo").first()).toBeVisible()
  await expect(projector.locator("[data-surface=projector]")).not.toContainText(/Semana \d/)

  await gotoScene(host, /^\d+\s*Criação/)
  const stage = projector.locator("[data-surface=projector]")
  await expect(stage).toContainText("Deus cria e organiza, de forma esplêndida, todas as coisas.")
  // Na Criação, o celular vira o minijogo (toque para a luz).
  await expect(phone.getByRole("button", { name: /haja luz/ })).toBeVisible()

  // O versículo (NAA) é público: telão e celular mostram o texto; o parágrafo do PRD não.
  await gotoScene(host, /Versículo do plano · Gênesis 3:15/)
  await expect(stage).toContainText("Porei inimizade entre você e a mulher")
  await expect(phone.getByText(/Porei inimizade entre você e a mulher/)).toBeVisible()
  await expect(phone.getByText("PRD · Plano Redentor de Deus")).toBeVisible()
  await expect(stage).not.toContainText(AUTHOR_PRD)
  await expect(stage).not.toContainText(FORBIDDEN)
  // No painel, a prévia do telão mostra só a referência: o texto fica escondido.
  const preview = host.locator("[data-surface=projector]")
  await expect(preview).toContainText("Gênesis 3:15")
  await expect(preview).not.toContainText("Porei inimizade")
  // O lembrete revela uma palavra por clique e depois tudo.
  const reminder = host.getByText(/Lembrete do versículo/).locator("..")
  await host.getByRole("button", { name: /Lembrar o versículo/ }).click()
  await expect(reminder.locator("span.text-parchment")).toHaveCount(1)
  await host.getByRole("button", { name: "Mostrar tudo" }).click()
  await expect(host.getByRole("button", { name: /Lembrar o versículo/ })).toBeDisabled()

  // A pista chega selada: o telão mostra o selo e a dica; o celular, a recompensa.
  await gotoScene(host, /Pista 1 do plano/)
  await expect(stage).toContainText("1º selo do trilho")
  await expect(stage).toContainText("Abre depois do versículo Gênesis 3:15")
  await expect(phone.getByText("Você ganhou o 1º selo do trilho!")).toBeVisible()
  await expect(phone.locator("body")).not.toContainText(AUTHOR_PRD)
  // Antes da liberação, tocar no selo não abre nada.
  await phone.getByRole("button", { name: /Espere o sinal/ }).click()
  await expect(phone.getByText("Ainda não! Espere o sinal.")).toBeVisible()

  await host.getByRole("button", { name: /Liberar pista/ }).click()
  await expect(stage).toContainText("Toquem no selo pelo celular")
  await expect(stage).toContainText("0 de 1 já quebraram o selo")
  await expect(phone.locator("body")).not.toContainText(AUTHOR_PRD)
  await tapSeal(phone)
  await expect(phone.getByText(AUTHOR_PRD, { exact: false })).toBeVisible({ timeout: 10_000 })
  // Todos quebraram: o selo do telão abre sozinho e mostra só a referência.
  await expect(stage).not.toContainText("Toquem no selo")
  await expect(stage).toContainText("Gênesis 3:15")
  await expect(host.getByRole("button", { name: /Selo aberto no telão/ })).toBeDisabled()
  await expect(stage).not.toContainText(AUTHOR_PRD)
  await expect(stage).not.toContainText(FORBIDDEN)
})

test.describe("ao vivo com Supabase", () => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY, "Supabase não configurado")

  test("dois celulares independentes recebem a pista da semana só depois da liberação", async ({ browser }) => {
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
    await gotoScene(host, /^\d+\s*Abraão/)
    for (const p of phones) await expect(p.getByRole("heading", { name: "Abraão" })).toBeVisible({ timeout: 10_000 })

    await gotoScene(host, /Pista 1 do plano/)
    const before = await phones[0].evaluate(async (c) => (await fetch(`/api/rooms/${c}/audience`)).text(), code)
    expect(before).not.toContain(AUTHOR_PRD)
    await host.getByRole("button", { name: /Liberar pista/ }).click()
    for (const p of phones) await expect(p.getByText(/Toque no selo para quebrar/)).toBeVisible({ timeout: 10_000 })
    await tapSeal(phones[0])
    await expect(phones[0].getByText(AUTHOR_PRD, { exact: false })).toBeVisible({ timeout: 10_000 })
    // Um de dois quebrou: o telão conta e o selo dele continua fechado.
    await expect.poll(async () => (await phones[1].evaluate(async (c) => (await fetch(`/api/rooms/${c}/projector`)).json(), code)).scene?.sealInfo?.opened, { timeout: 10_000 }).toBe(1)
    await tapSeal(phones[1])
    await expect(phones[1].getByText(AUTHOR_PRD, { exact: false })).toBeVisible({ timeout: 10_000 })

    const projector = await phones[1].evaluate(async (c) => (await fetch(`/api/rooms/${c}/projector`)).text(), code)
    expect(projector).not.toMatch(FORBIDDEN)
    expect(projector).not.toContain(AUTHOR_PRD)
    expect(await phones[0].evaluate(async (c) => (await fetch(`/api/rooms/${c}/host`)).status, code)).toBe(403)

    // Confirmações no modal do app (não no confirm() do navegador).
    await host.getByRole("button", { name: /Encerrar/ }).click()
    const endDialog = host.getByRole("alertdialog", { name: "Encerrar a sessão?" })
    await endDialog.getByRole("button", { name: "Encerrar" }).click()
    await expect(endDialog).toBeHidden()
    await expect(host.getByRole("link", { name: /Nova apresentação/ })).toBeVisible()
    await expect(phones[1].getByText("Obrigado por investigar!")).toBeVisible({ timeout: 10_000 })
    await host.getByRole("button", { name: /Apagar sala/ }).click()
    await host.getByRole("alertdialog", { name: "Apagar a sala?" }).getByRole("button", { name: "Apagar sala" }).click()
    await host.waitForURL(/\/presenter$/)
  })
})
