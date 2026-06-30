import { NextResponse } from "next/server";
import { googleConfigured, googleAuthUrl, randomState } from "@/lib/oauth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!googleConfigured()) return NextResponse.redirect(new URL("/login?error=oauth_unconfigured", req.url));
  const state = randomState();
  const res = NextResponse.redirect(googleAuthUrl(state));
  res.cookies.set("oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
