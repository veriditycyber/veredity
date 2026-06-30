"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Scan, Send, Sparkle, Clock, Card, Gear, Flame, Target } from "./icons";
import ProductHeader from "./ProductHeader";

const TRUEHIRE_NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: Grid },
  { href: "/check", label: "New Check", Icon: Scan },
  { href: "/interviews", label: "Interview AI", Icon: Sparkle },
  { href: "/links", label: "Verify Links", Icon: Send },
  { href: "/history", label: "History", Icon: Clock },
  { href: "/billing", label: "Billing", Icon: Card },
  { href: "/settings", label: "Settings", Icon: Gear },
];

const FORGE_NAV = [
  { href: "/forge", label: "Coach", Icon: Flame },
  { href: "/forge/dna", label: "Thinking DNA", Icon: Target },
  { href: "/billing", label: "Billing", Icon: Card },
  { href: "/settings", label: "Settings", Icon: Gear },
];

function isActive(path: string, href: string) {
  if (href === "/forge") return path === "/forge" || (path.startsWith("/forge/") && path !== "/forge/dna");
  if (href === "/forge/dna") return path === "/forge/dna";
  return path === href || path.startsWith(href + "/");
}

export default function Sidebar({ name, company }: { name: string; company: string }) {
  const path = usePathname();
  const product = path.startsWith("/forge") ? "forge" : "truehire";
  const nav = product === "forge" ? FORGE_NAV : TRUEHIRE_NAV;
  const initial = (name || "U").trim().charAt(0).toUpperCase();
  return (
    <aside className="sidebar">
      <ProductHeader active={product} />
      <nav className="nav">
        {nav.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={isActive(path, href) ? "active" : ""}>
            <Icon /> {label}
          </Link>
        ))}
      </nav>
      <div className="side-user">
        <div className="av">{initial}</div>
        <div style={{ overflow: "hidden" }}>
          <div className="who">{name}</div>
          <div className="org">{company || "—"}</div>
        </div>
      </div>
    </aside>
  );
}
