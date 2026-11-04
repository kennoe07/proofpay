"use client";

import { useActionState } from "react";
import { setHandle } from "@/app/dashboard/actions";

// Choosing a handle for the first time, or changing it (`current` set).
export function HandleForm({ current, onCancel }: { current?: string; onCancel?: () => void }) {
  const [state, action, pending] = useActionState(setHandle, undefined);

  return (
    <form action={action} className="rounded-3xl border border-accent/40 bg-accent/5 p-6">
      <label htmlFor="handle" className="font-medium">
        {current ? "Change your public handle" : "Choose your public handle"}
      </label>
      <p className="mt-1 text-sm text-muted">
        {current ? (
          <>
            Your profile link will change, and old <span className="font-mono">/u/{current}</span> links will
            stop working. Invoice links aren&apos;t affected.
          </>
        ) : (
          <>
            Your track record will live at <span className="font-mono">/u/your_handle</span>.
          </>
        )}
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          id="handle"
          name="handle"
          required
          minLength={3}
          maxLength={24}
          pattern="[a-zA-Z0-9_]{3,24}"
          defaultValue={state?.fields?.handle ?? current}
          placeholder="ada_designs"
          autoComplete="off"
          className="flex-1 rounded-full border border-line bg-surface px-5 py-3 font-mono text-sm outline-none focus:border-accent"
        />
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-3 text-sm text-muted transition-colors hover:text-foreground"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save handle"}
        </button>
      </div>
      {state?.error && (
        <p role="alert" className="mt-3 text-sm text-red-500">
          {state.error}
        </p>
      )}
    </form>
  );
}
