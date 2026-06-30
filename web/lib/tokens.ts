import crypto from "node:crypto";
import { prisma } from "./db";

export type TokenType = "verify_email" | "reset_password";

const TTL_MS: Record<TokenType, number> = {
  verify_email: 24 * 60 * 60 * 1000, // 24h
  reset_password: 60 * 60 * 1000,    // 1h
};

// Issue a fresh token, replacing any outstanding ones of the same type.
export async function issueToken(userId: string, type: TokenType): Promise<string> {
  await prisma.verificationToken.deleteMany({ where: { userId, type } });
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({ data: { token, userId, type, expiresAt: new Date(Date.now() + TTL_MS[type]) } });
  return token;
}

// Validate + consume a token. Returns the userId if valid, else null.
export async function consumeToken(token: string, type: TokenType): Promise<string | null> {
  if (!token) return null;
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (!row || row.type !== type) return null;
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
  if (row.expiresAt < new Date()) return null;
  return row.userId;
}
