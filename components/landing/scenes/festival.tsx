"use client";

// Township scene: Festival Night. Its own file so it loads only when shown.
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

export default function Festival() {
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
