import { getBasename } from "@/lib/basename";
import { shortAddress } from "@/lib/format";

// A wallet shown by its Basename (name.base.eth) when it has one, otherwise as a short address.
// Hovering shows the full address either way.
export async function WalletName({ address, className = "" }: { address: string; className?: string }) {
  const basename = await getBasename(address);
  return (
    <span title={address} className={basename ? className : `font-mono ${className}`}>
      {basename ?? shortAddress(address)}
    </span>
  );
}
