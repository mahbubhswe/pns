"use client";

// Township scene: Golden Sunrise. Its own file so it loads only when shown.
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

export default function Sunrise() {
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
