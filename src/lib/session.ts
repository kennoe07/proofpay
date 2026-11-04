import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// A session is "<address>.<expiry>.<signature>", signed with SESSION_SECRET and kept
// in an httpOnly cookie, so the browser can't read or forge it.
const SESSION_COOKIE = "pp_session";
const NONCE_COOKIE = "pp_nonce";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET is missing or too short.");
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function createSession(address: string) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${address.toLowerCase()}.${expires}`;
  const store = await cookies();
  store.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, { ...cookieBase, maxAge: SESSION_SECONDS });
}

export async function getSession(): Promise<{ address: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [address, expires, signature] = token.split(".");
  if (!address || !expires || !signature) return null;

  const expected = Buffer.from(sign(`${address}.${expires}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (Number(expires) < Date.now() / 1000) return null;

  return { address };
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

// One-time nonce for Sign-In With Ethereum, so a signed message can't be replayed.
export async function setNonce(nonce: string) {
  (await cookies()).set(NONCE_COOKIE, nonce, { ...cookieBase, maxAge: 60 * 10 });
}

export async function takeNonce() {
  const store = await cookies();
  const nonce = store.get(NONCE_COOKIE)?.value ?? null;
  store.delete(NONCE_COOKIE);
  return nonce;
}
