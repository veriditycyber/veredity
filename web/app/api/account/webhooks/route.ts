import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { newSecret, WEBHOOK_EVENTS } from "@/lib/webhooks";
import { isAdmin } from "@/lib/perms";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const hooks = await prisma.webhook.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { id: true, url: true, events: true, active: true, lastStatus: true, lastAt: true } });
  return NextResponse.json({ hooks, events: WEBHOOK_EVENTS });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "forbidden", message: "Only admins manage webhooks." }, { status: 403 });
  const { action, id, url, events } = await req.json().catch(() => ({}));

  if (action === "delete") {
    await prisma.webhook.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ ok: true });
  }

  // create
  const u = (url || "").toString().trim();
  if (!/^https?:\/\//i.test(u)) return NextResponse.json({ error: "bad_url", message: "Enter a valid https URL." }, { status: 400 });
  const count = await prisma.webhook.count({ where: { userId: user.id } });
  if (count >= 10) return NextResponse.json({ error: "limit", message: "Up to 10 webhooks." }, { status: 400 });
  const evs = Array.isArray(events) && events.length ? events.filter((e: string) => (WEBHOOK_EVENTS as readonly string[]).includes(e)).join(",") : "*";
  const secret = newSecret();
  const hook = await prisma.webhook.create({ data: { userId: user.id, url: u, events: evs || "*", secret } });
  return NextResponse.json({ id: hook.id, url: hook.url, events: hook.events, secret });
}
