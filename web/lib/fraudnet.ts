// Fraud Intelligence Network — a privacy-safe, cross-account signal graph.
// We store ONLY SHA-256 hashes of identifiers (never raw email/phone), tagged with
// the outcome band and which account observed it. New checks look up whether the
// same identifier has been flagged by *other* organizations — network effects that
// get stronger with every check across all customers.
import crypto from "node:crypto";
import { prisma } from "./db";
import type { Signal } from "./trust";

function h(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function identifiers(email?: string, phone?: string): { kind: string; hash: string }[] {
  const out: { kind: string; hash: string }[] = [];
  if (email && email.includes("@")) {
    out.push({ kind: "email", hash: h(email) });
    const domain = email.split("@")[1];
    if (domain) out.push({ kind: "domain", hash: h(domain) });
  }
  if (phone && phone.replace(/\D/g, "").length >= 7) out.push({ kind: "phone", hash: h(phone.replace(/\D/g, "")) });
  return out;
}

// Look up prior risky flags on these identifiers from OTHER accounts → a Signal.
export async function networkLookup(email?: string, phone?: string, selfReporterId?: string): Promise<Signal | null> {
  const ids = identifiers(email, phone);
  if (ids.length === 0) return null;
  const hashes = ids.map((i) => i.hash);
  try {
    const rows = await prisma.fraudSignal.findMany({
      where: { hash: { in: hashes }, band: { in: ["red", "yellow"] }, ...(selfReporterId ? { reporterId: { not: selfReporterId } } : {}) },
      select: { reporterId: true },
    });
    const accounts = new Set(rows.map((r) => r.reporterId)).size;
    if (accounts <= 0) return { key: "network", label: "Network intelligence", status: "ok", weight: 25, detail: "No prior fraud flags on this identity across the TrueHire network." };
    const status = accounts >= 2 ? "risk" : "warn";
    return { key: "network", label: "Network intelligence", status, weight: 25, detail: `This email/phone was flagged as risky by ${accounts} other organization${accounts === 1 ? "" : "s"} on the TrueHire network.` };
  } catch {
    return null;
  }
}

// Record the outcome of a check so the network learns (hashes only).
export async function recordSignals(email: string | undefined, phone: string | undefined, band: string, reporterId: string): Promise<void> {
  const ids = identifiers(email, phone);
  if (ids.length === 0) return;
  try {
    await prisma.fraudSignal.createMany({ data: ids.map((i) => ({ kind: i.kind, hash: i.hash, band, reporterId })) });
  } catch {}
}

export async function networkSize(): Promise<number> {
  return prisma.fraudSignal.count().catch(() => 0);
}
