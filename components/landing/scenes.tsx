// components/landing/scenes.tsx — 20 animated illustrations of life in Purbachal New Town.
import React from "react";
import {
  W,
  H,
  rng,
  pick,
  Sky,
  Sun,
  Moon,
  Stars,
  Clouds,
  CloudShape,
  Birds,
  Skyline,
  Tower,
  Villa,
  Tree,
  TreeRow,
  Flowers,
  Hedge,
  Water,
  Road,
  Sidewalk,
  LampPost,
  Bench,
  BdFlag,
  Car,
  CarKind,
  Bus,
  Rickshaw,
  Cng,
  Ambulance,
  Truck,
  Walker,
  Cyclist,
  Mosque,
  GateArch,
  Fountain,
  Crane,
  SolarPanels,
  WindTurbine,
  Rain,
  Firework,
  Lantern,
  Kite,
  Fence,
} from "./scene-kit";

export type SceneMeta = { key: string; title: string; bn: string; caption: string; tone: "light" | "dark"; Render: () => React.ReactElement };

const LUX = ["#1D2228", "#F2F2EE", "#AEB7BF", "#8E1C2A", "#1F3A63", "#C9B28A", "#0F6E56", "#3C3F44"];
const EVERYDAY = ["#E2553C", "#2F6FDE", "#F2F2EE", "#AEB7BF", "#1E8E6E", "#F4A62A", "#7C4DBA", "#1D2228"];

/** Cars evenly spread along a lane so the road is busy from the first frame. */
function Lane({ y, dir, n, dur, s = 1, seed = 1, colors = LUX, kinds = ["sedan", "luxury", "suv", "sports"] as CarKind[], night = false }: { y: number; dir: 1 | -1; n: number; dur: number; s?: number; seed?: number; colors?: string[]; kinds?: CarKind[]; night?: boolean }) {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Car key={i} y={y} dir={dir} s={s} night={night} kind={pick(r, kinds)} color={pick(r, colors)} dur={dur * (0.92 + r() * 0.16)} delay={-((dur / n) * i + r() * (dur / n) * 0.5)} />
      ))}
    </g>
  );
}

function Crowd({ y, n, seed = 1, h = 56, dur = [60, 90], umbrella, attires }: { y: number; n: number; seed?: number; h?: number; dur?: [number, number]; umbrella?: string[]; attires?: Array<"shirt" | "saree" | "panjabi"> }) {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const d = dur[0] + r() * (dur[1] - dur[0]);
        return (
          <Walker
            key={i}
            y={y + (r() - 0.5) * 6}
            dir={r() > 0.5 ? 1 : -1}
            dur={d}
            delay={-r() * d}
            seed={seed * 100 + i}
            h={h * (0.9 + r() * 0.15)}
            attire={attires ? pick(r, attires) : undefined}
            umbrella={umbrella ? pick(r, umbrella) : undefined}
          />
        );
      })}
    </g>
  );
}

function Boat({ x, y, s = 1, sail = "#F2F2EE", dur = 90, delay = 0 }: { x?: number; y: number; s?: number; sail?: string; dur?: number; delay?: number }) {
  const body = (
    <g className="pns-bob" style={{ ["--dur" as any]: "2.8s" }}>
      <path d="M-50 0 L50 0 L36 18 L-36 18 Z" fill="#8A5A3C" />
      <path d="M-50 0 L50 0 L48 5 L-48 5Z" fill="#C8553D" />
      <rect x={-2} y={-90} width={4} height={90} fill="#5B4636" />
      <path d="M2 -86 L46 -8 L2 -8 Z" fill={sail} />
      <path d="M-2 -70 L-36 -8 L-2 -8 Z" fill="#F4A62A" opacity={0.9} />
    </g>
  );
  if (x !== undefined) return <g transform={`translate(${x} ${y}) scale(${s})`}>{body}</g>;
  return (
    <g className="pns-move" style={{ ["--dur" as any]: `${dur}s`, ["--delay" as any]: `${delay}s`, ["--fx" as any]: "-120px", ["--tx" as any]: "1720px" }}>
      <g transform={`translate(0 ${y}) scale(${s})`}>{body}</g>
    </g>
  );
}

