import { getCurrentUser } from "@/lib/auth";
import Topbar from "@/components/Topbar";
import TeamManager from "@/components/TeamManager";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const user = (await getCurrentUser())!;
  return (
    <>
      <Topbar title="Team" crumb="Workspace" />
      <div className="content" style={{ maxWidth: 820 }}>
        <div className="page-head" style={{ marginBottom: 18 }}>
          <h2>Your team workspace</h2>
          <p>Invite colleagues so your whole recruiting team shares one view of candidates, alerts and analytics.</p>
        </div>
        <TeamManager selfId={user.id} />
      </div>
    </>
  );
}
