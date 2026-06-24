"use client";

import { useEffect, useRef } from "react";

// Ambient light that softly trails the cursor — futuristic depth, very subtle.
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y, raf = 0;
    const move = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.1; y += (ty - y) * 0.1;
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", move); };
  }, []);
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
