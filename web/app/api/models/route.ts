import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { modelsWithAvailability } from "@/lib/ai";
import { DEFAULT_MODEL_ID } from "@/lib/models";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  const models = modelsWithAvailability();
  // Default to the user's saved preference if its provider is available, else the
  // first available model, else the global default.
  const pref = user?.aiModel && models.find((m) => m.id === user.aiModel && m.available);
  const firstAvailable = models.find((m) => m.available);
  const def = (pref && pref.id) || firstAvailable?.id || DEFAULT_MODEL_ID;
  return NextResponse.json({ models, default: def });
}
