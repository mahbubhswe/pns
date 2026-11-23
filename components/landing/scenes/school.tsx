"use client";

// Township scene: School Run. Its own file so it loads only when shown.
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

export default function SchoolRun() {
  return (
    <g>
      <Sky kind="morning" />
      <Sun x={1420} y={200} r={50} />
      <Clouds count={5} seed={131} y={[50, 240]} />
      <Skyline y={600} seed={132} color="#C9C3D3" height={[80, 220]} />
      <TreeRow x0={0} x1={W} y={620} gap={100} s={0.85} kinds={["round", "flame"]} seed={133} />
      {/* school */}
      <g>
        <rect x={420} y={360} width={760} height={300} fill="#F7E9D2" />
        <rect x={420} y={350} width={760} height={16} fill="#C8553D" />
        <rect x={700} y={300} width={200} height={70} fill="#F7E9D2" />
        <path d="M690 300 L800 250 L910 300 Z" fill="#C8553D" />
        <circle cx={800} cy={326} r={20} fill="#fff" stroke="#3B3B3B" strokeWidth={3} />
        <line x1={800} y1={326} x2={800} y2={312} stroke="#3B3B3B" strokeWidth={3} />
        <line x1={800} y1={326} x2={810} y2={330} stroke="#3B3B3B" strokeWidth={3} />
        <rect x={580} y={372} width={440} height={34} rx={6} fill="#0F6E56" />
        <text x={800} y={396} textAnchor="middle" fontSize={20} fontWeight={800} fill="#F6F4EE" style={{ fontFamily: "var(--font-jakarta), sans-serif" }} letterSpacing="2">
          COMMUNITY SCHOOL
        </text>
        {[0, 1, 2].map(row =>
          Array.from({ length: 9 }, (_, i) => (
            <rect key={`${row}-${i}`} x={450 + i * 82} y={428 + row * 74} width={50} height={44} rx={4} fill="url(#glass)" />
          ))
        )}
        <rect x={760} y={580} width={80} height={80} fill="#7A4E33" />
      </g>
      <BdFlag x={1240} base={660} h={200} />
      <rect x={0} y={650} width={W} height={60} fill="url(#grass)" />
      <Fence x0={0} x1={W} base={690} color="#E9E2D3" />
      <Sidewalk y={690} h={40} />
      <Crowd y={726} n={8} seed={134} h={46} dur={[50, 70]} />
      <Walker x={320} y={728} still seed={135} h={66} />
      <g transform="translate(350 680)">
        <rect x={-2} y={-40} width={4} height={50} fill="#5B6670" />
        <circle cx={0} cy={-48} r={16} fill="#E2553C" />
        <text x={0} y={-43} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff" fontFamily="sans-serif">
          STOP
        </text>
      </g>
      <Road y={730} h={110} lanes={2} />
      <Bus y={792} dir={1} dur={18} delay={-6} />
      <Car y={832} dir={-1} kind="hatch" color="#2F6FDE" dur={12} delay={-2} />
      <Rickshaw y={834} dir={1} dur={34} delay={-20} s={0.95} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={1340} y={736 + i * 13} width={130} height={7} fill="#F2F2EE" opacity={0.9} />
      ))}
      <Sidewalk y={840} h={60} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 11. Monsoon Evening
// ---------------------------------------------------------------------------
