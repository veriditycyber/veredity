"use client";

import { useEffect, useRef } from "react";

// Monochrome "digital rain" — a live canvas of falling glyphs that adapts to the
// active theme. Decorative, behind content. Respects reduced-motion.
export default function MatrixRain({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = "アァカサタナハマヤラワ012345789ｱｲｳｴｵｶｷｸＸＶ↯⌁".split("");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, cols = 0, fontSize = 16;
    let drops: number[] = [], speeds: number[] = [];
    let raf = 0;

    const palette = () => {
      const dark = document.documentElement.getAttribute("data-theme") !== "light";
      return dark
        ? { head: "rgba(255,255,255,0.92)", body: "rgba(160,172,196,0.55)", fade: "rgba(10,10,12,0.10)" }
        : { head: "rgba(24,24,32,0.92)", body: "rgba(90,96,120,0.45)", fade: "rgba(243,243,245,0.13)" };
    };
    let pal = palette();

    const resize = () => {
      const parent = canvas.parentElement!;
      w = canvas.width = parent.clientWidth;
      h = canvas.height = parent.clientHeight;
      fontSize = Math.max(14, Math.round(w / 95));
      cols = Math.max(1, Math.floor(w / fontSize));
      drops = Array.from({ length: cols }, () => (Math.random() * -h) / fontSize);
      speeds = Array.from({ length: cols }, () => 0.35 + Math.random() * 0.55);
    };

    const draw = () => {
      pal = palette();
      ctx.fillStyle = pal.fade;
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px ui-monospace, monospace`;
      for (let i = 0; i < cols; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        // trailing glyph (dimmer)
        ctx.fillStyle = pal.body;
        ctx.fillText(chars[(Math.random() * chars.length) | 0], x, y - fontSize);
        // bright head
        ctx.fillStyle = pal.head;
        ctx.fillText(chars[(Math.random() * chars.length) | 0], x, y);
        drops[i] += speeds[i];
        if (y > h && Math.random() > 0.97) drops[i] = Math.random() * -18;
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    const mo = new MutationObserver(() => { pal = palette(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    if (reduce) {
      ctx.fillStyle = palette().fade;
      ctx.fillRect(0, 0, w, h);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      mo.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
