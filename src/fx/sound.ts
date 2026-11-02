"use client"

// Som sintetizado com Tone.js, carregado só quando o usuário liga o som.
// Nada toca sem um gesto do usuário (política de autoplay dos navegadores).

type ToneModule = typeof import("tone")

let tone: ToneModule | null = null
let master: import("tone").Volume | null = null
let ambient: { stop: () => void } | null = null

export type Stinger = "reveal" | "seal" | "whoosh" | "heartbeat" | "train" | "vote" | "light" | "rewind"
export type Ambience = "night" | "garden" | "tension" | "warm" | null

async function load(): Promise<ToneModule> {
  if (tone) return tone
  tone = await import("tone")
  master = new tone.Volume(-12).toDestination()
  return tone
}

export async function enableSound(volume: number) {
  const T = await load()
  await T.start()
  setVolume(volume)
}

export function setVolume(volume: number) {
  if (!master || !tone) return
  master.volume.rampTo(volume <= 0 ? -Infinity : tone.gainToDb(volume) - 8, 0.2)
}

export function disableSound() {
  ambient?.stop()
  ambient = null
  if (master) master.volume.rampTo(-Infinity, 0.3)
}

export async function playStinger(kind: Stinger) {
  if (!tone || !master) return
  const T = tone
  const now = T.now()
  switch (kind) {
    case "reveal": {
      const synth = new T.PolySynth(T.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.4, decay: 0.6, sustain: 0.4, release: 2.5 },
      }).connect(master)
      synth.triggerAttackRelease(["D4", "A4", "D5", "F#5"], 2.2, now)
      setTimeout(() => synth.dispose(), 6000)
      break
    }
    case "seal": {
      const noise = new T.NoiseSynth({ noise: { type: "brown" }, envelope: { attack: 0.001, decay: 0.25, sustain: 0 } }).connect(master)
      const bell = new T.MetalSynth({ envelope: { attack: 0.001, decay: 1.4, release: 0.2 }, harmonicity: 5.1, resonance: 1800, octaves: 1.2 }).connect(master)
      bell.volume.value = -18
      noise.triggerAttackRelease(0.25, now)
      bell.triggerAttackRelease("C5", 1.2, now + 0.08)
      setTimeout(() => (noise.dispose(), bell.dispose()), 3000)
      break
    }
    case "whoosh":
    case "rewind": {
      const noise = new T.Noise("pink")
      const filter = new T.Filter(kind === "rewind" ? 3000 : 400, "bandpass").connect(master)
      const gain = new T.Gain(0).connect(filter)
      noise.connect(gain).start(now)
      gain.gain.linearRampTo(0.6, 0.25, now)
      gain.gain.linearRampTo(0, 0.9, now + 0.3)
      filter.frequency.exponentialRampTo(kind === "rewind" ? 300 : 2400, 1, now)
      setTimeout(() => (noise.stop(), noise.dispose(), gain.dispose(), filter.dispose()), 1600)
      break
    }
    case "heartbeat": {
      const kick = new T.MembraneSynth({ pitchDecay: 0.03, octaves: 4, envelope: { attack: 0.001, decay: 0.3, sustain: 0 } }).connect(master)
      kick.triggerAttackRelease("A1", 0.2, now)
      kick.triggerAttackRelease("A1", 0.2, now + 0.28)
      setTimeout(() => kick.dispose(), 1500)
      break
    }
    case "train": {
      const noise = new T.Noise("brown")
      const gain = new T.Gain(0).connect(master)
      const horn = new T.Synth({ oscillator: { type: "sawtooth" }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.6 } })
      const hornFilter = new T.Filter(900, "lowpass").connect(master)
      horn.connect(hornFilter)
      horn.volume.value = -20
      noise.connect(gain).start(now)
      gain.gain.linearRampTo(0.9, 1.2, now)
      gain.gain.linearRampTo(0, 1.8, now + 1.6)
      horn.triggerAttackRelease("A3", 0.8, now + 0.6)
      setTimeout(() => (noise.stop(), noise.dispose(), gain.dispose(), horn.dispose(), hornFilter.dispose()), 4000)
      break
    }
    case "vote":
    case "light": {
      const pluck = new T.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.005, decay: 0.3, sustain: 0, release: 0.4 } }).connect(master)
      pluck.volume.value = -14
      pluck.triggerAttackRelease(kind === "light" ? "E6" : "A5", 0.2, now)
      setTimeout(() => pluck.dispose(), 1200)
      break
    }
  }
}

export async function setAmbience(kind: Ambience) {
  ambient?.stop()
  ambient = null
  if (!kind || !tone || !master) return
  const T = tone
  const notes: Record<Exclude<Ambience, null>, string[]> = {
    night: ["D2", "A2", "E3"],
    garden: ["G2", "D3", "B3"],
    tension: ["C2", "C#3", "G2"],
    warm: ["D2", "F#3", "A3"],
  }
  const reverb = new T.Reverb({ decay: 8, wet: 0.7 }).connect(master)
  const pad = new T.PolySynth(T.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 4, decay: 1, sustain: 0.8, release: 4 },
  }).connect(reverb)
  pad.volume.value = -22
  pad.triggerAttack(notes[kind])
  ambient = {
    stop: () => {
      pad.releaseAll()
      setTimeout(() => (pad.dispose(), reverb.dispose()), 5000)
    },
  }
}
