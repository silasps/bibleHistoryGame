import type { ReactNode } from "react"
import {
  Altar,
  Ark,
  Branch,
  Breastplate,
  Calf,
  Camel,
  Cloud,
  Columns,
  Crown,
  Cycle,
  Dove,
  Earth,
  Fish,
  Flame,
  Footprints,
  Gate,
  GOLD,
  Grapes,
  Ground,
  Group,
  Harp,
  Heart,
  Horn,
  Jar,
  Ladder,
  Lamp,
  Lion,
  Locust,
  Mountain,
  Palm,
  Person,
  Plumb,
  Pyramid,
  Ram,
  Rain,
  Scroll,
  Serpent,
  Sheaf,
  Sling,
  Spear,
  Sprout,
  Staff,
  Stars,
  Sword,
  Tablets,
  Temple,
  Tent,
  Tower,
  Tree,
  Trumpet,
  Walls,
  Waves,
  Wheel,
  Yoke,
} from "./motifs"

// Ilustração de cada item da linha do tempo, a partir da ideia das imagens
// das linhas do tempo do autor. Objetos ligados ao texto bíblico ficam
// dourados (ver as fichas de personagem para as referências).

const drops = (x: number, y: number) => <path d={`M ${x} ${y} l -1.5 4 a 1.6 1.6 0 0 0 3 0 Z M ${x - 4} ${y + 9} l -1.2 3 a 1.3 1.3 0 0 0 2.4 0 Z`} stroke={GOLD} fill={GOLD} fillOpacity={0.4} />

