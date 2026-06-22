import type { ReactNode } from "react";
import { Lock } from "./icons";

export default function Topbar({ title, crumb, right }: { title: string; crumb?: string; right?: ReactNode }) {
  return (
    <div className="topbar noprint">
      <div>
        {crumb && <div className="crumb">{crumb}</div>}
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">
        {right}
        <span className="pill secure"><Lock /> Encrypted session</span>
      </div>
    </div>
  );
}
