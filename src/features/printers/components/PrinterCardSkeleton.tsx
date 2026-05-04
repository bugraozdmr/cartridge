export function PrinterCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-muted"></div>
        
        <div className="min-w-0 flex-1 space-y-3 pt-1">
          <div className="h-4 w-1/3 rounded bg-muted"></div>
          <div className="h-3 w-1/4 rounded bg-muted"></div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-muted"></div>
          <div className="h-8 w-8 rounded-lg bg-muted"></div>
          <div className="h-8 w-8 rounded-lg bg-muted"></div>
        </div>
      </div>
    </div>
  )
}

export function PrinterCardSkeletonList({ count = 10 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <PrinterCardSkeleton key={i} />
      ))}
    </div>
  )
}
