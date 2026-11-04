import "server-only";
import { isTestnetChain } from "@/lib/chain";
import { shortAddress } from "@/lib/format";
import { supabaseAdmin, type Invoice, type Profile } from "@/lib/supabase-server";

const HANDLE = /^[a-z0-9_]{3,24}$/;
const ADDRESS = /^0x[0-9a-f]{40}$/;

export type TrackRecordJob = Pick<
  Invoice,
  "id" | "chain_id" | "title" | "amount_units" | "paid_at" | "attestation_uid" | "status"
>;

// A track record can be looked up by handle ("ada", "@ada") or by wallet ("0x…").
// Only paid jobs make up the track record, and client names stay off this public list.
export async function getTrackRecord(param: string) {
  const key = decodeURIComponent(param).toLowerCase().replace(/^@/, "");
  const column = ADDRESS.test(key) ? "wallet_address" : HANDLE.test(key) ? "handle" : null;
  if (!column) return null;

  const db = supabaseAdmin();
  const { data: profile } = await db.from("profiles").select("*").eq(column, key).maybeSingle<Profile>();
  if (!profile) return null;

  const { data: jobs } = await db
    .from("invoices")
    .select("id, chain_id, title, amount_units, paid_at, attestation_uid, status")
    .eq("freelancer_address", profile.wallet_address)
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .returns<TrackRecordJob[]>();

  return { profile, jobs: jobs ?? [] };
}

export function displayName(profile: Profile) {
  return profile.handle ? `@${profile.handle}` : shortAddress(profile.wallet_address);
}

// Live earnings only count Live invoices; Test mode is reported separately.
export function trackRecordStats(jobs: TrackRecordJob[]) {
  const total = (list: TrackRecordJob[]) => list.reduce((sum, j) => sum + BigInt(j.amount_units), BigInt(0));
  return {
    earned: total(jobs.filter((j) => !isTestnetChain(j.chain_id))),
    earnedTest: total(jobs.filter((j) => isTestnetChain(j.chain_id))),
    receipts: jobs.filter((j) => j.attestation_uid).length,
  };
}
