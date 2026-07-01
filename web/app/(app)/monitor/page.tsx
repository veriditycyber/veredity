import { getCurrentUser } from "@/lib/auth";
import Topbar from "@/components/Topbar";
import MonitorManager from "@/components/MonitorManager";

export const dynamic = "force-dynamic";

export default async function MonitorPage() {
  await getCurrentUser();
  return (
    <>
      <Topbar title="Monitoring" crumb="Continuous verification" />
      <div className="content" style={{ maxWidth: 900 }}>
        <div className="page-head" style={{ marginBottom: 18 }}>
          <h2>Fraud doesn&apos;t stop at the offer</h2>
          <p>Laptop farms and account hand-offs happen <i>after</i> hiring. Put your remote hires on continuous re-verification and TrueHire re-screens them on a schedule.</p>
        </div>
        <MonitorManager />
      </div>
    </>
  );
}
