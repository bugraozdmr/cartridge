export default function DepartmentsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-xl bg-muted" />
          <div className="h-4 w-72 rounded-lg bg-muted" />
        </div>
        <div className="h-8 w-24 rounded-xl bg-muted" />
      </div>

      {/* Add form skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-4 w-36 rounded-lg bg-muted" />
        <div className="h-12 w-full rounded-2xl bg-muted" />
      </div>

      {/* List skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {[...Array(4)].map((_, i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-3.5">
              {/* Icon */}
              <div className="h-10 w-10 shrink-0 rounded-xl bg-muted" />
              {/* Info */}
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-40 rounded-lg bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <div className="h-8 w-8 rounded-lg bg-muted" />
                <div className="h-8 w-8 rounded-lg bg-muted" />
                <div className="h-8 w-8 rounded-lg bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
