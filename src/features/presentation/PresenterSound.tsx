"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { soundEngine } from "@/fx/sound"
import { useSoundState } from "@/fx/useSound"
import { cn } from "@/lib/utils"
import { usePreferences } from "@/stores/preferences-store"

/**
 * Som da apresentação, no painel do apresentador. A trilha e os efeitos tocam
 * neste computador (o telão é mudo), então o clique aqui já libera o áudio,
 * inclusive no Safari. O volume é o do computador.
 */
export function PresenterSound() {
  const sound = usePreferences((s) => s.sound)
  const setSound = usePreferences((s) => s.setSound)
  const engine = useSoundState()
  const playing = sound && engine === "ready"
  const waiting = sound && engine !== "ready"

  // Carrega o motor antes do primeiro clique (o Safari só libera o áudio dentro do gesto).
  useEffect(() => soundEngine.preload(), [])

  return (
    <Button
      variant={playing ? "default" : "outline"}
      size="lg"
      className={cn(waiting && "animate-pulse border-gold text-gold-bright")}
      aria-pressed={playing}
      aria-label={playing ? "Som ligado: desligar" : waiting ? "Clique para ativar o som" : "Ligar som"}
      title={playing ? "Som ligado (clique para desligar)" : waiting ? "Clique para ativar o som" : "Ligar o som da apresentação"}
      onClick={() => {
        if (playing) return setSound(false)
        setSound(true)
        void soundEngine.start()
      }}
    >
      {playing ? <Volume2 /> : <VolumeX />}
      {waiting ? "Ativar som" : "Som"}
    </Button>
  )
}
