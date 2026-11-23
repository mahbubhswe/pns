"use client";

// Township scene: Master-Planned Township. Its own file so it loads only when shown.
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

export default function MasterPlan() {
  const r = rng(231);
  const blocks: React.ReactNode[] = [];
  const cols = [0, 400, 920, 1320, 1600];
  const rows = [0, 300, 620, 900];
  const roofs = ["#C8553D", "#E9E4DA", "#2F6FDE", "#F4A62A", "#7C4DBA", "#1E8E6E", "#D9D3C7"];
  for (let ci = 0; ci < cols.length - 1; ci++)
    for (let ri = 0; ri < rows.length - 1; ri++) {
      const x0 = cols[ci] + 40;
      const x1 = cols[ci + 1] - 40;
      const y0 = rows[ri] + 40;
      const y1 = rows[ri + 1] - 40;
      const park = (ci === 1 && ri === 1) || (ci === 3 && ri === 0);
      if (park) {
        blocks.push(<rect key={`p${ci}${ri}`} x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={18} fill="#7DBB63" />);
        for (let t = 0; t < 26; t++) blocks.push(<circle key={`t${ci}${ri}${t}`} cx={x0 + 20 + r() * (x1 - x0 - 40)} cy={y0 + 20 + r() * (y1 - y0 - 40)} r={10 + r() * 12} fill={r() > 0.5 ? "#4FA25A" : "#3E8A4C"} />);
        continue;
      }
      blocks.push(<rect key={`b${ci}${ri}`} x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={10} fill="#E9E2D3" />);
      for (let px = x0 + 14; px < x1 - 50; px += 64)
        for (let py = y0 + 14; py < y1 - 50; py += 74) {
          blocks.push(<rect key={`h${px}-${py}`} x={px} y={py} width={48} height={52} rx={4} fill={pick(r, roofs)} />);
          blocks.push(<rect key={`s${px}-${py}`} x={px + 26} y={py} width={22} height={52} rx={4} fill="#000" opacity={0.07} />);
        }
      blocks.push(
        <text key={`l${ci}${ri}`} x={x0 + 14} y={y1 - 12} fontSize={16} fontWeight={800} fill="#5A6B64" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          SECTOR {ci * 3 + ri + 1}
        </text>
      );
    }
  const carsH = [300, 620].flatMap((y, k) =>
    Array.from({ length: 5 }, (_, i) => {
      const dir = (i + k) % 2 ? 1 : -1;
      const dur = 14 + r() * 8;
      return (
        <g key={`ch${y}${i}`} className="pns-move" style={{ ["--dur" as any]: `${dur}s`, ["--delay" as any]: `${-r() * dur}s`, ["--fx" as any]: dir > 0 ? "-60px" : "1660px", ["--tx" as any]: dir > 0 ? "1660px" : "-60px" }}>
          <rect x={0} y={y + (dir > 0 ? 8 : -26)} width={32} height={16} rx={5} fill={pick(r, EVERYDAY)} />
        </g>
      );
    })
  );
  const carsV = [400, 920, 1320].flatMap((x, k) =>
    Array.from({ length: 3 }, (_, i) => {
      const dir = (i + k) % 2 ? 1 : -1;
      const dur = 10 + r() * 6;
      return (
        <g key={`cv${x}${i}`} className="pns-move" style={{ ["--dur" as any]: `${dur}s`, ["--delay" as any]: `${-r() * dur}s`, ["--fx" as any]: "0px", ["--tx" as any]: "0px", ["--fy" as any]: dir > 0 ? "-60px" : "960px", ["--ty" as any]: dir > 0 ? "960px" : "-60px" }}>
          <rect x={x + (dir > 0 ? -26 : 8)} y={0} width={16} height={32} rx={5} fill={pick(r, EVERYDAY)} />
        </g>
      );
    })
  );
  return (
    <g>
      <rect width={W} height={H} fill="url(#sky-aerial)" />
      <path d="M1000 380 Q1120 330 1240 370 Q1300 420 1260 500 Q1200 560 1080 540 Q980 520 960 460 Q950 410 1000 380Z" fill="url(#water)" />
      {blocks}
      {[300, 620].map(y => (
        <g key={y}>
          <rect x={0} y={y - 32} width={W} height={64} fill="#5B6168" />
          <line x1={0} x2={W} y1={y} y2={y} stroke="#F4D35E" strokeWidth={3} strokeDasharray="30 22" />
        </g>
      ))}
      {[400, 920, 1320].map(x => (
        <g key={x}>
          <rect x={x - 32} y={0} width={64} height={H} fill="#5B6168" />
          <line x1={x} x2={x} y1={0} y2={H} stroke="#F4D35E" strokeWidth={3} strokeDasharray="30 22" />
        </g>
      ))}
      {[400, 920, 1320].flatMap(x => [300, 620].map(y => <rect key={`${x}${y}`} x={x - 32} y={y - 32} width={64} height={64} fill="#5B6168" />))}
      <circle cx={920} cy={620} r={26} fill="#7DBB63" />
      {carsH}
      {carsV}
      <g opacity={0.5}>
        <Clouds count={3} seed={232} y={[120, 760]} speed={[60, 90]} />
      </g>
    </g>
  );
}

// ---------------------------------------------------------------------------
// 20. Metro connection
// ---------------------------------------------------------------------------
