#!/usr/bin/env node
// Gera src/content/art-manifest.json a partir das imagens que o autor colocar em
// public/art/<pasta>/<nome>.(webp|png|jpg|jpeg|svg). Quando existe uma imagem, ela
// substitui o desenho em SVG do app. Pastas: items (linha do tempo e fichas),
// cenas (fundos das etapas; "<nome>-celular" é a versão em pé), personagens,
// objetos e reliquias.
import { existsSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const root = new URL("..", import.meta.url).pathname
const EXT = /\.(webp|png|jpe?g|svg)$/i

function scan(dir) {
  const abs = join(root, "public/art", dir)
  if (!existsSync(abs)) return {}
  return Object.fromEntries(
    readdirSync(abs)
      .filter((f) => EXT.test(f))
      .sort()
      .map((f) => [f.replace(EXT, ""), `/art/${dir}/${f}`]),
  )
}

const FOLDERS = ["items", "cenas", "personagens", "objetos", "reliquias"]
const manifest = Object.fromEntries(FOLDERS.map((dir) => [dir, scan(dir)]))
writeFileSync(join(root, "src/content/art-manifest.json"), JSON.stringify(manifest, null, 2) + "\n")
const total = Object.values(manifest).reduce((n, files) => n + Object.keys(files).length, 0)
console.log(`art-manifest: ${total} imagens próprias`)
