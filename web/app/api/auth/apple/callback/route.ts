import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appleExchange, findOrCreateOAuthUser } from "@/lib/oauth";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const code = form.get("code")?.toString();
  const state = form.get("state")?.toString();
  const c = await cookies();
  const expected = c.get("oauth_state")?.value;

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(new URL("/login?error=oauth_state", req.url), 303);
  }
  const profile = await appleExchange(code);
  if (!profile) return NextResponse.redirect(new URL("/login?error=oauth_exchange", req.url), 303);

  // Apple sends the user's name only on the very first authorization, as a JSON blob.
  let name: string | undefined;
  try {
    const u = form.get("user")?.toString();
    if (u) { const j = JSON.parse(u); name = [j?.name?.firstName, j?.name?.lastName].filter(Boolean).join(" ") || undefined; }
  } catch {}

  const user = await findOrCreateOAuthUser("apple", { ...profile, name });
  await createSession(user.id);
  const res = NextResponse.redirect(new URL("/dashboard", req.url), 303);
  res.cookies.delete("oauth_state");
  return res;
}
