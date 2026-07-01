"use client";

export default function CmdkButton() {
  return (
    <button className="cmdk-trigger noprint" onClick={() => window.dispatchEvent(new Event("cmdk:toggle"))} title="Search (Ctrl/⌘ K)">
      <span>Search</span><kbd>⌘K</kbd>
    </button>
  );
}
