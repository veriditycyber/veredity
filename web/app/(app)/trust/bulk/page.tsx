import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import Topbar from "@/components/Topbar";
import BulkScreen from "@/components/BulkScreen";

export const dynamic = "force-dynamic";

export default async function BulkTrustPage() {
  await getCurrentUser();
  return (
    <>
      <Topbar title="Bulk screening" crumb="Trust Score" />
      <div className="content" style={{ maxWidth: 880 }}>
        <div className="flex-between" style={{ marginBottom: 18 }}>
          <div className="page-head" style={{ margin: 0 }}>
            <h2>Screen a whole pipeline at once</h2>
            <p>Built for staffing agencies and high-volume hiring: paste a list of candidates and get a trust verdict for every one, exportable to CSV.</p>
          </div>
          <Link className="btn btn-ghost" href="/trust">← Single candidate</Link>
        </div>
        <BulkScreen />
      </div>
    </>
  );
}
