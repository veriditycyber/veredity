import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getModel } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { model } = await req.json().catch(() => ({}));
  if (model) {
    const m = getModel(model);
    await prisma.user.update({ where: { id: user.id }, data: { aiModel: m.id, aiProvider: m.provider } });
    return NextResponse.json({ ok: true, model: m.id });
  }
  return NextResponse.json({ ok: false, message: "Nothing to update." }, { status: 400 });
}
