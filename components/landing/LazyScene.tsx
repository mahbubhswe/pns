"use client";

// A township illustration that is only built when it is about to scroll into
// view. Each scene is ~90 KB of SVG; rendering them all on the server made the
// home page HTML ~1.5 MB. Until then a soft gradient placeholder fills the box.
import React, { useRef } from "react";
import { useInViewOnce } from "@/components/home/motion";
import { SceneSvg } from "@/components/landing/scenes";

export default function LazyScene({ index, paused }: { index: number; paused?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // Start building a little before it is visible, so it is ready when the user gets there.
  const near = useInViewOnce(ref, { margin: "400px 0px" });
  return (
    <div ref={ref} style={{ position: "absolute", inset: 0 }}>
      {near ? (
        <SceneSvg index={index} paused={paused} />
      ) : (
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #CFE8F5 0%, #E8F3EC 60%, #D6E9DC 100%)" }} />
      )}
    </div>
  );
}
