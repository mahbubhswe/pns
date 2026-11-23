"use client";

// Township scene: Central Park. Its own file so it loads only when shown.
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

export default function CentralPark() {
  return (
    <g>
      <Sky kind="day" />
      <Sun x={1380} y={120} r={46} />
      <Clouds count={6} seed={61} y={[40, 260]} />
      <Birds y={150} dur={28} delay={-5} />
      <Kite x={1080} y={210} color="#E2553C" stringTo={[1230, 760]} />
      <Kite x={1300} y={150} color="#2F6FDE" tail="#F4A62A" delay={-2} stringTo={[1330, 770]} />
      <Kite x={620} y={240} color="#F4A62A" tail="#7C4DBA" delay={-4} stringTo={[470, 780]} />
      <Skyline y={560} seed={62} color="#C2D3E2" height={[120, 320]} />
      <TreeRow x0={-30} x1={W} y={600} gap={100} s={1.05} kinds={["round", "round", "flame", "pine"]} seed={63} />
      <rect x={0} y={590} width={W} height={310} fill="url(#grass)" />
      <ellipse cx={800} cy={760} rx={620} ry={70} fill="#E3D9C8" />
      <Fountain x={800} base={750} />
      <Bench x={250} base={720} />
      <Bench x={1290} base={720} />
      <Walker x={270} y={704} still seed={64} h={52} attire="saree" />
      <Walker x={300} y={704} still seed={65} h={52} />
      <Walker x={1320} y={704} still seed={66} h={52} attire="panjabi" />
      <Walker x={1230} y={790} still seed={67} h={44} child />
      <Walker x={1330} y={796} still seed={68} h={42} child />
      <Walker x={470} y={800} still seed={69} h={44} child />
      <Crowd y={808} n={6} seed={70} h={64} attires={["shirt", "saree", "panjabi"]} dur={[70, 100]} />
      <Flowers x0={0} x1={W} y={856} seed={71} />
      <TreeRow x0={-60} x1={W} y={920} gap={380} s={1.3} kinds={["round", "flame"]} seed={72} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 6. City Lights — the boulevard after dark
// ---------------------------------------------------------------------------
