// Data retention + subject-rights tooling (GDPR/BIPA). Purge old candidate data,
// erase everything about one candidate, or export it for a data-subject request.
import { prisma } from "./db";
import { normName } from "./candidates";

// Delete a user's candidate data older than retentionDays. Returns counts.
export async function purgeExpired(userId: string, retentionDays: number): Promise<Record<string, number>> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const where = { userId, createdAt: { lt: cutoff } };
  const [checks, trust, interviews, bots, links, alerts] = await Promise.all([
    prisma.check.deleteMany({ where }),
    prisma.trustReport.deleteMany({ where }),
    prisma.interview.deleteMany({ where }),
    prisma.interviewSession.deleteMany({ where }),
    prisma.verificationLink.deleteMany({ where }),
    prisma.alert.deleteMany({ where }),
  ]);
  return { checks: checks.count, trust: trust.count, interviews: interviews.count, bots: bots.count, links: links.count, alerts: alerts.count };
}

// Erase every record about one candidate (by name) across the given accounts.
export async function eraseCandidate(userIds: string[], name: string): Promise<Record<string, number>> {
  const nameFilter = { equals: name, mode: "insensitive" as const };
  const uid = { in: userIds };
  const [checks, trust, interviews, bots, links, monitors] = await Promise.all([
    prisma.check.deleteMany({ where: { userId: uid, candidateName: nameFilter } }),
    prisma.trustReport.deleteMany({ where: { userId: uid, candidateName: nameFilter } }),
    prisma.interview.deleteMany({ where: { userId: uid, candidateName: nameFilter } }),
    prisma.interviewSession.deleteMany({ where: { userId: uid, candidateName: nameFilter } }),
    prisma.verificationLink.deleteMany({ where: { userId: uid, candidateName: nameFilter } }),
    prisma.monitor.deleteMany({ where: { userId: uid, subjectName: nameFilter } }),
  ]);
  return { checks: checks.count, trust: trust.count, interviews: interviews.count, bots: bots.count, links: links.count, monitors: monitors.count };
}

// Gather everything about a candidate for a data-subject export.
export async function exportCandidate(userIds: string[], name: string): Promise<any> {
  const nameFilter = { equals: name, mode: "insensitive" as const };
  const uid = { in: userIds };
  const [checks, trust, interviews, bots, links, monitors] = await Promise.all([
    prisma.check.findMany({ where: { userId: uid, candidateName: nameFilter } }),
    prisma.trustReport.findMany({ where: { userId: uid, candidateName: nameFilter } }),
    prisma.interview.findMany({ where: { userId: uid, candidateName: nameFilter } }),
    prisma.interviewSession.findMany({ where: { userId: uid, candidateName: nameFilter } }),
    prisma.verificationLink.findMany({ where: { userId: uid, candidateName: nameFilter } }),
    prisma.monitor.findMany({ where: { userId: uid, subjectName: nameFilter } }),
  ]);
  return { candidate: name, exportedAt: new Date().toISOString(), checks, trustReports: trust, interviews, botSessions: bots, verificationLinks: links, monitors };
}

export { normName };
