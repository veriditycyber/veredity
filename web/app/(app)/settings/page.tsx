import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { monthlyCheckCount } from "@/lib/usage";
import { PLANS, planOf, effectiveScanLimit } from "@/lib/plans";
import Topbar from "@/components/Topbar";
import LogoutButton from "@/components/LogoutButton";
import { Lock, Shield, Check } from "@/components/icons";

export const dynamic = "force-dynamic";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex-between" style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
      <span className="muted">{k}</span><span>{v}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const user = (await getCurrentUser())!;
  const [total, monthUsed] = await Promise.all([
    prisma.check.count({ where: { userId: user.id } }),
    monthlyCheckCount(),
  ]);

  return (
    <>
      <Topbar title="Settings" crumb="Account" />
      <div className="content row-gap" style={{ maxWidth: 640 }}>
        <div className="card">
          <p className="section-title">Account</p>
          <Row k="Name" v={user.name || "—"} />
          <Row k="Company" v={user.company || "—"} />
          <Row k="Email" v={user.email} />
          <Row k="Member since" v={new Date(user.createdAt).toLocaleDateString()} />
          <div style={{ marginTop: 18 }}><LogoutButton /></div>
        </div>

        <div className="card">
          <div className="flex-between" style={{ marginBottom: 4 }}>
            <p className="section-title" style={{ margin: 0 }}>Plan &amp; usage</p>
            <Link className="hint" href="/billing" style={{ color: "var(--text)" }}>Manage →</Link>
          </div>
          <Row k="Plan" v={PLANS[planOf(user.plan)].name} />
          <Row k="Total checks run" v={String(total)} />
          <Row k="Checks this month" v={`${monthUsed} / ${effectiveScanLimit(user.plan)}`} />
          <Row k="Detection engine" v="Reality Defender" />
          <Row k="Interview AI" v="Claude" />
        </div>

        <div className="card">
          <p className="section-title">Security &amp; compliance</p>
          <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>
            How Veridity handles your data.
          </p>
          <div className="row-gap">
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><span className="sig-ok"><Lock /></span><span style={{ fontSize: 14 }}>Sessions are encrypted; passwords are hashed with bcrypt.</span></div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><span className="sig-ok"><Shield /></span><span style={{ fontSize: 14 }}>Uploaded media is sent to the detection engine and deleted immediately — never stored at rest.</span></div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><span className="sig-ok"><Check /></span><span style={{ fontSize: 14 }}>Consent is required before every biometric check (BIPA-aligned). Veridity is a fraud signal, not an automated hiring decision.</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
