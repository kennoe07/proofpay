import "server-only";
import { createClient } from "@supabase/supabase-js";

// Uses the secret key, which bypasses row level security. Server code only:
// every caller must check the session before writing.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase is not configured. Check .env.local.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type Profile = {
  wallet_address: string;
  handle: string | null;
  display_name: string | null;
  created_at: string;
};

export type Invoice = {
  id: string;
  freelancer_address: string;
  chain_id: number;
  title: string;
  description: string | null;
  client_name: string | null;
  amount_units: number;
  status: "unpaid" | "paid" | "cancelled";
  due_date: string | null;
  created_at: string;
  payment_tx_hash: string | null;
  payer_address: string | null;
  paid_at: string | null;
  evidence_url: string | null;
  evidence_hash: string | null;
  attestation_uid: string | null;
};
