import { Scene } from "./Backdrop"

function Tree({ x, y, scale = 1, glow = false, dark = false }: { x: number; y: number; scale?: number; glow?: boolean; dark?: boolean }) {
  const leaf = dark ? "#121a17" : "#1d3a2c"
  const leaf2 = dark ? "#0d1311" : "#27503c"
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M -14 0 C -10 -80 -16 -140 -4 -200 L 6 -200 C 12 -140 10 -80 16 0 Z" fill="#2b2016" />
      <path d="M -4 -150 C -50 -170 -80 -190 -100 -230 M 6 -170 C 50 -190 80 -210 96 -250" stroke="#2b2016" strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="0" cy="-280" r="120" fill={leaf} />
      <circle cx="-90" cy="-240" r="80" fill={leaf2} />
      <circle cx="95" cy="-250" r="85" fill={leaf2} />
      <circle cx="10" cy="-360" r="80" fill={leaf2} />
      {glow && (
        <>
          <circle cx="40" cy="-220" r="60" fill="url(#v-glow)" className="animate-glow" />
          <circle cx="40" cy="-220" r="13" fill="#e9a23b" />
          <circle cx="44" cy="-224" r="4" fill="#fff1c9" />
        </>
      )}
    </g>
  )
}

export function Garden() {
  return (
    <Scene>
      <rect width="1600" height="900" fill="url(#v-sky)" />
      <circle cx="800" cy="300" r="420" fill="url(#v-glow)" opacity="0.3" />
      <path d="M0 640 C 300 600 1300 600 1600 640 L1600 900 L0 900 Z" fill="#14231b" />
      {/* Rios */}
      <path d="M 0 820 C 300 760 520 720 800 700 C 1080 720 1300 760 1600 820" fill="none" stroke="#3a6a86" strokeOpacity="0.5" strokeWidth="10" />
      <path d="M 120 900 C 400 800 640 740 800 700 C 960 740 1200 800 1480 900" fill="none" stroke="#3a6a86" strokeOpacity="0.3" strokeWidth="6" />
      <Tree x={560} y={660} scale={0.95} />
      <Tree x={1040} y={660} scale={0.95} glow />
      <Tree x={180} y={700} scale={0.6} />
      <Tree x={1420} y={700} scale={0.65} />
    </Scene>
  )
}

export function SerpentFruit() {
  return (
    <Scene>
      <rect width="1600" height="900" fill="#05070d" />
      <circle cx="900" cy="420" r="380" fill="url(#v-glow)" opacity="0.18" />
      <path d="M0 700 C 400 670 1200 670 1600 700 L1600 900 L0 900 Z" fill="#0c120f" />
      <Tree x={860} y={720} scale={1.25} glow dark />
      {/* Serpente: uma curva sinuosa enrolada no galho */}
      <path
        d="M 700 690 C 760 640 700 590 760 540 S 860 500 820 450 S 760 380 860 360 C 920 350 960 380 980 400"
        fill="none"
        stroke="#3d4a2a"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M 700 690 C 760 640 700 590 760 540 S 860 500 820 450 S 760 380 860 360 C 920 350 960 380 980 400"
        fill="none"
        stroke="#7c8a4a"
        strokeWidth="3"
        strokeDasharray="2 14"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="984" cy="402" r="9" fill="#3d4a2a" />
      <circle cx="988" cy="398" r="2.2" fill="#f4d27a" />
    </Scene>
  )
}

export function FallenGarden() {
  return (
    <Scene>
      <rect width="1600" height="900" fill="#05070d" />
      <path d="M0 680 C 400 650 1200 650 1600 680 L1600 900 L0 900 Z" fill="#100d0a" />
      <Tree x={1180} y={690} scale={0.9} dark />
      <Tree x={1420} y={700} scale={0.7} dark />
      {/* Portal guardado: chama vertical */}
      <rect x="930" y="430" width="10" height="260" fill="#c8643b" opacity="0.9" />
      <rect x="926" y="430" width="18" height="260" fill="#f4aa5a" opacity="0.35" filter="url(#v-soft)" className="animate-flicker" />
      <circle cx="935" cy="430" r="90" fill="url(#v-glow)" opacity="0.4" className="animate-flicker" />
      {/* Duas silhuetas saindo */}
      {[0, 46].map((dx) => (
        <g key={dx} transform={`translate(${520 + dx} 610)`} fill="#1a140f" stroke="#6e5137" strokeWidth="1.5">
          <circle cx="0" cy="-58" r="12" />
          <path d="M -16 0 C -18 -30 -12 -40 0 -44 C 12 -40 18 -30 16 0 Z" />
        </g>
      ))}
    </Scene>
  )
}

export function ReflectionPool() {
  return (
    <Scene>
      <rect width="1600" height="900" fill="url(#v-sky)" />
      <circle cx="800" cy="300" r="70" fill="#f4d27a" opacity="0.85" />
      <circle cx="800" cy="300" r="260" fill="url(#v-glow)" opacity="0.4" className="animate-glow" />
      <rect y="560" width="1600" height="340" fill="#0a0f1c" />
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx="800" cy={620 + i * 46} rx={60 + i * 70} ry={6 + i * 2} fill="none" stroke="#f4d27a" strokeOpacity={0.35 - i * 0.06} strokeWidth="2" />
      ))}
    </Scene>
  )
}
