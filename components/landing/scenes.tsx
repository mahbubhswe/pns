"use client";

// components/landing/scenes.tsx — 20 animated illustrations of life in Purbachal New Town.
// Each scene lives in its own file (./scenes/<key>.tsx) and is loaded only when
// it is shown: the hero needs one at a time, so the other 19 never block the page.
import React from "react";
import dynamic from "next/dynamic";
import { W, H, CloudShape } from "./scene-kit";

export type SceneMeta = { key: string; title: string; bn: string; caption: string; tone: "light" | "dark" };

export const SCENES: SceneMeta[] = [
  { key: "boulevard", title: "Grand Boulevard", bn: "প্রশস্ত সড়ক, সবুজ বৃক্ষসারি", caption: "Wide, tree-lined avenues built for the next fifty years.", tone: "light" },
  { key: "lake", title: "Lakeside Promenade", bn: "লেকের ধারে সকালের হাঁটা", caption: "Morning walks by the water, neighbours saying hello.", tone: "light" },
  { key: "gate", title: "Welcome Home", bn: "নিরাপদ প্রবেশদ্বার", caption: "A safe, friendly entrance that knows every neighbour.", tone: "light" },
  { key: "villas", title: "Villa Lane", bn: "শান্ত আবাসিক সড়ক", caption: "Quiet streets where children can ride their bikes.", tone: "light" },
  { key: "park", title: "Central Park", bn: "পরিবারের জন্য সবুজ পার্ক", caption: "Green space for families, kites and evening chats.", tone: "light" },
  { key: "night", title: "City Lights", bn: "আলোকিত, নিরাপদ রাত", caption: "Well-lit streets that feel safe after dark.", tone: "dark" },
  { key: "expressway", title: "300 Feet Expressway", bn: "৩০০ ফিট সড়কে দ্রুত সংযোগ", caption: "A fast link to the city — and sunsets over the water.", tone: "dark" },
  { key: "sunrise", title: "Golden Sunrise", bn: "নতুন শহরের নতুন সকাল", caption: "A new town waking up to a new day.", tone: "dark" },
  { key: "mosque", title: "Community Mosque", bn: "হাঁটা দূরত্বে মসজিদ", caption: "Places of worship within walking distance.", tone: "dark" },
  { key: "school", title: "School Run", bn: "কাছেই ভালো স্কুল", caption: "Good schools close to home.", tone: "light" },
  { key: "monsoon", title: "Monsoon Evening", bn: "পরিকল্পিত পানি নিষ্কাশন", caption: "Planned drainage, so the rain is just rain.", tone: "dark" },
  { key: "green", title: "Green & Solar", bn: "সবুজ ও সৌরশক্তির শহর", caption: "Solar roofs and clean air for our children.", tone: "light" },
  { key: "market", title: "Neighbourhood Market", bn: "হাতের কাছে বাজার", caption: "Daily shopping, a short walk away.", tone: "light" },
  { key: "playground", title: "Playground", bn: "শিশুদের খেলার মাঠ", caption: "Fields where the next generation grows up.", tone: "light" },
  { key: "construction", title: "Building Our Future", bn: "একসাথে গড়ি ভবিষ্যৎ", caption: "Every plot owner is building this together.", tone: "light" },
  { key: "cycle", title: "Cycle Track", bn: "সাইকেল ও হাঁটার পথ", caption: "Room to breathe, ride and run.", tone: "dark" },
  { key: "care", title: "Care Close By", bn: "কাছেই চিকিৎসা সেবা", caption: "Healthcare close to home, when it matters most.", tone: "light" },
  { key: "festival", title: "Festival Night", bn: "উৎসবে আমরা একসাথে", caption: "Eid, Boishakh and every celebration — together.", tone: "dark" },
  { key: "plan", title: "Master-Planned Township", bn: "রাজউকের পরিকল্পিত টাউনশিপ", caption: "Planned sectors, wide roads and parks — connected by design.", tone: "light" },
  { key: "metro", title: "Metro Connection", bn: "মেট্রোতে ঢাকার আরও কাছে", caption: "Mass transit bringing Dhaka closer.", tone: "light" },
];

// Literal imports so the bundler makes one chunk per scene.
const LOADERS: Array<() => Promise<unknown>> = [
  () => import("./scenes/boulevard"),
  () => import("./scenes/lake"),
  () => import("./scenes/gate"),
  () => import("./scenes/villas"),
  () => import("./scenes/park"),
  () => import("./scenes/night"),
  () => import("./scenes/expressway"),
  () => import("./scenes/sunrise"),
  () => import("./scenes/mosque"),
  () => import("./scenes/school"),
  () => import("./scenes/monsoon"),
  () => import("./scenes/green"),
  () => import("./scenes/market"),
  () => import("./scenes/playground"),
  () => import("./scenes/construction"),
  () => import("./scenes/cycle"),
  () => import("./scenes/care"),
  () => import("./scenes/festival"),
  () => import("./scenes/plan"),
  () => import("./scenes/metro"),
];

const RENDERS = [
  dynamic(() => import("./scenes/boulevard")),
  dynamic(() => import("./scenes/lake")),
  dynamic(() => import("./scenes/gate")),
  dynamic(() => import("./scenes/villas")),
  dynamic(() => import("./scenes/park")),
  dynamic(() => import("./scenes/night")),
  dynamic(() => import("./scenes/expressway")),
  dynamic(() => import("./scenes/sunrise")),
  dynamic(() => import("./scenes/mosque")),
  dynamic(() => import("./scenes/school")),
  dynamic(() => import("./scenes/monsoon")),
  dynamic(() => import("./scenes/green")),
  dynamic(() => import("./scenes/market")),
  dynamic(() => import("./scenes/playground")),
  dynamic(() => import("./scenes/construction")),
  dynamic(() => import("./scenes/cycle")),
  dynamic(() => import("./scenes/care")),
  dynamic(() => import("./scenes/festival")),
  dynamic(() => import("./scenes/plan")),
  dynamic(() => import("./scenes/metro")),
];

const at = (index: number) => ((index % SCENES.length) + SCENES.length) % SCENES.length;

/** Start downloading a scene's code ahead of time (e.g. the next hero slide). */
export function preloadScene(index: number): void {
  void LOADERS[at(index)]().catch(() => {});
}

export function SceneSvg({ index, className, paused }: { index: number; className?: string; paused?: boolean }) {
  const i = at(index);
  const S = SCENES[i];
  const Render = RENDERS[i];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={`pns-scene${paused ? " pns-paused" : ""}${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={`${S.title}: ${S.caption}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <Render />
    </svg>
  );
}

export { CloudShape };
