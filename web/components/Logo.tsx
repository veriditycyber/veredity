// Veridity brand mark — "Pixel Split": a V whose left arm is solid (the real
// candidate) and whose right arm dissolves into pixels (the deepfake). Monochrome:
// uses currentColor so it inverts cleanly between light and dark themes.

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" role="img" style={{ color: "currentColor" }}>
      {/* left arm — solid, real */}
      <path d="M10 13 L24 39" stroke="currentColor" strokeWidth="7.5" strokeLinecap="round" />
      {/* right arm — dissolving into pixels, synthetic */}
      <rect x="21.4" y="31.6" width="8.6" height="8.6" rx="2.4" fill="currentColor" />
      <rect x="25.2" y="26.2" width="7.6" height="7.6" rx="2.2" fill="currentColor" opacity="0.7" />
      <rect x="29" y="20.4" width="6.6" height="6.6" rx="2" fill="currentColor" opacity="0.45" />
      <rect x="32.6" y="14.8" width="5.6" height="5.6" rx="1.8" fill="currentColor" opacity="0.26" />
    </svg>
  );
}

export function Logo({ size = 32, sub = "Cybersecurity" }: { size?: number; sub?: string }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-words">
        Veridity{sub ? <small>{sub}</small> : null}
      </span>
    </span>
  );
}
