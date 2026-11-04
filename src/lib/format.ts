import { formatUnits } from "viem";
import { USDC_DECIMALS } from "./chain";

// Amounts are stored in USDC base units (6 decimals). Show at least two decimals.
export function formatUsdc(units: number | string | bigint) {
  const value = formatUnits(BigInt(units), USDC_DECIMALS);
  const [whole, fraction = ""] = value.split(".");
  const grouped = Number(whole).toLocaleString("en-US");
  return `${grouped}.${fraction.padEnd(2, "0")}`;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
