#!/usr/bin/env node
// Gera src/content/art-manifest.json a partir das imagens que o autor colocar em
// public/art/items/<id>.(webp|png|jpg|jpeg|svg) e public/art/characters/<id>.(…).
// Quando existe uma imagem, ela substitui o desenho em SVG do app.
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

const manifest = { items: scan("items"), characters: scan("characters") }
writeFileSync(join(root, "src/content/art-manifest.json"), JSON.stringify(manifest, null, 2) + "\n")
console.log(`art-manifest: ${Object.keys(manifest.items).length} itens, ${Object.keys(manifest.characters).length} personagens com arte própria`)
