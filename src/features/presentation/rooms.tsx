"use client"

import { Maximize, Volume2, VolumeX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { deleteLiveRoom } from "@/app/actions/live"
import { DemoBadge } from "@/components/story/DemoBadge"
import { soundEngine } from "@/fx/sound"
import { useSoundState } from "@/fx/useSound"
import { usePreferences } from "@/stores/preferences-store"
import { useLocalAudience, useLocalProjector } from "@/data/local/clients"
import { useLocalHost } from "@/data/local/host"
import { joinUrlFor, siteOrigin, type ProjectorRoomApi, type RoomMode } from "@/data/ports"
import { useLiveAudience, useLiveHost, useLiveProjector } from "@/data/supabase/client"
import { AudienceScreen } from "./AudienceScreen"
import { PresenterConsole } from "./PresenterConsole"
import { ProjectorStage } from "./ProjectorStage"

// Liga cada superfície ao transporte certo. Os componentes de tela não
// sabem se a sala é local ou ao vivo.

const projectorUrl = (code: string, mode: RoomMode) => `/projector/${code}${mode === "demo" ? "?modo=demo" : ""}`

export function DemoPresenter({ code, sequenceId, rehearsal }: { code: string; sequenceId: string; rehearsal: boolean }) {
  const room = useLocalHost(code, { sequenceId, rehearsal })
  return <PresenterConsole room={room} code={code} joinUrl={joinUrlFor(code, "demo", siteOrigin())} projectorUrl={projectorUrl(code, "demo")} />
}

export function LivePresenter({ code }: { code: string }) {
  const room = useLiveHost(code)
  const router = useRouter()
  if (room.error && !room.state) return <p className="p-8 text-rose">{room.error}</p>
  return (
    <PresenterConsole
      room={room}
      code={code}
      joinUrl={joinUrlFor(code, "live", siteOrigin())}
      projectorUrl={projectorUrl(code, "live")}
      onDelete={async () => {
        if (!confirm("Apagar a sala definitivamente?")) return
        await deleteLiveRoom(code)
        router.push("/presenter")
      }}
    />
  )
}

function ProjectorScreen({ room, mode }: { room: ProjectorRoomApi & { error?: string | null }; mode: RoomMode }) {
  const [chrome, setChrome] = useState(true)
  const sound = usePreferences((s) => s.sound)
  const setSound = usePreferences((s) => s.setSound)
  const engine = useSoundState()
  const waitingGesture = sound && engine !== "ready"
  useEffect(() => {
    const t = setTimeout(() => setChrome(false), 4000)
    const show = () => {
      setChrome(true)
      clearTimeout(t)
    }
    window.addEventListener("mousemove", show, { once: true })
    return () => (clearTimeout(t), window.removeEventListener("mousemove", show))
  }, [chrome])
  return (
    <div className="grid h-dvh w-dvw place-items-center overflow-hidden bg-black">
      <div className="relative aspect-video max-h-dvh w-full max-w-[calc(100dvh*16/9)]">
        <ProjectorStage view={room.view} joinUrl={room.joinUrl} />
        {mode === "demo" && <DemoBadge className="absolute bottom-3 right-3 opacity-80" />}
        {room.error && !room.view && <p className="absolute inset-x-0 bottom-6 text-center text-rose">{room.error}</p>}
      </div>
      {(chrome || waitingGesture) && (
        <div className="fixed right-4 top-4 flex gap-2">
          <button
            onClick={async () => {
              if (sound && engine === "ready") return setSound(false)
              setSound(true)
              await soundEngine.start()
            }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm backdrop-blur ${waitingGesture ? "animate-pulse bg-gold text-primary-foreground" : "bg-navy/80 text-parchment"}`}
          >
            {sound && engine === "ready" ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            {waitingGesture ? "Clique para ativar o som" : sound ? "Som ligado" : "Ligar som"}
          </button>
          {chrome && (
            <button
              onClick={() => document.documentElement.requestFullscreen?.()}
              className="inline-flex items-center gap-2 rounded-full bg-navy/80 px-4 py-2 text-sm text-parchment backdrop-blur"
            >
              <Maximize className="size-4" /> Tela cheia
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function DemoProjector({ code }: { code: string }) {
  return <ProjectorScreen room={useLocalProjector(code)} mode="demo" />
}

export function LiveProjector({ code }: { code: string }) {
  return <ProjectorScreen room={useLiveProjector(code)} mode="live" />
}

export function DemoAudience({ code }: { code: string }) {
  return <AudienceScreen room={useLocalAudience(code)} mode="demo" code={code} />
}

export function LiveAudience({ code }: { code: string }) {
  return <AudienceScreen room={useLiveAudience(code)} mode="live" code={code} />
}
