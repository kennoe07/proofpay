"use client";

import { useActionState } from "react";
import { createInvoice } from "@/app/dashboard/actions";

const inputClass =
  "w-full rounded-2xl border border-line bg-surface-2/60 px-4 py-3 text-sm outline-none transition-colors focus:border-accent";

const networks = [
  { value: "test", title: "Test mode", body: "Base Sepolia, free test USDC. For trying things out." },
  { value: "live", title: "Live", body: "Base mainnet. Your client pays real USDC." },
] as const;

export function InvoiceForm({ defaultNetwork }: { defaultNetwork: "test" | "live" }) {
  const [state, action, pending] = useActionState(createInvoice, undefined);
  const fields = state?.fields;
  const selectedNetwork = fields?.network ?? defaultNetwork;

  return (
    <form action={action} className="space-y-6 rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Network</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {networks.map((network) => (
            <label
              key={network.value}
              className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-surface-2/60 p-4 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5"
            >
              <input
                type="radio"
                name="network"
                value={network.value}
                defaultChecked={selectedNetwork === network.value}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-sm font-medium">{network.title}</span>
                <span className="mt-0.5 block text-xs leading-5 text-muted">{network.body}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="What was the job?" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          maxLength={120}
          defaultValue={fields?.title}
          placeholder="Logo and brand kit"
          className={inputClass}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Client" hint="Optional" htmlFor="client">
          <input
            id="client"
            name="client"
            maxLength={120}
            defaultValue={fields?.client}
            placeholder="Lumen Coffee"
            className={inputClass}
          />
        </Field>
        <Field label="Amount" htmlFor="amount">
          <div className="relative">
            <input
              id="amount"
              name="amount"
              required
              inputMode="decimal"
              pattern="\d+(\.\d{1,6})?"
              defaultValue={fields?.amount}
              placeholder="450.00"
              className={`${inputClass} pr-16 font-mono`}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-sm text-muted">
              USDC
            </span>
          </div>
        </Field>
      </div>

      <Field label="Due date" hint="Optional" htmlFor="dueDate">
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          min={new Date().toISOString().slice(0, 10)}
          defaultValue={fields?.dueDate}
          className={`${inputClass} sm:max-w-xs`}
        />
      </Field>

      <Field label="Description" hint="Optional" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={fields?.description}
          placeholder="What you delivered, and anything the client should know."
          className={`${inputClass} resize-y`}
        />
      </Field>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create invoice"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between text-sm font-medium">
        {label}
        {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
