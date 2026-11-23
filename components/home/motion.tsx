"use client";

// Tiny replacements for the bits of framer-motion the public pages used, built
// on browser features (IntersectionObserver, CSS animations, requestAnimationFrame)
// so the animation library is no longer downloaded with the home page.
import React, { useEffect, useRef, useState } from "react";

const EASE = "cubic-bezier(.22,1,.36,1)";

/** True once the element has come within `margin` of the viewport (then stays true). */
export function useInViewOnce<T extends Element>(ref: React.RefObject<T | null>, opts: { margin?: string; amount?: number } = {}): boolean {
  const { margin = "0px", amount = 0 } = opts;
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: margin, threshold: amount }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, inView, margin, amount]);
  return inView;
}

/** The visitor asked their system for less motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduce;
}

/** Fades and lifts its content in the first time it scrolls into view. */
export function Reveal({ delay = 0, style, children }: { delay?: number; style?: React.CSSProperties; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInViewOnce(ref, { amount: 0.2 });
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(24px)",
        transition: `opacity .6s ${EASE} ${delay}s, transform .6s ${EASE} ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const XF_CSS = `
@keyframes pns-xf-in { from { opacity: 0; transform: translateX(var(--xf-in, 0)) scale(var(--xf-scale-in, 1)); } to { opacity: 1; transform: none; } }
@keyframes pns-xf-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateX(var(--xf-out, 0)) scale(var(--xf-scale-out, 1)); } }
`;

/**
 * Cross-fades between children when `id` changes: the old content fades out on
 * top of the new one fading in. `shift` slides them sideways (px, signed by `dir`)
 * and `zoom` starts the new one slightly enlarged.
 */
export function Crossfade({
  id,
  duration = 900,
  dir = 1,
  shift = 0,
  zoom = false,
  children,
}: {
  id: string;
  duration?: number;
  dir?: 1 | -1;
  shift?: number;
  zoom?: boolean;
  children: React.ReactNode;
}) {
  const [prev, setPrev] = useState<{ id: string; node: React.ReactNode } | null>(null);
  const last = useRef<{ id: string; node: React.ReactNode }>({ id, node: children });

  // Remember what was shown; when the id changes, keep the old content for the fade-out.
  useEffect(() => {
    if (last.current.id !== id) setPrev(last.current);
    last.current = { id, node: children };
  });
  useEffect(() => {
    if (!prev) return;
    const t = setTimeout(() => setPrev(null), duration);
    return () => clearTimeout(t);
  }, [prev, duration]);

  const layer: React.CSSProperties = { position: "absolute", inset: 0 };
  const vars = {
    "--xf-in": `${dir * shift}px`,
    "--xf-out": `${-dir * shift}px`,
    "--xf-scale-in": zoom ? 1.06 : 1,
    "--xf-scale-out": zoom ? 1.02 : 1,
  } as React.CSSProperties;
  return (
    <>
      <style>{XF_CSS}</style>
      <div key={`c-${id}`} style={{ ...layer, ...vars, animation: prev ? `pns-xf-in ${duration}ms ${EASE} both` : "none" }}>
        {children}
      </div>
      {prev && (
        <div key={`p-${prev.id}`} aria-hidden style={{ ...layer, ...vars, pointerEvents: "none", animation: `pns-xf-out ${duration}ms ${EASE} both` }}>
          {prev.node}
        </div>
      )}
    </>
  );
}

/** Ease-out tween from `from` to `to` over `ms`, calling `onUpdate`; returns a stop function. */
export function tween(from: number, to: number, ms: number, onUpdate: (v: number) => void): () => void {
  let raf = 0;
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(2, -10 * p); // ease-out (expo)
    onUpdate(p >= 1 ? to : from + (to - from) * eased);
    if (p < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
