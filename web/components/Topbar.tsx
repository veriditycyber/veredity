import type { ReactNode } from "react";
import { Lock } from "./icons";
import ThemeToggle from "./ThemeToggle";
import AlertBell from "./AlertBell";
import CmdkButton from "./CmdkButton";

export default function Topbar({ title, crumb, right }: { title: string; crumb?: string; right?: ReactNode }) {
  return (
    <div className="topbar noprint">
      <div>
        {crumb && <div className="crumb">{crumb}</div>}
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">
        {right}
        <CmdkButton />
        <span className="pill secure"><Lock /> Encrypted session</span>
        <AlertBell />
        <ThemeToggle />
      </div>
    </div>
  );
}
