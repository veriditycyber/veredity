// Reality Defender integration. Kept framework-agnostic so it can move to a
// standalone service later without a rewrite.
import { RealityDefender } from "@realitydefender/realitydefender";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import type { Band, Sig, Verdict } from "./types";

export const API_KEY = process.env.RD_API_KEY || "";
export const MAX_MONTHLY_SCANS = Number(process.env.MAX_MONTHLY_SCANS || 45);

export function rdClient(): RealityDefender {
  return new RealityDefender({ apiKey: API_KEY });
}

// RD SDK needs a real file path with extension — write the upload to a temp file.
export async function saveTemp(file: File): Promise<string> {
  const ext = path.extname(file.name) || "";
  const p = path.join(os.tmpdir(), `truehire-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  await fs.writeFile(p, Buffer.from(await file.arrayBuffer()));
  return p;
}

export async function unlinkQuiet(p: string) {
  try { await fs.unlink(p); } catch {}
}

// Map a Reality Defender result -> the verdict the UI renders.
export function mapResult(rd: any, filename: string): Verdict {
  const score = Math.round((rd.score ?? 0) * 100);
  let band: Band = "green";
  if (score >= 70) band = "red";
  else if (score >= 40) band = "yellow";

  const titleMap: Record<Band, string> = {
    green: "Likely genuine",
    yellow: "Inconclusive — human review needed",
    red: "High risk — likely manipulated",
  };
  const recMap: Record<Band, string> = {
    green: "<b>Proceed.</b> Reality Defender found no elevated manipulation risk in this media.",
    yellow: "<b>Manual review advised.</b> The score is ambiguous — re-verify with a live, monitored check.",
    red: "<b>Escalate — do not advance.</b> Reality Defender flags likely manipulation. Require secondary identity verification.",
  };

  const signals: Sig[] = (rd.models || [])
    .filter((m: any) => m.score != null && m.status !== "ANALYZING")
    .map((m: any) => {
      const ms = Math.round(m.score * 100);
      let s: Sig["s"] = "ok";
      if (ms >= 70) s = "bad"; else if (ms >= 40) s = "warn";
      return { s, t: `${m.name}: ${m.status} (${ms}/100)` };
    });
  if (!signals.length) {
    signals.push({ s: band === "green" ? "ok" : band === "red" ? "bad" : "warn", t: `Reality Defender overall verdict: ${rd.status}` });
  }

  return {
    name: filename, role: "Uploaded file", kind: "Live Reality Defender analysis",
    band, score, title: titleMap[band], sub: `Reality Defender status: ${rd.status}`,
    signals, rec: recMap[band], engine: "realitydefender",
  } as Verdict & { engine: string };
}
