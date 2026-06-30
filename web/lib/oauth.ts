// Google + Apple "Sign in with" on top of Veridity's own session system.
// No external auth library — standard OAuth 2.0 / OIDC authorization-code flow.
// The id_token comes straight from each provider's token endpoint over TLS, so we
// trust its payload without separate JWKS verification (standard for confidential
// server-side code exchange).
import crypto from "node:crypto";
import { prisma } from "./db";
import { appUrl } from "./email";

export function googleConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
export function appleConfigured(): boolean {
  return !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY);
}

export function randomState(): string {
  return crypto.randomBytes(16).toString("hex");
}

function decodeJwtPayload<T = any>(jwt: string): T | null {
  try {
    const part = jwt.split(".")[1];
    const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    return JSON.parse(json);
  } catch { return null; }
}

// ---------- Google ----------
export function googleAuthUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${appUrl()}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

export async function googleExchange(code: string): Promise<{ sub: string; email?: string; name?: string; image?: string } | null> {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${appUrl()}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  const claims = decodeJwtPayload(d.id_token || "");
  if (!claims?.sub) return null;
  return { sub: claims.sub, email: claims.email, name: claims.name, image: claims.picture };
}

// ---------- Apple ----------
// Apple needs a short-lived client secret: an ES256 JWT signed with your .p8 key.
function appleClientSecret(): string {
  const header = { alg: "ES256", kid: process.env.APPLE_KEY_ID! };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: process.env.APPLE_TEAM_ID!,
    iat: now,
    exp: now + 60 * 60 * 24 * 180, // up to 6 months
    aud: "https://appleid.apple.com",
    sub: process.env.APPLE_CLIENT_ID!,
  };
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const signingInput = `${b64(header)}.${b64(payload)}`;
  const keyPem = (process.env.APPLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const sig = crypto.sign("SHA256", Buffer.from(signingInput), { key: keyPem, dsaEncoding: "ieee-p1363" });
  return `${signingInput}.${sig.toString("base64url")}`;
}

export function appleAuthUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    redirect_uri: `${appUrl()}/api/auth/apple/callback`,
    response_type: "code",
    scope: "name email",
    response_mode: "form_post",
    state,
  });
  return `https://appleid.apple.com/auth/authorize?${p}`;
}

export async function appleExchange(code: string): Promise<{ sub: string; email?: string } | null> {
  const r = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.APPLE_CLIENT_ID!,
      client_secret: appleClientSecret(),
      redirect_uri: `${appUrl()}/api/auth/apple/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  const claims = decodeJwtPayload(d.id_token || "");
  if (!claims?.sub) return null;
  return { sub: claims.sub, email: claims.email };
}

// ---------- link / create ----------
export async function findOrCreateOAuthUser(
  provider: "google" | "apple",
  profile: { sub: string; email?: string; name?: string; image?: string },
) {
  const idField = provider === "google" ? "googleId" : "appleId";

  // 1) existing link
  const byId = await prisma.user.findFirst({ where: { [idField]: profile.sub } as any });
  if (byId) return byId;

  // 2) link to an existing account by email
  if (profile.email) {
    const byEmail = await prisma.user.findUnique({ where: { email: profile.email.toLowerCase() } });
    if (byEmail) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { [idField]: profile.sub, image: byEmail.image || profile.image || null, emailVerified: byEmail.emailVerified || new Date() } as any,
      });
    }
  }

  // 3) brand new account (OAuth emails are pre-verified)
  return prisma.user.create({
    data: {
      email: (profile.email || `${profile.sub}@${provider}.veridity`).toLowerCase(),
      name: profile.name || null,
      image: profile.image || null,
      emailVerified: new Date(),
      [idField]: profile.sub,
    } as any,
  });
}
