"use client";

// Township scene: Playground. Its own file so it loads only when shown.
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

export default function Playground() {
  return (
    <g>
      <Sky kind="day" />
      <Sun x={240} y={130} r={44} />
      <Clouds count={5} seed={171} y={[40, 240]} />
      <Kite x={1240} y={180} color="#F4A62A" tail="#E2553C" stringTo={[1420, 640]} />
      <Kite x={980} y={130} color="#1E8E6E" tail="#F2F2EE" delay={-3} stringTo={[1460, 650]} />
      <Skyline y={520} seed={172} color="#C2D3E2" height={[100, 260]} />
      <TreeRow x0={-30} x1={W} y={560} gap={95} s={0.95} kinds={["round", "flame", "round", "pine"]} seed={173} />
      <rect x={0} y={550} width={W} height={350} fill="#5FAA55" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={i * 200} y={560} width={100} height={340} fill="#69B55E" />
      ))}
      <rect x={120} y={590} width={1360} height={260} fill="none" stroke="#F2F2EE" strokeWidth={5} />
      <line x1={800} y1={590} x2={800} y2={850} stroke="#F2F2EE" strokeWidth={5} />
      <ellipse cx={800} cy={720} rx={110} ry={60} fill="none" stroke="#F2F2EE" strokeWidth={5} />
      {[120, 1480].map((gx, i) => (
        <g key={gx}>
          <rect x={gx - (i ? 0 : 6)} y={640} width={6} height={130} fill="#F2F2EE" />
          <rect x={gx + (i ? -40 : 0)} y={640} width={46} height={6} fill="#F2F2EE" />
          <rect x={gx + (i ? -40 : 40)} y={640} width={6} height={130} fill="#F2F2EE" opacity={0.6} />
        </g>
      ))}
      {[
        [360, 700, 1],
        [520, 760, -1],
        [640, 680, 1],
        [930, 740, -1],
        [1080, 690, 1],
        [1220, 780, -1],
        [780, 820, 1],
      ].map(([x, y, d], i) => (
        <g key={i} className="pns-bob" style={{ ["--dur" as any]: `${0.9 + i * 0.13}s`, ["--amp" as any]: "10px" }}>
          <Walker x={x} y={y} dir={d as 1 | -1} seed={174 + i} h={48} child />
        </g>
      ))}
      <g transform="translate(470 760)">
        <g className="pns-ball" style={{ ["--dur" as any]: "4.6s" }}>
          <circle r={11} fill="#fff" />
          <circle r={4} fill="#1D2228" />
        </g>
      </g>
      <Bench x={1400} base={880} />
      <Walker x={1420} y={864} still seed={181} h={54} attire="saree" />
      <Walker x={1452} y={864} still seed={182} h={54} />
      <Walker x={1440} y={660} still seed={183} h={40} child />
      <Walker x={1475} y={668} still seed={184} h={40} child />
      <Hedge x0={0} x1={W} y={900} h={26} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 15. Building our future — construction
// ---------------------------------------------------------------------------
