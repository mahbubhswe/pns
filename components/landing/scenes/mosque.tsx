"use client";

// Township scene: Community Mosque. Its own file so it loads only when shown.
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

export default function MosqueScene() {
  return (
    <g>
      <Sky kind="dusk" />
      <Stars count={40} seed={121} maxY={300} />
      <Moon x={1240} y={170} r={38} crescent />
      <Skyline y={660} seed={122} color="#2E2F5A" height={[100, 260]} lit />
      <TreeRow x0={-40} x1={W} y={690} gap={140} s={1.05} kinds={["round", "palm"]} dark seed={123} />
      <Mosque x={800} base={700} s={1.05} lit />
      <rect x={0} y={690} width={W} height={210} fill="#2E3B35" />
      <rect x={0} y={740} width={W} height={60} fill="#5A5248" />
      {[150, 450, 1150, 1450].map(x => (
        <LampPost key={x} x={x} base={750} h={150} on />
      ))}
      <Crowd y={790} n={8} seed={124} h={60} attires={["panjabi", "panjabi", "shirt", "saree"]} dur={[80, 110]} />
      <Flowers x0={0} x1={W} y={826} seed={125} colors={["#F4A62A", "#FFD98A", "#E2553C"]} />
      <rect x={0} y={830} width={W} height={70} fill="#1F2A25" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 10. School Run
// ---------------------------------------------------------------------------
