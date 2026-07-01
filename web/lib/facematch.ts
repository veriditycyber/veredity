// Biometric face match (selfie ↔ government ID) via a pluggable provider.
// Provider-agnostic contract so you can point it at AWS Rekognition, Azure Face,
// Face++/Luxand, or a small proxy of your own:
//   POST $FACEMATCH_API_URL  { "image1": <base64>, "image2": <base64> }
//   ->   { "score": 0-100 }  |  { "similarity": 0-1 }  |  { "confidence": 0-100 }
// Server-only. Degrades gracefully: returns null when unconfigured.
const URL_ = process.env.FACEMATCH_API_URL || "";
const KEY = process.env.FACEMATCH_API_KEY || "";

export function faceMatchConfigured(): boolean {
  return !!URL_;
}

export async function matchFaces(selfie: Buffer, idDoc: Buffer): Promise<number | null> {
  if (!URL_) return null;
  try {
    const r = await fetch(URL_, {
      method: "POST",
      headers: { "content-type": "application/json", ...(KEY ? { authorization: `Bearer ${KEY}` } : {}) },
      body: JSON.stringify({ image1: selfie.toString("base64"), image2: idDoc.toString("base64") }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    let score: number | null = null;
    if (typeof d.score === "number") score = d.score;
    else if (typeof d.similarity === "number") score = d.similarity * 100;
    else if (typeof d.confidence === "number") score = d.confidence;
    if (score == null) return null;
    return Math.max(0, Math.min(100, Math.round(score)));
  } catch {
    return null;
  }
}
