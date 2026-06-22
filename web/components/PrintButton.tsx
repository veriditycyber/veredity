"use client";
import { Upload } from "./icons";

export default function PrintButton({ label = "Download report (PDF)" }: { label?: string }) {
  return (
    <button className="btn btn-primary" onClick={() => window.print()}>
      <Upload style={{ transform: "rotate(180deg)" }} /> {label}
    </button>
  );
}
