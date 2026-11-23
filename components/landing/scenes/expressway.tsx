"use client";

// Township scene: 300 Feet Expressway. Its own file so it loads only when shown.
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

export default function Expressway() {
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
