"use client";

// Township scene: Building Our Future. Its own file so it loads only when shown.
/* eslint-disable @typescript-eslint/no-unused-vars */
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
} from "../scene-kit";
import { LUX, EVERYDAY, Lane, Crowd, Boat } from "./shared";

export default function Construction() {
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
      <text x={800} y={640} textAnchor="middle" fontSize={26} fontWeight={800} fill="#F6F4EE" style={{ fontFamily: "var(--font-jakarta), sans-serif" }} letterSpacing="3">
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
