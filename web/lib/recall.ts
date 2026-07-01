// Recall.ai — meeting-bot-as-a-service. One API to send a bot into Zoom, Google
// Meet, or Microsoft Teams, capture real-time transcription, and get the recording.
// Server-only. Degrades gracefully: if RECALL_API_KEY is unset, the Interview Bot
// falls back to manual-transcript mode (paste a transcript, still get notes+report).
const KEY = process.env.RECALL_API_KEY || "";
// Recall is region-scoped; set RECALL_API_BASE to your workspace region base URL.
const BASE = (process.env.RECALL_API_BASE || "https://us-west-2.recall.ai/api/v1").replace(/\/$/, "");

export function recallConfigured(): boolean {
  return !!KEY;
}

async function recall(path: string, method: "GET" | "POST", body?: object) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { authorization: `Token ${KEY}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data?.detail || JSON.stringify(data).slice(0, 200)) || `Recall error ${r.status}`);
  return data;
}

// Detect the platform from a meeting URL (for display + validation).
export function detectPlatform(url: string): "zoom" | "meet" | "teams" | "manual" {
  const u = (url || "").toLowerCase();
  if (u.includes("zoom.")) return "zoom";
  if (u.includes("meet.google")) return "meet";
  if (u.includes("teams.microsoft") || u.includes("teams.live")) return "teams";
  return "manual";
}

// Send a bot into a live meeting. Real-time transcript is delivered to webhookUrl.
export async function createBot(meetingUrl: string, opts: { botName?: string; webhookUrl?: string }) {
  const body: any = {
    meeting_url: meetingUrl,
    bot_name: opts.botName || "TrueHire Notetaker",
    recording_config: {
      transcript: { provider: { meeting_captions: {} } },
    },
  };
  if (opts.webhookUrl) {
    body.recording_config.realtime_endpoints = [
      { type: "webhook", url: opts.webhookUrl, events: ["transcript.data", "transcript.partial_data"] },
    ];
  }
  return recall("/bot/", "POST", body) as Promise<{ id: string; status?: any }>;
}

export async function getBot(botId: string) {
  return recall(`/bot/${botId}/`, "GET");
}
export async function leaveBot(botId: string) {
  return recall(`/bot/${botId}/leave_call/`, "POST", {}).catch(() => null);
}
