'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface LocalPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function LocalPagination({ currentPage, totalPages, onPageChange }: LocalPaginationProps) {
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => hasPrev && onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
          hasPrev
            ? 'border border-border bg-muted/40 hover:bg-muted/60 text-foreground cursor-pointer'
            : 'border border-border/30 bg-transparent text-muted-foreground/40 cursor-not-allowed'
        }`}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      <div className="text-sm text-muted-foreground flex items-center gap-1">
        <span className="font-semibold text-foreground">{currentPage}</span>
        <span>/</span>
        <span className="font-semibold text-foreground">{totalPages}</span>
      </div>

      <button
        onClick={() => hasNext && onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
          hasNext
            ? 'border border-border bg-muted/40 hover:bg-muted/60 text-foreground cursor-pointer'
            : 'border border-border/30 bg-transparent text-muted-foreground/40 cursor-not-allowed'
        }`}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

