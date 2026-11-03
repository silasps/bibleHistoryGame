import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { PreferencesEffect } from "@/components/app/PreferencesMenu"
import { Toaster } from "@/components/ui/sonner"
import { SoundBootstrap } from "@/fx/useSound"
import { StoreHydrator } from "@/stores/hydration"
import "./globals.css"

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
})
const body = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: { default: "Bíblia — Por trás da história", template: "%s · Bíblia — Por trás da história" },
  description: "Uma história. Muitas escolhas. Uma investigação interativa pela narrativa bíblica, para jogar sozinho ou apresentar ao vivo.",
}

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-night">
          Pular para o conteúdo
        </a>
        <StoreHydrator />
        <PreferencesEffect />
        <SoundBootstrap />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
