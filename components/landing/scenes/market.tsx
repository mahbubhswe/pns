"use client";

// Township scene: Neighbourhood Market. Its own file so it loads only when shown.
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

export default function Market() {
  const shops = [
    { label: "GROCERY", awn: ["#1E8E6E", "#F2F2EE"] },
    { label: "PHARMACY", awn: ["#2F6FDE", "#F2F2EE"] },
    { label: "BAKERY", awn: ["#E2553C", "#FFF4D6"] },
    { label: "CAFÉ", awn: ["#7A4E33", "#F4D7A0"] },
    { label: "BOOKS", awn: ["#7C4DBA", "#F2F2EE"] },
  ];
  return (
    <g>
      <Sky kind="day" />
      <Clouds count={5} seed={161} y={[40, 220]} />
      <Skyline y={420} seed={162} color="#C4D4E2" height={[80, 200]} />
      <Tower x={0} base={430} w={1600} h={110} color="#EFE6D8" trim="#D3C6B2" seed={163} roof={false} />
      <rect x={0} y={300} width={W} height={20} fill="#D3C6B2" />
      {shops.map((sh, i) => {
        const x = 20 + i * 316;
        return (
          <g key={sh.label}>
            <rect x={x} y={430} width={300} height={250} fill="#F7F1E6" />
            <rect x={x + 20} y={440} width={260} height={40} rx={6} fill="#1D2228" />
            <text x={x + 150} y={468} textAnchor="middle" fontSize={20} fontWeight={800} fill="#F4A62A" style={{ fontFamily: "var(--font-jakarta), sans-serif" }} letterSpacing="2">
              {sh.label}
            </text>
            <g>
              {Array.from({ length: 10 }, (_, k) => (
                <path key={k} d={`M${x + k * 30} 496 h30 l-4 44 q-11 10 -22 0z`} fill={sh.awn[k % 2]} />
              ))}
            </g>
            <rect x={x + 26} y={556} width={150} height={124} fill="url(#glass)" />
            <rect x={x + 196} y={566} width={80} height={114} fill="#5B4636" />
            {Array.from({ length: 5 }, (_, k) => (
              <circle key={k} cx={x + 44 + k * 28} cy={652} r={9} fill={["#E2553C", "#F4A62A", "#1E8E6E", "#F2C230", "#C04A9B"][k]} />
            ))}
          </g>
        );
      })}
      <Sidewalk y={680} h={60} />
      <Crowd y={736} n={10} seed={164} h={60} attires={["shirt", "saree", "panjabi"]} dur={[60, 90]} />
      {/* fruit cart */}
      <g transform="translate(1180 736)">
        <rect x={-60} y={-46} width={120} height={20} fill="#8A5A3C" />
        {Array.from({ length: 8 }, (_, k) => (
          <circle key={k} cx={-50 + k * 14} cy={-52} r={7} fill={["#F4A62A", "#E2553C", "#9BCB4A"][k % 3]} />
        ))}
        <circle cx={-40} cy={-12} r={12} fill="none" stroke="#3B3B3B" strokeWidth={3} />
        <circle cx={40} cy={-12} r={12} fill="none" stroke="#3B3B3B" strokeWidth={3} />
      </g>
      <Walker x={1270} y={736} still seed={165} h={62} />
      <Road y={740} h={110} lanes={2} />
      <Rickshaw y={792} dir={1} dur={30} delay={-5} hood="#2F6FDE" />
      <Rickshaw y={796} dir={1} dur={30} delay={-19} hood="#F4A62A" />
      <Cng y={830} dir={-1} dur={14} delay={-6} />
      <Car y={840} dir={-1} kind="taxi" dur={11} delay={-1} />
      <Sidewalk y={850} h={50} />
      {[300, 940].map(x => (
        <LampPost key={x} x={x} base={880} h={190} />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// 14. Playground & sports
// ---------------------------------------------------------------------------
