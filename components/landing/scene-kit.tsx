// components/landing/scene-kit.tsx — reusable, animated SVG pieces for the hero scenes.
// Everything is drawn in a 1600 × 900 viewBox and animated with CSS (GPU-friendly transforms).
import React from "react";

export const W = 1600;
export const H = 900;

// ---------------------------------------------------------------------------
// Deterministic randomness (same output on server and client → no hydration drift)
// ---------------------------------------------------------------------------
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];

type V = React.CSSProperties & Record<`--${string}`, string | number>;
const vars = (o: Record<string, string | number | undefined>): V => {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) out[k] = v;
  return out as V;
};

// ---------------------------------------------------------------------------
// Global keyframes + shared gradients. Mount <SceneDefs/> once on the page.
// ---------------------------------------------------------------------------
export const SCENE_CSS = `
.pns-move { animation: pns-move var(--dur, 14s) linear infinite; animation-delay: var(--delay, 0s); transform-box: view-box; }
@keyframes pns-move { from { transform: translate(var(--fx, -420px), var(--fy, 0px)); } to { transform: translate(var(--tx, 2020px), var(--ty, 0px)); } }
.pns-spin { transform-box: fill-box; animation: pns-spin var(--dur, .7s) linear infinite; transform-origin: center; }
@keyframes pns-spin { to { transform: rotate(360deg); } }
.pns-sway { transform-box: fill-box; animation: pns-sway var(--dur, 5s) ease-in-out infinite alternate; animation-delay: var(--delay, 0s); transform-origin: 50% 100%; }
@keyframes pns-sway { from { transform: rotate(calc(var(--amp, 1.6deg) * -1)); } to { transform: rotate(var(--amp, 1.6deg)); } }
.pns-bob { animation: pns-bob var(--dur, 3.2s) ease-in-out infinite alternate; animation-delay: var(--delay, 0s); }
@keyframes pns-bob { from { transform: translateY(calc(var(--amp, 4px) * -1)); } to { transform: translateY(var(--amp, 4px)); } }
.pns-twinkle { animation: pns-twinkle var(--dur, 2.6s) ease-in-out infinite; animation-delay: var(--delay, 0s); }
@keyframes pns-twinkle { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
.pns-flap { transform-box: fill-box; animation: pns-flap .45s ease-in-out infinite alternate; animation-delay: var(--delay, 0s); transform-origin: 50% 50%; }
@keyframes pns-flap { from { transform: scaleY(1); } to { transform: scaleY(-.45); } }
.pns-leg { transform-box: fill-box; animation: pns-leg var(--dur, .7s) ease-in-out infinite alternate; transform-origin: 50% 0%; }
.pns-leg.b { animation-direction: alternate-reverse; }
@keyframes pns-leg { from { transform: rotate(-24deg); } to { transform: rotate(24deg); } }
.pns-arm { transform-box: fill-box; animation: pns-leg var(--dur, .7s) ease-in-out infinite alternate-reverse; transform-origin: 50% 0%; }
.pns-arm.b { animation-direction: alternate; }
.pns-step { animation: pns-step calc(var(--dur, .7s) / 1) ease-in-out infinite alternate; }
@keyframes pns-step { from { transform: translateY(0); } to { transform: translateY(-2px); } }
.pns-pedal { transform-box: fill-box; animation: pns-spin var(--dur, 1s) linear infinite; transform-origin: center; }
.pns-glow { animation: pns-glow var(--dur, 3s) ease-in-out infinite alternate; animation-delay: var(--delay, 0s); }
@keyframes pns-glow { from { opacity: .55; } to { opacity: 1; } }
.pns-blink { animation: pns-blink var(--dur, .8s) steps(2, jump-none) infinite; }
@keyframes pns-blink { 0% { opacity: 1; } 100% { opacity: .1; } }
.pns-rain { animation: pns-rain var(--dur, .9s) linear infinite; animation-delay: var(--delay, 0s); transform-box: view-box; }
@keyframes pns-rain { from { transform: translate(0, -140px); } to { transform: translate(-60px, 1000px); } }
.pns-ripple { transform-box: fill-box; animation: pns-ripple var(--dur, 2.4s) ease-out infinite; animation-delay: var(--delay, 0s); transform-origin: center; }
@keyframes pns-ripple { from { transform: scale(.2); opacity: .9; } to { transform: scale(1.6); opacity: 0; } }
.pns-wave { animation: pns-wave var(--dur, 6s) ease-in-out infinite alternate; animation-delay: var(--delay, 0s); }
@keyframes pns-wave { from { transform: translateX(-18px); opacity: .35; } to { transform: translateX(18px); opacity: .85; } }
.pns-burst { transform-box: fill-box; animation: pns-burst var(--dur, 2.8s) ease-out infinite; animation-delay: var(--delay, 0s); transform-origin: center; opacity: 0; }
@keyframes pns-burst { 0% { transform: scale(.05); opacity: 0; } 8% { opacity: 1; } 60% { opacity: .9; } 100% { transform: scale(1); opacity: 0; } }
.pns-rocket { animation: pns-rocket var(--dur, 2.8s) ease-out infinite; animation-delay: var(--delay, 0s); transform-box: view-box; opacity: 0; }
@keyframes pns-rocket { 0% { transform: translateY(0); opacity: 1; } 18% { transform: translateY(var(--rise, -380px)); opacity: 1; } 19%,100% { opacity: 0; transform: translateY(var(--rise, -380px)); } }
.pns-float { animation: pns-float var(--dur, 12s) linear infinite; animation-delay: var(--delay, 0s); transform-box: view-box; }
@keyframes pns-float { from { transform: translate(0, 120px); opacity: 0; } 10% { opacity: 1; } 85% { opacity: 1; } to { transform: translate(var(--drift, 40px), -760px); opacity: 0; } }
.pns-flash { animation: pns-flash 7s linear infinite; animation-delay: var(--delay, 0s); opacity: 0; }
@keyframes pns-flash { 0%, 61%, 64%, 66%, 100% { opacity: 0; } 62%, 65% { opacity: .55; } }
.pns-boom { transform-box: fill-box; animation: pns-boom 9s ease-in-out infinite; transform-origin: 0% 50%; }
@keyframes pns-boom { 0%, 22% { transform: rotate(0deg); } 30%, 62% { transform: rotate(-78deg); } 70%, 100% { transform: rotate(0deg); } }
.pns-jib { transform-box: fill-box; animation: pns-jib var(--dur, 14s) ease-in-out infinite alternate; transform-origin: var(--ox, 50%) 50%; }
@keyframes pns-jib { from { transform: scaleX(1); } to { transform: scaleX(-.55); } }
.pns-hook { transform-box: fill-box; animation: pns-hook var(--dur, 7s) ease-in-out infinite alternate; transform-origin: 50% 0%; }
@keyframes pns-hook { from { transform: scaleY(.35); } to { transform: scaleY(1); } }
.pns-rise { animation: pns-rise var(--dur, 16s) ease-out infinite; animation-delay: var(--delay, 0s); opacity: 0; }
@keyframes pns-rise { 0% { opacity: 0; transform: translateY(14px); } 6%, 88% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; } }
.pns-flow { animation: pns-flow var(--dur, 1.2s) linear infinite; }
@keyframes pns-flow { to { stroke-dashoffset: -60; } }
.pns-dash { animation: pns-flow var(--dur, .6s) linear infinite; }
.pns-ball { animation: pns-ball var(--dur, 5s) ease-in-out infinite; transform-box: view-box; }
@keyframes pns-ball { 0% { transform: translate(0,0); } 25% { transform: translate(240px,-120px); } 50% { transform: translate(470px,0); } 75% { transform: translate(230px,-70px); } 100% { transform: translate(0,0); } }
.pns-kite { transform-box: fill-box; animation: pns-kite var(--dur, 6s) ease-in-out infinite alternate; animation-delay: var(--delay, 0s); transform-origin: 50% 100%; }
@keyframes pns-kite { 0% { transform: translate(0,0) rotate(-6deg); } 50% { transform: translate(24px,-16px) rotate(5deg); } 100% { transform: translate(-10px,10px) rotate(-3deg); } }
.pns-flag { transform-box: fill-box; animation: pns-flag 1.6s ease-in-out infinite alternate; transform-origin: 0% 50%; }
@keyframes pns-flag { from { transform: skewY(-4deg) scaleX(.96); } to { transform: skewY(4deg) scaleX(1.02); } }
.pns-sun { animation: pns-sunrise 18s ease-out infinite alternate; transform-box: view-box; }
@keyframes pns-sunrise { from { transform: translateY(120px); } to { transform: translateY(-40px); } }
.pns-pulse { transform-box: fill-box; animation: pns-pulse var(--dur, 2.4s) ease-in-out infinite; transform-origin: center; animation-delay: var(--delay, 0s); }
@keyframes pns-pulse { 0%,100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.12); opacity: 1; } }
.pns-paused .pns-scene *, .pns-paused.pns-scene * { animation-play-state: paused !important; }
@media (prefers-reduced-motion: reduce) { .pns-scene * { animation-play-state: paused !important; } }
`;

