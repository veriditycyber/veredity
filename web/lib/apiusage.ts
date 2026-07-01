// Durable monthly usage counter for the public API.
import { prisma } from "./db";
import { planOf } from "./plans";

const MONTHLY: Record<string, number> = { free: 100, pro: 5000, business: 50000 };
export function apiMonthlyLimit(plan: string | null | undefined): number {
  return MONTHLY[planOf(plan)];
}

export function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getApiUsage(userId: string): Promise<number> {
  const row = await prisma.apiUsage.findUnique({ where: { userId_period: { userId, period: currentPeriod() } } });
  return row?.count ?? 0;
}

export async function incrementApiUsage(userId: string): Promise<void> {
  const period = currentPeriod();
  await prisma.apiUsage.upsert({
    where: { userId_period: { userId, period } },
    update: { count: { increment: 1 } },
    create: { userId, period, count: 1 },
  });
}
