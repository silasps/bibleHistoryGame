"use client"

// Motor de som do app: trilha generativa por "clima" + efeitos, tudo
// sintetizado com Tone.js (sem arquivos de áudio). Carrega sob demanda e só
// começa a tocar depois de um gesto do usuário (política de autoplay).

type ToneModule = typeof import("tone")
type Node = { dispose: () => unknown }

export type EngineState = "off" | "loading" | "ready"
export type Mood = "night" | "garden" | "tension" | "warm" | "wonder" | "hope" | "sorrow" | "triumph"
export type Stinger = "reveal" | "seal" | "whoosh" | "heartbeat" | "train" | "vote" | "light" | "rewind"

interface MoodDef {
  bpm: number
  /** Acordes (vozes com oitava), trocados a cada `bars` compassos. */
  chords: string[][]
  bars: number
  /** Notas do arpejo (escala pentatônica do clima). */
  arp: string[]
  /** Probabilidade de cada colcheia do arpejo soar. */
  density: number
  padBrightness: number
  wind: number
}

const MOODS: Record<Mood, MoodDef> = {
  night: {
    bpm: 58,
    bars: 2,
    chords: [["D2", "A2", "F3", "C4", "E4"], ["Bb1", "F2", "D3", "A3", "C4"], ["F2", "C3", "A3", "E4"], ["C2", "G2", "E3", "D4"]],
    arp: ["D4", "F4", "G4", "A4", "C5", "D5"],
    density: 0.18,
    padBrightness: 700,
    wind: 0.08,
  },
  garden: {
    bpm: 72,
    bars: 2,
    chords: [["G2", "D3", "B3", "F#4"], ["E2", "B2", "G3", "D4"], ["C2", "G2", "E3", "B3", "D4"], ["D2", "A2", "F#3", "B3"]],
    arp: ["G4", "A4", "B4", "D5", "E5", "G5"],
    density: 0.42,
    padBrightness: 1400,
    wind: 0.04,
  },
  tension: {
    bpm: 66,
    bars: 2,
    chords: [["C2", "G2", "Eb3", "D4"], ["Ab1", "Eb2", "C3", "G3"], ["F2", "C3", "Ab3", "Eb4"], ["G1", "D2", "C3", "F3"]],
    arp: ["C4", "Eb4", "F4", "G4", "Bb4"],
    density: 0.14,
    padBrightness: 550,
    wind: 0.1,
  },
  warm: {
    bpm: 68,
    bars: 2,
    chords: [["D2", "A2", "F#3", "C#4", "E4"], ["B1", "F#2", "D3", "A3"], ["G2", "D3", "B3", "F#4"], ["A1", "E2", "C#3", "B3"]],
    arp: ["D4", "E4", "F#4", "A4", "B4", "D5"],
    density: 0.3,
    padBrightness: 1100,
    wind: 0.03,
  },
  wonder: {
    bpm: 62,
    bars: 2,
    chords: [["Eb2", "Bb2", "G3", "D4", "A4"], ["C2", "G2", "Eb3", "Bb3", "D4"], ["Ab1", "Eb2", "C3", "G3", "D4"], ["Bb1", "F2", "D3", "G3"]],
    arp: ["Eb5", "F5", "G5", "Bb5", "C6"],
    density: 0.28,
    padBrightness: 1600,
    wind: 0.05,
  },
  hope: {
    bpm: 70,
    bars: 2,
    chords: [["F2", "C3", "A3", "E4"], ["A1", "E2", "C3", "G3"], ["Bb1", "F2", "D3", "A3", "C4"], ["C2", "G2", "E3", "D4"]],
    arp: ["F4", "G4", "A4", "C5", "D5", "F5"],
    density: 0.34,
    padBrightness: 1300,
    wind: 0.03,
  },
  sorrow: {
    bpm: 56,
    bars: 2,
    chords: [["A1", "E2", "C3", "G3"], ["F1", "C2", "A2", "E3"], ["C2", "G2", "E3", "G3"], ["E1", "B1", "A2", "D3"]],
    arp: ["A3", "C4", "D4", "E4", "G4"],
    density: 0.16,
    padBrightness: 600,
    wind: 0.08,
  },
  triumph: {
    bpm: 76,
    bars: 2,
    chords: [["C2", "G2", "E3", "G3", "D4"], ["B1", "G2", "D3", "A3"], ["A1", "E2", "C3", "G3"], ["F1", "C2", "A2", "E3", "G3"]],
    arp: ["C5", "D5", "E5", "G5", "A5", "C6"],
    density: 0.45,
    padBrightness: 1800,
    wind: 0.02,
  },
}

