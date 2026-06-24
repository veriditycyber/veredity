import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "Veridity — Verify candidates against deepfake & identity fraud",
  description: "The trust layer for remote hiring. Catch deepfake, impersonation, and AI-fronted candidates before you make an offer.",
};

// Set the saved theme before paint to avoid a flash.
const themeInit = `(function(){try{var t=localStorage.getItem('veridity-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${display.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
      </body>
    </html>
  );
}
