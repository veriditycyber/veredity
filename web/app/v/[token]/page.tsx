import { prisma } from "@/lib/db";
import VerifyClient from "@/components/VerifyClient";
import { LogoMark } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await prisma.verificationLink.findUnique({ where: { token }, include: { user: true } });

  if (!link) {
    return (
      <div className="verify-wrap">
        <div className="verify-card" style={{ textAlign: "center" }}>
          <h2>Link not found</h2>
          <p className="muted">This verification link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const company = link.user.company || link.user.name || "A company";

  if (link.status === "done") {
    return (
      <div className="verify-wrap">
        <div className="verify-card" style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><LogoMark size={40} /></div>
          <h2>Already completed</h2>
          <p className="muted">This verification has already been submitted. Thank you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-wrap">
      <VerifyClient token={token} company={company} mode={link.mode} challengeCode={link.challengeCode} />
    </div>
  );
}
