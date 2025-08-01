export default function Page() {
  return (
    <div className="container space-y-6">
      <section className="card">
        <h2 className="text-lg font-semibold">Welcome to Codie</h2>
        <p className="mt-2 text-sm text-neutral-300">
          Secure, efficient, explainable AI code reviews. This dashboard will summarize PR risk,
          hotspots touched, performance impact, security flags, style deviations, and confidence
          thresholds.
        </p>
        <div className="mt-4 flex gap-2">
          <a className="btn" href="/pr/123">Open Sample PR</a>
          <a className="badge" href="/repo/intelligence">Repo Intelligence</a>
          <a className="badge" href="/runtime">Runtime</a>
          <a className="badge" href="/security">Security</a>
          <a className="badge" href="/tests">Tests</a>
          <a className="badge" href="/refactor">Refactor Planner</a>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <h3 className="font-medium">Risk Score</h3>
          <p className="mt-2 text-sm text-neutral-400">Pending analysis…</p>
        </div>
        <div className="card">
          <h3 className="font-medium">Hotspots</h3>
          <p className="mt-2 text-sm text-neutral-400">No hotspots yet.</p>
        </div>
        <div className="card">
          <h3 className="font-medium">Performance</h3>
          <p className="mt-2 text-sm text-neutral-400">No regressions detected.</p>
        </div>
      </section>
    </div>
  );
}
