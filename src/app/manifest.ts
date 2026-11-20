import type { MetadataRoute } from "next"

// Para salvar o site na tela inicial do celular como um app: nome curto,
// tela cheia e o ícone do "B" dourado no fundo preto.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bíblia — Por trás da história",
    short_name: "Bíblia",
    description: "Uma investigação interativa pela narrativa bíblica, para jogar sozinho, apresentar ao vivo ou jogar o Bible Show em grupo.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070d",
    theme_color: "#05070d",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
