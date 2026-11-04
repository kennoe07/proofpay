"use client";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EVIDENCE_BUCKET, MAX_EVIDENCE_BYTES } from "@/lib/evidence";

type Mode = "file" | "link";
type Stage = "idle" | "uploading" | "attesting";

const tab = "flex-1 rounded-full px-4 py-2 text-sm transition-colors";

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data;
}

// For the freelancer, once an invoice is paid: attach what was delivered, and ProofPay writes the
// onchain receipt that links it to the payment.
export function EvidenceForm({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      let evidence: { path: string } | { link: string };
      if (mode === "file") {
        if (!file) throw new Error("Choose a file to upload.");
        if (file.size > MAX_EVIDENCE_BYTES) throw new Error("Files can be up to 10 MB.");
        setStage("uploading");
        const { path, token } = await postJson(`/api/invoices/${invoiceId}/evidence`, {
          fileName: file.name,
          size: file.size,
        });
        const storage = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        ).storage;
        const { error: uploadError } = await storage.from(EVIDENCE_BUCKET).uploadToSignedUrl(path, token, file);
        if (uploadError) throw new Error("The upload failed. Please try again.");
        evidence = { path };
      } else {
        evidence = { link };
      }

      setStage("attesting");
      await postJson(`/api/invoices/${invoiceId}/receipt`, evidence);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStage("idle");
    }
  }

  const busy = stage !== "idle";

  return (
    <form onSubmit={submit} className="space-y-5 rounded-3xl border border-accent/40 bg-accent/5 p-6 sm:p-8">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Add delivery evidence</h2>
        <p className="mt-1 text-sm text-muted">
          Attach what you delivered. ProofPay then writes an onchain receipt that links your work to this
          payment, verifiable by anyone.
        </p>
      </div>

      <div className="flex gap-1 rounded-full border border-line bg-surface p-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "file"}
          onClick={() => setMode("file")}
          className={`${tab} ${mode === "file" ? "bg-surface-2 font-medium" : "text-muted"}`}
        >
          Upload a file
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "link"}
          onClick={() => setMode("link")}
          className={`${tab} ${mode === "link" ? "bg-surface-2 font-medium" : "text-muted"}`}
        >
          Add a link
        </button>
      </div>

      {mode === "file" ? (
        <label className="block cursor-pointer rounded-2xl border border-dashed border-line bg-surface px-5 py-6 text-center text-sm transition-colors hover:border-accent/50">
          <input
            type="file"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={busy}
          />
          {file ? (
            <span>
              <span className="font-medium">{file.name}</span>
              <span className="text-muted"> · {(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </span>
          ) : (
            <span className="text-muted">Choose a file (up to 10 MB)</span>
          )}
        </label>
      ) : (
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://figma.com/… or https://github.com/…"
          disabled={busy}
          className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
        />
      )}

      <p className="text-xs leading-5 text-muted">
        {mode === "file"
          ? "The file becomes public: anyone with the receipt can open it, and its fingerprint is recorded onchain."
          : "The link is recorded onchain as part of the receipt, so anyone can see it."}
      </p>

      {error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {stage === "uploading"
          ? "Uploading…"
          : stage === "attesting"
            ? "Writing your receipt on Base…"
            : "Create onchain receipt"}
      </button>
    </form>
  );
}
