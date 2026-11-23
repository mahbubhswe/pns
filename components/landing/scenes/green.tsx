"use client";

// Township scene: Green & Solar. Its own file so it loads only when shown.
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

export default function GreenSolar() {
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
