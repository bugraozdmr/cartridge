'use client'

import { useState, useEffect, useRef } from 'react'
import { SearchIcon, Loader2Icon, PrinterIcon, BoxIcon, BuildingIcon, XIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { globalSearch } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const data = await globalSearch(query)
      setResults(data)
      setIsSearching(false)
      setIsOpen(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const hasResults = results && (
    results.printerModels.length > 0 ||
    results.physicalPrinters.length > 0 ||
    results.cartridges.length > 0 ||
    results.departments.length > 0
  )

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 w-full rounded-xl border-border bg-muted/60 pl-10 pr-10 text-sm focus-visible:ring-primary/20"
          placeholder="Yazıcı, kartuş veya departman ara..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setResults(null); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--surface-shadow)] z-50">
          <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
            {isSearching ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2Icon className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Aranıyor...</span>
              </div>
            ) : !hasResults ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground italic">Sonuç bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-4 p-2">
                {results.physicalPrinters.length > 0 && (
                  <section>
                    <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fizikî Yazıcılar</h3>
                    <div className="space-y-1">
                      {results.physicalPrinters.map((p: any) => (
                        <Link 
                          key={p.id} 
                          href={p.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <PrinterIcon className="h-4 w-4 text-violet-500" />
                          <div className="min-w-0 flex-1">
                            <span className="block font-medium truncate">{p.title}</span>
                            {p.meta && <span className="block text-[10px] text-muted-foreground truncate">{p.meta}</span>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {results.printerModels.length > 0 && (
                  <section>
                    <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Yazıcı Modelleri</h3>
                    <div className="space-y-1">
                      {results.printerModels.map((p: any) => (
                        <Link 
                          key={p.id} 
                          href={p.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <PrinterIcon className="h-4 w-4 text-violet-500" />
                          <span className="font-medium">{p.title}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {results.cartridges.length > 0 && (
                  <section>
                    <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kartuşlar</h3>
                    <div className="space-y-1">
                      {results.cartridges.map((c: any) => (
                        <Link 
                          key={c.id} 
                          href={c.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <BoxIcon className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium">{c.title}</span>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">{c.meta}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {results.departments.length > 0 && (
                  <section>
                    <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Departmanlar</h3>
                    <div className="space-y-1">
                      {results.departments.map((d: any) => (
                        <Link 
                          key={d.id} 
                          href={d.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <BuildingIcon className="h-4 w-4 text-sky-500" />
                          <span className="font-medium">{d.title}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
