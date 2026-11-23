"use client";

// Township scene: Welcome Home. Its own file so it loads only when shown.
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

export default function WelcomeGate() {
  return (
    <g>
      <Sky kind="day" />
      <Sun x={1420} y={140} r={48} />
      <Clouds count={5} seed={41} y={[50, 240]} />
      <Skyline y={600} seed={42} color="#BFD0DE" height={[120, 280]} />
      <Villa x={620} base={640} w={210} color="#F7EDE2" roof="#C8553D" />
      <Villa x={880} base={640} w={230} color="#EAF2EC" roof="#2F6FDE" accent="#1E3A5F" />
      <TreeRow x0={560} x1={1200} y={650} gap={130} s={0.8} kinds={["round", "flame"]} seed={43} />
      <rect x={0} y={640} width={W} height={260} fill="url(#grass)" />
      {/* boundary wall */}
      <rect x={0} y={600} width={560} height={64} fill="#E8DFCF" />
      <rect x={1160} y={600} width={440} height={64} fill="#E8DFCF" />
      <rect x={0} y={596} width={560} height={8} fill="#0F6E56" />
      <rect x={1160} y={596} width={440} height={8} fill="#0F6E56" />
      <Flowers x0={0} x1={560} y={672} seed={44} />
      <Flowers x0={1160} x1={W} y={672} seed={45} />
      <Road y={690} h={120} lanes={2} />
      <GateArch x={860} base={700} s={1.2} />
      <BdFlag x={530} base={600} h={170} />
      <BdFlag x={1190} base={600} h={170} />
      {/* guard booth */}
      <rect x={420} y={590} width={90} height={110} rx={6} fill="#F4EEE2" />
      <rect x={430} y={606} width={70} height={40} rx={4} fill="url(#glass)" />
      <rect x={412} y={580} width={106} height={14} rx={4} fill="#0F6E56" />
      <Walker x={465} y={700} still seed={46} h={60} />
      {/* barrier */}
      <rect x={608} y={652} width={22} height={52} rx={4} fill="#3B3B3B" />
      <g transform="translate(619 660)">
        <g className="pns-boom">
          <rect x={0} y={-6} width={440} height={12} rx={6} fill="#F2F2EE" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={20 + i * 54} y={-6} width={26} height={12} fill="#E2553C" />
          ))}
        </g>
      </g>
      <g style={{ ["--delay" as any]: "0s" }}>
        <Car y={770} dir={1} kind="luxury" color="#1D2228" dur={9} delay={0} />
      </g>
      <Car y={800} dir={-1} kind="suv" color="#F2F2EE" dur={14} delay={-4} s={1.05} />
      <Walker y={830} dir={1} dur={40} delay={-10} seed={47} h={70} attire="saree" />
      <Walker y={832} dir={1} dur={40} delay={-11.2} seed={48} h={46} child />
      <rect x={0} y={810} width={W} height={90} fill="#D9D3C7" />
      <Hedge x0={0} x1={W} y={900} h={30} />
      <Flowers x0={0} x1={W} y={878} seed={49} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 4. Villa Lane
// ---------------------------------------------------------------------------