interface MoodVoice {
  mood: Mood
  bus: import("tone").Gain
  nodes: Node[]
  loops: import("tone").Loop[]
}

class SoundEngine {
  private tone: ToneModule | null = null
  private master: import("tone").Volume | null = null
  private sfx: import("tone").Gain | null = null
  private reverb: import("tone").Reverb | null = null
  private delay: import("tone").FeedbackDelay | null = null
  private voice: MoodVoice | null = null
  private pendingMood: Mood | null = null
  private volume = 0.6
  private state: EngineState = "off"
  private listeners = new Set<() => void>()
  private starting: Promise<void> | null = null

  getState = () => this.state
  subscribe = (l: () => void) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }
  private setState(s: EngineState) {
    this.state = s
    this.listeners.forEach((l) => l())
  }

  /** Precisa ser chamado dentro de um gesto do usuário (clique/tecla). */
  start(): Promise<void> {
    if (this.state === "ready") return Promise.resolve()
    this.starting ??= this.boot().catch((e) => {
      console.error("Som indisponível", e)
      this.starting = null
      this.setState("off")
    })
    return this.starting
  }

  private async boot() {
    this.setState("loading")
    const T = (this.tone = await import("tone"))
    await T.start()
    T.getContext().lookAhead = 0.08
    const limiter = new T.Limiter(-1).toDestination()
    const comp = new T.Compressor({ threshold: -20, ratio: 3, attack: 0.03, release: 0.3 }).connect(limiter)
    this.master = new T.Volume(-60).connect(comp)
    this.reverb = new T.Reverb({ decay: 6, preDelay: 0.04, wet: 1 })
    await this.reverb.ready
    this.reverb.connect(this.master)
    this.delay = new T.FeedbackDelay({ delayTime: "8n.", feedback: 0.35, wet: 1 }).connect(this.reverb)
    this.sfx = new T.Gain(1).connect(this.master)
    this.sfx.connect(this.reverb)
    this.applyVolume()
    if (T.getTransport().state !== "started") T.getTransport().start("+0.05")
    this.setState("ready")
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __bphSound: { context: () => T.getContext().state, mood: () => this.voice?.mood ?? null } })
    if (this.pendingMood) this.setMood(this.pendingMood)
  }

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v))
    this.applyVolume()
  }

  private applyVolume() {
    if (!this.master || !this.tone) return
    const db = this.volume <= 0.001 ? -60 : this.tone.gainToDb(this.volume) - 6
    this.master.volume.rampTo(db, 0.4)
  }

  setMuted(muted: boolean) {
    if (this.master) this.master.mute = muted
  }

  /** Troca a trilha com crossfade. `null` silencia a música (efeitos continuam). */
  setMood(mood: Mood | null) {
    this.pendingMood = mood
    if (this.state !== "ready" || !this.tone) return
    if (this.voice?.mood === mood) return
    const T = this.tone
    const old = this.voice
    this.voice = null
    if (old) {
      old.bus.gain.rampTo(0, 2.5)
      setTimeout(() => {
        old.loops.forEach((l) => l.dispose())
        old.nodes.forEach((n) => n.dispose())
        old.bus.dispose()
      }, 3200)
    }
    if (!mood) return
    const def = MOODS[mood]
    T.getTransport().bpm.rampTo(def.bpm, 2)

    const bus = new T.Gain(0).connect(this.master!)
    const send = new T.Gain(0.55).connect(this.reverb!)
    bus.connect(send)

    const padFilter = new T.Filter(def.padBrightness, "lowpass", -24).connect(bus)
    const padLfo = new T.LFO(0.04, def.padBrightness * 0.6, def.padBrightness * 1.4).connect(padFilter.frequency).start()
    const pad = new T.PolySynth(T.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 24 },
      envelope: { attack: 2.4, decay: 1.5, sustain: 0.75, release: 4 },
    }).connect(padFilter)
    pad.volume.value = -24

    const bass = new T.MonoSynth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.8, decay: 0.5, sustain: 0.8, release: 3 },
      filterEnvelope: { attack: 0.5, baseFrequency: 120, octaves: 1.5 },
    }).connect(bus)
    bass.volume.value = -20

    const arp = new T.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.006, decay: 0.5, sustain: 0.04, release: 1.4 },
    }).connect(bus)
    arp.connect(this.delay!)
    arp.volume.value = -22

    const windGain = new T.Gain(def.wind).connect(bus)
    const windFilter = new T.AutoFilter({ frequency: 0.07, baseFrequency: 260, octaves: 3.5, depth: 0.9 }).connect(windGain).start()
    const wind = new T.Noise("pink").connect(windFilter).start()

    let chordIndex = 0
    let current = def.chords[0]
    const chordLoop = new T.Loop((time) => {
      current = def.chords[chordIndex % def.chords.length]
      chordIndex++
      const dur = T.Time(`${def.bars}m`).toSeconds()
      pad.triggerAttackRelease(current.slice(1), dur * 0.95, time, 0.55)
      bass.triggerAttackRelease(current[0], dur * 0.9, time, 0.7)
    }, `${def.bars}m`).start(0)

    const arpLoop = new T.Loop((time) => {
      if (Math.random() > def.density) return
      const note = def.arp[Math.floor(Math.random() * def.arp.length)]
      arp.triggerAttackRelease(note, "8n", time, 0.25 + Math.random() * 0.35)
    }, "8n").start(T.Time("1m").toSeconds())

    bus.gain.rampTo(1, 3)
    this.voice = { mood, bus, nodes: [send, padFilter, padLfo, pad, bass, arp, windGain, windFilter, wind], loops: [chordLoop, arpLoop] }
  }

  stinger(kind: Stinger) {
    if (this.state !== "ready" || !this.tone || !this.sfx) return
    const T = this.tone
    const out = this.sfx
    const now = T.now() + 0.02
    const later = (nodes: Node[], ms: number) => setTimeout(() => nodes.forEach((n) => n.dispose()), ms)
    switch (kind) {
      case "reveal": {
        const bell = new T.PolySynth(T.FMSynth, {
          harmonicity: 3.01,
          modulationIndex: 8,
          envelope: { attack: 0.01, decay: 1.8, sustain: 0.1, release: 2.5 },
          modulationEnvelope: { attack: 0.01, decay: 0.6, sustain: 0, release: 0.5 },
        }).connect(out)
        bell.volume.value = -16
        bell.triggerAttackRelease(["D5", "A5"], 2, now)
        bell.triggerAttackRelease(["F#5", "D6"], 2, now + 0.18)
        const swell = new T.PolySynth(T.Synth, { oscillator: { type: "fatsine", count: 3, spread: 15 }, envelope: { attack: 0.8, decay: 1, sustain: 0.6, release: 2.5 } }).connect(out)
        swell.volume.value = -22
        swell.triggerAttackRelease(["D3", "A3", "F#4", "E5"], 2.2, now)
        later([bell, swell], 7000)
        break
      }
      case "seal": {
        const thump = new T.MembraneSynth({ pitchDecay: 0.08, octaves: 5, envelope: { attack: 0.001, decay: 0.6, sustain: 0 } }).connect(out)
        thump.volume.value = -8
        const crackFilter = new T.Filter(2500, "highpass").connect(out)
        const crack = new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.12, sustain: 0 } }).connect(crackFilter)
        crack.volume.value = -14
        thump.triggerAttackRelease("C1", 0.5, now)
        crack.triggerAttackRelease(0.12, now + 0.01)
        crack.triggerAttackRelease(0.08, now + 0.09)
        later([thump, crack, crackFilter], 3000)
        break
      }
      case "whoosh":
      case "rewind": {
        const filter = new T.Filter(kind === "rewind" ? 4000 : 300, "bandpass", -12).connect(out)
        filter.Q.value = 2
        const gain = new T.Gain(0).connect(filter)
        const noise = new T.Noise("pink").connect(gain).start(now)
        gain.gain.linearRampTo(0.7, 0.3, now)
        gain.gain.linearRampTo(0, 0.6, now + 0.5)
        filter.frequency.exponentialRampTo(kind === "rewind" ? 200 : 3000, 1, now)
        if (kind === "rewind") {
          const tape = new T.Synth({ oscillator: { type: "sawtooth" }, envelope: { attack: 0.02, decay: 0.9, sustain: 0, release: 0.1 } }).connect(out)
          tape.volume.value = -26
          tape.triggerAttackRelease("A4", 0.9, now)
          tape.frequency.exponentialRampTo(60, 0.9, now)
          later([tape], 2500)
        }
        setTimeout(() => noise.stop(), 1400)
        later([noise, gain, filter], 2000)
        break
      }
      case "heartbeat": {
        const kick = new T.MembraneSynth({ pitchDecay: 0.04, octaves: 3, envelope: { attack: 0.002, decay: 0.35, sustain: 0 } }).connect(out)
        kick.volume.value = -12
        kick.triggerAttackRelease("G1", 0.2, now)
        kick.triggerAttackRelease("G1", 0.2, now + 0.26)
        later([kick], 1500)
        break
      }
      case "train": {
        const rumbleGain = new T.Gain(0).connect(out)
        const rumble = new T.Noise("brown").connect(new T.Filter(500, "lowpass").connect(rumbleGain)).start(now)
        rumbleGain.gain.linearRampTo(0.9, 1.1, now)
        rumbleGain.gain.linearRampTo(0, 1.6, now + 1.4)
        const clack = new T.MetalSynth({ envelope: { attack: 0.001, decay: 0.05, release: 0.02 }, harmonicity: 3.1, resonance: 900, octaves: 0.8 }).connect(out)
        clack.volume.value = -30
        for (let i = 0; i < 10; i++) clack.triggerAttackRelease("C2", 0.04, now + 0.3 + i * 0.22 + (i % 2) * 0.06)
        const horn = new T.PolySynth(T.Synth, { oscillator: { type: "fatsawtooth", count: 2, spread: 12 }, envelope: { attack: 0.08, decay: 0.2, sustain: 0.8, release: 0.5 } }).connect(new T.Filter(1100, "lowpass").connect(out))
        horn.volume.value = -22
        horn.triggerAttackRelease(["A3", "C#4", "E4"], 0.9, now + 0.5)
        setTimeout(() => rumble.stop(), 3200)
        later([rumble, rumbleGain, clack, horn], 4000)
        break
      }
      case "vote": {
        const mallet = new T.FMSynth({ harmonicity: 2, modulationIndex: 3, envelope: { attack: 0.002, decay: 0.4, sustain: 0, release: 0.3 } }).connect(out)
        mallet.volume.value = -16
        mallet.triggerAttackRelease("A5", 0.2, now)
        later([mallet], 1500)
        break
      }
      case "light": {
        const glass = new T.FMSynth({ harmonicity: 5, modulationIndex: 4, envelope: { attack: 0.005, decay: 1.2, sustain: 0, release: 1 } }).connect(out)
        glass.volume.value = -18
        glass.triggerAttackRelease("E6", 0.6, now)
        glass.triggerAttackRelease("B6", 0.6, now + 0.12)
        later([glass], 3000)
        break
      }
    }
  }
}

export const soundEngine = new SoundEngine()

/** Clima musical sugerido para cada deixa visual das cenas. */
export const MOOD_FOR_CUE: Record<string, Mood> = {
  stars: "night",
  "creation-light": "wonder",
  "question-pulse": "night",
  "garden-breeze": "garden",
  "fruit-glow": "tension",
  heartbeat: "tension",
  rewind: "sorrow",
  "seed-thread": "hope",
  seal: "warm",
  embers: "warm",
  train: "garden",
  cliff: "tension",
}