export function SceneDefs() {
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} focusable="false">
      <defs>
        {/* Skies */}
        <linearGradient id="sky-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7EC3F2" />
          <stop offset=".62" stopColor="#CDE9F7" />
          <stop offset="1" stopColor="#FFF1D6" />
        </linearGradient>
        <linearGradient id="sky-morning" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9BC9EC" />
          <stop offset=".55" stopColor="#F8DCC5" />
          <stop offset="1" stopColor="#FFE7B8" />
        </linearGradient>
        <linearGradient id="sky-dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B4C7A" />
          <stop offset=".45" stopColor="#C77E8E" />
          <stop offset=".75" stopColor="#F6B47A" />
          <stop offset="1" stopColor="#FFE0A3" />
        </linearGradient>
        <linearGradient id="sky-sunset" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5A4D8C" />
          <stop offset=".42" stopColor="#E07A6A" />
          <stop offset=".72" stopColor="#F7A45C" />
          <stop offset="1" stopColor="#FCD27B" />
        </linearGradient>
        <linearGradient id="sky-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E2A55" />
          <stop offset=".55" stopColor="#5B4E86" />
          <stop offset=".85" stopColor="#D98A7A" />
          <stop offset="1" stopColor="#F2B27C" />
        </linearGradient>
        <linearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070D24" />
          <stop offset=".6" stopColor="#142250" />
          <stop offset="1" stopColor="#2B3B6E" />
        </linearGradient>
        <linearGradient id="sky-rain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A5868" />
          <stop offset=".6" stopColor="#7D8B98" />
          <stop offset="1" stopColor="#A9B4BC" />
        </linearGradient>
        <linearGradient id="sky-aerial" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#CFE6C4" />
          <stop offset="1" stopColor="#B7D9A8" />
        </linearGradient>
        {/* Lights */}
        <radialGradient id="glow-warm">
          <stop offset="0" stopColor="#FFE9A8" stopOpacity=".95" />
          <stop offset=".4" stopColor="#FFD166" stopOpacity=".45" />
          <stop offset="1" stopColor="#FFD166" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow-sun">
          <stop offset="0" stopColor="#FFF6D5" />
          <stop offset=".25" stopColor="#FFD970" stopOpacity=".9" />
          <stop offset=".6" stopColor="#FFB54A" stopOpacity=".25" />
          <stop offset="1" stopColor="#FFB54A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow-moon">
          <stop offset="0" stopColor="#F4F1E1" stopOpacity=".8" />
          <stop offset="1" stopColor="#F4F1E1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF4C2" stopOpacity=".85" />
          <stop offset="1" stopColor="#FFF4C2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5DA9C9" />
          <stop offset="1" stopColor="#2F7A9E" />
        </linearGradient>
        <linearGradient id="water-sunset" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6977A" />
          <stop offset="1" stopColor="#5D5A8E" />
        </linearGradient>
        <linearGradient id="water-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E3566" />
          <stop offset="1" stopColor="#0B1736" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#BFE3F5" />
          <stop offset=".5" stopColor="#7FB9D9" />
          <stop offset="1" stopColor="#5E97BC" />
        </linearGradient>
        <linearGradient id="glass-warm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE1B5" />
          <stop offset="1" stopColor="#E9A877" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3E444C" />
          <stop offset="1" stopColor="#2F343A" />
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7DBB63" />
          <stop offset="1" stopColor="#4E9A4A" />
        </linearGradient>
        <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity=".55" />
        </linearGradient>
        <mask id="crescent" maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill="#fff" />
          <circle cx=".74" cy=".36" r=".46" fill="#000" />
        </mask>
        <linearGradient id="carshine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sky, sun, moon, stars, clouds, birds
// ---------------------------------------------------------------------------
export type SkyKind = "day" | "morning" | "dawn" | "sunset" | "dusk" | "night" | "rain";

export const Sky = ({ kind }: { kind: SkyKind }) => <rect width={W} height={H} fill={`url(#sky-${kind})`} />;

export const Sun = ({ x, y, r = 60, rise }: { x: number; y: number; r?: number; rise?: boolean }) => (
  <g className={rise ? "pns-sun" : undefined}>
    <circle cx={x} cy={y} r={r * 4} fill="url(#glow-sun)" className="pns-glow" style={vars({ "--dur": "5s" })} />
    <circle cx={x} cy={y} r={r} fill="#FFE9A0" />
  </g>
);

export const Moon = ({ x, y, r = 46, crescent }: { x: number; y: number; r?: number; crescent?: boolean }) => (
  <g>
    <circle cx={x} cy={y} r={r * 3} fill="url(#glow-moon)" />
    <circle cx={x} cy={y} r={r} fill="#F5F0DA" mask={crescent ? "url(#crescent)" : undefined} />
    {crescent ? null : (
      <>
        <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.16} fill="#E2DCC0" />
        <circle cx={x + r * 0.25} cy={y + r * 0.3} r={r * 0.11} fill="#E2DCC0" />
      </>
    )}
  </g>
);

export function Stars({ count = 70, seed = 7, maxY = 460 }: { count?: number; seed?: number; maxY?: number }) {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx={r() * W}
          cy={r() * maxY}
          r={r() * 1.8 + 0.6}
          fill="#fff"
          className="pns-twinkle"
          style={vars({ "--dur": `${2 + r() * 3}s`, "--delay": `${-r() * 4}s` })}
        />
      ))}
    </g>
  );
}

export const CloudShape = ({ s = 1, fill = "#fff", opacity = 0.95 }: { s?: number; fill?: string; opacity?: number }) => (
  <g transform={`scale(${s})`} opacity={opacity}>
    <ellipse cx="0" cy="0" rx="90" ry="34" fill={fill} />
    <circle cx="-38" cy="-18" r="34" fill={fill} />
    <circle cx="18" cy="-34" r="46" fill={fill} />
    <circle cx="62" cy="-10" r="30" fill={fill} />
  </g>
);

