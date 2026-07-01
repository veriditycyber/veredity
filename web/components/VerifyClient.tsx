"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Check, Lock, Shield } from "./icons";
import { LogoMark } from "./Logo";

export default function VerifyClient({ token, company, mode = "basic", challengeCode }: { token: string; company: string; mode?: string; challengeCode?: string | null }) {
  const isId = mode === "id";
  const [stage, setStage] = useState<"intro" | "submitting" | "done" | "error">("intro");
  const [consent, setConsent] = useState(false);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [err, setErr] = useState("");
  const [cam, setCam] = useState<"selfie" | "id" | null>(null);
  const [camErr, setCamErr] = useState("");

  const idInput = useRef<HTMLInputElement>(null);
  const selfieInput = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function stopCam() { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setCam(null); }
  async function openCam(target: "selfie" | "id") {
    setCamErr("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: target === "id" ? "environment" : "user" }, audio: false });
      streamRef.current = s; setCam(target);
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}); } }, 50);
    } catch { setCamErr("Camera unavailable. Allow camera access, or upload a photo instead."); }
  }
  function capture() {
    const v = videoRef.current; if (!v) return;
    const target = cam;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
    c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((b) => {
      if (!b) return;
      const f = new File([b], `${target}.jpg`, { type: "image/jpeg" });
      if (target === "id") setIdFile(f); else setSelfie(f);
      stopCam();
    }, "image/jpeg", 0.92);
  }
  useEffect(() => () => stopCam(), []);

  async function submit() {
    if (!selfie) return;
    setStage("submitting"); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", selfie);
      if (isId) { if (idFile) fd.append("id", idFile); fd.append("liveness", "1"); }
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

  const canSubmit = !!selfie && consent && (!isId || !!idFile);

  return (
    <div className="verify-card">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><LogoMark size={30} /> <b>Veridity</b></div>
      <h2 style={{ marginTop: 8 }}>Identity verification</h2>
      <p className="muted"><b style={{ color: "var(--text)" }}>{company}</b> has asked you to confirm your identity for a role. It takes about {isId ? "a minute" : "20 seconds"}.</p>

      {stage === "submitting" ? (
        <div className="analyzing" style={{ padding: "30px 0" }}>
          <div className="spinner" />
          <div className="steps">Verifying your identity…</div>
        </div>
      ) : cam ? (
        <div className="cam-panel">
          {cam === "selfie" && isId && challengeCode && (
            <div className="liveness-prompt">Hold up <b>{challengeCode}</b> on your fingers or a note, and look at the camera.</div>
          )}
          <video ref={videoRef} playsInline muted className="cam-video" />
          <div className="cam-actions">
            <button className="btn btn-primary" type="button" onClick={capture}>Capture</button>
            <button className="btn btn-ghost" type="button" onClick={stopCam}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {/* Step 1 — live selfie */}
          <div className="v-step">
            <div className="v-step-h"><span className={`v-step-n ${selfie ? "done" : ""}`}>{selfie ? <Check /> : "1"}</span> {isId ? "Live selfie" : "Your photo"}</div>
            {isId && challengeCode && !selfie && <p className="hint" style={{ margin: "0 0 8px" }}>Liveness check — you&apos;ll be asked to show the code <b>{challengeCode}</b>.</p>}
            {selfie ? (
              <p className="hint">✓ Selfie captured.{" "}<button className="linklike" onClick={() => setSelfie(null)}>Retake</button></p>
            ) : (
              <div className="v-actions">
                <button className="btn btn-primary" type="button" onClick={() => openCam("selfie")}><Camera /> Use camera</button>
                {!isId && <>
                  <button className="btn" type="button" onClick={() => selfieInput.current?.click()}><Upload /> Upload a photo</button>
                  <input ref={selfieInput} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelfie(f); }} />
                </>}
              </div>
            )}
          </div>

          {/* Step 2 — government ID (id mode only) */}
          {isId && (
            <div className="v-step">
              <div className="v-step-h"><span className={`v-step-n ${idFile ? "done" : ""}`}>{idFile ? <Check /> : "2"}</span> Government ID</div>
              {idFile ? (
                <p className="hint">✓ ID captured.{" "}<button className="linklike" onClick={() => setIdFile(null)}>Retake</button></p>
              ) : (
                <div className="v-actions">
                  <button className="btn btn-primary" type="button" onClick={() => openCam("id")}><Camera /> Scan ID</button>
                  <button className="btn" type="button" onClick={() => idInput.current?.click()}><Upload /> Upload ID</button>
                  <input ref={idInput} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setIdFile(f); }} />
                </div>
              )}
            </div>
          )}

          {camErr && <p className="err" style={{ marginTop: 8 }}>{camErr}</p>}

          <div className="consent" style={{ marginTop: 16 }}>
            <input type="checkbox" id="vc" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <label htmlFor="vc">I consent to automated identity{isId ? ", document" : ""} & media verification of what I submit.</label>
          </div>
          {stage === "error" && <p className="err" style={{ marginBottom: 10 }}>{err}</p>}
          <button className="btn btn-primary btn-block" disabled={!canSubmit} onClick={submit}>Submit verification</button>
        </>
      )}

      <div className="trust-row" style={{ marginTop: 22 }}>
        <span><Lock /> Encrypted</span>
        <span><Shield /> Your images aren&apos;t stored</span>
      </div>
    </div>
  );
}
