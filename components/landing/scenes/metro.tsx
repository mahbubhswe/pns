"use client";

// Township scene: Metro Connection. Its own file so it loads only when shown.
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

export default function Metro() {
  const coach = (x: number) => (
    <g key={x} transform={`translate(${x} 0)`}>
      <path d="M0 -70 Q0 -84 14 -84 L246 -84 Q260 -84 260 -70 L260 -6 L0 -6Z" fill="#F4F6F7" />
      <rect x={0} y={-30} width={260} height={10} fill="#0F6E56" />
      <rect x={0} y={-20} width={260} height={4} fill="#E2553C" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={14 + i * 40} y={-72} width={30} height={30} rx={4} fill="#3A4E66" />
      ))}
      <rect x={0} y={-6} width={260} height={6} fill="#5B6670" />
    </g>
  );
  return (
    <g>
      <Sky kind="day" />
      <Sun x={1420} y={120} r={46} />
      <Clouds count={5} seed={241} y={[40, 220]} />
      <Birds y={160} dur={30} delay={-11} />
      <Skyline y={560} seed={242} color="#BFD0DE" height={[160, 360]} />
      <Tower x={60} base={600} w={150} h={360} color="#F1E7D6" seed={243} />
      <Tower x={1360} base={600} w={180} h={400} style="glass" seed={244} />
      {/* viaduct */}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={120 + i * 280} y={470} width={40} height={230} fill="#C9C3B8" />
          <path d={`M${92 + i * 280} 470 h96 l-20 28 h-56z`} fill="#B8B1A5" />
        </g>
      ))}
      <rect x={0} y={440} width={W} height={30} fill="#D9D3C7" />
      <rect x={0} y={432} width={W} height={8} fill="#B8B1A5" />
      {/* station */}
      <g>
        <rect x={980} y={330} width={360} height={110} fill="#EFF3F5" opacity={0.9} />
        <path d="M960 330 Q1160 270 1360 330 Z" fill="#0F6E56" />
        <rect x={1060} y={344} width={200} height={26} rx={6} fill="#1D2228" />
        <text x={1160} y={363} textAnchor="middle" fontSize={15} fontWeight={800} fill="#F4A62A" style={{ fontFamily: "var(--font-jakarta), sans-serif" }} letterSpacing="2">
          PURBACHAL
        </text>
      </g>
      <g className="pns-move" style={{ ["--dur" as any]: "13s", ["--fx" as any]: "-900px", ["--tx" as any]: "1700px" }}>
        <g transform="translate(0 432)">
          {coach(0)}
          {coach(266)}
          <g transform="translate(532 0)">
            <path d="M0 -70 Q0 -84 14 -84 L210 -84 Q262 -80 272 -30 L272 -6 L0 -6Z" fill="#F4F6F7" />
            <rect x={0} y={-30} width={270} height={10} fill="#0F6E56" />
            <path d="M214 -76 Q252 -70 262 -40 L214 -40Z" fill="#3A4E66" />
            {Array.from({ length: 5 }, (_, i) => (
              <rect key={i} x={14 + i * 38} y={-72} width={28} height={30} rx={4} fill="#3A4E66" />
            ))}
            <rect x={262} y={-24} width={8} height={6} rx={2} fill="#FFF1B8" />
          </g>
        </g>
      </g>
      <TreeRow x0={0} x1={W} y={700} gap={150} s={0.9} kinds={["round", "palm", "flame"]} seed={245} />
      <Sidewalk y={690} h={30} />
      <Crowd y={716} n={6} seed={246} h={54} />
      <Road y={720} h={124} lanes={2} />
      <Lane y={772} dir={-1} n={3} dur={10} s={0.92} seed={247} colors={EVERYDAY} kinds={["sedan", "hatch", "suv"]} />
      <Rickshaw y={780} dir={-1} dur={30} delay={-12} s={0.9} />
      <Bus y={836} dir={1} dur={14} delay={-3} color="#1E8E6E" label="CITY BUS" />
      <Car y={836} dir={1} kind="luxury" color="#1D2228" dur={9} delay={-6} />
      <Sidewalk y={844} h={56} />
    </g>
  );
}
