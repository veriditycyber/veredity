// Slack incoming-webhook notifications for high-risk alerts. Best-effort.
export async function postSlack(webhookUrl: string, text: string): Promise<boolean> {
  if (!/^https:\/\/hooks\.slack\.com\//.test(webhookUrl)) return false;
  try {
    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(6000),
    });
    return r.ok;
  } catch {
    return false;
  }
}
