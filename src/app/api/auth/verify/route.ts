import { createPublicClient, http, isHex } from "viem";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { chain, publicRpcUrl } from "@/lib/chain";
import { createSession, takeNonce } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-server";

// Base's public endpoint: reachable from anywhere, and needed to verify smart wallet signatures.
const client = createPublicClient({ chain, transport: http(publicRpcUrl) });

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { message?: unknown; signature?: unknown } | null;
  const message = typeof body?.message === "string" ? body.message : null;
  const signature = typeof body?.signature === "string" && isHex(body.signature) ? body.signature : null;
  if (!message || !signature) {
    return Response.json({ error: "Missing message or signature." }, { status: 400 });
  }

  // The nonce is single-use: it is cleared here whether or not verification succeeds.
  const nonce = await takeNonce();
  const host = request.headers.get("host");
  const parsed = parseSiweMessage(message);

  if (!nonce || !host || !parsed.address) {
    return Response.json({ error: "Sign-in expired. Please try again." }, { status: 400 });
  }
  if (parsed.chainId !== chain.id) {
    return Response.json({ error: `Please sign in on ${chain.name}.` }, { status: 400 });
  }

  let valid = false;
  try {
    valid = await verifySiweMessage(client, { message, signature, domain: host, nonce });
  } catch {
    return Response.json({ error: "Couldn't reach Base to check the signature. Try again." }, { status: 502 });
  }
  if (!valid) {
    return Response.json({ error: "That signature didn't check out. Please try again." }, { status: 401 });
  }

  const address = parsed.address.toLowerCase();
  const { error } = await supabaseAdmin()
    .from("profiles")
    .upsert({ wallet_address: address }, { onConflict: "wallet_address", ignoreDuplicates: true });
  if (error) {
    return Response.json({ error: "Couldn't save your profile. Please try again." }, { status: 500 });
  }

  await createSession(address);
  return Response.json({ ok: true });
}
