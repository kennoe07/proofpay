// Illustrative public profile for the landing page. Every value here is example data.
const jobs = [
  { title: "Logo and brand kit", client: "Lumen Coffee", amount: "450.00", date: "3 Nov" },
  { title: "Landing page build", client: "Orbit Labs", amount: "1,200.00", date: "21 Oct" },
  { title: "Pitch deck design", client: "Kola Studio", amount: "220.00", date: "9 Oct" },
];

export function TrackRecordPreview() {
  return (
    <figure className="h-full rounded-3xl border border-line bg-surface p-6">
      <div className="flex items-center gap-4">
        <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-accent to-emerald-700 font-semibold text-accent-ink">
          AO
        </div>
        <div className="min-w-0">
          <p className="font-medium">Ada Okafor</p>
          <p className="truncate font-mono text-sm text-muted">proofpay/u/ada</p>
        </div>
        <span className="ml-auto rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
          Example
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-surface-2/60 p-4">
          <p className="text-2xl font-semibold">3</p>
          <p className="text-sm text-muted">Verified jobs</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-2/60 p-4">
          <p className="text-2xl font-semibold">1,870</p>
          <p className="text-sm text-muted">USDC earned</p>
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {jobs.map((job) => (
          <li
            key={job.title}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2"
          >
            <span className="size-2 shrink-0 rounded-full bg-accent" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{job.title}</p>
              <p className="truncate text-xs text-muted">
                {job.client} · {job.date}
              </p>
            </div>
            <p className="font-mono text-sm">{job.amount}</p>
          </li>
        ))}
      </ul>
    </figure>
  );
}
