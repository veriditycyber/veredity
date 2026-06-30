import { NextResponse } from "next/server";
import { appleConfigured, appleAuthUrl, randomState } from "@/lib/oauth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!appleConfigured()) return NextResponse.redirect(new URL("/login?error=oauth_unconfigured", req.url));
  const state = randomState();
  const res = NextResponse.redirect(appleAuthUrl(state));
  // Apple posts the callback cross-site (form_post), so the state cookie must be
  // SameSite=None; Secure to survive the round trip.
  res.cookies.set("oauth_state", state, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 600 });
  return res;
}
