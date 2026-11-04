"use client";

import { useState } from "react";
import { HandleForm } from "@/components/handle-form";

// The freelancer's handle on the dashboard, with an inline form to change it.
// The dashboard keys this by handle, so it closes on its own once a new handle is saved.
export function HandleEditor({ handle }: { handle: string }) {
  const [editing, setEditing] = useState(false);

  if (editing) return <HandleForm current={handle} onCancel={() => setEditing(false)} />;
  return (
    <p className="font-mono text-sm text-accent">
      @{handle}{" "}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="font-sans text-xs text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        change
      </button>
    </p>
  );
}
