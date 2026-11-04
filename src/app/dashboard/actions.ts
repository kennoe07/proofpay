"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseUnits } from "viem";
import { USDC_DECIMALS } from "@/lib/chain";
import { base, baseSepolia } from "viem/chains";
import { clearSession, getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-server";

export type FormState = { error?: string; fields?: Record<string, string> } | undefined;

const MAX_AMOUNT = parseUnits("1000000", USDC_DECIMALS);

// Handles that could pass for ProofPay staff or partners on a public track record.
const RESERVED_HANDLE = /^(proofpay|vibestarter|admin|support|help|official|team|staff|base|coinbase)(_.*)?$|proofpay/;

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function setHandle(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };

  const handle = text(formData, "handle").toLowerCase();
  if (!/^[a-z0-9_]{3,24}$/.test(handle)) {
    return { error: "Use 3 to 24 lowercase letters, numbers or underscores.", fields: { handle } };
  }
  if (RESERVED_HANDLE.test(handle)) {
    return { error: "That handle is reserved. Try another.", fields: { handle } };
  }

  const { error } = await supabaseAdmin()
    .from("profiles")
    .update({ handle })
    .eq("wallet_address", session.address);
  if (error) {
    const taken = error.code === "23505";
    return { error: taken ? "That handle is taken. Try another." : "Couldn't save your handle.", fields: { handle } };
  }

  revalidatePath("/dashboard");
  return undefined;
}

export async function createInvoice(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };

  const fields = {
    title: text(formData, "title"),
    client: text(formData, "client"),
    amount: text(formData, "amount"),
    description: text(formData, "description"),
    network: text(formData, "network"),
    dueDate: text(formData, "dueDate"),
  };

  // Test mode uses Base Sepolia (free test USDC); Live uses Base with real USDC.
  if (fields.network !== "test" && fields.network !== "live") {
    return { error: "Choose Test or Live.", fields };
  }
  const chainId = fields.network === "live" ? base.id : baseSepolia.id;

  if (fields.dueDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.dueDate) || Number.isNaN(Date.parse(fields.dueDate))) {
      return { error: "That due date isn't valid.", fields };
    }
    if (fields.dueDate < today) return { error: "The due date can't be in the past.", fields };
  }

  if (!fields.title || fields.title.length > 120) {
    return { error: "Give the job a title (up to 120 characters).", fields };
  }
  if (fields.client.length > 120) return { error: "Client name is too long.", fields };
  if (fields.description.length > 2000) return { error: "Description is too long.", fields };

  // Up to 6 decimal places, matching USDC.
  if (!/^\d+(\.\d{1,6})?$/.test(fields.amount)) {
    return { error: "Enter an amount like 250 or 99.50.", fields };
  }
  const units = parseUnits(fields.amount, USDC_DECIMALS);
  if (units <= BigInt(0) || units > MAX_AMOUNT) {
    return { error: "Amount must be more than 0 and at most 1,000,000 USDC.", fields };
  }

  const { data, error } = await supabaseAdmin()
    .from("invoices")
    .insert({
      freelancer_address: session.address,
      chain_id: chainId,
      title: fields.title,
      client_name: fields.client || null,
      description: fields.description || null,
      amount_units: units.toString(),
      due_date: fields.dueDate || null,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "Couldn't create the invoice. Please try again.", fields };

  revalidatePath("/dashboard");
  redirect(`/i/${data.id}?created=1`);
}

export async function cancelInvoice(invoiceId: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };

  // Only the owner can cancel, and only while it's still unpaid.
  const { data, error } = await supabaseAdmin()
    .from("invoices")
    .update({ status: "cancelled" })
    .eq("id", invoiceId)
    .eq("freelancer_address", session.address)
    .eq("status", "unpaid")
    .select("id");
  if (error) {
    console.error("cancelInvoice failed", error);
    return { error: "Couldn't cancel the invoice. Please try again." };
  }
  if (!data?.length) return { error: "Only unpaid invoices you created can be cancelled." };

  revalidatePath("/dashboard");
  revalidatePath(`/i/${invoiceId}`);
  return {};
}

export async function signOut() {
  await clearSession();
  redirect("/dashboard");
}