// ---------------------------------------------------------------------------
// 1. Grand Boulevard — wide divided avenue, palms and luxury cars
// ---------------------------------------------------------------------------
function GrandBoulevard() {
  return (
    <g>
      <Sky kind="day" />
      <Sun x={1360} y={150} r={52} />
      <Clouds count={6} seed={1} y={[60, 280]} />
      <Birds y={190} dur={30} delay={-8} />
      <Skyline y={600} seed={2} color="#BACDDD" height={[160, 360]} />
      <Skyline y={600} seed={5} color="#A6BCD0" height={[90, 230]} />
      <Tower x={40} base={600} w={150} h={380} color="#F1E7D6" seed={3} />
      <Tower x={210} base={600} w={120} h={300} style="glass" seed={4} />
      <Tower x={1080} base={600} w={170} h={430} color="#E8EEF2" trim="#B9C5CE" seed={6} />
      <Tower x={1270} base={600} w={120} h={330} style="glass" glass="url(#glass-warm)" seed={7} />
      <Tower x={1410} base={600} w={170} h={370} color="#F3DCCB" trim="#D9B79E" seed={8} />
      <TreeRow x0={20} x1={1600} y={612} gap={110} s={0.9} kinds={["round", "palm", "round", "flame"]} seed={9} />
      <Sidewalk y={604} h={24} />
      {[120, 520, 920, 1320].map(x => (
        <LampPost key={x} x={x} base={622} h={120} />
      ))}
      <Crowd y={624} n={7} seed={3} h={42} />
      <Road y={628} h={72} lanes={2} />
      <Lane y={662} dir={-1} n={4} dur={13} s={0.66} seed={11} />
      <Lane y={694} dir={-1} n={3} dur={11} s={0.7} seed={12} />
      {/* decorated median */}
      <rect x={0} y={700} width={W} height={34} fill="#5FAA55" />
      <rect x={0} y={700} width={W} height={5} fill="#E6DED0" />
      <rect x={0} y={729} width={W} height={5} fill="#E6DED0" />
      <Flowers x0={0} x1={W} y={722} seed={14} />
      {[60, 340, 620, 900, 1180, 1460].map(x => (
        <Tree key={x} x={x} y={716} s={0.95} kind="palm" />
      ))}
      {[200, 760, 1320].map(x => (
        <LampPost key={x} x={x} base={720} h={150} double />
      ))}
      <Road y={734} h={118} lanes={2} />
      <Lane y={790} dir={1} n={3} dur={8.5} s={1} seed={15} />
      <Lane y={846} dir={1} n={3} dur={7.2} s={1.08} seed={16} />
      <Sidewalk y={852} h={48} />
      <Hedge x0={0} x1={W} y={900} h={18} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 2. Lakeside Promenade
// ---------------------------------------------------------------------------
function Lakeside() {
  return (
    <g>
      <Sky kind="morning" />
      <Sun x={1180} y={330} r={58} />
      <Clouds count={4} seed={21} y={[60, 220]} />
      <Birds y={250} dur={34} delay={-12} />
      <Birds y={160} dur={40} delay={-3} count={3} s={0.8} />
      <Skyline y={548} seed={22} color="#C9B8C8" height={[120, 300]} />
      <Tower x={980} base={548} w={110} h={320} color="#EADDE0" trim="#CDB9BE" seed={23} />
      <Tower x={1110} base={548} w={90} h={250} style="glass" seed={24} />
      <TreeRow x0={0} x1={W} y={560} gap={70} s={0.55} kinds={["round", "round", "palm"]} seed={25} />
      <Water y={556} h={176} kind="day" seed={26} />
      <g transform="translate(0 1112) scale(1 -1)" opacity={0.16}>
        <Skyline y={548} seed={22} color="#ffffff" height={[120, 300]} />
      </g>
      <Boat y={630} s={0.7} dur={120} delay={-30} />
      <Boat y={680} s={0.9} dur={150} delay={-100} sail="#FFE0B8" />
      {/* promenade */}
      <rect x={0} y={724} width={W} height={10} fill="#C8BFAE" />
      {Array.from({ length: 54 }, (_, i) => (
        <rect key={i} x={i * 30} y={694} width={4} height={32} fill="#7D8790" />
      ))}
      <rect x={0} y={692} width={W} height={5} fill="#7D8790" />
      <Sidewalk y={732} h={58} color="#E3D9C8" />
      {[200, 640, 1080, 1500].map(x => (
        <LampPost key={x} x={x} base={760} h={150} />
      ))}
      <Bench x={380} base={772} />
      <Bench x={1240} base={772} />
      <Walker x={398} y={756} still seed={41} h={50} />
      <Crowd y={782} n={6} seed={27} h={62} attires={["shirt", "saree", "panjabi"]} />
      <Cyclist y={786} dir={1} dur={20} delay={-6} seed={28} />
      <Cyclist y={786} dir={-1} dur={24} delay={-15} seed={29} frame="#2F6FDE" />
      <rect x={0} y={790} width={W} height={110} fill="url(#grass)" />
      <Flowers x0={0} x1={W} y={812} seed={30} />
      <TreeRow x0={-40} x1={W} y={900} gap={300} s={1.2} kinds={["round", "flame"]} seed={31} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 3. Welcome Home — gated entrance with a lifting barrier
// ---------------------------------------------------------------------------
function WelcomeGate() {
  return (
    <g>
      <Sky kind="day" />
      <Sun x={1420} y={140} r={48} />
      <Clouds count={5} seed={41} y={[50, 240]} />
      <Skyline y={600} seed={42} color="#BFD0DE" height={[120, 280]} />
      <Villa x={620} base={640} w={210} color="#F7EDE2" roof="#C8553D" />
      <Villa x={880} base={640} w={230} color="#EAF2EC" roof="#2F6FDE" accent="#1E3A5F" />
      <TreeRow x0={560} x1={1200} y={650} gap={130} s={0.8} kinds={["round", "flame"]} seed={43} />
      <rect x={0} y={640} width={W} height={260} fill="url(#grass)" />
      {/* boundary wall */}
      <rect x={0} y={600} width={560} height={64} fill="#E8DFCF" />
      <rect x={1160} y={600} width={440} height={64} fill="#E8DFCF" />
      <rect x={0} y={596} width={560} height={8} fill="#0F6E56" />
      <rect x={1160} y={596} width={440} height={8} fill="#0F6E56" />
      <Flowers x0={0} x1={560} y={672} seed={44} />
      <Flowers x0={1160} x1={W} y={672} seed={45} />
      <Road y={690} h={120} lanes={2} />
      <GateArch x={860} base={700} s={1.2} />
      <BdFlag x={530} base={600} h={170} />
      <BdFlag x={1190} base={600} h={170} />
      {/* guard booth */}
      <rect x={420} y={590} width={90} height={110} rx={6} fill="#F4EEE2" />
      <rect x={430} y={606} width={70} height={40} rx={4} fill="url(#glass)" />
      <rect x={412} y={580} width={106} height={14} rx={4} fill="#0F6E56" />
      <Walker x={465} y={700} still seed={46} h={60} />
      {/* barrier */}
      <rect x={608} y={652} width={22} height={52} rx={4} fill="#3B3B3B" />
      <g transform="translate(619 660)">
        <g className="pns-boom">
          <rect x={0} y={-6} width={440} height={12} rx={6} fill="#F2F2EE" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={20 + i * 54} y={-6} width={26} height={12} fill="#E2553C" />
          ))}
        </g>
      </g>
      <g style={{ ["--delay" as any]: "0s" }}>
        <Car y={770} dir={1} kind="luxury" color="#1D2228" dur={9} delay={0} />
      </g>
      <Car y={800} dir={-1} kind="suv" color="#F2F2EE" dur={14} delay={-4} s={1.05} />
      <Walker y={830} dir={1} dur={40} delay={-10} seed={47} h={70} attire="saree" />
      <Walker y={832} dir={1} dur={40} delay={-11.2} seed={48} h={46} child />
      <rect x={0} y={810} width={W} height={90} fill="#D9D3C7" />
      <Hedge x0={0} x1={W} y={900} h={30} />
      <Flowers x0={0} x1={W} y={878} seed={49} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 4. Villa Lane
// ---------------------------------------------------------------------------
function VillaLane() {
  const villas = [
    { x: 20, c: "#F7EDE2", roof: "#C8553D", acc: "#2F5D50" },
    { x: 330, c: "#EAF2EC", roof: "#2F6FDE", acc: "#1E3A5F", flip: true },
    { x: 640, c: "#FFF4D6", roof: "#7C4DBA", acc: "#4A3B6B" },
    { x: 950, c: "#F3E3E8", roof: "#1E8E6E", acc: "#2F5D50", flip: true },
    { x: 1260, c: "#E6EEF5", roof: "#E2553C", acc: "#3A4A5A" },
  ];
  return (
    <g>
      <Sky kind="day" />
      <Sun x={240} y={130} r={46} />
      <Clouds count={5} seed={51} y={[60, 260]} />
      <Birds y={220} dur={36} delay={-20} />
      <Skyline y={560} seed={52} color="#C4D4E2" height={[80, 240]} />
      <TreeRow x0={0} x1={W} y={580} gap={90} s={0.75} kinds={["round", "pine"]} seed={53} />
      <rect x={0} y={575} width={W} height={120} fill="url(#grass)" />
      {villas.map(v => (
        <Villa key={v.x} x={v.x + 40} base={680} w={240} color={v.c} roof={v.roof} accent={v.acc} flip={v.flip} />
      ))}
      <Fence x0={0} x1={W} base={706} />
      {[300, 610, 920, 1230].map(x => (
        <Tree key={x} x={x + 15} y={700} s={0.95} kind="flame" />
      ))}
      <Flowers x0={0} x1={W} y={700} seed={54} />
      <Sidewalk y={706} h={34} />
      <Crowd y={734} n={5} seed={55} h={54} attires={["shirt", "saree"]} />
      <Road y={740} h={92} lanes={2} />
      <Car y={784} dir={1} kind="suv" color="#1F3A63" dur={16} delay={-3} />
      <Car y={822} dir={-1} kind="hatch" color="#E2553C" dur={18} delay={-11} />
      <Cyclist y={826} dir={1} dur={26} delay={-14} seed={56} s={0.9} />
      <Sidewalk y={832} h={68} />
      <Walker y={880} dir={-1} dur={50} delay={-20} seed={57} h={70} />
      <Walker y={882} dir={-1} dur={50} delay={-21} seed={58} h={44} child />
      {[160, 760, 1360].map(x => (
        <LampPost key={x} x={x} base={860} h={170} />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// 5. Central Park & Fountain
// ---------------------------------------------------------------------------
function CentralPark() {
  return (
    <g>
      <Sky kind="day" />
      <Sun x={1380} y={120} r={46} />
      <Clouds count={6} seed={61} y={[40, 260]} />
      <Birds y={150} dur={28} delay={-5} />
      <Kite x={1080} y={210} color="#E2553C" stringTo={[1230, 760]} />
      <Kite x={1300} y={150} color="#2F6FDE" tail="#F4A62A" delay={-2} stringTo={[1330, 770]} />
      <Kite x={620} y={240} color="#F4A62A" tail="#7C4DBA" delay={-4} stringTo={[470, 780]} />
      <Skyline y={560} seed={62} color="#C2D3E2" height={[120, 320]} />
      <TreeRow x0={-30} x1={W} y={600} gap={100} s={1.05} kinds={["round", "round", "flame", "pine"]} seed={63} />
      <rect x={0} y={590} width={W} height={310} fill="url(#grass)" />
      <ellipse cx={800} cy={760} rx={620} ry={70} fill="#E3D9C8" />
      <Fountain x={800} base={750} />
      <Bench x={250} base={720} />
      <Bench x={1290} base={720} />
      <Walker x={270} y={704} still seed={64} h={52} attire="saree" />
      <Walker x={300} y={704} still seed={65} h={52} />
      <Walker x={1320} y={704} still seed={66} h={52} attire="panjabi" />
      <Walker x={1230} y={790} still seed={67} h={44} child />
      <Walker x={1330} y={796} still seed={68} h={42} child />
      <Walker x={470} y={800} still seed={69} h={44} child />
      <Crowd y={808} n={6} seed={70} h={64} attires={["shirt", "saree", "panjabi"]} dur={[70, 100]} />
      <Flowers x0={0} x1={W} y={856} seed={71} />
      <TreeRow x0={-60} x1={W} y={920} gap={380} s={1.3} kinds={["round", "flame"]} seed={72} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 6. City Lights — the boulevard after dark
// ---------------------------------------------------------------------------
function CityLights() {
  return (
    <g>
      <Sky kind="night" />
      <Stars count={90} seed={81} />
      <Moon x={1320} y={140} r={40} />
      <Skyline y={610} seed={82} color="#1B2A4F" height={[180, 380]} lit />
      <Tower x={60} base={610} w={160} h={420} color="#24335C" trim="#1A2648" glass="#2E3E6E" lit seed={83} />
      <Tower x={240} base={610} w={120} h={320} style="glass" glass="#26365F" trim="#33447A" lit seed={84} />
      <Tower x={1100} base={610} w={170} h={460} color="#2A3A66" trim="#1A2648" glass="#2E3E6E" lit seed={85} />
      <Tower x={1300} base={610} w={130} h={360} style="glass" glass="#26365F" trim="#33447A" lit seed={86} />
      <TreeRow x0={0} x1={W} y={624} gap={120} s={0.85} kinds={["round", "palm"]} dark seed={87} />
      <Sidewalk y={616} h={22} color="#3A3F4A" tile={false} />
      <Road y={638} h={78} lanes={2} />
      <Lane y={674} dir={-1} n={4} dur={12} s={0.66} seed={88} night colors={EVERYDAY} />
      <Lane y={708} dir={-1} n={3} dur={10} s={0.72} seed={89} night />
      <rect x={0} y={716} width={W} height={26} fill="#24452F" />
      {[180, 600, 1020, 1440].map(x => (
        <LampPost key={x} x={x} base={730} h={160} on double />
      ))}
      <Road y={742} h={110} lanes={2} />
      <Lane y={796} dir={1} n={3} dur={8} s={1} seed={90} night />
      <Lane y={846} dir={1} n={3} dur={7} s={1.08} seed={91} night colors={EVERYDAY} />
      <Sidewalk y={852} h={48} color="#3A3F4A" tile={false} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 7. 300 Feet Expressway at sunset
// ---------------------------------------------------------------------------
function Expressway() {
  return (
    <g>
      <Sky kind="sunset" />
      <Sun x={1120} y={470} r={72} />
      <Clouds count={4} seed={101} y={[80, 260]} fill="#F6C6A8" opacity={0.75} />
      <Birds y={300} dur={30} delay={-6} color="#3B2A3A" />
      <Skyline y={560} seed={102} color="#6A4E7A" height={[40, 150]} />
      <Water y={556} h={344} kind="sunset" seed={103} />
      <rect x={1050} y={560} width={140} height={240} fill="#FFD27A" opacity={0.18} />
      <Boat y={800} s={0.8} dur={140} delay={-60} sail="#FFE0B8" />
      {/* deck & pillars */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={40 + i * 200} y={598} width={34} height={302} fill="#8E7C8C" />
      ))}
      <rect x={0} y={540} width={W} height={10} fill="#C9B6BE" />
      {Array.from({ length: 80 }, (_, i) => (
        <rect key={i} x={i * 20} y={526} width={3} height={16} fill="#C9B6BE" />
      ))}
      <rect x={0} y={524} width={W} height={4} fill="#C9B6BE" />
      <rect x={0} y={550} width={W} height={36} fill="#4A4550" />
      <line x1={0} x2={W} y1={568} y2={568} stroke="#F4D7A0" strokeWidth={3} strokeDasharray="40 30" />
      <Lane y={566} dir={-1} n={5} dur={7} s={0.62} seed={104} colors={EVERYDAY} />
      <Lane y={586} dir={1} n={5} dur={6} s={0.7} seed={105} />
      <rect x={0} y={586} width={W} height={18} fill="#B29FA8" />
      <rect x={0} y={604} width={W} height={6} fill="#5A4E5A" opacity={0.5} />
      {[100, 500, 900, 1300].map(x => (
        <LampPost key={x} x={x} base={540} h={120} on double />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// 8. Golden Sunrise
// ---------------------------------------------------------------------------
function Sunrise() {
  return (
    <g>
      <Sky kind="dawn" />
      <Sun x={820} y={390} r={74} rise />
      <Clouds count={4} seed={111} y={[100, 320]} fill="#F8C9A8" opacity={0.6} speed={[110, 160]} />
      <Birds y={280} dur={34} delay={-10} color="#2A2440" />
      <Birds y={220} dur={44} delay={-24} color="#2A2440" count={3} />
      <Skyline y={640} seed={112} color="#3E3558" height={[90, 250]} />
      <Tower x={130} base={640} w={150} h={440} color="#2E2846" trim="#241F38" glass="#3A3358" seed={113} roof />
      <Tower x={1240} base={640} w={170} h={470} color="#2E2846" trim="#241F38" glass="#3A3358" seed={114} />
      <rect x={0} y={560} width={W} height={120} fill="url(#mist)" />
      <TreeRow x0={-20} x1={W} y={700} gap={110} s={1} kinds={["round", "palm", "round"]} dark seed={115} />
      <rect x={0} y={690} width={W} height={210} fill="#2A3A30" />
      <rect x={0} y={760} width={W} height={46} fill="#B9A691" opacity={0.85} />
      <Crowd y={800} n={7} seed={116} h={60} attires={["shirt", "panjabi", "saree"]} dur={[80, 110]} />
      {[200, 700, 1200].map(x => (
        <LampPost key={x} x={x} base={770} h={160} on />
      ))}
      <rect x={0} y={806} width={W} height={94} fill="#1F2D25" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 9. Community Mosque at dusk
// ---------------------------------------------------------------------------
function MosqueScene() {
  return (
    <g>
      <Sky kind="dusk" />
      <Stars count={40} seed={121} maxY={300} />
      <Moon x={1240} y={170} r={38} crescent />
      <Skyline y={660} seed={122} color="#2E2F5A" height={[100, 260]} lit />
      <TreeRow x0={-40} x1={W} y={690} gap={140} s={1.05} kinds={["round", "palm"]} dark seed={123} />
      <Mosque x={800} base={700} s={1.05} lit />
      <rect x={0} y={690} width={W} height={210} fill="#2E3B35" />
      <rect x={0} y={740} width={W} height={60} fill="#5A5248" />
      {[150, 450, 1150, 1450].map(x => (
        <LampPost key={x} x={x} base={750} h={150} on />
      ))}
      <Crowd y={790} n={8} seed={124} h={60} attires={["panjabi", "panjabi", "shirt", "saree"]} dur={[80, 110]} />
      <Flowers x0={0} x1={W} y={826} seed={125} colors={["#F4A62A", "#FFD98A", "#E2553C"]} />
      <rect x={0} y={830} width={W} height={70} fill="#1F2A25" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 10. School Run
// ---------------------------------------------------------------------------
function SchoolRun() {
  return (
    <g>
      <Sky kind="morning" />
      <Sun x={1420} y={200} r={50} />
      <Clouds count={5} seed={131} y={[50, 240]} />
      <Skyline y={600} seed={132} color="#C9C3D3" height={[80, 220]} />
      <TreeRow x0={0} x1={W} y={620} gap={100} s={0.85} kinds={["round", "flame"]} seed={133} />
      {/* school */}
      <g>
        <rect x={420} y={360} width={760} height={300} fill="#F7E9D2" />
        <rect x={420} y={350} width={760} height={16} fill="#C8553D" />
        <rect x={700} y={300} width={200} height={70} fill="#F7E9D2" />
        <path d="M690 300 L800 250 L910 300 Z" fill="#C8553D" />
        <circle cx={800} cy={326} r={20} fill="#fff" stroke="#3B3B3B" strokeWidth={3} />
        <line x1={800} y1={326} x2={800} y2={312} stroke="#3B3B3B" strokeWidth={3} />
        <line x1={800} y1={326} x2={810} y2={330} stroke="#3B3B3B" strokeWidth={3} />
        <rect x={580} y={372} width={440} height={34} rx={6} fill="#0F6E56" />
        <text x={800} y={396} textAnchor="middle" fontSize={20} fontWeight={800} fill="#F6F4EE" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="2">
          COMMUNITY SCHOOL
        </text>
        {[0, 1, 2].map(row =>
          Array.from({ length: 9 }, (_, i) => (
            <rect key={`${row}-${i}`} x={450 + i * 82} y={428 + row * 74} width={50} height={44} rx={4} fill="url(#glass)" />
          ))
        )}
        <rect x={760} y={580} width={80} height={80} fill="#7A4E33" />
      </g>
      <BdFlag x={1240} base={660} h={200} />
      <rect x={0} y={650} width={W} height={60} fill="url(#grass)" />
      <Fence x0={0} x1={W} base={690} color="#E9E2D3" />
      <Sidewalk y={690} h={40} />
      <Crowd y={726} n={8} seed={134} h={46} dur={[50, 70]} />
      <Walker x={320} y={728} still seed={135} h={66} />
      <g transform="translate(350 680)">
        <rect x={-2} y={-40} width={4} height={50} fill="#5B6670" />
        <circle cx={0} cy={-48} r={16} fill="#E2553C" />
        <text x={0} y={-43} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff" fontFamily="sans-serif">
          STOP
        </text>
      </g>
      <Road y={730} h={110} lanes={2} />
      <Bus y={792} dir={1} dur={18} delay={-6} />
      <Car y={832} dir={-1} kind="hatch" color="#2F6FDE" dur={12} delay={-2} />
      <Rickshaw y={834} dir={1} dur={34} delay={-20} s={0.95} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={1340} y={736 + i * 13} width={130} height={7} fill="#F2F2EE" opacity={0.9} />
      ))}
      <Sidewalk y={840} h={60} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 11. Monsoon Evening
// ---------------------------------------------------------------------------
function Monsoon() {
  const umbrellas = ["#E2553C", "#2F6FDE", "#1E1A18", "#F4A62A", "#7C4DBA", "#1E8E6E"];
  return (
    <g>
      <Sky kind="rain" />
      <Clouds count={8} seed={141} y={[20, 220]} fill="#5E6B78" opacity={0.95} speed={[90, 130]} />
      <Skyline y={620} seed={142} color="#7E8C99" height={[160, 360]} lit />
      <Tower x={140} base={620} w={150} h={380} color="#9AA6B0" trim="#7E8A94" glass="#6F8191" seed={143} lit />
      <Tower x={1220} base={620} w={160} h={420} color="#A3AEB7" trim="#7E8A94" glass="#6F8191" seed={144} lit />
      <TreeRow x0={0} x1={W} y={640} gap={120} s={0.9} kinds={["round", "palm"]} seed={145} />
      <Sidewalk y={630} h={26} color="#9A9488" tile={false} />
      <Crowd y={652} n={6} seed={146} h={44} umbrella={umbrellas} />
      <Road y={656} h={150} lanes={2} />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} transform={`translate(${80 + i * 160} ${700 + (i % 3) * 30})`}>
          <ellipse rx={60} ry={8} fill="#8FA3B5" opacity={0.35} />
          <ellipse rx={30} ry={5} fill="none" stroke="#DDE7EE" strokeWidth={1.5} className="pns-ripple" style={{ ["--delay" as any]: `${-i * 0.37}s`, ["--dur" as any]: "1.6s" }} />
        </g>
      ))}
      <Rickshaw y={730} dir={1} dur={32} delay={-4} rain />
      <Rickshaw y={736} dir={-1} dur={36} delay={-20} rain s={0.9} />
      <Cng y={780} dir={1} dur={15} delay={-9} />
      <Car y={800} dir={-1} kind="sedan" color="#AEB7BF" dur={12} delay={-3} night />
      <Car y={804} dir={1} kind="suv" color="#1D2228" dur={10} delay={-7} night />
      <Sidewalk y={806} h={94} color="#9A9488" tile={false} />
      <Crowd y={860} n={5} seed={147} h={70} umbrella={umbrellas} dur={[60, 80]} />
      <Rain count={170} seed={148} />
      <rect width={W} height={H} fill="#fff" className="pns-flash" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 12. Green & Solar living
// ---------------------------------------------------------------------------
function GreenSolar() {
  return (
    <g>
      <Sky kind="day" />
      <Sun x={1300} y={150} r={60} />
      <Clouds count={4} seed={151} y={[60, 240]} />
      <Birds y={210} dur={32} delay={-14} />
      <path d="M0 560 Q240 470 520 540 T1040 520 T1600 540 L1600 700 L0 700Z" fill="#9CCB86" />
      <path d="M0 610 Q300 540 640 600 T1280 590 T1600 610 L1600 720 L0 720Z" fill="#7DBB63" />
      <WindTurbine x={260} base={520} h={220} dur={6} />
      <WindTurbine x={420} base={545} h={180} dur={5} />
      <WindTurbine x={1460} base={540} h={240} dur={7} />
      <rect x={0} y={680} width={W} height={220} fill="url(#grass)" />
      {[
        { x: 120, c: "#FFF4D6", roof: "#1E8E6E" },
        { x: 470, c: "#EAF2EC", roof: "#2F6FDE" },
        { x: 820, c: "#F7EDE2", roof: "#C8553D" },
        { x: 1170, c: "#F3E3E8", roof: "#7C4DBA" },
      ].map((v, i) => (
        <g key={v.x}>
          <Villa x={v.x} base={760} w={250} color={v.c} roof={v.roof} flip={i % 2 === 1} />
          <SolarPanels x={v.x + (i % 2 ? 80 : 30)} y={566} n={3} />
        </g>
      ))}
      {[90, 440, 790, 1140, 1490].map(x => (
        <Tree key={x} x={x} y={772} s={0.9} kind={x % 2 ? "round" : "pine"} />
      ))}
      <Flowers x0={0} x1={W} y={776} seed={152} />
      <rect x={0} y={780} width={W} height={46} fill="#D9D3C7" />
      <rect x={0} y={790} width={W} height={26} fill="#4FA25A" opacity={0.55} />
      <Cyclist y={814} dir={1} dur={20} delay={-3} seed={153} />
      <Cyclist y={814} dir={-1} dur={24} delay={-13} seed={154} frame="#1E8E6E" />
      <Crowd y={862} n={5} seed={155} h={66} attires={["shirt", "saree"]} />
      <Flowers x0={0} x1={W} y={890} seed={156} colors={["#F4A62A", "#FFFFFF", "#E2553C"]} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 13. Neighbourhood Market
// ---------------------------------------------------------------------------
function Market() {
  const shops = [
    { label: "GROCERY", awn: ["#1E8E6E", "#F2F2EE"] },
    { label: "PHARMACY", awn: ["#2F6FDE", "#F2F2EE"] },
    { label: "BAKERY", awn: ["#E2553C", "#FFF4D6"] },
    { label: "CAFÉ", awn: ["#7A4E33", "#F4D7A0"] },
    { label: "BOOKS", awn: ["#7C4DBA", "#F2F2EE"] },
  ];
  return (
    <g>
      <Sky kind="day" />
      <Clouds count={5} seed={161} y={[40, 220]} />
      <Skyline y={420} seed={162} color="#C4D4E2" height={[80, 200]} />
      <Tower x={0} base={430} w={1600} h={110} color="#EFE6D8" trim="#D3C6B2" seed={163} roof={false} />
      <rect x={0} y={300} width={W} height={20} fill="#D3C6B2" />
      {shops.map((sh, i) => {
        const x = 20 + i * 316;
        return (
          <g key={sh.label}>
            <rect x={x} y={430} width={300} height={250} fill="#F7F1E6" />
            <rect x={x + 20} y={440} width={260} height={40} rx={6} fill="#1D2228" />
            <text x={x + 150} y={468} textAnchor="middle" fontSize={20} fontWeight={800} fill="#F4A62A" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="2">
              {sh.label}
            </text>
            <g>
              {Array.from({ length: 10 }, (_, k) => (
                <path key={k} d={`M${x + k * 30} 496 h30 l-4 44 q-11 10 -22 0z`} fill={sh.awn[k % 2]} />
              ))}
            </g>
            <rect x={x + 26} y={556} width={150} height={124} fill="url(#glass)" />
            <rect x={x + 196} y={566} width={80} height={114} fill="#5B4636" />
            {Array.from({ length: 5 }, (_, k) => (
              <circle key={k} cx={x + 44 + k * 28} cy={652} r={9} fill={["#E2553C", "#F4A62A", "#1E8E6E", "#F2C230", "#C04A9B"][k]} />
            ))}
          </g>
        );
      })}
      <Sidewalk y={680} h={60} />
      <Crowd y={736} n={10} seed={164} h={60} attires={["shirt", "saree", "panjabi"]} dur={[60, 90]} />
      {/* fruit cart */}
      <g transform="translate(1180 736)">
        <rect x={-60} y={-46} width={120} height={20} fill="#8A5A3C" />
        {Array.from({ length: 8 }, (_, k) => (
          <circle key={k} cx={-50 + k * 14} cy={-52} r={7} fill={["#F4A62A", "#E2553C", "#9BCB4A"][k % 3]} />
        ))}
        <circle cx={-40} cy={-12} r={12} fill="none" stroke="#3B3B3B" strokeWidth={3} />
        <circle cx={40} cy={-12} r={12} fill="none" stroke="#3B3B3B" strokeWidth={3} />
      </g>
      <Walker x={1270} y={736} still seed={165} h={62} />
      <Road y={740} h={110} lanes={2} />
      <Rickshaw y={792} dir={1} dur={30} delay={-5} hood="#2F6FDE" />
      <Rickshaw y={796} dir={1} dur={30} delay={-19} hood="#F4A62A" />
      <Cng y={830} dir={-1} dur={14} delay={-6} />
      <Car y={840} dir={-1} kind="taxi" dur={11} delay={-1} />
      <Sidewalk y={850} h={50} />
      {[300, 940].map(x => (
        <LampPost key={x} x={x} base={880} h={190} />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// 14. Playground & sports
// ---------------------------------------------------------------------------
function Playground() {
  return (
    <g>
      <Sky kind="day" />
      <Sun x={240} y={130} r={44} />
      <Clouds count={5} seed={171} y={[40, 240]} />
      <Kite x={1240} y={180} color="#F4A62A" tail="#E2553C" stringTo={[1420, 640]} />
      <Kite x={980} y={130} color="#1E8E6E" tail="#F2F2EE" delay={-3} stringTo={[1460, 650]} />
      <Skyline y={520} seed={172} color="#C2D3E2" height={[100, 260]} />
      <TreeRow x0={-30} x1={W} y={560} gap={95} s={0.95} kinds={["round", "flame", "round", "pine"]} seed={173} />
      <rect x={0} y={550} width={W} height={350} fill="#5FAA55" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={i * 200} y={560} width={100} height={340} fill="#69B55E" />
      ))}
      <rect x={120} y={590} width={1360} height={260} fill="none" stroke="#F2F2EE" strokeWidth={5} />
      <line x1={800} y1={590} x2={800} y2={850} stroke="#F2F2EE" strokeWidth={5} />
      <ellipse cx={800} cy={720} rx={110} ry={60} fill="none" stroke="#F2F2EE" strokeWidth={5} />
      {[120, 1480].map((gx, i) => (
        <g key={gx}>
          <rect x={gx - (i ? 0 : 6)} y={640} width={6} height={130} fill="#F2F2EE" />
          <rect x={gx + (i ? -40 : 0)} y={640} width={46} height={6} fill="#F2F2EE" />
          <rect x={gx + (i ? -40 : 40)} y={640} width={6} height={130} fill="#F2F2EE" opacity={0.6} />
        </g>
      ))}
      {[
        [360, 700, 1],
        [520, 760, -1],
        [640, 680, 1],
        [930, 740, -1],
        [1080, 690, 1],
        [1220, 780, -1],
        [780, 820, 1],
      ].map(([x, y, d], i) => (
        <g key={i} className="pns-bob" style={{ ["--dur" as any]: `${0.9 + i * 0.13}s`, ["--amp" as any]: "10px" }}>
          <Walker x={x} y={y} dir={d as 1 | -1} seed={174 + i} h={48} child />
        </g>
      ))}
      <g transform="translate(470 760)">
        <g className="pns-ball" style={{ ["--dur" as any]: "4.6s" }}>
          <circle r={11} fill="#fff" />
          <circle r={4} fill="#1D2228" />
        </g>
      </g>
      <Bench x={1400} base={880} />
      <Walker x={1420} y={864} still seed={181} h={54} attire="saree" />
      <Walker x={1452} y={864} still seed={182} h={54} />
      <Walker x={1440} y={660} still seed={183} h={40} child />
      <Walker x={1475} y={668} still seed={184} h={40} child />
      <Hedge x0={0} x1={W} y={900} h={26} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 15. Building our future — construction
// ---------------------------------------------------------------------------
function Construction() {
  const floors = 12;
  return (
    <g>
      <Sky kind="day" />
      <Sun x={1440} y={140} r={46} />
      <Clouds count={5} seed={191} y={[60, 260]} />
      <Skyline y={640} seed={192} color="#C2D3E2" height={[160, 360]} />
      <Tower x={80} base={640} w={170} h={420} color="#EDE4D4" seed={193} />
      <Tower x={1260} base={640} w={150} h={380} style="glass" seed={194} />
      {/* rising tower */}
      <g>
        <rect x={600} y={640 - floors * 34} width={300} height={floors * 34} fill="none" stroke="#C9C1B2" strokeWidth={2} strokeDasharray="6 6" />
        {Array.from({ length: floors }, (_, f) => (
          <g key={f} className="pns-rise" style={{ ["--delay" as any]: `${f * 1.1}s`, ["--dur" as any]: "16s" }}>
            <rect x={600} y={640 - (f + 1) * 34} width={300} height={34} fill={f % 2 ? "#E6DED0" : "#EFE8DC"} />
            {Array.from({ length: 6 }, (_, k) => (
              <rect key={k} x={612 + k * 48} y={640 - (f + 1) * 34 + 8} width={32} height={18} fill={f > 8 ? "#BFC6CC" : "url(#glass)"} />
            ))}
          </g>
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={590 + i * 54} y1={640} x2={590 + i * 54} y2={640 - floors * 34 - 20} stroke="#B98A4E" strokeWidth={3} opacity={0.7} />
        ))}
      </g>
      <Crane x={960} base={640} h={460} jib={360} dur={18} />
      <Crane x={430} base={640} h={380} jib={280} color="#E2553C" dur={14} />
      <rect x={0} y={640} width={W} height={260} fill="#C8B79A" />
      <rect x={0} y={640} width={W} height={60} fill="#B7A27C" />
      <rect x={150} y={600} width={1300} height={60} fill="#0F6E56" />
      <text x={800} y={640} textAnchor="middle" fontSize={26} fontWeight={800} fill="#F6F4EE" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="3">
        BUILDING OUR COMMUNITY TOGETHER
      </text>
      <Road y={700} h={100} lanes={2} />
      <Truck y={752} dir={1} dur={20} delay={-4} />
      <Truck y={794} dir={-1} dur={24} delay={-15} color="#2F6FDE" />
      <Car y={792} dir={1} kind="suv" color="#F2F2EE" dur={11} delay={-8} />
      <rect x={0} y={800} width={W} height={100} fill="#D9D3C7" />
      {[
        [300, "#F4A62A"],
        [380, "#F4A62A"],
        [1100, "#F2F2EE"],
      ].map(([x, hat], i) => (
        <g key={i}>
          <Walker x={x as number} y={860} still={i === 2} seed={195 + i} h={64} />
          <ellipse cx={x as number} cy={860 - 64 * 1.04} rx={11} ry={6} fill={hat as string} />
        </g>
      ))}
      <Crowd y={870} n={4} seed={198} h={64} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 16. Cycle track at sunset
// ---------------------------------------------------------------------------
function CycleTrack() {
  return (
    <g>
      <Sky kind="sunset" />
      <Sun x={400} y={470} r={70} />
      <Clouds count={4} seed={201} y={[60, 260]} fill="#F7B79A" opacity={0.7} />
      <Birds y={250} dur={30} delay={-9} color="#3B2A3A" />
      <Skyline y={600} seed={202} color="#7A5F86" height={[100, 280]} />
      <Water y={600} h={80} kind="sunset" seed={203} />
      <TreeRow x0={-20} x1={W} y={690} gap={130} s={1.05} kinds={["palm", "round"]} dark seed={204} />
      <rect x={0} y={680} width={W} height={220} fill="#3E4A3A" />
      <rect x={0} y={710} width={W} height={60} fill="#C8B49C" opacity={0.9} />
      <Crowd y={762} n={6} seed={205} h={58} dur={[40, 60]} />
      <rect x={0} y={772} width={W} height={70} fill="#2E8B57" />
      <line x1={0} x2={W} y1={807} y2={807} stroke="#F2F2EE" strokeWidth={3} strokeDasharray="30 24" />
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i} transform={`translate(${200 + i * 400} 822)`} opacity={0.55}>
          <circle cx={-14} cy={0} r={9} fill="none" stroke="#F2F2EE" strokeWidth={2.5} />
          <circle cx={14} cy={0} r={9} fill="none" stroke="#F2F2EE" strokeWidth={2.5} />
          <path d="M-14 0 L0 -12 L14 0 M0 -12 L-4 -16" stroke="#F2F2EE" strokeWidth={2.5} fill="none" />
        </g>
      ))}
      <Cyclist y={806} dir={1} dur={14} delay={-2} seed={206} />
      <Cyclist y={806} dir={1} dur={16} delay={-9} seed={207} frame="#F4A62A" />
      <Cyclist y={838} dir={-1} dur={15} delay={-5} seed={208} frame="#2F6FDE" s={1.05} />
      <Cyclist y={838} dir={-1} dur={18} delay={-13} seed={209} frame="#F2F2EE" s={1.05} />
      {[100, 540, 980, 1420].map(x => (
        <LampPost key={x} x={x} base={712} h={170} on />
      ))}
      <rect x={0} y={842} width={W} height={58} fill="#2A332A" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 17. Care close by — hospital & ambulance
// ---------------------------------------------------------------------------
function CareClose() {
  return (
    <g>
      <Sky kind="day" />
      <Clouds count={5} seed={211} y={[50, 240]} />
      <Birds y={180} dur={30} delay={-4} />
      <Skyline y={640} seed={212} color="#C4D4E2" height={[100, 260]} />
      <Tower x={460} base={660} w={520} h={360} color="#F5F7F8" trim="#C9D3DA" seed={213} style="grid" />
      <rect x={662} y={300} width={116} height={360} fill="url(#glass)" />
      <rect x={662} y={300} width={116} height={6} fill="#C9D3DA" />
      <rect x={680} y={208} width={80} height={80} rx={14} fill="#1E8E6E" />
      <text x={720} y={269} textAnchor="middle" fontSize={56} fontWeight={900} fill="#fff" fontFamily="Plus Jakarta Sans, sans-serif">
        H
      </text>
      <rect x={560} y={600} width={320} height={60} fill="url(#glass)" />
      <rect x={540} y={588} width={360} height={14} fill="#1E8E6E" />
      <Tower x={1060} base={660} w={180} h={300} color="#EAF2EC" seed={214} />
      <rect x={1080} y={420} width={140} height={34} rx={6} fill="#1E8E6E" />
      <text x={1150} y={444} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="2">
        PHARMACY
      </text>
      <Tower x={140} base={660} w={200} h={340} color="#F3DCCB" seed={215} />
      <TreeRow x0={0} x1={W} y={680} gap={180} s={0.85} kinds={["round", "pine"]} seed={216} />
      <Sidewalk y={660} h={50} />
      <Crowd y={706} n={7} seed={217} h={56} attires={["shirt", "saree", "panjabi"]} />
      <Road y={710} h={130} lanes={2} />
      <Ambulance y={772} dir={1} dur={8} delay={-2} />
      <Car y={830} dir={-1} kind="sedan" color="#AEB7BF" dur={11} delay={-6} />
      <Car y={830} dir={-1} kind="hatch" color="#F4A62A" dur={12} delay={-1} />
      <Sidewalk y={840} h={60} />
      {[260, 900, 1460].map(x => (
        <LampPost key={x} x={x} base={870} h={190} />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// 18. Festival night — fireworks & lanterns
// ---------------------------------------------------------------------------
function Festival() {
  const fw = [
    { x: 340, y: 200, c: "#F4A62A", d: 0 },
    { x: 1180, y: 160, c: "#E2553C", d: 0.8 },
    { x: 760, y: 120, c: "#7FD1AE", d: 1.6 },
    { x: 1440, y: 260, c: "#C9A6FF", d: 2.2 },
    { x: 560, y: 280, c: "#FFD98A", d: 2.9 },
    { x: 980, y: 300, c: "#6EA1FF", d: 3.6 },
  ];
  const r = rng(221);
  return (
    <g>
      <Sky kind="night" />
      <Stars count={60} seed={222} />
      {fw.map((f, i) => (
        <Firework key={i} x={f.x} y={f.y} color={f.c} delay={-f.d} dur={4.2} size={80 + (i % 3) * 20} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <Lantern key={i} x={80 + r() * 1440} y={760 - r() * 100} delay={-r() * 14} dur={12 + r() * 6} drift={(r() - 0.5) * 140} color={pick(r, ["#F4A62A", "#E2553C", "#FFD98A"])} />
      ))}
      <Skyline y={600} seed={223} color="#1B2A4F" height={[120, 300]} lit />
      {[40, 340, 640, 940, 1240].map((x, i) => (
        <g key={x}>
          <Villa x={x + 30} base={700} w={250} color="#3A4366" roof="#5B3F6B" accent="#26304F" lit flip={i % 2 === 1} />
          {Array.from({ length: 14 }, (_, k) => (
            <circle
              key={k}
              cx={x + 40 + k * 14}
              cy={520 + Math.sin(k / 1.6) * 6}
              r={3.5}
              fill={["#F4A62A", "#E2553C", "#7FD1AE", "#FFD98A"][k % 4]}
              className="pns-twinkle"
              style={{ ["--dur" as any]: `${1 + (k % 4) * 0.4}s`, ["--delay" as any]: `${-k * 0.2}s` }}
            />
          ))}
        </g>
      ))}
      <rect x={0} y={700} width={W} height={200} fill="#1C2A22" />
      <TreeRow x0={-20} x1={W} y={720} gap={300} s={0.9} kinds={["palm", "round"]} dark seed={224} />
      <rect x={0} y={740} width={W} height={60} fill="#3C3A44" />
      {[200, 800, 1400].map(x => (
        <LampPost key={x} x={x} base={760} h={150} on />
      ))}
      <Crowd y={796} n={9} seed={225} h={60} attires={["panjabi", "saree", "shirt"]} dur={[90, 120]} />
      {[300, 420, 1100, 1180, 1250].map((x, i) => (
        <Walker key={x} x={x} y={870} still seed={226 + i} h={i % 2 ? 46 : 66} child={i % 2 === 1} attire={i === 0 ? "saree" : undefined} />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// 19. Master-planned township — aerial view
// ---------------------------------------------------------------------------
function MasterPlan() {
  const r = rng(231);
  const blocks: React.ReactNode[] = [];
  const cols = [0, 400, 920, 1320, 1600];
  const rows = [0, 300, 620, 900];
  const roofs = ["#C8553D", "#E9E4DA", "#2F6FDE", "#F4A62A", "#7C4DBA", "#1E8E6E", "#D9D3C7"];
  for (let ci = 0; ci < cols.length - 1; ci++)
    for (let ri = 0; ri < rows.length - 1; ri++) {
      const x0 = cols[ci] + 40;
      const x1 = cols[ci + 1] - 40;
      const y0 = rows[ri] + 40;
      const y1 = rows[ri + 1] - 40;
      const park = (ci === 1 && ri === 1) || (ci === 3 && ri === 0);
      if (park) {
        blocks.push(<rect key={`p${ci}${ri}`} x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={18} fill="#7DBB63" />);
        for (let t = 0; t < 26; t++) blocks.push(<circle key={`t${ci}${ri}${t}`} cx={x0 + 20 + r() * (x1 - x0 - 40)} cy={y0 + 20 + r() * (y1 - y0 - 40)} r={10 + r() * 12} fill={r() > 0.5 ? "#4FA25A" : "#3E8A4C"} />);
        continue;
      }
      blocks.push(<rect key={`b${ci}${ri}`} x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={10} fill="#E9E2D3" />);
      for (let px = x0 + 14; px < x1 - 50; px += 64)
        for (let py = y0 + 14; py < y1 - 50; py += 74) {
          blocks.push(<rect key={`h${px}-${py}`} x={px} y={py} width={48} height={52} rx={4} fill={pick(r, roofs)} />);
          blocks.push(<rect key={`s${px}-${py}`} x={px + 26} y={py} width={22} height={52} rx={4} fill="#000" opacity={0.07} />);
        }
      blocks.push(
        <text key={`l${ci}${ri}`} x={x0 + 14} y={y1 - 12} fontSize={16} fontWeight={800} fill="#5A6B64" fontFamily="Plus Jakarta Sans, sans-serif">
          SECTOR {ci * 3 + ri + 1}
        </text>
      );
    }
  const carsH = [300, 620].flatMap((y, k) =>
    Array.from({ length: 5 }, (_, i) => {
      const dir = (i + k) % 2 ? 1 : -1;
      const dur = 14 + r() * 8;
      return (
        <g key={`ch${y}${i}`} className="pns-move" style={{ ["--dur" as any]: `${dur}s`, ["--delay" as any]: `${-r() * dur}s`, ["--fx" as any]: dir > 0 ? "-60px" : "1660px", ["--tx" as any]: dir > 0 ? "1660px" : "-60px" }}>
          <rect x={0} y={y + (dir > 0 ? 8 : -26)} width={32} height={16} rx={5} fill={pick(r, EVERYDAY)} />
        </g>
      );
    })
  );
  const carsV = [400, 920, 1320].flatMap((x, k) =>
    Array.from({ length: 3 }, (_, i) => {
      const dir = (i + k) % 2 ? 1 : -1;
      const dur = 10 + r() * 6;
      return (
        <g key={`cv${x}${i}`} className="pns-move" style={{ ["--dur" as any]: `${dur}s`, ["--delay" as any]: `${-r() * dur}s`, ["--fx" as any]: "0px", ["--tx" as any]: "0px", ["--fy" as any]: dir > 0 ? "-60px" : "960px", ["--ty" as any]: dir > 0 ? "960px" : "-60px" }}>
          <rect x={x + (dir > 0 ? -26 : 8)} y={0} width={16} height={32} rx={5} fill={pick(r, EVERYDAY)} />
        </g>
      );
    })
  );
  return (
    <g>
      <rect width={W} height={H} fill="url(#sky-aerial)" />
      <path d="M1000 380 Q1120 330 1240 370 Q1300 420 1260 500 Q1200 560 1080 540 Q980 520 960 460 Q950 410 1000 380Z" fill="url(#water)" />
      {blocks}
      {[300, 620].map(y => (
        <g key={y}>
          <rect x={0} y={y - 32} width={W} height={64} fill="#5B6168" />
          <line x1={0} x2={W} y1={y} y2={y} stroke="#F4D35E" strokeWidth={3} strokeDasharray="30 22" />
        </g>
      ))}
      {[400, 920, 1320].map(x => (
        <g key={x}>
          <rect x={x - 32} y={0} width={64} height={H} fill="#5B6168" />
          <line x1={x} x2={x} y1={0} y2={H} stroke="#F4D35E" strokeWidth={3} strokeDasharray="30 22" />
        </g>
      ))}
      {[400, 920, 1320].flatMap(x => [300, 620].map(y => <rect key={`${x}${y}`} x={x - 32} y={y - 32} width={64} height={64} fill="#5B6168" />))}
      <circle cx={920} cy={620} r={26} fill="#7DBB63" />
      {carsH}
      {carsV}
      <g opacity={0.5}>
        <Clouds count={3} seed={232} y={[120, 760]} speed={[60, 90]} />
      </g>
    </g>
  );
}

// ---------------------------------------------------------------------------
// 20. Metro connection
// ---------------------------------------------------------------------------
function Metro() {
  const coach = (x: number) => (
    <g key={x} transform={`translate(${x} 0)`}>
      <path d="M0 -70 Q0 -84 14 -84 L246 -84 Q260 -84 260 -70 L260 -6 L0 -6Z" fill="#F4F6F7" />
      <rect x={0} y={-30} width={260} height={10} fill="#0F6E56" />
      <rect x={0} y={-20} width={260} height={4} fill="#E2553C" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={14 + i * 40} y={-72} width={30} height={30} rx={4} fill="#3A4E66" />
      ))}
      <rect x={0} y={-6} width={260} height={6} fill="#5B6670" />
    </g>
  );
  return (
    <g>
      <Sky kind="day" />
      <Sun x={1420} y={120} r={46} />
      <Clouds count={5} seed={241} y={[40, 220]} />
      <Birds y={160} dur={30} delay={-11} />
      <Skyline y={560} seed={242} color="#BFD0DE" height={[160, 360]} />
      <Tower x={60} base={600} w={150} h={360} color="#F1E7D6" seed={243} />
      <Tower x={1360} base={600} w={180} h={400} style="glass" seed={244} />
      {/* viaduct */}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={120 + i * 280} y={470} width={40} height={230} fill="#C9C3B8" />
          <path d={`M${92 + i * 280} 470 h96 l-20 28 h-56z`} fill="#B8B1A5" />
        </g>
      ))}
      <rect x={0} y={440} width={W} height={30} fill="#D9D3C7" />
      <rect x={0} y={432} width={W} height={8} fill="#B8B1A5" />
      {/* station */}
      <g>
        <rect x={980} y={330} width={360} height={110} fill="#EFF3F5" opacity={0.9} />
        <path d="M960 330 Q1160 270 1360 330 Z" fill="#0F6E56" />
        <rect x={1060} y={344} width={200} height={26} rx={6} fill="#1D2228" />
        <text x={1160} y={363} textAnchor="middle" fontSize={15} fontWeight={800} fill="#F4A62A" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="2">
          PURBACHAL
        </text>
      </g>
      <g className="pns-move" style={{ ["--dur" as any]: "13s", ["--fx" as any]: "-900px", ["--tx" as any]: "1700px" }}>
        <g transform="translate(0 432)">
          {coach(0)}
          {coach(266)}
          <g transform="translate(532 0)">
            <path d="M0 -70 Q0 -84 14 -84 L210 -84 Q262 -80 272 -30 L272 -6 L0 -6Z" fill="#F4F6F7" />
            <rect x={0} y={-30} width={270} height={10} fill="#0F6E56" />
            <path d="M214 -76 Q252 -70 262 -40 L214 -40Z" fill="#3A4E66" />
            {Array.from({ length: 5 }, (_, i) => (
              <rect key={i} x={14 + i * 38} y={-72} width={28} height={30} rx={4} fill="#3A4E66" />
            ))}
            <rect x={262} y={-24} width={8} height={6} rx={2} fill="#FFF1B8" />
          </g>
        </g>
      </g>
      <TreeRow x0={0} x1={W} y={700} gap={150} s={0.9} kinds={["round", "palm", "flame"]} seed={245} />
      <Sidewalk y={690} h={30} />
      <Crowd y={716} n={6} seed={246} h={54} />
      <Road y={720} h={124} lanes={2} />
      <Lane y={772} dir={-1} n={3} dur={10} s={0.92} seed={247} colors={EVERYDAY} kinds={["sedan", "hatch", "suv"]} />
      <Rickshaw y={780} dir={-1} dur={30} delay={-12} s={0.9} />
      <Bus y={836} dir={1} dur={14} delay={-3} color="#1E8E6E" label="CITY BUS" />
      <Car y={836} dir={1} kind="luxury" color="#1D2228" dur={9} delay={-6} />
      <Sidewalk y={844} h={56} />
    </g>
  );
}

export const SCENES: SceneMeta[] = [
  { key: "boulevard", title: "Grand Boulevard", bn: "প্রশস্ত সড়ক, সবুজ বৃক্ষসারি", caption: "Wide, tree-lined avenues built for the next fifty years.", tone: "light", Render: GrandBoulevard },
  { key: "lake", title: "Lakeside Promenade", bn: "লেকের ধারে সকালের হাঁটা", caption: "Morning walks by the water, neighbours saying hello.", tone: "light", Render: Lakeside },
  { key: "gate", title: "Welcome Home", bn: "নিরাপদ প্রবেশদ্বার", caption: "A safe, friendly entrance that knows every neighbour.", tone: "light", Render: WelcomeGate },
  { key: "villas", title: "Villa Lane", bn: "শান্ত আবাসিক সড়ক", caption: "Quiet streets where children can ride their bikes.", tone: "light", Render: VillaLane },
  { key: "park", title: "Central Park", bn: "পরিবারের জন্য সবুজ পার্ক", caption: "Green space for families, kites and evening chats.", tone: "light", Render: CentralPark },
  { key: "night", title: "City Lights", bn: "আলোকিত, নিরাপদ রাত", caption: "Well-lit streets that feel safe after dark.", tone: "dark", Render: CityLights },
  { key: "expressway", title: "300 Feet Expressway", bn: "৩০০ ফিট সড়কে দ্রুত সংযোগ", caption: "A fast link to the city — and sunsets over the water.", tone: "dark", Render: Expressway },
  { key: "sunrise", title: "Golden Sunrise", bn: "নতুন শহরের নতুন সকাল", caption: "A new town waking up to a new day.", tone: "dark", Render: Sunrise },
  { key: "mosque", title: "Community Mosque", bn: "হাঁটা দূরত্বে মসজিদ", caption: "Places of worship within walking distance.", tone: "dark", Render: MosqueScene },
  { key: "school", title: "School Run", bn: "কাছেই ভালো স্কুল", caption: "Good schools close to home.", tone: "light", Render: SchoolRun },
  { key: "monsoon", title: "Monsoon Evening", bn: "পরিকল্পিত পানি নিষ্কাশন", caption: "Planned drainage, so the rain is just rain.", tone: "dark", Render: Monsoon },
  { key: "green", title: "Green & Solar", bn: "সবুজ ও সৌরশক্তির শহর", caption: "Solar roofs and clean air for our children.", tone: "light", Render: GreenSolar },
  { key: "market", title: "Neighbourhood Market", bn: "হাতের কাছে বাজার", caption: "Daily shopping, a short walk away.", tone: "light", Render: Market },
  { key: "playground", title: "Playground", bn: "শিশুদের খেলার মাঠ", caption: "Fields where the next generation grows up.", tone: "light", Render: Playground },
  { key: "construction", title: "Building Our Future", bn: "একসাথে গড়ি ভবিষ্যৎ", caption: "Every plot owner is building this together.", tone: "light", Render: Construction },
  { key: "cycle", title: "Cycle Track", bn: "সাইকেল ও হাঁটার পথ", caption: "Room to breathe, ride and run.", tone: "dark", Render: CycleTrack },
  { key: "care", title: "Care Close By", bn: "কাছেই চিকিৎসা সেবা", caption: "Healthcare close to home, when it matters most.", tone: "light", Render: CareClose },
  { key: "festival", title: "Festival Night", bn: "উৎসবে আমরা একসাথে", caption: "Eid, Boishakh and every celebration — together.", tone: "dark", Render: Festival },
  { key: "plan", title: "Master-Planned Township", bn: "রাজউকের পরিকল্পিত টাউনশিপ", caption: "Planned sectors, wide roads and parks — connected by design.", tone: "light", Render: MasterPlan },
  { key: "metro", title: "Metro Connection", bn: "মেট্রোতে ঢাকার আরও কাছে", caption: "Mass transit bringing Dhaka closer.", tone: "light", Render: Metro },
];

export function SceneSvg({ index, className, paused }: { index: number; className?: string; paused?: boolean }) {
  const S = SCENES[((index % SCENES.length) + SCENES.length) % SCENES.length];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={`pns-scene${paused ? " pns-paused" : ""}${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={`${S.title}: ${S.caption}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <S.Render />
    </svg>
  );
}

export { CloudShape };
