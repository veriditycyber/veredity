// Developer API keys for the public Trust API. We store only a SHA-256 hash of the
// key; the plaintext is shown to the user exactly once at creation.
import crypto from "node:crypto";
import { prisma } from "./db";

export function hashKey(plaintext: string): string {
  return crypto.createHash("sha256").update(plaintext).digest("hex");
}

export function generateApiKey(): { plaintext: string; prefix: string; keyHash: string } {
  const plaintext = "thk_live_" + crypto.randomBytes(24).toString("hex");
  return { plaintext, prefix: plaintext.slice(0, 16), keyHash: hashKey(plaintext) };
}

// Authenticate an incoming API request via the Authorization: Bearer header.
export async function authenticateApiKey(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const m = /^Bearer\s+(thk_live_[a-f0-9]+)$/i.exec(auth.trim());
  if (!m) return null;
  const key = await prisma.apiKey.findUnique({ where: { keyHash: hashKey(m[1]) }, include: { user: true } });
  if (!key || key.revokedAt) return null;
  // Best-effort last-used stamp (don't block the request on it).
  prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
  return key.user;
}
