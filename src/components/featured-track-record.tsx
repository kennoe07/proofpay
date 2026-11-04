import { cacheLife } from "next/cache";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { NetworkBadge } from "@/components/status-badge";
import { TrackRecordPreview } from "@/components/track-record-preview";
import { isTestnetChain } from "@/lib/chain";
import { easscanUrl } from "@/lib/eas-schema";
import { formatDate, formatUsdc } from "@/lib/format";
import { displayName, getTrackRecord, trackRecordStats } from "@/lib/track-record";

// A real freelancer's track record on the landing page. Cached and refreshed every few
// minutes, so the page stays fast. Falls back to the example card if it can't load.
export async function FeaturedTrackRecord({ handle }: { handle: string }) {
  "use cache";
  cacheLife("minutes");

  const found = await getTrackRecord(handle).catch(() => null);
  if (!found) return <TrackRecordPreview />;

  const { profile, jobs } = found;
  const name = displayName(profile);
  const { earned, earnedTest } = trackRecordStats(jobs);
  const path = `/u/${profile.handle ?? profile.wallet_address}`;

  return (
    <figure className="h-full rounded-3xl border border-line bg-surface p-6">
      <div className="flex items-center gap-4">
        <Avatar url={profile.avatar_url} name={name} />
        <div className="min-w-0">
          <p className="font-medium">{name}</p>
          <p className="truncate font-mono text-sm text-muted">proofpay{path}</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-2.5 py-0.5 text-xs text-accent">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          Real profile
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-surface-2/60 p-4">
          <p className="text-2xl font-semibold">{jobs.length}</p>
          <p className="text-sm text-muted">Verified jobs</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-2/60 p-4">
          <p className="text-2xl font-semibold">{formatUsdc(earned)}</p>
          <p className="text-sm text-muted">USDC earned</p>
          {earnedTest > BigInt(0) && (
            <p className="mt-0.5 text-xs text-muted">+ {formatUsdc(earnedTest)} in Test mode</p>
          )}
        </div>
      </div>

      {jobs.length > 0 ? (
        <ul className="mt-6 space-y-2">
          {jobs.slice(0, 3).map((job) => {
            const verifyUrl = job.attestation_uid ? easscanUrl(job.chain_id, job.attestation_uid) : null;
            return (
              <li key={job.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                <span className="size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{job.title}</p>
                  <p className="truncate text-xs text-muted">
                    {job.paid_at ? `Paid ${formatDate(job.paid_at)}` : "Paid"}
                  </p>
                </div>
                {isTestnetChain(job.chain_id) && <NetworkBadge testnet />}
                {verifyUrl && (
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent transition hover:bg-accent/25"
                  >
                    Receipt ↗
                  </a>
                )}
                <p className="font-mono text-sm">{formatUsdc(job.amount_units)}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted">No paid jobs yet.</p>
      )}

      <Link
        href={path}
        className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent underline-offset-4 hover:underline"
      >
        Open full profile →
      </Link>
    </figure>
  );
}
