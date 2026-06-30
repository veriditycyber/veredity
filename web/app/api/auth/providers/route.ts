import { NextResponse } from "next/server";
import { googleConfigured, appleConfigured } from "@/lib/oauth";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ google: googleConfigured(), apple: appleConfigured() });
}
