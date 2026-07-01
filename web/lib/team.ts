// Team workspace helpers. Org members share the rollup surfaces (Candidates,
// Alerts, Dashboard, Insights); each member's own work is still attributed to them.
import { prisma } from "./db";

// The set of user ids whose data the given user can see.
export async function teamUserIds(user: { id: string; orgId?: string | null }): Promise<string[]> {
  if (!user.orgId) return [user.id];
  const members = await prisma.user.findMany({ where: { orgId: user.orgId }, select: { id: true } });
  const ids = members.map((m) => m.id);
  return ids.length ? ids : [user.id];
}

export function isOrgOwner(user: { orgRole?: string | null }): boolean {
  return user.orgRole === "owner";
}
