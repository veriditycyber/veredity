import { prisma } from "./db";

// Count checks created this calendar month (global) — protects the shared
// Reality Defender free-tier quota.
export async function monthlyCheckCount(): Promise<number> {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return prisma.check.count({ where: { createdAt: { gte: start } } });
}
