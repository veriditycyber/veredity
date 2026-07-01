// Unified candidate view — aggregates every signal about a person across checks,
// trust reports, interviews, bot sessions, verification links, and monitors.
// Grouped by normalized name (the common field across all record types).
import { prisma } from "./db";

export function normName(s?: string | null): string {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}
export function candKey(name: string): string {
  return encodeURIComponent(normName(name));
}

const BAND_RANK: Record<string, number> = { red: 3, yellow: 2, green: 1 };
function worse(a?: string | null, b?: string | null): string | null {
  if (!a) return b || null; if (!b) return a;
  return (BAND_RANK[a] || 0) >= (BAND_RANK[b] || 0) ? a : b;
}

export type CandidateSummary = {
  key: string; name: string; email?: string | null; phone?: string | null;
  worstBand: string | null; records: number; lastActivity: Date; types: string[];
};

export async function listCandidates(userId: string, query?: string): Promise<CandidateSummary[]> {
  const [checks, trust, interviews, bots, links, monitors] = await Promise.all([
    prisma.check.findMany({ where: { userId }, select: { candidateName: true, band: true, createdAt: true }, take: 1000 }),
    prisma.trustReport.findMany({ where: { userId }, select: { candidateName: true, email: true, phone: true, band: true, createdAt: true }, take: 1000 }),
    prisma.interview.findMany({ where: { userId }, select: { candidateName: true, createdAt: true }, take: 1000 }),
    prisma.interviewSession.findMany({ where: { userId }, select: { candidateName: true, createdAt: true }, take: 1000 }),
    prisma.verificationLink.findMany({ where: { userId }, select: { candidateName: true, createdAt: true }, take: 1000 }),
    prisma.monitor.findMany({ where: { userId }, select: { subjectName: true, email: true, phone: true, lastBand: true, createdAt: true }, take: 1000 }),
  ]);

  const map = new Map<string, CandidateSummary>();
  const add = (name: string | null | undefined, date: Date, type: string, opts: { band?: string | null; email?: string | null; phone?: string | null } = {}) => {
    const key = normName(name);
    if (!key) return;
    let c = map.get(key);
    if (!c) { c = { key: candKey(name!), name: name!.trim(), worstBand: null, records: 0, lastActivity: date, types: [] }; map.set(key, c); }
    c.records++;
    c.worstBand = worse(c.worstBand, opts.band);
    if (opts.email && !c.email) c.email = opts.email;
    if (opts.phone && !c.phone) c.phone = opts.phone;
    if (date > c.lastActivity) c.lastActivity = date;
    if (!c.types.includes(type)) c.types.push(type);
  };

  checks.forEach((r) => add(r.candidateName, r.createdAt, "check", { band: r.band }));
  trust.forEach((r) => add(r.candidateName, r.createdAt, "trust", { band: r.band, email: r.email, phone: r.phone }));
  interviews.forEach((r) => add(r.candidateName, r.createdAt, "interview"));
  bots.forEach((r) => add(r.candidateName, r.createdAt, "interview"));
  links.forEach((r) => add(r.candidateName, r.createdAt, "link"));
  monitors.forEach((r) => add(r.subjectName, r.createdAt, "monitor", { band: r.lastBand, email: r.email, phone: r.phone }));

  let out = Array.from(map.values());
  const q = normName(query);
  if (q) out = out.filter((c) => normName(c.name).includes(q) || (c.email || "").toLowerCase().includes(q));
  return out.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
}

export async function getCandidate(userId: string, name: string) {
  const n = normName(name);
  const all = await listCandidates(userId);
  const summary = all.find((c) => normName(c.name) === n);
  if (!summary) return null;

  // Fetch full records for this name (case-insensitive).
  const nameFilter = { equals: summary.name, mode: "insensitive" as const };
  const [checks, trust, interviews, bots, links, monitors] = await Promise.all([
    prisma.check.findMany({ where: { userId, candidateName: nameFilter }, orderBy: { createdAt: "desc" } }),
    prisma.trustReport.findMany({ where: { userId, candidateName: nameFilter }, orderBy: { createdAt: "desc" } }),
    prisma.interview.findMany({ where: { userId, candidateName: nameFilter }, orderBy: { createdAt: "desc" } }),
    prisma.interviewSession.findMany({ where: { userId, candidateName: nameFilter }, orderBy: { createdAt: "desc" } }),
    prisma.verificationLink.findMany({ where: { userId, candidateName: nameFilter }, orderBy: { createdAt: "desc" } }),
    prisma.monitor.findMany({ where: { userId, subjectName: nameFilter }, orderBy: { createdAt: "desc" } }),
  ]);
  return { summary, checks, trust, interviews, bots, links, monitors };
}
