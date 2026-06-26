"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Scan, Send, Sparkle, Clock, Card, Gear } from "./icons";
import ProductHeader from "./ProductHeader";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: Grid },
  { href: "/check", label: "New Check", Icon: Scan },
  { href: "/interviews", label: "Interview AI", Icon: Sparkle },
  { href: "/links", label: "Verify Links", Icon: Send },
  { href: "/history", label: "History", Icon: Clock },
  { href: "/billing", label: "Billing", Icon: Card },
  { href: "/settings", label: "Settings", Icon: Gear },
];

export default function Sidebar({ name, company }: { name: string; company: string }) {
  const path = usePathname();
  const initial = (name || "U").trim().charAt(0).toUpperCase();
  return (
    <aside className="sidebar">
      <ProductHeader />
      <nav className="nav">
        {NAV.map(({ href, label, Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={active ? "active" : ""}>
              <Icon /> {label}
            </Link>
          );
        })}
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
