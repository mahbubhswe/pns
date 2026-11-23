"use client";

// Township scene: Grand Boulevard. Its own file so it loads only when shown.
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

export default function GrandBoulevard() {
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
