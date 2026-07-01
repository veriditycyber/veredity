"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "./icons";

export default function AlertBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => fetch("/api/alerts?count=1").then((r) => r.json()).then((d) => { if (alive) setUnread(d.unread || 0); }).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  return (
    <Link href="/alerts" className="alert-bell noprint" aria-label="Alerts" title="Alerts">
      <Alert />
      {unread > 0 && <span className="alert-dot">{unread > 9 ? "9+" : unread}</span>}
    </Link>
  );
}
