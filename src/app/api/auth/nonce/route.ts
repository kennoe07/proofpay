import { generateSiweNonce } from "viem/siwe";
import { setNonce } from "@/lib/session";

export async function GET() {
  const nonce = generateSiweNonce();
  await setNonce(nonce);
  return Response.json({ nonce });
}
