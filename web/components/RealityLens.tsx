"use client";

import { useEffect, useRef } from "react";

// Facial-landmark points on a 400x360 stage (abstract "candidate" face).
const PTS: [number, number][] = [
  [200, 64], [156, 86], [244, 86], [132, 140], [268, 140], [158, 132], [188, 128], [212, 128], [242, 132],
  [160, 150], [190, 150], [210, 150], [240, 150], [175, 150], [225, 150], [200, 150], [200, 172], [200, 196],
  [184, 202], [216, 202], [150, 196], [250, 196], [178, 226], [222, 226], [200, 219], [200, 234], [158, 240], [242, 240], [200, 268],
];
const LINES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4], [1, 5], [2, 8], [5, 6], [6, 7], [7, 8], [5, 9], [8, 12],
  [9, 13], [13, 10], [11, 14], [14, 12], [9, 20], [12, 21], [10, 15], [11, 15], [15, 16], [16, 17], [17, 18], [17, 19],
  [18, 20], [19, 21], [20, 16], [21, 16], [17, 24], [18, 22], [19, 23], [22, 24], [24, 23], [22, 25], [23, 25],
  [20, 22], [21, 23], [20, 26], [21, 27], [26, 22], [27, 23], [26, 28], [27, 28], [3, 20], [4, 21], [3, 9], [4, 12],
];
const FLAGGED = new Set([17, 22, 23, 24, 25]); // "manipulated" mouth/nose region

export default function RealityLens() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let active = false, raf = 0, t = 0;

    const set = (x: number, y: number) => {
      el.style.setProperty("--lx", x + "px");
      el.style.setProperty("--ly", y + "px");
    };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      active = true;
      el.classList.add("lens-on");
      set(e.clientX - r.left, e.clientY - r.top);
    };
    const onLeave = () => { active = false; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    if (reduce) {
      set(el.clientWidth * 0.5, el.clientHeight * 0.46);
      el.classList.add("lens-on");
    } else {
      const loop = () => {
        t += 0.016;
        if (!active) {
          const w = el.clientWidth, h = el.clientHeight;
          set(w * (0.5 + 0.3 * Math.sin(t * 0.9)), h * (0.46 + 0.26 * Math.sin(t * 1.4)));
          el.classList.add("lens-on");
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => { cancelAnimationFrame(raf); el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <div className="lens-stage" ref={ref}>
      {/* CLEAN layer — what a human sees */}
      <svg className="lens-svg" viewBox="0 0 400 360" preserveAspectRatio="xMidYMid meet">
        <ellipse className="face-clean" cx="200" cy="166" rx="86" ry="108" />
        {PTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" className="dot-clean" />)}
      </svg>

      {/* SYNTHETIC layer — revealed only inside the lens */}
      <div className="subject-reveal">
        <div className="lens-scan" />
        <svg className="lens-svg" viewBox="0 0 400 360" preserveAspectRatio="xMidYMid meet">
          <ellipse className="face-mesh-o" cx="200" cy="166" rx="86" ry="108" />
          {LINES.map(([a, b], i) => (
            <line key={i} x1={PTS[a][0]} y1={PTS[a][1]} x2={PTS[b][0]} y2={PTS[b][1]} className="mesh-line" />
          ))}
          {PTS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={FLAGGED.has(i) ? 3.2 : 2} className={FLAGGED.has(i) ? "dot-flag" : "dot-mesh"} />
          ))}
          {/* red detection bracket around the manipulated region */}
          <path className="flag-box" d="M168 210 v-8 h8 M232 210 v-8 h-8 M168 244 v8 h8 M232 244 v8 h-8" />
          <text className="flag-tag" x="240" y="206">FACE-SWAP 0.94</text>
          <text className="flag-tag2" x="240" y="248">jawline · lip-sync</text>
        </svg>
      </div>

      {/* viewfinder chrome — always on top */}
      <div className="vf-chrome" aria-hidden="true">
        <span className="vfc tl" /><span className="vfc tr" /><span className="vfc bl" /><span className="vfc br" />
        <span className="vf-rec"><i /> ANALYZING</span>
        <span className="vf-id">SUBJECT&nbsp;001 · LIVE FRAME</span>
        <span className="vf-status">SYNTHETIC&nbsp;DETECTED</span>
      </div>

      {/* the scanner reticle */}
      <div className="lens-ring" aria-hidden="true">
        <span className="lr-cross" /><span className="lr-cross v" />
      </div>
    </div>
  );
}
