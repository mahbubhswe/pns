"use client";

// Helpers shared by several scenes.
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

export const LUX = ["#1D2228", "#F2F2EE", "#AEB7BF", "#8E1C2A", "#1F3A63", "#C9B28A", "#0F6E56", "#3C3F44"];
export const EVERYDAY = ["#E2553C", "#2F6FDE", "#F2F2EE", "#AEB7BF", "#1E8E6E", "#F4A62A", "#7C4DBA", "#1D2228"];

/** Cars evenly spread along a lane so the road is busy from the first frame. */
export function Lane({ y, dir, n, dur, s = 1, seed = 1, colors = LUX, kinds = ["sedan", "luxury", "suv", "sports"] as CarKind[], night = false }: { y: number; dir: 1 | -1; n: number; dur: number; s?: number; seed?: number; colors?: string[]; kinds?: CarKind[]; night?: boolean }) {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Car key={i} y={y} dir={dir} s={s} night={night} kind={pick(r, kinds)} color={pick(r, colors)} dur={dur * (0.92 + r() * 0.16)} delay={-((dur / n) * i + r() * (dur / n) * 0.5)} />
      ))}
    </g>
  );
}

export function Crowd({ y, n, seed = 1, h = 56, dur = [60, 90], umbrella, attires }: { y: number; n: number; seed?: number; h?: number; dur?: [number, number]; umbrella?: string[]; attires?: Array<"shirt" | "saree" | "panjabi"> }) {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const d = dur[0] + r() * (dur[1] - dur[0]);
        return (
          <Walker
            key={i}
            y={y + (r() - 0.5) * 6}
            dir={r() > 0.5 ? 1 : -1}
            dur={d}
            delay={-r() * d}
            seed={seed * 100 + i}
            h={h * (0.9 + r() * 0.15)}
            attire={attires ? pick(r, attires) : undefined}
            umbrella={umbrella ? pick(r, umbrella) : undefined}
          />
        );
      })}
    </g>
  );
}

export function Boat({ x, y, s = 1, sail = "#F2F2EE", dur = 90, delay = 0 }: { x?: number; y: number; s?: number; sail?: string; dur?: number; delay?: number }) {
  const body = (
    <g className="pns-bob" style={{ ["--dur" as any]: "2.8s" }}>
      <path d="M-50 0 L50 0 L36 18 L-36 18 Z" fill="#8A5A3C" />
      <path d="M-50 0 L50 0 L48 5 L-48 5Z" fill="#C8553D" />
      <rect x={-2} y={-90} width={4} height={90} fill="#5B4636" />
      <path d="M2 -86 L46 -8 L2 -8 Z" fill={sail} />
      <path d="M-2 -70 L-36 -8 L-2 -8 Z" fill="#F4A62A" opacity={0.9} />
    </g>
  );
  if (x !== undefined) return <g transform={`translate(${x} ${y}) scale(${s})`}>{body}</g>;
  return (
    <g className="pns-move" style={{ ["--dur" as any]: `${dur}s`, ["--delay" as any]: `${delay}s`, ["--fx" as any]: "-120px", ["--tx" as any]: "1720px" }}>
      <g transform={`translate(0 ${y}) scale(${s})`}>{body}</g>
    </g>
  );
}

// ---------------------------------------------------------------------------
// 1. Grand Boulevard — wide divided avenue, palms and luxury cars
// ---------------------------------------------------------------------------
