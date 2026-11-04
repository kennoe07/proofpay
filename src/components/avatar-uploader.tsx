"use client";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { AVATAR_BUCKET, AVATAR_TYPES, MAX_AVATAR_BYTES } from "@/lib/avatar";

async function request(method: string, body?: unknown) {
  const res = await fetch("/api/profile/avatar", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data;
}

// The freelancer's own profile picture on the dashboard, with change and remove.
export function AvatarUploader({ url, name }: { url: string | null; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"uploading" | "removing" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (!AVATAR_TYPES[file.type]) return setError("Use a PNG, JPG, WebP or GIF image.");
    if (file.size > MAX_AVATAR_BYTES) return setError("Images can be up to 2 MB.");
    setBusy("uploading");
    try {
      const { path, token } = await request("POST", { type: file.type, size: file.size });
      const storage = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      ).storage;
      const { error: uploadError } = await storage.from(AVATAR_BUCKET).uploadToSignedUrl(path, token, file);
      if (uploadError) throw new Error("The upload failed. Please try again.");
      await request("PUT", { path });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The upload failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setError(null);
    setBusy("removing");
    try {
      await request("DELETE");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't remove your picture.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar url={url} name={name} className={`size-16 text-xl ${busy ? "opacity-60" : ""}`} />
      <div className="space-y-1">
        <div className="flex items-center gap-3 text-sm">
          <label className="cursor-pointer font-medium text-accent underline-offset-4 hover:underline">
            {busy === "uploading" ? "Uploading…" : url ? "Change photo" : "Add photo"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              disabled={busy !== null}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void upload(file);
              }}
            />
          </label>
          {url && (
            <button
              type="button"
              onClick={remove}
              disabled={busy !== null}
              className="text-muted transition-colors hover:text-red-500 disabled:opacity-60"
            >
              {busy === "removing" ? "Removing…" : "Remove"}
            </button>
          )}
        </div>
        {error ? (
          <p role="alert" className="text-xs text-red-500">
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted">PNG, JPG, WebP or GIF, up to 2 MB. Shown on your public profile.</p>
        )}
      </div>
    </div>
  );
}
