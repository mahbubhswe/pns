"use client";

// Township scene: Cycle Track. Its own file so it loads only when shown.
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

export default function CycleTrack() {
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
