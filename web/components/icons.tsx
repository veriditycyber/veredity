import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...p,
});

export const Shield = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const ShieldSolid = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="#04111f" stroke="#04111f" strokeWidth={2.2} strokeLinejoin="round" {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#04111f" stroke="#04111f" />
    <path d="m9 12 2 2 4-4" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const Grid = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);
export const Scan = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M3 12h18" /></svg>
);
export const Clock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const Gear = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
);
export const Lock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const Person = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>
);
export const Audio = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 10v4M7 7v10M11 4v16M15 8v8M19 11v2" /></svg>
);
export const Check = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="m20 6-11 11-5-5" /></svg>
);
export const Alert = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
);
export const Logout = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
);
export const Upload = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 9 5-5 5 5" /><path d="M12 4v12" /></svg>
);
export const Inbox = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5 5h14l3 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" /></svg>
);
export const Sun = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const Moon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
);
export const Camera = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
);
export const Send = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></svg>
);
export const Sparkle = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8L16.5 17.5l1.8-.7z" /></svg>
);
export const Card = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></svg>
);
export const Chevron = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const GoogleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...p}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
);
export const AppleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...p}>
    <path d="M17.05 12.04c-.03-2.55 2.08-3.77 2.17-3.83-1.18-1.73-3.02-1.97-3.68-2-1.57-.16-3.06.92-3.85.92-.79 0-2.02-.9-3.32-.87-1.71.02-3.29.99-4.17 2.52-1.78 3.08-.46 7.64 1.27 10.14.85 1.22 1.86 2.6 3.18 2.55 1.28-.05 1.76-.83 3.31-.83 1.54 0 1.98.83 3.33.8 1.38-.02 2.25-1.25 3.09-2.48.97-1.42 1.37-2.8 1.39-2.87-.03-.01-2.67-1.03-2.7-4.07-.02-.03 0-.05 0-.07zM14.6 4.5c.7-.85 1.17-2.03 1.04-3.2-1.01.04-2.23.67-2.95 1.52-.65.75-1.21 1.95-1.06 3.1 1.12.09 2.27-.57 2.97-1.42z" />
  </svg>
);
export const Flame = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.4-2 1-2.8C9 9.8 9 11 10 11.5 9.2 9 11 5.5 12 3z" /><path d="M12 21a5 5 0 0 0 5-5c0-1.3-.5-2.4-1.2-3.3" /></svg>
);
export const Target = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></svg>
);
export const Compass = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>
);
export const Code = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /></svg>
);