export const ART: Record<string, () => ReactNode> = {
  // Semana 1
  criacao: () => (
    <>
      <Earth x={50} y={58} r={20} />
      <Sprout x={50} y={38} s={1.1} />
      <Stars x={50} y={22} n={6} r={30} />
      <path d="M 18 30 l 6 3 M 82 30 l -6 3 M 14 52 l 7 0 M 86 52 l -7 0" stroke={GOLD} />
    </>
  ),
  queda: () => (
    <>
      <Tree x={54} y={62} s={1.25} fruit />
      <Serpent x={36} y={70} s={0.95} />
      <Ground />
    </>
  ),
  diluvio: () => (
    <>
      <Rain x={50} y={30} w={56} />
      <Ark x={50} y={64} s={1.1} />
      <Waves x={50} y={80} w={76} n={2} />
    </>
  ),
  babel: () => (
    <>
      <Tower x={50} y={60} s={1.5} />
      <path d="M 40 24 L 46 30 M 62 22 L 56 30 M 50 18 L 50 26" stroke={GOLD} />
      <path d="M 22 52 l -8 -4 M 78 52 l 8 -4 M 24 70 l -9 2 M 76 70 l 9 2" strokeOpacity={0.6} />
      <Ground />
    </>
  ),
  "alianca-abraamica": () => (
    <>
      <Tent x={50} y={70} s={1.2} />
      <Stars x={50} y={26} n={9} r={34} />
      <Ground />
    </>
  ),
  "sacrificio-isaque": () => (
    <>
      <Altar x={46} y={72} s={1.1} />
      <path d="M 34 63 L 58 61 M 36 60 L 56 58" stroke={GOLD} />
      <Ram x={26} y={42} s={0.8} />
      <Person x={74} y={58} s={0.75} arm="open" flip />
      <path d="M 14 36 Q 20 30 26 36 Q 32 30 38 36" strokeOpacity={0.6} />
    </>
  ),
  "migracao-egito": () => (
    <>
      <Camel x={30} y={64} s={1} />
      <Camel x={56} y={66} s={0.8} />
      <Pyramid x={82} y={62} s={0.55} />
      <Ground />
    </>
  ),
  "tempo-egito": () => (
    <>
      <Pyramid x={46} y={58} s={1.4} />
      <Pyramid x={80} y={66} s={0.6} />
      <Yoke x={22} y={78} s={0.6} />
      <Ground />
    </>
  ),
  exodo: () => (
    <>
      <path d="M 14 86 Q 10 60 18 40 Q 24 26 32 18 M 22 86 Q 18 62 26 44 Q 30 34 36 26" />
      <path d="M 86 86 Q 90 60 82 40 Q 76 26 68 18 M 78 86 Q 82 62 74 44 Q 70 34 64 26" />
      <Group x={50} y={70} n={3} s={0.42} />
      <path d="M 40 86 L 46 52 M 60 86 L 54 52" stroke={GOLD} strokeOpacity={0.6} />
    </>
  ),
  "adao-eva": () => (
    <>
      <Tree x={50} y={62} s={0.95} fruit />
      <Person x={24} y={62} s={0.72} arm="open" />
      <Person x={76} y={62} s={0.72} beard={false} head="hair-long" arm="open" flip />
      <Ground />
    </>
  ),
  noe: () => (
    <>
      <Person x={40} y={60} s={0.95} arm="hold">
        <Staff x={23} y={-8} h={56} />
      </Person>
      <Dove x={74} y={28} s={1.1} />
      <Branch x={82} y={30} s={0.4} />
      <Ark x={74} y={76} s={0.5} />
    </>
  ),
  abraao: () => (
    <>
      <Person x={36} y={60} s={0.95} head="turban" arm="up" />
      <Stars x={68} y={24} n={7} r={24} />
      <Tent x={74} y={72} s={0.6} />
      <Ground />
    </>
  ),
  isaque: () => (
    <>
      <Person x={44} y={60} s={0.9} beard={false} arm="hold" />
      <path d="M 26 40 L 52 34 M 27 44 L 53 38 M 28 48 L 54 42" stroke={GOLD} />
      <Ram x={76} y={70} s={0.65} />
      <Ground />
    </>
  ),
  jaco: () => (
    <>
      <Ladder x={62} y={84} h={70} />
      <Stars x={70} y={16} n={4} r={14} />
      <Person x={30} y={64} s={0.8} arm="pray" />
      <Ground />
    </>
  ),
  moises: () => (
    <>
      <Person x={50} y={60} s={1} arm="hold">
        <Tablets x={24} y={-10} s={0.75} />
      </Person>
      <Staff x={30} y={56} h={60} />
      <Ground />
    </>
  ),

  // Semana 2
  "alianca-sinai": () => (
    <>
      <Mountain x={50} y={66} s={1.25} />
      <Tablets x={50} y={30} s={1} />
      <Cloud x={76} y={26} s={0.7} />
      <path d="M 70 34 l -3 6 l 4 -1 l -3 6" stroke={GOLD} />
    </>
  ),
  tabernaculo: () => (
    <>
      <rect x="12" y="58" width="76" height="22" />
      <path d="M 12 58 l 0 -4 M 25 58 l 0 -4 M 38 58 l 0 -4 M 62 58 l 0 -4 M 75 58 l 0 -4 M 88 58 l 0 -4" />
      <rect x="54" y="36" width="24" height="30" fill="currentColor" fillOpacity={0.14} />
      <path d="M 54 36 L 66 28 L 78 36" stroke={GOLD} />
      <Altar x={30} y={70} s={0.55} />
      <Cloud x={66} y={18} s={0.6} />
    </>
  ),
  espioes: () => (
    <>
      <Person x={24} y={62} s={0.7} arm="hold" />
      <Person x={76} y={62} s={0.7} arm="hold" flip />
      <path d="M 40 57 L 60 57" strokeWidth={3} />
      <Grapes x={50} y={68} s={1.2} />
      <Ground />
    </>
  ),
  peregrinacao: () => (
    <>
      <Footprints x={18} y={84} />
      <path d="M 66 86 Q 60 64 68 46 Q 74 30 66 14" />
      <Cloud x={68} y={20} s={0.6} />
      <Flame x={70} y={44} s={0.9} />
      <Ground />
    </>
  ),
  "alianca-deuteronomica": () => (
    <>
      <Scroll x={50} y={46} w={40} open />
      <Tablets x={50} y={74} s={0.6} />
      <path d="M 24 22 L 32 30 M 76 22 L 68 30" stroke={GOLD} />
    </>
  ),
  "uncao-josue": () => (
    <>
      <Horn x={60} y={26} s={1.1} />
      {drops(52, 34)}
      <Person x={46} y={64} s={0.85} arm="pray" />
      <Ground />
    </>
  ),
  "morte-moises": () => (
    <>
      <Mountain x={40} y={68} s={1.2} />
      <Person x={48} y={41} s={0.32} arm="open" />
      <path d="M 62 70 Q 76 66 92 70 M 66 76 Q 80 72 94 76" stroke={GOLD} strokeOpacity={0.7} />
    </>
  ),
  arao: () => (
    <>
      <Person x={46} y={60} s={1} head="mitre" arm="hold">
        <Breastplate x={0} y={-12} />
        <Branch x={26} y={-14} s={0.6} />
      </Person>
      <path d="M 32 86 l 3 -3 M 40 87 l 2 -3 M 52 87 l 2 -3 M 60 86 l 3 -3" stroke={GOLD} />
    </>
  ),
  levitico: () => (
    <>
      <Altar x={50} y={68} s={1.2} />
      <Flame x={50} y={48} s={1.3} />
      <path d="M 44 34 Q 40 26 46 20 M 56 34 Q 60 26 54 18" strokeOpacity={0.5} />
      <Ground />
    </>
  ),

  // Semana 3
  conquista: () => (
    <>
      <Walls x={56} y={78} w={60} h={24} broken />
      <Trumpet x={22} y={36} s={1.2} />
      <path d="M 30 30 q 6 -2 8 -8 M 34 36 q 6 0 10 -4" strokeOpacity={0.5} />
    </>
  ),
  juizes: () => (
    <>
      <Cycle x={50} y={52} r={26} />
      <Sword x={50} y={54} s={0.9} angle={0} />
    </>
  ),
  "rute-boaz": () => (
    <>
      <Person x={30} y={62} s={0.75} beard={false} head="veil" arm="hold" />
      <Person x={72} y={62} s={0.78} arm="open" flip />
      <Sheaf x={50} y={72} s={1.1} />
      <Ground />
    </>
  ),
  "davi-ungido": () => (
    <>
      <Horn x={62} y={26} s={1.1} />
      {drops(54, 34)}
      <Person x={46} y={66} s={0.82} beard={false} arm="pray" />
      <Ground />
    </>
  ),
  "alianca-davidica": () => (
    <>
      <Crown x={50} y={30} s={1.3} />
      <path d="M 32 86 L 32 50 Q 32 44 38 44 L 62 44 Q 68 44 68 50 L 68 86 M 32 66 L 68 66 M 26 86 L 74 86" fill="none" />
      <path d="M 38 44 L 38 66 M 62 44 L 62 66" stroke={GOLD} />
    </>
  ),
  josue: () => (
    <>
      <Person x={42} y={60} s={1} head="helmet" arm="open" />
      <path d="M 52 50 L 86 22" strokeWidth={2.6} />
      <path d="M 86 22 L 80 24 L 84 28 Z" stroke={GOLD} fill={GOLD} fillOpacity={0.4} />
      <Walls x={82} y={86} w={26} h={12} towers={1} broken />
    </>
  ),
  raabe: () => (
    <>
      <Walls x={50} y={86} w={70} h={46} towers={0} />
      <rect x="38" y="44" width="24" height="18" fill="currentColor" fillOpacity={0.14} />
      <Person x={50} y={70} s={0.48} beard={false} head="veil" arm="open" />
      <path d="M 60 50 Q 66 64 62 86" stroke="#ff5a69" strokeWidth={3} />
      <path d="M 18 36 L 40 36 M 20 32 L 38 32" stroke={GOLD} strokeOpacity={0.7} />
    </>
  ),
  debora: () => (
    <>
      <Person x={40} y={62} s={0.95} beard={false} head="veil" arm="open" />
      <Palm x={76} y={54} s={0.95} />
      <Ground />
    </>
  ),
  gideao: () => (
    <>
      <Person x={44} y={60} s={0.95} arm="hold">
        <Jar x={25} y={-6} s={0.9} />
      </Person>
      <Trumpet x={20} y={44} s={0.9} />
      <Ground />
    </>
  ),
  sansao: () => (
    <>
      <path d="M 16 86 L 16 24 M 24 86 L 24 24 M 76 86 L 76 24 M 84 86 L 84 24 M 12 24 L 28 24 M 72 24 L 88 24" />
      <Person x={50} y={60} s={1} head="hair-long" arm="open" />
    </>
  ),
  samuel: () => (
    <>
      <Person x={44} y={60} s={0.95} arm="hold">
        <Horn x={26} y={-12} s={0.8} />
      </Person>
      <Ground />
    </>
  ),
  saul: () => (
    <>
      <Person x={46} y={58} s={1.12} head="crown" arm="hold" />
      <Spear x={72} y={50} h={60} />
      <Ground />
    </>
  ),
  davi: () => (
    <>
      <Person x={44} y={60} s={0.95} head="crown" arm="hold">
        <Harp x={28} y={-8} s={0.9} />
      </Person>
      <Sling x={20} y={56} s={0.8} />
      <Ground />
    </>
  ),

  // Semana 4
  templo: () => (
    <>
      <Temple x={50} y={60} s={1.25} />
      <Cloud x={50} y={22} s={0.8} />
      <path d="M 40 30 l -3 4 M 60 30 l 3 4" stroke={GOLD} />
    </>
  ),
  "divisao-reino": () => <Crown x={50} y={52} s={1.7} broken />,
  salomao: () => (
    <>
      <Person x={40} y={60} s={0.95} head="crown" arm="hold">
        <Scroll x={26} y={-8} w={12} />
      </Person>
      <Temple x={76} y={70} s={0.55} />
    </>
  ),
  jeroboao: () => (
    <>
      <Person x={34} y={60} s={0.9} head="crown" arm="open" />
      <Calf x={70} y={64} s={0.95} />
    </>
  ),
  roboao: () => (
    <>
      <Person x={40} y={60} s={0.92} head="crown" arm="hold" />
      <Yoke x={76} y={46} s={0.8} />
      <Ground />
    </>
  ),
  elias: () => (
    <>
      <Person x={36} y={60} s={0.92} arm="up" />
      <Altar x={72} y={74} s={0.75} />
      <Flame x={72} y={56} s={1.3} />
      <path d="M 72 16 L 70 30 M 80 20 L 76 32 M 64 20 L 68 32" stroke={GOLD} />
    </>
  ),
  acabe: () => (
    <>
      <Person x={36} y={60} s={0.92} head="crown" arm="open" />
      <path d="M 62 86 L 62 50 M 82 86 L 82 50 M 58 50 L 86 50" />
      <Grapes x={72} y={60} s={1} />
      <Ground />
    </>
  ),
  eliseu: () => (
    <>
      <Person x={42} y={58} s={0.92} arm="hold">
        <path d="M 22 -8 Q 30 4 26 16 Q 22 22 16 18" stroke={GOLD} />
      </Person>
      <Waves x={74} y={78} w={34} n={2} />
    </>
  ),
  aram: () => <Gate x={50} y={60} s={1.2} />,
  assiria: () => <Lion x={50} y={62} s={1.35} wings />,
  coroa: () => (
    <>
      <Crown x={50} y={36} s={1.3} />
      <Scroll x={50} y={70} w={34} open />
    </>
  ),
  "profeta-rolo": () => (
    <>
      <Person x={42} y={60} s={0.95} arm="hold">
        <Scroll x={26} y={-8} w={16} open />
      </Person>
      <Ground />
    </>
  ),

  // Semana 5
  "queda-samaria": () => (
    <>
      <Walls x={50} y={74} w={60} h={24} broken />
      <path d="M 18 30 l 10 8 M 30 22 l 6 10 M 82 30 l -10 8" stroke={GOLD} />
    </>
  ),
  "cerco-jerusalem": () => (
    <>
      <Walls x={60} y={74} w={50} h={26} />
      <path d="M 8 70 L 28 66 M 26 62 L 32 66 L 26 70" strokeWidth={3} />
      <Spear x={14} y={56} h={34} />
      <Spear x={22} y={58} h={30} />
    </>
  ),
  isaias: () => (
    <>
      <Person x={40} y={60} s={0.95} arm="up">
        <Flame x={18} y={-46} s={0.55} />
      </Person>
      <Scroll x={74} y={62} w={22} open />
    </>
  ),
  ezequias: () => (
    <>
      <Person x={36} y={60} s={0.92} head="crown" arm="pray" />
      <path d="M 60 86 L 60 76 L 68 76 L 68 66 L 76 66 L 76 56 L 84 56 L 84 46 L 92 46" />
      <circle cx="80" cy="22" r="6" stroke={GOLD} />
      <path d="M 76 30 L 66 72" stroke={GOLD} strokeDasharray="3 3" />
    </>
  ),
  manasses: () => (
    <>
      <Person x={36} y={60} s={0.92} head="crown" arm="open" />
      <path d="M 74 86 L 74 28 M 68 36 L 80 36 M 70 46 L 78 46" />
      <circle cx="74" cy="24" r="4" />
      <Flame x={86} y={78} s={0.6} />
    </>
  ),
  babilonia: () => <Gate x={50} y={60} s={1.2} lions />,
  amos: () => (
    <>
      <Person x={38} y={60} s={0.92} arm="hold" />
      <path d="M 66 86 L 66 30 M 66 30 L 82 30" />
      <Plumb x={80} y={52} s={0.9} />
      <Ground />
    </>
  ),
  oseias: () => (
    <>
      <Person x={38} y={60} s={0.92} arm="open" />
      <Heart x={72} y={42} s={1.3} />
      <Ground />
    </>
  ),
  joel: () => (
    <>
      <Locust x={30} y={30} s={1.1} />
      <Locust x={68} y={22} s={0.7} />
      <path d="M 50 40 L 40 62 M 56 40 L 56 64 M 62 40 L 72 62" stroke={GOLD} />
      <Group x={56} y={74} n={3} s={0.4} />
    </>
  ),
  miqueias: () => (
    <>
      <Person x={34} y={60} s={0.9} arm="hold" />
      <Walls x={74} y={74} w={30} h={14} towers={1} />
      <Stars x={74} y={34} n={1} r={2} />
      <circle cx="74" cy="34" r="5" stroke={GOLD} strokeOpacity={0.5} />
    </>
  ),
  jonas: () => (
    <>
      <Fish x={52} y={50} s={1.4} />
      <Person x={46} y={53} s={0.28} arm="pray" />
      <Waves x={50} y={78} w={80} n={2} />
    </>
  ),
  naum: () => (
    <>
      <Lion x={44} y={62} s={1.1} />
      <Walls x={82} y={84} w={24} h={14} broken towers={1} />
    </>
  ),

  // Semana 6
  "queda-jerusalem": () => (
    <>
      <Walls x={50} y={76} w={64} h={26} broken />
      <Flame x={28} y={38} s={0.9} />
      <Flame x={70} y={34} s={0.7} />
    </>
  ),
  exilio: () => (
    <>
      <Group x={46} y={64} n={4} s={0.5} />
      <Footprints x={14} y={88} />
      <path d="M 78 50 L 92 50 M 86 44 L 92 50 L 86 56" stroke={GOLD} />
    </>
  ),
  ciro: () => (
    <>
      <Person x={36} y={60} s={0.95} head="crown" arm="hold">
        <Scroll x={26} y={-8} w={18} open />
      </Person>
      <Gate x={80} y={70} s={0.45} />
    </>
  ),
  josias: () => (
    <>
      <Person x={42} y={60} s={0.95} head="crown" arm="hold">
        <Scroll x={26} y={-8} w={18} open />
      </Person>
      <Temple x={80} y={72} s={0.4} />
    </>
  ),
  jeremias: () => (
    <>
      <Person x={42} y={60} s={0.95} arm="hold">
        <Branch x={26} y={-12} s={0.7} />
      </Person>
      <Yoke x={42} y={34} s={0.55} />
      <Walls x={82} y={84} w={22} h={12} towers={1} broken />
    </>
  ),
  daniel: () => (
    <>
      <Person x={34} y={62} s={0.9} arm="pray" />
      <Lion x={72} y={70} s={0.85} />
      <Ground />
    </>
  ),
  ezequiel: () => (
    <>
      <Person x={30} y={62} s={0.85} arm="up" />
      <Wheel x={68} y={36} r={16} />
      <Wheel x={82} y={66} r={10} />
    </>
  ),
  persia: () => <Columns x={50} y={58} s={1.2} />,
  sofonias: () => (
    <>
      <Person x={40} y={60} s={0.95} arm="hold">
        <Lamp x={28} y={-8} s={0.8} />
      </Person>
      <Walls x={82} y={84} w={22} h={12} towers={1} />
    </>
  ),
  habacuque: () => (
    <>
      <Tower x={66} y={60} s={1.1} />
      <Person x={66} y={30} s={0.34} arm="up" />
      <Person x={28} y={64} s={0.75} arm="up" />
      <Ground />
    </>
  ),
}

export const ART_IDS = Object.keys(ART)
