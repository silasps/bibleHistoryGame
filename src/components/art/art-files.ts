import manifest from "@/content/art-manifest.json"

// Imagens do autor em public/art/<pasta>/ (veja public/art/README.md).
// Sem a imagem, cada componente usa o próprio desenho provisório.

export type ArtFolder = "items" | "cenas" | "personagens" | "objetos" | "reliquias"

const FILES = manifest as Record<ArtFolder, Record<string, string>>

export function artFile(folder: ArtFolder, name: string): string | undefined {
  return FILES[folder]?.[name]
}

/** Cena de fundo: no celular, prefere a versão em pé (`<nome>-celular`). */
export function sceneFile(name: string, portrait: boolean): string | undefined {
  return (portrait ? artFile("cenas", `${name}-celular`) : undefined) ?? artFile("cenas", name)
}
