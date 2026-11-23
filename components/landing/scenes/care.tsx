"use client";

// Township scene: Care Close By. Its own file so it loads only when shown.
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

export default function CareClose() {
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
      <text x={720} y={269} textAnchor="middle" fontSize={56} fontWeight={900} fill="#fff" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        H
      </text>
      <rect x={560} y={600} width={320} height={60} fill="url(#glass)" />
      <rect x={540} y={588} width={360} height={14} fill="#1E8E6E" />
      <Tower x={1060} base={660} w={180} h={300} color="#EAF2EC" seed={214} />
      <rect x={1080} y={420} width={140} height={34} rx={6} fill="#1E8E6E" />
      <text x={1150} y={444} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff" style={{ fontFamily: "var(--font-jakarta), sans-serif" }} letterSpacing="2">
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