export function Clouds({ count = 5, seed = 3, y = [70, 300], fill = "#fff", opacity = 0.92, speed = [70, 120] }: { count?: number; seed?: number; y?: [number, number]; fill?: string; opacity?: number; speed?: [number, number] }) {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const dur = speed[0] + r() * (speed[1] - speed[0]);
        return (
          <g key={i} className="pns-move" style={vars({ "--dur": `${dur}s`, "--delay": `${-r() * dur}s`, "--fx": "-260px", "--tx": "1860px" })}>
            <g transform={`translate(0 ${y[0] + r() * (y[1] - y[0])})`}>
              <CloudShape s={0.6 + r() * 0.9} fill={fill} opacity={opacity * (0.7 + r() * 0.3)} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

export function Birds({ count = 5, y = 180, dur = 26, delay = 0, color = "#2B3A4A", s = 1 }: { count?: number; y?: number; dur?: number; delay?: number; color?: string; s?: number }) {
  const r = rng(count * 31 + y);
  return (
    <g className="pns-move" style={vars({ "--dur": `${dur}s`, "--delay": `${delay}s`, "--fx": "-200px", "--tx": "1800px", "--fy": "30px", "--ty": "-50px" })}>
      <g transform={`translate(0 ${y}) scale(${s})`}>
        {Array.from({ length: count }, (_, i) => (
          <g key={i} transform={`translate(${i * 34 + r() * 14} ${(i % 2) * 16 + r() * 10})`}>
            <path className="pns-flap" style={vars({ "--delay": `${-r()}s` })} d="M-12 0 Q-6 -8 0 0 Q6 -8 12 0" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------
export function Skyline({ y, seed = 1, color = "#AFC6D8", lit = false, height = [120, 300], width = W, x0 = 0 }: { y: number; seed?: number; color?: string; lit?: boolean; height?: [number, number]; width?: number; x0?: number }) {
  const r = rng(seed);
  const items: React.ReactNode[] = [];
  let x = x0 - 20;
  let i = 0;
  while (x < x0 + width) {
    const w = 40 + r() * 70;
    const h = height[0] + r() * (height[1] - height[0]);
    items.push(<rect key={`b${i}`} x={x} y={y - h} width={w} height={h + 2} fill={color} />);
    if (r() > 0.6) items.push(<rect key={`a${i}`} x={x + w * 0.4} y={y - h - 18} width={3} height={18} fill={color} />);
    if (lit) {
      for (let wy = y - h + 14; wy < y - 10; wy += 18)
        for (let wx = x + 7; wx < x + w - 10; wx += 14)
          if (r() > 0.55)
            items.push(<rect key={`w${i}-${wx}-${wy}`} x={wx} y={wy} width={6} height={8} fill="#FFD98A" opacity={0.85} className={r() > 0.9 ? "pns-twinkle" : undefined} style={vars({ "--dur": `${4 + r() * 6}s` })} />);
    }
    x += w + 2 + r() * 10;
    i++;
  }
  return <g>{items}</g>;
}

export function Tower({
  x,
  base,
  w,
  h,
  color = "#E9E4DA",
  trim = "#C9C1B2",
  glass = "url(#glass)",
  lit = false,
  seed = 1,
  style = "balcony",
  roof = true,
}: {
  x: number;
  base: number;
  w: number;
  h: number;
  color?: string;
  trim?: string;
  glass?: string;
  lit?: boolean;
  seed?: number;
  style?: "balcony" | "glass" | "grid";
  roof?: boolean;
}) {
  const r = rng(seed);
  const top = base - h;
  const floors = Math.max(3, Math.floor(h / 34));
  const fh = h / floors;
  const cols = Math.max(2, Math.floor(w / 34));
  const cw = w / cols;
  const els: React.ReactNode[] = [];
  els.push(<rect key="body" x={x} y={top} width={w} height={h} fill={color} />);
  els.push(<rect key="shade" x={x + w * 0.72} y={top} width={w * 0.28} height={h} fill="#000" opacity={0.06} />);
  if (style === "glass") {
    els.push(<rect key="g" x={x + 8} y={top + 10} width={w - 16} height={h - 18} fill={glass} />);
    for (let i = 1; i < cols; i++) els.push(<rect key={`m${i}`} x={x + 8 + ((w - 16) / cols) * i} y={top + 10} width={2} height={h - 18} fill={trim} opacity={0.7} />);
    for (let f = 1; f < floors; f++) els.push(<rect key={`f${f}`} x={x + 8} y={top + 10 + ((h - 18) / floors) * f} width={w - 16} height={2} fill={trim} opacity={0.6} />);
    if (lit)
      for (let f = 0; f < floors; f++)
        for (let c = 0; c < cols; c++)
          if (r() > 0.45)
            els.push(<rect key={`l${f}-${c}`} x={x + 9 + ((w - 16) / cols) * c} y={top + 11 + ((h - 18) / floors) * f} width={(w - 16) / cols - 3} height={(h - 18) / floors - 3} fill="#FFD98A" opacity={0.75} />);
  } else {
    for (let f = 0; f < floors; f++) {
      const fy = top + f * fh;
      for (let c = 0; c < cols; c++) {
        const wx = x + c * cw + cw * 0.18;
        const ww = cw * 0.64;
        const on = lit && r() > 0.4;
        els.push(<rect key={`w${f}-${c}`} x={wx} y={fy + fh * 0.22} width={ww} height={fh * 0.5} rx={2} fill={on ? "#FFD98A" : glass} opacity={on ? 0.95 : 1} />);
        if (style === "balcony") els.push(<rect key={`b${f}-${c}`} x={wx - 3} y={fy + fh * 0.72} width={ww + 6} height={3.5} fill={trim} />);
        if (style === "balcony" && !lit && r() > 0.82) els.push(<rect key={`p${f}-${c}`} x={wx + 2} y={fy + fh * 0.62} width={8} height={7} rx={3} fill="#5FA35A" />);
      }
    }
  }
  if (roof) {
    els.push(<rect key="roof" x={x - 4} y={top - 8} width={w + 8} height={10} fill={trim} />);
    els.push(<rect key="tank" x={x + w * 0.62} y={top - 26} width={w * 0.18} height={18} fill={trim} />);
  }
  return <g>{els}</g>;
}

export function Villa({ x, base, w = 230, color = "#F4EFE6", roof = "#C8553D", accent = "#2F5D50", lit = false, flip = false }: { x: number; base: number; w?: number; color?: string; roof?: string; accent?: string; lit?: boolean; flip?: boolean }) {
  const h1 = 92;
  const h2 = 84;
  const win = lit ? "#FFD98A" : "url(#glass)";
  return (
    <g transform={flip ? `translate(${x * 2 + w} 0) scale(-1 1)` : undefined}>
      {/* ground floor */}
      <rect x={x} y={base - h1} width={w} height={h1} fill={color} />
      <rect x={x} y={base - h1} width={w} height={6} fill="#000" opacity={0.06} />
      {/* first floor set back */}
      <rect x={x + w * 0.08} y={base - h1 - h2} width={w * 0.62} height={h2} fill={color} />
      <rect x={x + w * 0.62} y={base - h1 - h2} width={w * 0.08} height={h2} fill="#000" opacity={0.05} />
      {/* flat roof slab + pitched accent */}
      <rect x={x + w * 0.02} y={base - h1 - h2 - 10} width={w * 0.74} height={12} fill={accent} />
      <path d={`M${x + w * 0.66} ${base - h1 - 2} l${w * 0.36} 0 l-${w * 0.04} -26 l-${w * 0.3} 0 z`} fill={roof} />
      {/* windows */}
      <rect x={x + w * 0.14} y={base - h1 - h2 + 18} width={w * 0.2} height={44} rx={3} fill={win} />
      <rect x={x + w * 0.42} y={base - h1 - h2 + 18} width={w * 0.2} height={44} rx={3} fill={win} />
      <rect x={x + w * 0.1} y={base - h1 - h2 + 66} width={w * 0.56} height={4} fill={accent} />
      <rect x={x + w * 0.08} y={base - h1 + 20} width={w * 0.34} height={48} rx={3} fill={win} />
      {/* door */}
      <rect x={x + w * 0.56} y={base - 66} width={w * 0.16} height={66} rx={3} fill={accent} />
      <circle cx={x + w * 0.69} cy={base - 32} r={2.5} fill="#F4A62A" />
      <rect x={x + w * 0.78} y={base - h1 + 20} width={w * 0.16} height={34} rx={3} fill={win} />
      {lit && <circle cx={x + w * 0.64} cy={base - 74} r={40} fill="url(#glow-warm)" />}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Nature
// ---------------------------------------------------------------------------
export type TreeKind = "round" | "palm" | "pine" | "flame" | "bush";

export function Tree({ x, y, s = 1, kind = "round", sway = true, dark = false, delay = 0 }: { x: number; y: number; s?: number; kind?: TreeKind; sway?: boolean; dark?: boolean; delay?: number }) {
  const leaf = dark ? "#1F4A35" : "#4FA25A";
  const leaf2 = dark ? "#173B2A" : "#3E8A4C";
  const trunk = dark ? "#3A2B22" : "#7A5236";
  let crown: React.ReactNode;
  if (kind === "palm") {
    crown = (
      <g>
        <path d="M0 0 Q4 -60 -2 -120" stroke={trunk} strokeWidth="9" fill="none" strokeLinecap="round" />
        {[-150, -110, -70, -30, 10, 200].map((a, i) => (
          <path key={i} d="M-2 -120 q40 -14 78 12 q-40 -2 -78 -8z" fill={i % 2 ? leaf : leaf2} transform={`rotate(${a + 60} -2 -120)`} />
        ))}
        <circle cx="-2" cy="-118" r="7" fill="#8A6A3C" />
      </g>
    );
  } else if (kind === "pine") {
    crown = (
      <g>
        <rect x="-4" y="-30" width="8" height="30" fill={trunk} />
        <path d="M0 -150 L36 -60 L-36 -60Z" fill={leaf2} />
        <path d="M0 -120 L44 -30 L-44 -30Z" fill={leaf} />
      </g>
    );
  } else if (kind === "flame") {
    // Krishnachura — the red-flowering tree that lines Dhaka's roads in summer
    crown = (
      <g>
        <path d="M-5 0 L-3 -60 Q-20 -80 -40 -84 M-3 -60 Q10 -86 34 -92" stroke={trunk} strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="0" cy="-104" rx="86" ry="44" fill={dark ? "#4A2620" : "#3E8A4C"} />
        <ellipse cx="-30" cy="-112" rx="44" ry="28" fill={dark ? "#6A2E22" : "#E2553C"} />
        <ellipse cx="30" cy="-118" rx="48" ry="30" fill={dark ? "#7A3424" : "#EF6A3A"} />
        <ellipse cx="4" cy="-96" rx="52" ry="22" fill={dark ? "#5A2A20" : "#D9472F"} />
        <ellipse cx="54" cy="-98" rx="26" ry="16" fill={dark ? "#6A2E22" : "#F28A3C"} />
      </g>
    );
  } else if (kind === "bush") {
    crown = (
      <g>
        <circle cx="-20" cy="-18" r="22" fill={leaf2} />
        <circle cx="10" cy="-26" r="28" fill={leaf} />
        <circle cx="34" cy="-14" r="18" fill={leaf2} />
      </g>
    );
  } else {
    crown = (
      <g>
        <rect x="-5" y="-60" width="10" height="60" rx="3" fill={trunk} />
        <circle cx="0" cy="-92" r="46" fill={leaf2} />
        <circle cx="-26" cy="-74" r="30" fill={leaf} />
        <circle cx="22" cy="-112" r="30" fill={leaf} />
        <circle cx="26" cy="-72" r="26" fill={leaf2} />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={sway ? "pns-sway" : undefined} style={vars({ "--dur": `${4 + ((x * 7) % 30) / 10}s`, "--delay": `${-delay - (x % 5)}s`, "--amp": kind === "palm" ? "2.4deg" : "1.4deg" })}>
        {crown}
      </g>
    </g>
  );
}

export function TreeRow({ x0, x1, y, gap = 120, s = 1, kinds = ["round"], seed = 1, dark = false }: { x0: number; x1: number; y: number; gap?: number; s?: number; kinds?: TreeKind[]; seed?: number; dark?: boolean }) {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  for (let x = x0, i = 0; x <= x1; x += gap * (0.8 + r() * 0.4), i++) out.push(<Tree key={i} x={x} y={y} s={s * (0.85 + r() * 0.3)} kind={pick(r, kinds)} dark={dark} delay={r() * 3} />);
  return <g>{out}</g>;
}

export function Flowers({ x0, x1, y, seed = 4, colors = ["#E2553C", "#F4A62A", "#F7D9E3", "#C04A9B", "#FFFFFF"] }: { x0: number; x1: number; y: number; seed?: number; colors?: string[] }) {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  for (let x = x0; x < x1; x += 9 + r() * 10) out.push(<circle key={x} cx={x} cy={y - r() * 10} r={3 + r() * 2.5} fill={pick(r, colors)} />);
  return <g>{out}</g>;
}

export function Hedge({ x0, x1, y, h = 26, color = "#3E8A4C" }: { x0: number; x1: number; y: number; h?: number; color?: string }) {
  return <rect x={x0} y={y - h} width={x1 - x0} height={h} rx={h / 2} fill={color} />;
}

export function Water({ y, h, kind = "day", seed = 9 }: { y: number; h: number; kind?: "day" | "sunset" | "night"; seed?: number }) {
  const r = rng(seed);
  const fill = kind === "night" ? "url(#water-night)" : kind === "sunset" ? "url(#water-sunset)" : "url(#water)";
  return (
    <g>
      <rect x={0} y={y} width={W} height={h} fill={fill} />
      {Array.from({ length: 34 }, (_, i) => {
        const wx = r() * W;
        const wy = y + 12 + r() * (h - 20);
        const len = 30 + r() * 90;
        return (
          <rect
            key={i}
            x={wx}
            y={wy}
            width={len}
            height={2.5}
            rx={1.2}
            fill="#fff"
            className="pns-wave"
            style={vars({ "--dur": `${3 + r() * 4}s`, "--delay": `${-r() * 5}s` })}
          />
        );
      })}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Street furniture
// ---------------------------------------------------------------------------
export function Road({ y, h, lanes = 2, dashed = true, median }: { y: number; h: number; lanes?: number; dashed?: boolean; median?: number }) {
  const lines: React.ReactNode[] = [];
  for (let i = 1; i < lanes; i++) {
    const ly = y + (h / lanes) * i;
    if (median && i === lanes / 2) continue;
    lines.push(<line key={i} x1={0} x2={W} y1={ly} y2={ly} stroke="#F2F2EE" strokeWidth={4} strokeDasharray={dashed ? "44 34" : undefined} opacity={0.85} />);
  }
  return (
    <g>
      <rect x={0} y={y} width={W} height={h} fill="url(#road)" />
      <rect x={0} y={y} width={W} height={4} fill="#000" opacity={0.18} />
      <rect x={0} y={y + 6} width={W} height={2} fill="#F4A62A" opacity={0.7} />
      <rect x={0} y={y + h - 8} width={W} height={2} fill="#F2F2EE" opacity={0.7} />
      {lines}
    </g>
  );
}

export function Sidewalk({ y, h, color = "#D9D3C7", tile = true }: { y: number; h: number; color?: string; tile?: boolean }) {
  return (
    <g>
      <rect x={0} y={y} width={W} height={h} fill={color} />
      <rect x={0} y={y + h - 6} width={W} height={6} fill="#B8B0A2" />
      {tile && Array.from({ length: 40 }, (_, i) => <rect key={i} x={i * 42} y={y} width={1.5} height={h - 6} fill="#000" opacity={0.06} />)}
    </g>
  );
}

export function LampPost({ x, base, h = 150, on = false, double = false }: { x: number; base: number; h?: number; on?: boolean; double?: boolean }) {
  return (
    <g>
      {on && <circle cx={x + 26} cy={base - h + 12} r={90} fill="url(#glow-warm)" className="pns-glow" style={vars({ "--dur": "2.6s", "--delay": `${-(x % 7) / 3}s` })} />}
      {on && double && <circle cx={x - 26} cy={base - h + 12} r={90} fill="url(#glow-warm)" className="pns-glow" style={vars({ "--dur": "2.9s" })} />}
      <rect x={x - 3} y={base - h} width={6} height={h} fill="#2E3A40" />
      <path d={`M${x} ${base - h + 4} q 0 -14 22 -14 h6`} stroke="#2E3A40" strokeWidth={5} fill="none" />
      <rect x={x + 18} y={base - h - 2} width={20} height={8} rx={3} fill={on ? "#FFE7A0" : "#566169"} />
      {double && (
        <>
          <path d={`M${x} ${base - h + 4} q 0 -14 -22 -14 h-6`} stroke="#2E3A40" strokeWidth={5} fill="none" />
          <rect x={x - 38} y={base - h - 2} width={20} height={8} rx={3} fill={on ? "#FFE7A0" : "#566169"} />
        </>
      )}
      <rect x={x - 7} y={base - 10} width={14} height={10} rx={2} fill="#2E3A40" />
    </g>
  );
}

export const Bench = ({ x, base, color = "#8A5A3C" }: { x: number; base: number; color?: string }) => (
  <g>
    <rect x={x} y={base - 24} width={70} height={6} rx={2} fill={color} />
    <rect x={x} y={base - 40} width={70} height={6} rx={2} fill={color} />
    <rect x={x + 6} y={base - 24} width={4} height={24} fill="#3A3A3A" />
    <rect x={x + 60} y={base - 24} width={4} height={24} fill="#3A3A3A" />
  </g>
);

export function BdFlag({ x, base, h = 130 }: { x: number; base: number; h?: number }) {
  return (
    <g>
      <rect x={x - 2} y={base - h} width={4} height={h} fill="#7D8790" />
      <g className="pns-flag">
        <rect x={x + 2} y={base - h + 2} width={64} height={38} fill="#006A4E" />
        <circle cx={x + 30} cy={base - h + 21} r={12} fill="#F42A41" />
      </g>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------
export type CarKind = "sedan" | "suv" | "sports" | "luxury" | "taxi" | "hatch";

function carBody(kind: CarKind) {
  switch (kind) {
    case "sports":
      return {
        w: 168,
        body: "M4 -16 Q2 -30 18 -32 L58 -36 Q80 -54 108 -54 Q134 -52 150 -36 L164 -32 Q170 -24 166 -14 Z",
        win: "M66 -37 Q84 -50 106 -50 Q126 -49 138 -37 Z",
        wheels: [36, 132],
        r: 13,
      };
    case "suv":
      return {
        w: 162,
        body: "M4 -14 Q2 -36 14 -38 L34 -40 L52 -70 Q56 -74 64 -74 L124 -74 Q134 -74 140 -66 L150 -42 Q160 -40 160 -30 L160 -14 Z",
        win: "M58 -66 L70 -66 L70 -44 L48 -44 Z M76 -68 L118 -68 L118 -44 L76 -44 Z M124 -68 Q130 -68 134 -60 L142 -44 L124 -44 Z",
        wheels: [38, 128],
        r: 15,
      };
    case "luxury":
      return {
        w: 186,
        body: "M4 -14 Q0 -30 14 -34 L50 -38 Q72 -62 104 -62 L132 -62 Q150 -60 162 -40 L178 -36 Q186 -30 184 -14 Z",
        win: "M60 -40 Q78 -58 102 -58 L106 -58 L106 -40 Z M112 -58 L130 -58 Q146 -56 154 -40 L112 -40 Z",
        wheels: [40, 146],
        r: 14,
      };
    case "hatch":
      return {
        w: 140,
        body: "M4 -14 Q2 -32 14 -34 L30 -36 L48 -62 Q52 -66 60 -66 L104 -66 Q114 -64 120 -52 L128 -36 Q138 -34 138 -24 L138 -14 Z",
        win: "M54 -60 L76 -60 L76 -40 L40 -40 Z M82 -60 L102 -60 Q110 -58 114 -48 L118 -40 L82 -40 Z",
        wheels: [34, 110],
        r: 12,
      };
    default:
      return {
        w: 160,
        body: "M4 -14 Q2 -30 14 -33 L44 -36 Q64 -60 92 -60 L114 -60 Q130 -58 140 -38 L154 -34 Q162 -28 160 -14 Z",
        win: "M54 -38 Q70 -56 90 -56 L94 -56 L94 -38 Z M100 -56 L112 -56 Q126 -54 132 -38 L100 -38 Z",
        wheels: [36, 126],
        r: 13,
      };
  }
}

export function CarShape({ kind = "sedan", color = "#C8463A", night = false }: { kind?: CarKind; color?: string; night?: boolean }) {
  const b = carBody(kind);
  const isTaxi = kind === "taxi";
  return (
    <g>
      {night && <path d={`M${b.w - 4} -24 L${b.w + 230} -54 L${b.w + 230} 12 Z`} fill="url(#beam)" opacity={0.75} />}
      <ellipse cx={b.w / 2} cy={2} rx={b.w * 0.5} ry={5} fill="#000" opacity={0.18} />
      <path d={b.body} fill={isTaxi ? "#F2C230" : color} />
      <path d={b.body} fill="url(#carshine)" opacity={0.6} />
      <path d={b.win} fill={night ? "#2A3550" : "#9FC9E3"} opacity={0.95} />
      <rect x={10} y={-22} width={b.w - 22} height={2} fill="#fff" opacity={0.35} />
      {isTaxi && <rect x={b.w * 0.42} y={-66} width={22} height={8} rx={2} fill="#2B2B2B" />}
      <rect x={b.w - 12} y={-30} width={9} height={6} rx={2} fill={night ? "#FFF6C8" : "#FFF1B8"} />
      <rect x={4} y={-30} width={7} height={6} rx={2} fill="#E8302E" opacity={night ? 1 : 0.85} />
      {b.wheels.map(wx => (
        <g key={wx} transform={`translate(${wx} -${b.r - 2})`}>
          <circle r={b.r} fill="#1F2327" />
          <g className="pns-spin" style={vars({ "--dur": ".45s" })}>
            <circle r={b.r * 0.55} fill="#BFC6CC" />
            <rect x={-b.r * 0.5} y={-1} width={b.r} height={2} fill="#6B747B" />
            <rect x={-1} y={-b.r * 0.5} width={2} height={b.r} fill="#6B747B" />
          </g>
        </g>
      ))}
    </g>
  );
}

/** A car crossing the scene. dir=1 drives right, dir=-1 drives left. */
export function Car({ y, dir = 1, kind = "sedan", color, dur = 9, delay = 0, s = 1, night = false }: { y: number; dir?: 1 | -1; kind?: CarKind; color?: string; dur?: number; delay?: number; s?: number; night?: boolean }) {
  const range = dir === 1 ? { "--fx": "-300px", "--tx": "1900px" } : { "--fx": "1900px", "--tx": "-300px" };
  return (
    <g className="pns-move" style={vars({ ...range, "--dur": `${dur}s`, "--delay": `${delay}s` })}>
      <g transform={`translate(0 ${y}) scale(${dir * s} ${s})`}>
        <CarShape kind={kind} color={color} night={night} />
      </g>
    </g>
  );
}

export function BusShape({ color = "#F2B705", label = "SCHOOL BUS", night = false }: { color?: string; label?: string; night?: boolean }) {
  return (
    <g>
      {night && <path d="M296 -30 L520 -60 L520 4 Z" fill="url(#beam)" opacity={0.7} />}
      <ellipse cx={150} cy={2} rx={150} ry={6} fill="#000" opacity={0.18} />
      <path d="M4 -16 L4 -104 Q4 -112 12 -112 L270 -112 Q286 -112 292 -96 L298 -60 L298 -16 Z" fill={color} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={20 + i * 40} y={-100} width={32} height={30} rx={4} fill={night ? "#FFD98A" : "#9FC9E3"} />
      ))}
      <path d="M262 -100 L282 -100 Q288 -98 290 -88 L294 -66 L262 -66Z" fill="#9FC9E3" />
      <rect x={4} y={-58} width={294} height={6} fill="#1F2327" opacity={0.65} />
      <text x={120} y={-36} fontSize={13} fontWeight={800} fill="#1F2327" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="1">
        {label}
      </text>
      <rect x={290} y={-40} width={8} height={7} rx={2} fill="#FFF1B8" />
      {[56, 236].map(wx => (
        <g key={wx} transform={`translate(${wx} -12)`}>
          <circle r={15} fill="#1F2327" />
          <g className="pns-spin" style={vars({ "--dur": ".6s" })}>
            <circle r={8} fill="#BFC6CC" />
            <rect x={-7} y={-1} width={14} height={2} fill="#6B747B" />
          </g>
        </g>
      ))}
    </g>
  );
}

export function Bus({ y, dir = 1, dur = 16, delay = 0, s = 1, color, label, night }: { y: number; dir?: 1 | -1; dur?: number; delay?: number; s?: number; color?: string; label?: string; night?: boolean }) {
  const range = dir === 1 ? { "--fx": "-400px", "--tx": "1950px" } : { "--fx": "1950px", "--tx": "-400px" };
  return (
    <g className="pns-move" style={vars({ ...range, "--dur": `${dur}s`, "--delay": `${delay}s` })}>
      <g transform={`translate(0 ${y}) scale(${dir * s} ${s})`}>
        <BusShape color={color} label={label} night={night} />
      </g>
    </g>
  );
}

/** Dhaka's cycle rickshaw with its painted hood. */
export function Rickshaw({ y, dir = 1, dur = 30, delay = 0, s = 1, hood = "#D93B5B", rain = false }: { y: number; dir?: 1 | -1; dur?: number; delay?: number; s?: number; hood?: string; rain?: boolean }) {
  const range = dir === 1 ? { "--fx": "-200px", "--tx": "1850px" } : { "--fx": "1850px", "--tx": "-200px" };
  return (
    <g className="pns-move" style={vars({ ...range, "--dur": `${dur}s`, "--delay": `${delay}s` })}>
      <g transform={`translate(0 ${y}) scale(${dir * s} ${s})`}>
        <ellipse cx={60} cy={2} rx={70} ry={4} fill="#000" opacity={0.15} />
        {/* passenger seat + hood */}
        <path d="M6 -46 Q4 -104 50 -108 L62 -108 L62 -46 Z" fill={rain ? "#3D7FB7" : hood} />
        <path d="M14 -60 Q14 -96 48 -100" stroke="#F4D35E" strokeWidth={3} fill="none" />
        <rect x={10} y={-50} width={56} height={10} rx={3} fill="#2F5D50" />
        <circle cx={34} cy={-62} r={8} fill="#7A4E33" />
        <rect x={26} y={-56} width={18} height={10} rx={3} fill="#3A6EA5" />
        {/* frame */}
        <path d="M60 -40 L118 -40 L130 -70" stroke="#3B3B3B" strokeWidth={4} fill="none" />
        <rect x={120} y={-76} width={20} height={4} rx={2} fill="#3B3B3B" />
        {/* rider */}
        <g transform="translate(96 -64)">
          <circle cx={0} cy={-34} r={8} fill="#8A5A3C" />
          <path d="M-6 -26 L6 -26 L8 0 L-8 0 Z" fill="#F2F2EE" />
          <g className="pns-pedal" style={vars({ "--dur": "1s" })}>
            <line x1={0} y1={0} x2={10} y2={16} stroke="#5B4636" strokeWidth={5} strokeLinecap="round" />
            <line x1={0} y1={0} x2={-10} y2={-6} stroke="#5B4636" strokeWidth={5} strokeLinecap="round" />
          </g>
        </g>
        {[22, 64, 126].map(wx => (
          <g key={wx} transform={`translate(${wx} -16)`}>
            <circle r={16} fill="none" stroke="#2A2A2A" strokeWidth={3.5} />
            <g className="pns-spin" style={vars({ "--dur": ".9s" })}>
              <line x1={-15} y1={0} x2={15} y2={0} stroke="#888" strokeWidth={1.2} />
              <line x1={0} y1={-15} x2={0} y2={15} stroke="#888" strokeWidth={1.2} />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

/** Green CNG auto-rickshaw. */
export function Cng({ y, dir = 1, dur = 13, delay = 0, s = 1 }: { y: number; dir?: 1 | -1; dur?: number; delay?: number; s?: number }) {
  const range = dir === 1 ? { "--fx": "-200px", "--tx": "1850px" } : { "--fx": "1850px", "--tx": "-200px" };
  return (
    <g className="pns-move" style={vars({ ...range, "--dur": `${dur}s`, "--delay": `${delay}s` })}>
      <g transform={`translate(0 ${y}) scale(${dir * s} ${s})`}>
        <ellipse cx={60} cy={2} rx={64} ry={4} fill="#000" opacity={0.15} />
        <path d="M6 -16 L6 -78 Q6 -96 30 -96 L84 -96 Q104 -96 112 -70 L122 -36 L122 -16 Z" fill="#2E8B57" />
        <path d="M20 -86 L60 -86 L60 -52 L16 -52 Z" fill="#1F2E2A" opacity={0.6} />
        <path d="M70 -86 L88 -86 Q98 -84 104 -66 L108 -52 L70 -52 Z" fill="#9FC9E3" />
        <rect x={6} y={-28} width={116} height={5} fill="#F4D35E" />
        <rect x={114} y={-44} width={8} height={6} rx={2} fill="#FFF1B8" />
        {[30, 100].map(wx => (
          <g key={wx} transform={`translate(${wx} -12)`}>
            <circle r={12} fill="#1F2327" />
            <g className="pns-spin" style={vars({ "--dur": ".5s" })}>
              <circle r={6} fill="#BFC6CC" />
              <rect x={-5} y={-1} width={10} height={2} fill="#6B747B" />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

export function Ambulance({ y, dir = 1, dur = 9, delay = 0, s = 1 }: { y: number; dir?: 1 | -1; dur?: number; delay?: number; s?: number }) {
  const range = dir === 1 ? { "--fx": "-300px", "--tx": "1900px" } : { "--fx": "1900px", "--tx": "-300px" };
  return (
    <g className="pns-move" style={vars({ ...range, "--dur": `${dur}s`, "--delay": `${delay}s` })}>
      <g transform={`translate(0 ${y}) scale(${dir * s} ${s})`}>
        <ellipse cx={100} cy={2} rx={100} ry={5} fill="#000" opacity={0.18} />
        <path d="M4 -14 L4 -96 Q4 -102 10 -102 L132 -102 L132 -14 Z" fill="#FAFAF7" />
        <path d="M132 -14 L132 -80 L164 -80 Q176 -80 182 -66 L196 -40 L196 -14 Z" fill="#FAFAF7" />
        <path d="M138 -74 L162 -74 Q170 -74 174 -64 L182 -46 L138 -46 Z" fill="#9FC9E3" />
        <rect x={4} y={-50} width={192} height={10} fill="#1E8E6E" />
        <rect x={54} y={-88} width={30} height={30} rx={4} fill="#1E8E6E" />
        <rect x={66} y={-84} width={6} height={22} fill="#fff" />
        <rect x={58} y={-76} width={22} height={6} fill="#fff" />
        <rect x={110} y={-110} width={22} height={8} rx={3} fill="#2F6FDE" className="pns-blink" />
        <rect x={86} y={-110} width={22} height={8} rx={3} fill="#E2553C" className="pns-blink" style={vars({ "--dur": ".8s" })} />
        <g opacity={0.3}>
          <circle cx={120} cy={-106} r={26} fill="#2F6FDE" className="pns-blink" />
        </g>
        {[44, 160].map(wx => (
          <g key={wx} transform={`translate(${wx} -13)`}>
            <circle r={14} fill="#1F2327" />
            <g className="pns-spin" style={vars({ "--dur": ".4s" })}>
              <circle r={7} fill="#BFC6CC" />
              <rect x={-6} y={-1} width={12} height={2} fill="#6B747B" />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

export function Truck({ y, dir = 1, dur = 18, delay = 0, s = 1, color = "#F4A62A" }: { y: number; dir?: 1 | -1; dur?: number; delay?: number; s?: number; color?: string }) {
  const range = dir === 1 ? { "--fx": "-320px", "--tx": "1900px" } : { "--fx": "1900px", "--tx": "-320px" };
  return (
    <g className="pns-move" style={vars({ ...range, "--dur": `${dur}s`, "--delay": `${delay}s` })}>
      <g transform={`translate(0 ${y}) scale(${dir * s} ${s})`}>
        <ellipse cx={110} cy={2} rx={110} ry={5} fill="#000" opacity={0.18} />
        <path d="M4 -16 L4 -60 L140 -60 L150 -24 L150 -16 Z" fill="#7D8790" />
        <path d="M14 -60 L130 -60 L120 -96 L30 -96 Z" fill="#B7A27C" />
        <path d="M150 -16 L150 -86 L190 -86 Q200 -86 204 -74 L214 -44 L214 -16 Z" fill={color} />
        <path d="M160 -80 L188 -80 Q194 -80 197 -72 L204 -52 L160 -52 Z" fill="#9FC9E3" />
        {[40, 112, 186].map(wx => (
          <g key={wx} transform={`translate(${wx} -13)`}>
            <circle r={14} fill="#1F2327" />
            <g className="pns-spin" style={vars({ "--dur": ".6s" })}>
              <circle r={7} fill="#BFC6CC" />
              <rect x={-6} y={-1} width={12} height={2} fill="#6B747B" />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------
const SKIN = ["#8A5A3C", "#A86E4A", "#6E4630", "#C08A62", "#7A4E33"];
const SHIRT = ["#E2553C", "#2F6FDE", "#1E8E6E", "#F4A62A", "#7C4DBA", "#F2F2EE", "#D93B5B", "#3A6EA5"];

export function PersonShape({ seed = 1, h = 64, attire = "shirt", umbrella, child = false, walking = true }: { seed?: number; h?: number; attire?: "shirt" | "saree" | "panjabi" | "kid"; umbrella?: string; child?: boolean; walking?: boolean }) {
  const r = rng(seed);
  const skin = pick(r, SKIN);
  const top = pick(r, SHIRT);
  const legs = pick(r, ["#2B3A4A", "#3B3B3B", "#4A5B6E", "#6B4F3A"]);
  const k = h / 64;
  const dur = child ? ".45s" : ".7s";
  const leg = (cls: string) => (
    <g className={walking ? cls : undefined} style={vars({ "--dur": dur })}>
      <rect x={-3} y={0} width={6} height={22} rx={3} fill={attire === "saree" ? top : legs} />
    </g>
  );
  return (
    <g transform={`scale(${k})`}>
      <ellipse cx={0} cy={0} rx={12} ry={2.5} fill="#000" opacity={0.15} />
      <g transform="translate(0 -22)">
        <g transform="translate(-3 0)">{leg("pns-leg")}</g>
        <g transform="translate(3 0)">{leg("pns-leg b")}</g>
      </g>
      <g className={walking ? "pns-step" : undefined} style={vars({ "--dur": dur })}>
        {attire === "saree" ? (
          <path d="M-11 -24 L-8 -50 Q0 -54 8 -50 L13 -24 Z" fill={top} />
        ) : attire === "panjabi" ? (
          <path d="M-10 -18 L-9 -50 Q0 -54 9 -50 L10 -18 Z" fill="#F2F2EE" />
        ) : (
          <rect x={-9} y={-50} width={18} height={28} rx={6} fill={top} />
        )}
        {attire === "saree" && <path d="M-8 -50 Q6 -40 13 -26" stroke={pick(r, ["#F4A62A", "#1E8E6E", "#E2553C"])} strokeWidth={4} fill="none" />}
        <g transform="translate(-9 -48)">
          <g className={walking ? "pns-arm" : undefined} style={vars({ "--dur": dur })}>
            <rect x={-2.5} y={0} width={5} height={22} rx={2.5} fill={skin} />
          </g>
        </g>
        <g transform="translate(9 -48)">
          <g className={walking ? "pns-arm b" : undefined} style={vars({ "--dur": dur })}>
            <rect x={-2.5} y={0} width={5} height={22} rx={2.5} fill={skin} />
          </g>
        </g>
        <rect x={-3} y={-56} width={6} height={6} fill={skin} />
        <circle cx={0} cy={-63} r={9} fill={skin} />
        <path d={attire === "saree" ? "M-9 -64 Q0 -78 9 -64 L10 -54 Q4 -60 0 -60 Q-6 -60 -10 -54Z" : "M-9 -64 Q-2 -76 9 -66 L9 -63 Q0 -68 -9 -62Z"} fill="#1E1A18" />
        {attire === "panjabi" && <ellipse cx={0} cy={-70} rx={9} ry={4} fill="#F2F2EE" />}
        {umbrella && (
          <g>
            <line x1={10} y1={-46} x2={10} y2={-96} stroke="#3B3B3B" strokeWidth={2} />
            <path d="M-26 -94 Q10 -130 46 -94 Q34 -100 28 -94 Q20 -100 10 -94 Q0 -100 -8 -94 Q-14 -100 -26 -94Z" fill={umbrella} />
          </g>
        )}
      </g>
    </g>
  );
}

export function Walker({ y, x, dir = 1, dur = 60, delay = 0, seed = 1, h = 64, attire, umbrella, child, still }: { y: number; x?: number; dir?: 1 | -1; dur?: number; delay?: number; seed?: number; h?: number; attire?: "shirt" | "saree" | "panjabi" | "kid"; umbrella?: string; child?: boolean; still?: boolean }) {
  if (still || x !== undefined)
    return (
      <g transform={`translate(${x ?? 0} ${y}) scale(${dir} 1)`}>
        <PersonShape seed={seed} h={h} attire={attire} umbrella={umbrella} child={child} walking={!still} />
      </g>
    );
  const range = dir === 1 ? { "--fx": "-80px", "--tx": "1700px" } : { "--fx": "1700px", "--tx": "-80px" };
  return (
    <g className="pns-move" style={vars({ ...range, "--dur": `${dur}s`, "--delay": `${delay}s` })}>
      <g transform={`translate(0 ${y}) scale(${dir} 1)`}>
        <PersonShape seed={seed} h={h} attire={attire} umbrella={umbrella} child={child} />
      </g>
    </g>
  );
}

export function Cyclist({ y, dir = 1, dur = 22, delay = 0, seed = 2, s = 1, frame = "#E2553C" }: { y: number; dir?: 1 | -1; dur?: number; delay?: number; seed?: number; s?: number; frame?: string }) {
  const r = rng(seed);
  const skin = pick(r, SKIN);
  const top = pick(r, SHIRT);
  const range = dir === 1 ? { "--fx": "-120px", "--tx": "1750px" } : { "--fx": "1750px", "--tx": "-120px" };
  return (
    <g className="pns-move" style={vars({ ...range, "--dur": `${dur}s`, "--delay": `${delay}s` })}>
      <g transform={`translate(0 ${y}) scale(${dir * s} ${s})`}>
        <ellipse cx={30} cy={2} rx={40} ry={3} fill="#000" opacity={0.15} />
        {[0, 62].map(wx => (
          <g key={wx} transform={`translate(${wx} -18)`}>
            <circle r={18} fill="none" stroke="#2A2A2A" strokeWidth={3.5} />
            <g className="pns-spin" style={vars({ "--dur": ".7s" })}>
              <line x1={-17} y1={0} x2={17} y2={0} stroke="#999" strokeWidth={1.2} />
              <line x1={0} y1={-17} x2={0} y2={17} stroke="#999" strokeWidth={1.2} />
            </g>
          </g>
        ))}
        <path d="M0 -18 L24 -18 L44 -46 L18 -46 Z M24 -18 L14 -52 M44 -46 L62 -18 M44 -46 L48 -58" stroke={frame} strokeWidth={4} fill="none" strokeLinejoin="round" />
        <rect x={8} y={-56} width={14} height={4} rx={2} fill="#2A2A2A" />
        <g transform="translate(24 -18)" className="pns-pedal" style={vars({ "--dur": ".7s" })}>
          <line x1={0} y1={0} x2={0} y2={-9} stroke="#444" strokeWidth={3} />
        </g>
        <path d="M16 -56 L30 -88" stroke={top} strokeWidth={14} strokeLinecap="round" />
        <path d="M30 -84 L46 -60" stroke={skin} strokeWidth={5} strokeLinecap="round" />
        <path d="M16 -56 L24 -34 L24 -22" stroke="#2B3A4A" strokeWidth={6} fill="none" strokeLinecap="round" />
        <circle cx={34} cy={-98} r={9} fill={skin} />
        <path d="M24 -100 Q34 -114 44 -100Z" fill={frame} />
      </g>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Landmarks
// ---------------------------------------------------------------------------
export function Mosque({ x, base, s = 1, lit = false }: { x: number; base: number; s?: number; lit?: boolean }) {
  const wall = lit ? "#E9E1CF" : "#F4EEE2";
  const dome = "#2E8B73";
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`}>
      <rect x={-170} y={-120} width={340} height={120} fill={wall} />
      <rect x={-170} y={-128} width={340} height={10} fill="#D9CDB2" />
      {[-120, -60, 0, 60, 120].map(ax => (
        <path key={ax} d={`M${ax - 18} 0 L${ax - 18} -60 Q${ax} -92 ${ax + 18} -60 L${ax + 18} 0 Z`} fill={lit ? "#FFD98A" : "#B88B5A"} opacity={lit ? 0.95 : 0.55} />
      ))}
      <path d="M-90 -128 Q-90 -240 0 -250 Q90 -240 90 -128 Z" fill={dome} />
      <path d="M-70 -140 Q-60 -220 0 -232" stroke="#fff" strokeWidth={6} opacity={0.25} fill="none" />
      <rect x={-3} y={-290} width={6} height={42} fill="#C9A227" />
      <path d="M0 -306 a12 12 0 1 0 8 18 a10 10 0 1 1 -8 -18z" fill="#C9A227" />
      {[-210, 210].map(mx => (
        <g key={mx}>
          <rect x={mx - 14} y={-300} width={28} height={300} fill={wall} />
          <rect x={mx - 20} y={-230} width={40} height={10} fill="#D9CDB2" />
          <rect x={mx - 20} y={-150} width={40} height={10} fill="#D9CDB2" />
          <path d={`M${mx - 16} -300 Q${mx} -350 ${mx + 16} -300 Z`} fill={dome} />
          {lit && <rect x={mx - 6} y={-280} width={12} height={20} rx={6} fill="#FFD98A" />}
        </g>
      ))}
      {lit && <circle cx={0} cy={-60} r={220} fill="url(#glow-warm)" opacity={0.35} />}
    </g>
  );
}

export function GateArch({ x, base, label = "PURBACHAL NEWTOWN", s = 1 }: { x: number; base: number; label?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`}>
      <rect x={-260} y={-250} width={44} height={250} fill="#E8DFCF" />
      <rect x={216} y={-250} width={44} height={250} fill="#E8DFCF" />
      <rect x={-280} y={-292} width={560} height={58} rx={8} fill="#0F6E56" />
      <rect x={-280} y={-240} width={560} height={8} fill="#0A4F3E" />
      <text x={0} y={-256} textAnchor="middle" fontSize={26} fontWeight={800} fill="#F6F4EE" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="3">
        {label}
      </text>
      <circle cx={-238} cy={-262} r={9} fill="#F4A62A" />
      <circle cx={238} cy={-262} r={9} fill="#F4A62A" />
      {[-246, 226].map(px => (
        <g key={px}>
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={px} y={-230 + i * 36} width={24} height={2} fill="#000" opacity={0.08} />
          ))}
        </g>
      ))}
    </g>
  );
}

export function Fountain({ x, base }: { x: number; base: number }) {
  const jets = [-60, -30, 0, 30, 60];
  return (
    <g transform={`translate(${x} ${base})`}>
      <ellipse cx={0} cy={-6} rx={150} ry={22} fill="#C9C1B2" />
      <ellipse cx={0} cy={-12} rx={136} ry={16} fill="#6FB6D3" />
      {jets.map((j, i) => (
        <path
          key={j}
          d={`M${j * 0.3} -20 Q${j * 0.8} ${-150 - (2 - Math.abs(i - 2)) * 40} ${j * 1.9} -14`}
          fill="none"
          stroke="#BFE6F5"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="8 12"
          className="pns-flow"
          style={vars({ "--dur": `${0.9 + i * 0.07}s` })}
          opacity={0.9}
        />
      ))}
      <rect x={-10} y={-60} width={20} height={48} rx={4} fill="#D9D3C7" />
      <ellipse cx={0} cy={-62} rx={36} ry={8} fill="#C9C1B2" />
      {[0, 1, 2].map(i => (
        <ellipse key={i} cx={0} cy={-12} rx={50} ry={7} fill="none" stroke="#fff" strokeWidth={2} className="pns-ripple" style={vars({ "--delay": `${-i * 0.8}s` })} />
      ))}
    </g>
  );
}

export function Crane({ x, base, h = 420, jib = 340, color = "#F4A62A", dur = 16 }: { x: number; base: number; h?: number; jib?: number; color?: string; dur?: number }) {
  const lattice: React.ReactNode[] = [];
  for (let y = 0; y < h; y += 24) lattice.push(<path key={y} d={`M-12 ${-y} L12 ${-y - 24} M12 ${-y} L-12 ${-y - 24}`} stroke={color} strokeWidth={2} />);
  return (
    <g transform={`translate(${x} ${base})`}>
      <rect x={-14} y={-h} width={4} height={h} fill={color} />
      <rect x={10} y={-h} width={4} height={h} fill={color} />
      {lattice}
      <rect x={-22} y={-8} width={44} height={8} fill="#5B6670" />
      <g className="pns-jib" style={vars({ "--dur": `${dur}s`, "--ox": `${(jib * 0.25) / (jib * 1.25) * 100}%` })}>
        <rect x={-jib * 0.25} y={-h - 16} width={jib * 1.25} height={14} fill={color} />
        <rect x={-jib * 0.25} y={-h - 10} width={50} height={26} fill="#5B6670" />
        <path d={`M0 ${-h - 16} L0 ${-h - 70} L${jib} ${-h - 16}`} stroke={color} strokeWidth={3} fill="none" />
        <g transform={`translate(${jib * 0.7} ${-h - 2})`}>
          <g className="pns-hook" style={vars({ "--dur": "6s" })}>
            <line x1={0} y1={0} x2={0} y2={200} stroke="#3B3B3B" strokeWidth={2} />
            <rect x={-26} y={200} width={52} height={18} fill="#9AA5AE" />
          </g>
        </g>
      </g>
      <rect x={-20} y={-h - 34} width={30} height={22} rx={3} fill="#2F6FDE" />
    </g>
  );
}

export function SolarPanels({ x, y, n = 4 }: { x: number; y: number; n?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${x + i * 46} ${y}) skewX(-20)`}>
          <rect width={42} height={18} fill="#1E3A5F" />
          <path d="M14 0 V18 M28 0 V18 M0 9 H42" stroke="#5E8DBF" strokeWidth={1.2} />
          <rect width={42} height={18} fill="url(#carshine)" opacity={0.5} />
        </g>
      ))}
    </g>
  );
}

export function WindTurbine({ x, base, h = 260, dur = 5 }: { x: number; base: number; h?: number; dur?: number }) {
  return (
    <g transform={`translate(${x} ${base})`}>
      <path d={`M-6 0 L-2 ${-h} L2 ${-h} L6 0 Z`} fill="#F2F2EE" />
      <g transform={`translate(0 ${-h})`}>
        <g className="pns-spin" style={vars({ "--dur": `${dur}s` })}>
          {[0, 120, 240].map(a => (
            <path key={a} d="M0 0 Q8 -40 2 -110 Q-6 -40 0 0Z" fill="#F7F7F2" transform={`rotate(${a})`} />
          ))}
        </g>
        <circle r={6} fill="#D9D3C7" />
      </g>
    </g>
  );
}

export function Rain({ count = 140, seed = 11, color = "#DDE7EE" }: { count?: number; seed?: number; color?: string }) {
  const r = rng(seed);
  return (
    <g opacity={0.75}>
      {Array.from({ length: count }, (_, i) => {
        const x = r() * (W + 200);
        return (
          <line
            key={i}
            x1={x}
            y1={-r() * 300}
            x2={x - 8}
            y2={36 - r() * 300}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
            className="pns-rain"
            style={vars({ "--dur": `${0.6 + r() * 0.5}s`, "--delay": `${-r() * 1.2}s` })}
          />
        );
      })}
    </g>
  );
}

export function Firework({ x, y, color, delay = 0, size = 90, dur = 3.2 }: { x: number; y: number; color: string; delay?: number; size?: number; dur?: number }) {
  return (
    <g>
      <g className="pns-rocket" style={vars({ "--delay": `${delay}s`, "--dur": `${dur}s`, "--rise": `${y - 760}px` })}>
        <circle cx={x} cy={760} r={3} fill="#FFE9A0" />
      </g>
      <g transform={`translate(${x} ${y})`}>
        <g className="pns-burst" style={vars({ "--delay": `${delay + dur * 0.18}s`, "--dur": `${dur}s` })}>
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={0} y1={size * 0.25} x2={0} y2={size} stroke={color} strokeWidth={3} strokeLinecap="round" transform={`rotate(${(360 / 14) * i})`} />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={`c${i}`} cx={0} cy={size * 1.08} r={3} fill="#FFF6D5" transform={`rotate(${(360 / 14) * i + 12})`} />
          ))}
        </g>
      </g>
    </g>
  );
}

export function Lantern({ x, y, color = "#F4A62A", delay = 0, dur = 14, drift = 50 }: { x: number; y: number; color?: string; delay?: number; dur?: number; drift?: number }) {
  return (
    <g className="pns-float" style={vars({ "--delay": `${delay}s`, "--dur": `${dur}s`, "--drift": `${drift}px` })}>
      <g transform={`translate(${x} ${y})`}>
        <circle r={26} fill="url(#glow-warm)" />
        <path d="M-9 -12 Q0 -18 9 -12 L7 10 Q0 14 -7 10Z" fill={color} />
        <rect x={-5} y={10} width={10} height={3} fill="#7A4E33" />
      </g>
    </g>
  );
}

export function Kite({ x, y, color = "#E2553C", tail = "#F4A62A", delay = 0, stringTo }: { x: number; y: number; color?: string; tail?: string; delay?: number; stringTo?: [number, number] }) {
  return (
    <g>
      {stringTo && <path d={`M${x} ${y + 30} Q${(x + stringTo[0]) / 2 + 60} ${(y + stringTo[1]) / 2 + 40} ${stringTo[0]} ${stringTo[1]}`} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={1.2} fill="none" />}
      <g transform={`translate(${x} ${y})`}>
        <g className="pns-kite" style={vars({ "--delay": `${delay}s` })}>
          <path d="M0 -30 L22 0 L0 30 L-22 0Z" fill={color} />
          <path d="M0 -30 L0 30 M-22 0 L22 0" stroke="#fff" strokeOpacity={0.6} strokeWidth={1.5} />
          <path d="M0 30 q8 14 0 24 q-8 12 0 24" stroke={tail} strokeWidth={3} fill="none" />
        </g>
      </g>
    </g>
  );
}

export const Fence = ({ x0, x1, base, color = "#F2F2EE" }: { x0: number; x1: number; base: number; color?: string }) => (
  <g>
    <rect x={x0} y={base - 30} width={x1 - x0} height={4} fill={color} />
    <rect x={x0} y={base - 14} width={x1 - x0} height={4} fill={color} />
    {Array.from({ length: Math.floor((x1 - x0) / 16) }, (_, i) => (
      <rect key={i} x={x0 + i * 16} y={base - 38} width={6} height={38} rx={2} fill={color} />
    ))}
  </g>
);

/** A soft vignette & haze so text on top stays readable. */
export const Haze = ({ color = "#fff", opacity = 0.18 }: { color?: string; opacity?: number }) => (
  <rect width={W} height={H} fill={color} opacity={opacity} />
);
