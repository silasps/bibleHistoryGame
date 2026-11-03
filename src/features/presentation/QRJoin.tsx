"use client"

import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"

export function QRJoin({ url, code, className }: { url: string; code: string; className?: string }) {
  // joinUrlFor marca as salas de demonstração com ?modo=demo.
  const demo = new URL(url, "http://x").searchParams.get("modo") === "demo"
  return (
    <div className={cn("flex items-center gap-[3cqw]", className)}>
      <div className="rounded-[1.2cqw] bg-parchment p-[1.2cqw] shadow-[0_0_6cqw_rgba(216,169,72,0.35)]">
        <QRCodeSVG value={url} size={512} bgColor="#f1e8d6" fgColor="#05070d" level="M" className="size-[18cqw] max-h-[30cqh] max-w-[30cqh]" aria-label={`QR code para entrar na sala ${code}`} />
      </div>
      <div className="space-y-[1cqw] text-left">
        <p className="text-[1.4cqw] uppercase tracking-[0.4em] text-gold">Entre pelo celular</p>
        <p className="font-display text-[7cqw] font-semibold leading-none tracking-[0.15em] text-parchment">{code}</p>
        <p className="max-w-[40cqw] break-all text-[1.3cqw] text-mist">{url.replace(/^https?:\/\//, "")}</p>
        {demo && <p className="max-w-[40cqw] text-[1.3cqw] text-[#f2a27e]">Demonstração: só abre em abas deste navegador. Para celulares, crie uma sala ao vivo.</p>}
      </div>
    </div>
  )
}
