'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  paramName?: string
}

export function Pagination({ currentPage, totalPages, paramName = 'page' }: PaginationProps) {
  const searchParams = useSearchParams()
  
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set(paramName, page.toString())
    return `?${params.toString()}`
  }

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {totalPages > 0 ? (
          <>
            Sayfa <span className="font-semibold text-foreground">{currentPage}</span> / {' '}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </>
        ) : (
          'Veri yok'
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={createPageUrl(currentPage - 1)}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            hasPrev
              ? 'border-border bg-muted/50 hover:bg-muted text-foreground cursor-pointer'
              : 'border-border/50 bg-transparent text-muted-foreground/50 cursor-not-allowed opacity-50'
          }`}
          aria-disabled={!hasPrev}
          tabIndex={hasPrev ? 0 : -1}
          onClick={(e) => {
            if (!hasPrev) e.preventDefault()
          }}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Önceki
        </Link>

        <Link
          href={createPageUrl(currentPage + 1)}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            hasNext
              ? 'border-border bg-muted/50 hover:bg-muted text-foreground cursor-pointer'
              : 'border-border/50 bg-transparent text-muted-foreground/50 cursor-not-allowed opacity-50'
          }`}
          aria-disabled={!hasNext}
          tabIndex={hasNext ? 0 : -1}
          onClick={(e) => {
            if (!hasNext) e.preventDefault()
          }}
        >
          Sonraki
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
