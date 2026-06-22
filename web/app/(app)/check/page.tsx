import { getCurrentUser } from "@/lib/auth";
import { monthlyCheckCount } from "@/lib/usage";
import { MAX_MONTHLY_SCANS } from "@/lib/rd";
import Topbar from "@/components/Topbar";
import CheckFlow from "@/components/CheckFlow";

export const dynamic = "force-dynamic";

export default async function CheckPage() {
  await getCurrentUser();
  const used = await monthlyCheckCount();
  const scansLeft = Math.max(0, MAX_MONTHLY_SCANS - used);
  return (
    <>
      <Topbar title="New Check" crumb="Verify a candidate"
        right={<span className="pill"><span className="dot-live" /> <b>{scansLeft}</b>&nbsp;scans left</span>} />
      <div className="content">
        <div className="page-head">
          <h2>Verify a candidate</h2>
          <p>Upload a candidate&apos;s photo, video frame, or voice clip. We flag deepfake, face-swap, and synthetic-voice risk — you make the final call.</p>
        </div>
        <CheckFlow initialScansLeft={scansLeft} />
      </div>
    </>
  );
}
