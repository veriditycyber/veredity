import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { monthlyCheckCount } from "@/lib/usage";
import { PLANS, planOf, effectiveScanLimit } from "@/lib/plans";
import Topbar from "@/components/Topbar";
import LogoutButton from "@/components/LogoutButton";
import ModelPreference from "@/components/ModelPreference";
import ChangePassword from "@/components/ChangePassword";
import DeleteAccount from "@/components/DeleteAccount";
import ComplianceSettings from "@/components/ComplianceSettings";
import BrandingSettings from "@/components/BrandingSettings";
import SlackSettings from "@/components/SlackSettings";
import { anyProviderConfigured } from "@/lib/ai";
import { isAdmin } from "@/lib/perms";
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
          <div className="flex-between" style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
            <span className="muted">Email status</span>
            {user.emailVerified
              ? <span className="badge green"><Check /> Verified</span>
              : <span className="badge yellow">Unverified</span>}
          </div>
          <Row k="Sign-in methods" v={[user.passwordHash ? "Email" : null, user.googleId ? "Google" : null, user.appleId ? "Apple" : null].filter(Boolean).join(", ") || "—"} />
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
        </div>

        <div className="card">
          <p className="section-title">AI preferences</p>
          <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>
            Pick the default model for Interview AI and the Forge coach. You can still switch per-session.
          </p>
          {anyProviderConfigured()
            ? <ModelPreference initial={user.aiModel} />
            : <p className="hint">No AI provider configured yet. Add a provider key (Claude, OpenAI, or Gemini) to enable model selection.</p>}
        </div>

        <div className="card">
          <p className="section-title">Password</p>
          <ChangePassword hasPassword={!!user.passwordHash} />
        </div>

        {isAdmin(user) && (
          <div className="card">
            <p className="section-title">Data retention &amp; compliance</p>
            <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>
              Auto-delete candidate data on a schedule (GDPR/BIPA). Per-candidate export &amp; erasure live on each candidate&apos;s profile.
            </p>
            <ComplianceSettings initial={user.retentionDays} />
          </div>
        )}

        <div className="card">
          <p className="section-title">Report branding</p>
          <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>
            White-label the public <b>TrueHire Verified</b> reports you share with your name and accent color.
          </p>
          <BrandingSettings initialName={user.brandName} initialColor={user.brandColor} />
        </div>

        <div className="card">
          <p className="section-title">Slack alerts</p>
          <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>
            Get a Slack ping the moment a candidate is flagged high-risk. Paste an incoming-webhook URL from your Slack workspace.
          </p>
          <SlackSettings initial={user.slackWebhook} />
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

        <div className="card danger-zone">
          <p className="section-title" style={{ color: "var(--danger)" }}>Danger zone</p>
          <DeleteAccount />
        </div>
      </div>
    </>
  );
}
