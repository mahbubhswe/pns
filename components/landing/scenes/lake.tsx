"use client";

// Township scene: Lakeside Promenade. Its own file so it loads only when shown.
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

export default function Lakeside() {
  return (
    <g>
      <Sky kind="morning" />
      <Sun x={1180} y={330} r={58} />
      <Clouds count={4} seed={21} y={[60, 220]} />
      <Birds y={250} dur={34} delay={-12} />
      <Birds y={160} dur={40} delay={-3} count={3} s={0.8} />
      <Skyline y={548} seed={22} color="#C9B8C8" height={[120, 300]} />
      <Tower x={980} base={548} w={110} h={320} color="#EADDE0" trim="#CDB9BE" seed={23} />
      <Tower x={1110} base={548} w={90} h={250} style="glass" seed={24} />
      <TreeRow x0={0} x1={W} y={560} gap={70} s={0.55} kinds={["round", "round", "palm"]} seed={25} />
      <Water y={556} h={176} kind="day" seed={26} />
      <g transform="translate(0 1112) scale(1 -1)" opacity={0.16}>
        <Skyline y={548} seed={22} color="#ffffff" height={[120, 300]} />
      </g>
      <Boat y={630} s={0.7} dur={120} delay={-30} />
      <Boat y={680} s={0.9} dur={150} delay={-100} sail="#FFE0B8" />
      {/* promenade */}
      <rect x={0} y={724} width={W} height={10} fill="#C8BFAE" />
      {Array.from({ length: 54 }, (_, i) => (
        <rect key={i} x={i * 30} y={694} width={4} height={32} fill="#7D8790" />
      ))}
      <rect x={0} y={692} width={W} height={5} fill="#7D8790" />
      <Sidewalk y={732} h={58} color="#E3D9C8" />
      {[200, 640, 1080, 1500].map(x => (
        <LampPost key={x} x={x} base={760} h={150} />
      ))}
      <Bench x={380} base={772} />
      <Bench x={1240} base={772} />
      <Walker x={398} y={756} still seed={41} h={50} />
      <Crowd y={782} n={6} seed={27} h={62} attires={["shirt", "saree", "panjabi"]} />
      <Cyclist y={786} dir={1} dur={20} delay={-6} seed={28} />
      <Cyclist y={786} dir={-1} dur={24} delay={-15} seed={29} frame="#2F6FDE" />
      <rect x={0} y={790} width={W} height={110} fill="url(#grass)" />
      <Flowers x0={0} x1={W} y={812} seed={30} />
      <TreeRow x0={-40} x1={W} y={900} gap={300} s={1.2} kinds={["round", "flame"]} seed={31} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 3. Welcome Home — gated entrance with a lifting barrier
// ---------------------------------------------------------------------------
