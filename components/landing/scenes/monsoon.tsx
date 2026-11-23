"use client";

// Township scene: Monsoon Evening. Its own file so it loads only when shown.
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

export default function Monsoon() {
  const umbrellas = ["#E2553C", "#2F6FDE", "#1E1A18", "#F4A62A", "#7C4DBA", "#1E8E6E"];
  return (
    <g>
      <Sky kind="rain" />
      <Clouds count={8} seed={141} y={[20, 220]} fill="#5E6B78" opacity={0.95} speed={[90, 130]} />
      <Skyline y={620} seed={142} color="#7E8C99" height={[160, 360]} lit />
      <Tower x={140} base={620} w={150} h={380} color="#9AA6B0" trim="#7E8A94" glass="#6F8191" seed={143} lit />
      <Tower x={1220} base={620} w={160} h={420} color="#A3AEB7" trim="#7E8A94" glass="#6F8191" seed={144} lit />
      <TreeRow x0={0} x1={W} y={640} gap={120} s={0.9} kinds={["round", "palm"]} seed={145} />
      <Sidewalk y={630} h={26} color="#9A9488" tile={false} />
      <Crowd y={652} n={6} seed={146} h={44} umbrella={umbrellas} />
      <Road y={656} h={150} lanes={2} />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} transform={`translate(${80 + i * 160} ${700 + (i % 3) * 30})`}>
          <ellipse rx={60} ry={8} fill="#8FA3B5" opacity={0.35} />
          <ellipse rx={30} ry={5} fill="none" stroke="#DDE7EE" strokeWidth={1.5} className="pns-ripple" style={{ ["--delay" as any]: `${-i * 0.37}s`, ["--dur" as any]: "1.6s" }} />
        </g>
      ))}
      <Rickshaw y={730} dir={1} dur={32} delay={-4} rain />
      <Rickshaw y={736} dir={-1} dur={36} delay={-20} rain s={0.9} />
      <Cng y={780} dir={1} dur={15} delay={-9} />
      <Car y={800} dir={-1} kind="sedan" color="#AEB7BF" dur={12} delay={-3} night />
      <Car y={804} dir={1} kind="suv" color="#1D2228" dur={10} delay={-7} night />
      <Sidewalk y={806} h={94} color="#9A9488" tile={false} />
      <Crowd y={860} n={5} seed={147} h={70} umbrella={umbrellas} dur={[60, 80]} />
      <Rain count={170} seed={148} />
      <rect width={W} height={H} fill="#fff" className="pns-flash" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 12. Green & Solar living
// ---------------------------------------------------------------------------
