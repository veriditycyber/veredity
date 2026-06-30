import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { googleExchange, findOrCreateOAuthUser } from "@/lib/oauth";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const c = await cookies();
  const expected = c.get("oauth_state")?.value;

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(new URL("/login?error=oauth_state", req.url));
  }
  const profile = await googleExchange(code);
  if (!profile) return NextResponse.redirect(new URL("/login?error=oauth_exchange", req.url));

  const user = await findOrCreateOAuthUser("google", profile);
  await createSession(user.id);
  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.delete("oauth_state");
  return res;
}
