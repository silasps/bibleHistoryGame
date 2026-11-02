#!/usr/bin/env node
// Verifica que o conteúdo server-only (sínteses das conexões e roteiro privado
// do apresentador) não foi parar em nenhum JavaScript enviado ao navegador.
// Rode depois de `npm run build`.
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const root = new URL("..", import.meta.url).pathname
const SECRET_SOURCES = ["src/content/released/index.ts", "src/content/private/index.ts"]
const STATIC_DIR = join(root, ".next/static")

function literals(file) {
  const src = readFileSync(join(root, file), "utf8")
  return [...src.matchAll(/"((?:[^"\\]|\\.){40,})"/g)].map((m) => m[1])
}

/** Trechos ASCII longos: resistem a escapes de acentos no bundle. */
function fragments(text) {
  return text.split(/[^A-Za-z ,.;:()-]+/).map((s) => s.trim()).filter((s) => s.length >= 28)
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".js") ? [p] : []
  })
}

let files
try {
  files = walk(STATIC_DIR)
} catch {
  console.error("✖ .next/static não encontrado. Rode `npm run build` antes.")
  process.exit(2)
}

const needles = SECRET_SOURCES.flatMap(literals).flatMap((s) => [s, ...fragments(s)])
const bundle = files.map((f) => ({ f, text: readFileSync(f, "utf8") }))
const leaks = []
for (const needle of new Set(needles)) {
  for (const { f, text } of bundle) if (text.includes(needle)) leaks.push({ file: f.replace(root, ""), needle })
}
// O nome do pacote e marcadores proibidos no cliente.
for (const { f, text } of bundle) {
  if (/\bPRD\b/.test(text) && /plano redentivo/i.test(text)) leaks.push({ file: f.replace(root, ""), needle: "PRD/Plano Redentivo" })
}

if (leaks.length) {
  console.error(`✖ ${leaks.length} vazamento(s) de conteúdo server-only no bundle do cliente:`)
  for (const l of leaks.slice(0, 20)) console.error(`  ${l.file}: "${l.needle.slice(0, 70)}…"`)
  process.exit(1)
}
console.log(`✓ ${files.length} arquivos JS do cliente verificados; ${new Set(needles).size} trechos server-only ausentes.`)
