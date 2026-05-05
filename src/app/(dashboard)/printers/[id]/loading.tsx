export default function PrinterDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Back link skeleton */}
      <div className="h-5 w-36 rounded-lg bg-muted" />

      {/* Header card skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          <div className="h-24 w-24 shrink-0 rounded-2xl bg-muted" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-7 w-2/3 rounded-lg bg-muted" />
            <div className="h-4 w-1/4 rounded-lg bg-muted" />
          </div>
        </div>
      </div>

      {/* Cartridge selector card skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-3/4 rounded-lg bg-muted" />
        </div>
        {/* Search input */}
        <div className="h-11 w-full rounded-xl bg-muted" />
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 w-28 rounded-xl bg-muted" />
          ))}
        </div>
        <div className="flex justify-end border-t border-border pt-4">
          <div className="h-10 w-24 rounded-xl bg-muted" />
        </div>
      </div>

      {/* Compatible cartridges list skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="h-6 w-52 rounded-lg bg-muted" />
        <div className="grid gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-3">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/2 rounded-lg bg-muted" />
                <div className="h-3 w-1/4 rounded-lg bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
