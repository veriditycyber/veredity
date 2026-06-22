import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrueHire — Candidate Identity & Deepfake Check",
  description: "A trust layer for remote hiring — flag deepfake, impersonation, and AI-fronted candidates before you make an offer.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
