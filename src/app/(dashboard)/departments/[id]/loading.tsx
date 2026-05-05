export default function DepartmentDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Back */}
      <div className="h-5 w-40 rounded-lg bg-muted" />

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-48 rounded-lg bg-muted" />
            <div className="h-4 w-32 rounded-lg bg-muted" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
            <div className="h-8 w-12 rounded-lg bg-muted" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="h-5 w-40 rounded-lg bg-muted" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="flex items-center gap-2 flex-1">
                <div className="h-7 w-7 rounded-md bg-muted shrink-0" />
                <div className="h-4 w-32 rounded bg-muted" />
              </div>
              <div className="h-5 w-16 rounded-lg bg-muted ml-auto" />
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-28 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
