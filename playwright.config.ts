import { loadEnvConfig } from "@next/env"
import { defineConfig, devices } from "@playwright/test"

// Carrega .env.local para saber se o Supabase está configurado (testes ao vivo).
loadEnvConfig(process.cwd())

// E2E sobre o build de produção. Para reaproveitar um servidor já rodando:
// E2E_BASE_URL=http://localhost:3000 npm run test:e2e
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3200"

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "npm run build && npx next start -p 3200", url: baseURL, timeout: 300_000, reuseExistingServer: true },
})
