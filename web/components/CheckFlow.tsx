"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Band, Verdict } from "@/lib/types";
import VerdictCard from "./VerdictCard";
import { Person, Audio, Camera } from "./icons";

const STEPS = [
  "Uploading media securely…",
  "Running face-swap / morphing detection…",
  "Checking frame-to-frame consistency…",
  "Analyzing voice for synthetic-speech markers…",
  "Scoring liveness & compiling report…",
];

const SAMPLES: Record<string, Verdict & { audio?: boolean }> = {
  alex: {
    name: "Alex Morgan", role: "Senior Backend Engineer", kind: "Video interview · 12 min",
    band: "green", score: 8, title: "Likely genuine", sub: "No synthetic-media indicators detected.",
    signals: [
      { s: "ok", t: "Face: no face-swap or morphing artifacts detected" },
      { s: "ok", t: "Video: consistent frame-to-frame geometry & lighting" },
      { s: "ok", t: "Audio: natural speech, no synthetic-voice markers" },
      { s: "ok", t: "Liveness: passed (genuine live presence)" },
    ],
    rec: "<b>Proceed.</b> No elevated fraud risk. Continue your normal process.",
  },
  jordan: {
    name: "Jordan Lee", role: "Remote DevOps Engineer", kind: "Video interview · 8 min",
    band: "red", score: 87, title: "High risk — likely deepfake", sub: "Multiple face-swap indicators in the video stream.",
    signals: [
      { s: "bad", t: "Face: face-swap artifacts at jawline & eye region" },
      { s: "bad", t: "Video: frame-to-frame inconsistency (real-time face replacement)" },
      { s: "warn", t: "Lighting: facial lighting does not match background" },
      { s: "bad", t: "Liveness: anomalies suggesting injected/synthetic feed" },
    ],
    rec: "<b>Escalate — do not advance.</b> Strong indicators of real-time face replacement. Re-verify identity via a live, monitored secondary check.",
  },
  sam: {
    name: "Sam Rivera", role: "Full-Stack Developer", kind: "Video interview · 5 min",
    band: "yellow", score: 52, title: "Inconclusive — human review needed", sub: "Signal quality too low for a confident verdict.",
    signals: [
      { s: "warn", t: "Video: heavy compression / low resolution limits analysis" },
      { s: "warn", t: "Face: minor artifacts — could be codec or manipulation" },
      { s: "ok", t: "Audio: no synthetic-voice markers detected" },
      { s: "na", t: "Liveness: not conclusive on this recording" },
    ],
    rec: "<b>Manual review advised.</b> Not enough signal to clear or flag. Ask for a brief live re-verification on a stable connection.",
  },
  casey: {
    name: "Casey Kim", role: "Support Engineer", kind: "Phone screen · audio only", audio: true,
    band: "red", score: 79, title: "High risk — synthetic voice", sub: "Audio shows AI voice-generation markers.",
    signals: [
      { s: "bad", t: "Audio: synthetic text-to-speech signature detected" },
      { s: "bad", t: "Prosody: unnatural rhythm & intonation patterns" },
      { s: "warn", t: "Spectral: artifacts consistent with voice cloning" },
      { s: "na", t: "Video / Liveness: not available (audio-only screen)" },
    ],
    rec: "<b>Escalate.</b> Voice likely AI-generated or cloned. Require a video identity check before proceeding.",
  },
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const notice = (band: Band, title: string, msg: string): Verdict => ({
  name: "", role: "", kind: "", band, score: "", title, sub: "",
  signals: [{ s: band === "red" ? "bad" : "warn", t: msg }], rec: "",
});

export default function CheckFlow({ initialScansLeft }: { initialScansLeft: number }) {
  const [stage, setStage] = useState<"input" | "analyzing" | "result">("input");
  const [selected, setSelected] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileLabel, setFileLabel] = useState("");
  const [candidate, setCandidate] = useState("");
  const [consent, setConsent] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [step, setStep] = useState(STEPS[0]);
  const [drag, setDrag] = useState(false);
  const [live, setLive] = useState(false);
  const [scansLeft, setScansLeft] = useState<number>(initialScansLeft);
  const [cam, setCam] = useState(false);
  const [camErr, setCamErr] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function stopCam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCam(false);
  }
  async function openCam() {
    setCamErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      setCam(true);
      setSelected(null);
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); } }, 50);
    } catch {
      setCamErr("Camera access denied or unavailable. Allow camera permission and try again.");
    }
  }
  function capture() {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
    c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((blob) => {
      if (!blob) return;
      const f = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      setFile(f); setFileLabel("Camera capture"); setSelected(null);
      stopCam();
    }, "image/jpeg", 0.92);
  }
  useEffect(() => () => stopCam(), []);

  useEffect(() => {
    (async () => {
      try {
        const s = await (await fetch("/api/status")).json();
        setLive(!!s.configured);
        if (typeof s.scansLeft === "number") setScansLeft(s.scansLeft);
      } catch {}
    })();
  }, []);

  const canRun = (!!selected || !!file) && consent;

  async function pollResult(requestId: string, checkId: string, filename: string, cand: string): Promise<Verdict> {
    const qs = `id=${encodeURIComponent(requestId)}&checkId=${encodeURIComponent(checkId)}&filename=${encodeURIComponent(filename)}&candidate=${encodeURIComponent(cand)}`;
    let last: Verdict | null = null;
    for (let i = 0; i < 15; i++) {
      const r = await fetch(`/api/result?${qs}`);
      if (!r.ok) break;
      const d = await r.json();
      last = d.verdict;
      if (typeof d.verdict?.scansLeft === "number") setScansLeft(d.verdict.scansLeft);
      if (d.settled) return d.verdict;
      await wait(3000);
    }
    return last || notice("yellow", "Still analyzing", "Detection is taking longer than usual — check History in a moment.");
  }

  async function analyzeUpload(f: File): Promise<Verdict> {
    try {
      const fd = new FormData();
      fd.append("file", f);
      if (candidate.trim()) fd.append("candidateName", candidate.trim());
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      if (r.status === 401) return notice("yellow", "Session expired", "Please sign in again.");
      if (r.status === 429) { const e = await r.json().catch(() => ({})); setScansLeft(0); return notice("yellow", "Monthly scan limit reached", e.message || "Quota reached. Resets next month."); }
      if (r.status === 503) return notice("yellow", "Detection not configured", "No detection key set on the server.");
      if (!r.ok) { const e = await r.json().catch(() => ({})); return notice("red", "Upload failed", e.message || "Could not analyze this file."); }
      const { requestId, checkId, filename, candidateName } = await r.json();
      return await pollResult(requestId, checkId, filename, candidateName || "");
    } catch {
      return notice("red", "Network error", "Could not reach the detection service.");
    }
  }

  async function run() {
    setStage("analyzing");
    let i = 0; setStep(STEPS[0]);
    timer.current = setInterval(() => { i = (i + 1) % STEPS.length; setStep(STEPS[i]); }, 750);

    let result: Verdict;
    if (selected) { setIsSample(true); await wait(2600); result = SAMPLES[selected]; }
    else if (file) { setIsSample(false); result = await analyzeUpload(file); }
    else { result = notice("yellow", "Nothing to analyze", "Pick a sample or upload a file."); }

    if (timer.current) clearInterval(timer.current);
    setVerdict(result);
    setStage("result");
  }

  function reset() {
    setStage("input"); setVerdict(null); setSelected(null); setFile(null);
    setFileLabel(""); setCandidate(""); setConsent(false); setIsSample(false);
  }

  if (stage === "analyzing") {
    return (
      <div className="card analyzing">
        <div className="spinner" />
        <div className="steps">{step}</div>
        <div className="scan-track"><i /></div>
      </div>
    );
  }

  if (stage === "result" && verdict) {
    return (
      <div className="card">
        <VerdictCard
          verdict={verdict}
          metaLeft={verdict.role ? `${verdict.name} · ${verdict.role}` : verdict.name || undefined}
          metaRight="Human review required"
        />
        <div className="result-actions noprint">
          {!isSample && verdict.checkId
            ? <button className="btn btn-primary" onClick={() => window.print()}>Download report (PDF)</button>
            : null}
          <button className="btn btn-ghost" onClick={reset}>Check another</button>
          {!isSample && <Link className="btn btn-ghost" href="/history">View in history →</Link>}
        </div>
        {isSample && <p className="hint" style={{ marginTop: 14 }}>This is a sample candidate (illustrative, not saved). Upload a real file to run live detection and save it to your history.</p>}
      </div>
    );
  }

  return (
    <div className="card">
      <p className="section-title">Try a sample candidate</p>
      <div className="grid">
        {Object.entries(SAMPLES).map(([key, s]) => (
          <button key={key} className={`sample${selected === key ? " active" : ""}`}
            onClick={() => { setSelected(key); setFile(null); setFileLabel(""); }}>
            <span className="avatar">{s.audio ? <Audio /> : <Person />}</span>
            <span>
              <span className="nm">{s.name}</span><br />
              <span className="role">{s.role}</span><br />
              <span className="kind">{s.kind}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="section-title" style={{ marginTop: 22 }}>…or check a real candidate</p>
      <div className={`drop${drag ? " drag" : ""}`}
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setSelected(null); setFileLabel(f.name); } }}>
        {fileLabel
          ? <>Selected: <span className="fn">{fileLabel}</span> — ready to analyze</>
          : <>Drop an image or audio file here {live ? <>for <b>live Reality Defender analysis</b></> : "for analysis"}, or click to browse</>}
        <input ref={fileInput} type="file" accept="image/*,video/*,audio/*" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setSelected(null); setFileLabel(f.name); } }} />
      </div>

      {!cam ? (
        <button className="btn btn-ghost cam-btn" type="button" onClick={openCam}><Camera /> Capture live from camera</button>
      ) : (
        <div className="cam-panel">
          <video ref={videoRef} playsInline muted className="cam-video" />
          <div className="cam-actions">
            <button className="btn btn-primary" type="button" onClick={capture}>Capture frame</button>
            <button className="btn btn-ghost" type="button" onClick={stopCam}>Cancel</button>
          </div>
        </div>
      )}
      {camErr && <p className="err" style={{ marginTop: 8 }}>{camErr}</p>}

      <input className="cand" type="text" value={candidate} placeholder="Candidate name (optional — appears on the report)"
        onChange={(e) => setCandidate(e.target.value)} />

      <div className="consent">
        <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <label htmlFor="consent">I confirm the candidate has been informed and has consented to automated identity &amp; media verification.{" "}
          <span className="hint">(Required — biometric checks need consent. Keeps you compliant with laws like Illinois BIPA.)</span></label>
      </div>

      <div className="actions">
        <button className="btn btn-primary" disabled={!canRun} onClick={run}>Analyze candidate</button>
        <span className="hint">{!selected && !file ? "Select a sample or upload a file, then confirm consent." : !consent ? "Confirm consent to continue." : "Ready."}</span>
        <span className="hint" style={{ marginLeft: "auto" }}>{scansLeft} scans left this month</span>
      </div>
    </div>
  );
}
