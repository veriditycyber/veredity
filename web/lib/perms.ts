// Team roles. Solo users (no org) are always their own admin. Inside an org,
// owner + admin can manage the workspace (team, billing, keys, data); members do
// normal work but can't touch those administrative controls.
export type Role = "owner" | "admin" | "member";

export function isAdmin(user: { orgId?: string | null; orgRole?: string | null }): boolean {
  return !user.orgId || user.orgRole === "owner" || user.orgRole === "admin";
}

export function isOwner(user: { orgId?: string | null; orgRole?: string | null }): boolean {
  return !user.orgId || user.orgRole === "owner";
}
