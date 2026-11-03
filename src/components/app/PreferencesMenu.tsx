"use client"

import { Settings2, Volume2, VolumeX } from "lucide-react"
import { useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { soundEngine } from "@/fx/sound"
import { useFx } from "@/fx/useFx"
import { cn } from "@/lib/utils"
import { usePreferences, type FxLevel } from "@/stores/preferences-store"

const FX_OPTIONS: { value: FxLevel; label: string }[] = [
  { value: "completo", label: "Completos" },
  { value: "reduzido", label: "Reduzidos" },
  { value: "desligado", label: "Sem efeitos" },
]

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-flow-col gap-1 rounded-lg bg-night/60 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-2 py-1.5 text-xs transition-colors",
            value === o.value ? "bg-gold text-primary-foreground" : "text-mist hover:text-parchment",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Aplica preferências globais ao documento (tamanho do texto, nível de efeitos). */
export function PreferencesEffect() {
  const textScale = usePreferences((s) => s.textScale)
  const fx = useFx()
  useEffect(() => {
    document.documentElement.style.fontSize = `${textScale * 100}%`
    document.documentElement.dataset.fx = fx.level === "desligado" ? "off" : fx.level === "reduzido" ? "reduced" : "full"
  }, [textScale, fx.level])
  return null
}

export function PreferencesMenu({ className }: { className?: string }) {
  const { fx, sound, volume, textScale, setFx, setSound, setVolume, setTextScale } = usePreferences()
  const toggleSound = async () => {
    if (sound) {
      setSound(false)
      return
    }
    // O clique é o gesto que o navegador exige para liberar o áudio.
    setSound(true)
    soundEngine.setVolume(volume)
    await soundEngine.start()
  }
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        onClick={toggleSound}
        aria-pressed={sound}
        aria-label={sound ? "Desligar som" : "Ligar som"}
        className="grid size-10 place-items-center rounded-full text-mist transition-colors hover:bg-navy-2 hover:text-parchment"
      >
        {sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
      </button>
      <Popover>
        <PopoverTrigger
          aria-label="Preferências de acessibilidade"
          className="grid size-10 place-items-center rounded-full text-mist transition-colors hover:bg-navy-2 hover:text-parchment"
        >
          <Settings2 className="size-5" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 gap-4 border border-border bg-navy p-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-mist">Efeitos visuais</p>
            <Segmented label="Efeitos visuais" value={fx} options={FX_OPTIONS} onChange={setFx} />
            <p className="text-xs text-mist/80">Se o seu sistema pede movimento reduzido, isso é respeitado automaticamente.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-mist">Tamanho do texto</p>
            <Segmented
              label="Tamanho do texto"
              value={textScale}
              options={[
                { value: 1, label: "A" },
                { value: 1.15, label: "A+" },
                { value: 1.3, label: "A++" },
              ]}
              onChange={setTextScale}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="volume" className="text-xs uppercase tracking-widest text-mist">
              Volume {sound ? "" : "(som desligado)"}
            </label>
            <input
              id="volume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-[var(--gold)]"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
