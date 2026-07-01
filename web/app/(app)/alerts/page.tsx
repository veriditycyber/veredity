import { getCurrentUser } from "@/lib/auth";
import Topbar from "@/components/Topbar";
import AlertList from "@/components/AlertList";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  await getCurrentUser();
  return (
    <>
      <Topbar title="Alerts" crumb="Notifications" />
      <div className="content" style={{ maxWidth: 780 }}>
        <div className="page-head" style={{ marginBottom: 18 }}>
          <h2>High-risk alerts</h2>
          <p>TrueHire flags you here — and by email if configured — the moment a candidate comes back high-risk from a check, bulk screen, verification link, or continuous monitoring.</p>
        </div>
        <AlertList />
      </div>
    </>
  );
}
