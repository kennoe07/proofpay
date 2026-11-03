const steps = [
  {
    title: "Invoice",
    body: "Create a USDC invoice for finished work and share its link with your client.",
  },
  {
    title: "Get paid",
    body: "Your client pays on Base. ProofPay checks the payment onchain before marking it paid.",
  },
  {
    title: "Prove it",
    body: "Each paid job becomes a receipt, attested onchain, that links the work to the payment.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-20 sm:py-32">
      <div className="w-full max-w-3xl">
        <p className="font-mono text-sm text-emerald-600 dark:text-emerald-400">&gt;_ proofpay</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          A verifiable record of paid work.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          ProofPay links what you delivered to how you were paid, so every job you finish adds to a
          track record your next client can check for themselves.
        </p>

        <ol className="mt-14 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <span className="font-mono text-sm text-zinc-500">0{i + 1}</span>
              <h2 className="mt-2 font-medium">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{step.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-14 text-sm text-zinc-500">
          Being built for Vibeathon 02 on Base.
        </p>
      </div>
    </main>
  );
}
