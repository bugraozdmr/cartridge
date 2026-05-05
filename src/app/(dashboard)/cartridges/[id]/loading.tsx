export default function CartridgeDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-5 w-36 rounded-lg bg-muted" />

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          <div className="h-24 w-24 shrink-0 rounded-2xl bg-muted" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-7 w-2/3 rounded-lg bg-muted" />
            <div className="h-4 w-1/4 rounded-lg bg-muted" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`rounded-2xl border border-border bg-card p-5 space-y-4 ${i === 3 ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-muted" />
              <div className="h-4 w-20 rounded-lg bg-muted" />
            </div>
            <div className="h-8 w-16 rounded-lg bg-muted" />
            <div className="h-3 w-10 rounded-lg bg-muted" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-2/3 rounded-lg bg-muted" />
        </div>
        <div className="grid gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-3">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
              <div className="h-4 flex-1 rounded-lg bg-muted" />
              <div className="h-4 w-12 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
