"use client";

// Township scene: City Lights. Its own file so it loads only when shown.
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

export default function CityLights() {
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
