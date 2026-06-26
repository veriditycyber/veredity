"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Check, Lock, Shield } from "./icons";
import { LogoMark } from "./Logo";

export default function VerifyClient({ token, company }: { token: string; company: string }) {
  const [stage, setStage] = useState<"intro" | "submitting" | "done" | "error">("intro");
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [err, setErr] = useState("");
  const [cam, setCam] = useState(false);
  const [camErr, setCamErr] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function stopCam() { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setCam(false); }
  async function openCam() {
    setCamErr("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = s; setCam(true);
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}); } }, 50);
    } catch { setCamErr("Camera unavailable. Allow camera access, or upload a photo instead."); }
  }
  function capture() {
    const v = videoRef.current; if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
    c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((b) => { if (!b) return; setFile(new File([b], "selfie.jpg", { type: "image/jpeg" })); setLabel("Camera capture"); stopCam(); }, "image/jpeg", 0.92);
  }
  useEffect(() => () => stopCam(), []);

  async function submit() {
    if (!file) return;
    setStage("submitting"); setErr("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch(`/api/v/${token}/submit`, { method: "POST", body: fd });
      if (r.ok) setStage("done");
      else { const d = await r.json().catch(() => ({})); setErr(d.message || "Something went wrong. Please try again."); setStage("error"); }
    } catch { setErr("Network error. Please try again."); setStage("error"); }
  }

  if (stage === "done") {
    return (
      <div className="verify-card" style={{ textAlign: "center" }}>
        <div className="v-checkmark"><Check /></div>
        <h2>Verification submitted</h2>
        <p className="muted">Thanks — your identity check has been sent to {company}. You can close this page.</p>
      </div>
    );
  }

  return (
    <div className="verify-card">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><LogoMark size={30} /> <b>Veridity</b></div>
      <h2 style={{ marginTop: 8 }}>Identity verification</h2>
      <p className="muted"><b style={{ color: "var(--text)" }}>{company}</b> has asked you to confirm your identity for a role. It takes about 20 seconds.</p>

      {stage === "submitting" ? (
        <div className="analyzing" style={{ padding: "30px 0" }}>
          <div className="spinner" />
          <div className="steps">Verifying your identity…</div>
        </div>
      ) : (
        <>
          {!cam ? (
            <div className="v-actions">
              <button className="btn btn-primary" type="button" onClick={openCam}><Camera /> Use camera</button>
              <button className="btn" type="button" onClick={() => fileInput.current?.click()}><Upload /> Upload a photo</button>
              <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setLabel(f.name); } }} />
            </div>
          ) : (
            <div className="cam-panel">
              <video ref={videoRef} playsInline muted className="cam-video" />
              <div className="cam-actions">
                <button className="btn btn-primary" type="button" onClick={capture}>Capture</button>
                <button className="btn btn-ghost" type="button" onClick={stopCam}>Cancel</button>
              </div>
            </div>
          )}
          {label && <p className="hint" style={{ marginTop: 10 }}>Ready: <b style={{ color: "var(--text)" }}>{label}</b></p>}
          {camErr && <p className="err" style={{ marginTop: 8 }}>{camErr}</p>}

          <div className="consent" style={{ marginTop: 16 }}>
            <input type="checkbox" id="vc" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <label htmlFor="vc">I consent to automated identity & media verification of the image I submit.</label>
          </div>
          {stage === "error" && <p className="err" style={{ marginBottom: 10 }}>{err}</p>}
          <button className="btn btn-primary btn-block" disabled={!file || !consent} onClick={submit}>Submit verification</button>
        </>
      )}

      <div className="trust-row" style={{ marginTop: 22 }}>
        <span><Lock /> Encrypted</span>
        <span><Shield /> Your photo isn&apos;t stored</span>
      </div>
    </div>
  );
}
