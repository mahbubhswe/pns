"use client";

// Section-by-section loading for the home page. A section's code and markup
// are only created when it is about to scroll into view (or when a link like
// /#join points at it). Until then an empty box of roughly the right height
// holds its place, carrying the section's id so in-page links still work.
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export default function Deferred({ id, minHeight, children }: { id: string; minHeight: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "700px 0px" });
  const [linked, setLinked] = useState(false);

  // A link to this section (on load or later): render it now, then scroll to it.
  useEffect(() => {
    const check = () => {
      if (window.location.hash === `#${id}`) setLinked(true);
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [id]);

  const show = near || linked;

  useEffect(() => {
    if (!show || window.location.hash !== `#${id}`) return;
    // After the real section has rendered (and the sections above it settled), land on it.
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 60);
    return () => clearTimeout(t);
  }, [show, id]);

  if (show) return <>{children}</>;
  return <div ref={ref} id={id} aria-hidden style={{ minHeight, scrollMarginTop: 80 }} />;
}
