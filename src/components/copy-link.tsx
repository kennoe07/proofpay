"use client";

import { useState } from "react";

export function CopyLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the address bar still has the link.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition hover:brightness-110"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
