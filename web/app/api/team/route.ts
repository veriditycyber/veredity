import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail, appUrl, emailConfigured } from "@/lib/email";
import { isAdmin, isOwner } from "@/lib/perms";

export const runtime = "nodejs";

async function ensureOrg(user: { id: string; orgId?: string | null; company?: string | null; name?: string | null }): Promise<string> {
  if (user.orgId) return user.orgId;
  const org = await prisma.organization.create({ data: { name: user.company || user.name || "My team", ownerId: user.id } });
  await prisma.user.update({ where: { id: user.id }, data: { orgId: org.id, orgRole: "owner" } });
  return org.id;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!user.orgId) return NextResponse.json({ org: null, members: [], invites: [], isOwner: false });
  const [members, invites, org] = await Promise.all([
    prisma.user.findMany({ where: { orgId: user.orgId }, select: { id: true, name: true, email: true, orgRole: true } }),
    prisma.invite.findMany({ where: { orgId: user.orgId, status: "pending" }, select: { id: true, email: true, createdAt: true } }),
    prisma.organization.findUnique({ where: { id: user.orgId }, select: { name: true, ownerId: true } }),
  ]);
  return NextResponse.json({ org, members, invites, isOwner: org?.ownerId === user.id });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { action, email, id, token, role } = await req.json().catch(() => ({}));

  // Accepting an invite is allowed for anyone with the token; everything else that
  // mutates the workspace requires admin.
  if (action !== "accept" && user.orgId && !isAdmin(user)) {
    return NextResponse.json({ error: "forbidden", message: "Only workspace admins can do that." }, { status: 403 });
  }

  if (action === "invite") {
    const e = (email || "").toString().trim().toLowerCase();
    if (!e.includes("@")) return NextResponse.json({ error: "bad_email", message: "Enter a valid email." }, { status: 400 });
    const orgId = await ensureOrg(user);
    const tok = crypto.randomBytes(16).toString("hex");
    await prisma.invite.create({ data: { orgId, email: e, token: tok } });
    const url = `${appUrl()}/team/join?token=${tok}`;
    if (emailConfigured()) {
      await sendEmail(e, "You've been invited to a TrueHire team", `<div style="font-family:sans-serif"><h2>Join the team on TrueHire</h2><p>${user.name || user.email} invited you to their workspace.</p><a href="${url}" style="display:inline-block;margin-top:10px;background:#111;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Accept invite</a><p style="font-size:12px;color:#666;margin-top:14px">Or paste: ${url}</p></div>`).catch(() => {});
    }
    return NextResponse.json({ ok: true, url });
  }

  if (action === "accept") {
    const inv = await prisma.invite.findUnique({ where: { token: (token || "").toString() } });
    if (!inv || inv.status !== "pending") return NextResponse.json({ ok: false, message: "This invite is invalid or already used." }, { status: 400 });
    await prisma.user.update({ where: { id: user.id }, data: { orgId: inv.orgId, orgRole: user.id === (await prisma.organization.findUnique({ where: { id: inv.orgId }, select: { ownerId: true } }))?.ownerId ? "owner" : "member" } });
    await prisma.invite.update({ where: { id: inv.id }, data: { status: "accepted" } });
    return NextResponse.json({ ok: true });
  }

  if (action === "revoke_invite") {
    if (user.orgId) await prisma.invite.deleteMany({ where: { id, orgId: user.orgId } });
    return NextResponse.json({ ok: true });
  }

  if (action === "set_role") {
    if (!isOwner(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    if (id === user.id) return NextResponse.json({ error: "cant_change_self" }, { status: 400 });
    const target = user.orgId ? await prisma.user.findFirst({ where: { id, orgId: user.orgId }, select: { orgRole: true } }) : null;
    if (!target || target.orgRole === "owner") return NextResponse.json({ error: "bad_target" }, { status: 400 });
    await prisma.user.updateMany({ where: { id, orgId: user.orgId }, data: { orgRole: role === "admin" ? "admin" : "member" } });
    return NextResponse.json({ ok: true });
  }

  if (action === "remove_member") {
    const org = user.orgId ? await prisma.organization.findUnique({ where: { id: user.orgId }, select: { ownerId: true } }) : null;
    if (!org || org.ownerId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    if (id === user.id) return NextResponse.json({ error: "cant_remove_owner" }, { status: 400 });
    await prisma.user.updateMany({ where: { id, orgId: user.orgId }, data: { orgId: null, orgRole: null } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "bad_action" }, { status: 400 });
}
