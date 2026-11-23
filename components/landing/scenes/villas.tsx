"use client";

// Township scene: Villa Lane. Its own file so it loads only when shown.
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

export default function VillaLane() {
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
