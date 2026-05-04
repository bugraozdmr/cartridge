'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'

export function SearchForm({ placeholder = 'Ara...' }: { placeholder?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const currentQuery = searchParams.get('q') || ''

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get('q') as string
    
    startTransition(() => {
      if (query.trim()) {
        router.push(`?q=${encodeURIComponent(query)}&page=1`)
      } else {
        router.push('?page=1')
      }
    })
  }

  const handleClear = () => {
    startTransition(() => {
      router.push('?page=1')
    })
  }

  return (
    <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          name="q"
          defaultValue={currentQuery}
          placeholder={placeholder}
          disabled={isPending}
          className="w-full rounded-lg border border-border bg-muted/30 py-2 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        {currentQuery && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-foreground text-muted-foreground disabled:opacity-50"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  )
}
