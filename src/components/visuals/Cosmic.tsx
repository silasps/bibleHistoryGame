import { Scene } from "./Backdrop"

export function NightSky() {
  return (
    <Scene>
      <rect width="1600" height="900" fill="url(#v-sky)" />
      <ellipse cx="800" cy="980" rx="1100" ry="260" fill="#0a0f1c" />
      <circle cx="800" cy="420" r="3" fill="#f4d27a" className="animate-glow" />
      <circle cx="800" cy="420" r="60" fill="url(#v-glow)" opacity="0.25" className="animate-glow" />
    </Scene>
  )
}

export function Creation() {
  return (
    <Scene>
      <rect width="1600" height="900" fill="#05070d" />
      <circle cx="800" cy="360" r="520" fill="url(#v-glow)" opacity="0.55" className="animate-glow" />
      {[120, 210, 300, 400].map((r, i) => (
        <circle key={r} cx="800" cy="360" r={r} fill="none" stroke="#f4d27a" strokeOpacity={0.18 - i * 0.03} strokeWidth="1.5" />
      ))}
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2
        return (
          <line
            key={i}
            x1={800 + Math.cos(a) * 90}
            y1={360 + Math.sin(a) * 90}
            x2={800 + Math.cos(a) * 760}
            y2={360 + Math.sin(a) * 760}
            stroke="#f4d27a"
            strokeOpacity="0.07"
            strokeWidth="2"
          />
        )
      })}
      {/* Águas separadas da terra seca */}
      <path d="M0 700 C 260 660 420 720 640 690 S 1040 650 1240 690 S 1500 700 1600 680 L1600 900 L0 900 Z" fill="#0f182b" opacity="0.9" />
      <path d="M0 760 C 300 730 500 790 800 760 S 1300 730 1600 760 L1600 900 L0 900 Z" fill="#16223a" />
      <path d="M0 640 C 400 610 1200 610 1600 640" fill="none" stroke="#d9c7a7" strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="800" cy="360" r="26" fill="#fff6d8" />
      <circle cx="1270" cy="170" r="18" fill="#d9c7a7" opacity="0.6" />
    </Scene>
  )
}

export function QuestionMark() {
  return (
    <Scene>
      <rect width="1600" height="900" fill="#05070d" />
      <circle cx="800" cy="450" r="320" fill="url(#v-glow)" opacity="0.2" className="animate-glow" />
      {/* Anel quebrado: algo bom que se partiu */}
      <path d="M 800 190 A 260 260 0 1 1 560 560" fill="none" stroke="#d8a948" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
      <path d="M 520 470 A 260 260 0 0 1 700 214" fill="none" stroke="#d8a948" strokeWidth="6" strokeLinecap="round" opacity="0.35" strokeDasharray="4 18" />
      {[[548, 520, 12], [600, 600, 8], [520, 610, 5], [640, 660, 4]].map(([x, y, r], i) => (
        <rect key={i} x={x} y={y} width={r * 2} height={r} fill="#d8a948" opacity={0.6 - i * 0.12} transform={`rotate(${i * 37} ${x} ${y})`} />
      ))}
    </Scene>
  )
}

export function StarsPromise() {
  return (
    <Scene>
      <rect width="1600" height="900" fill="url(#v-sky)" />
      <path d="M0 760 C 400 720 1200 720 1600 760 L1600 900 L0 900 Z" fill="#0a0f1c" />
      {/* Tenda no horizonte */}
      <path d="M 1110 760 L 1170 690 L 1230 760 Z" fill="#1b1712" stroke="#6e5137" strokeWidth="2" />
      <circle cx="1170" cy="745" r="6" fill="#f4d27a" opacity="0.8" className="animate-flicker" />
      <path d="M 200 820 C 520 760 760 640 1160 420" fill="none" stroke="#d8a948" strokeWidth="2" strokeDasharray="2 12" opacity="0.7" />
    </Scene>
  )
}
