'use client'

import { useState, useTransition, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { SearchIcon, XIcon, PrinterIcon, BoxIcon, CheckIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { searchCartridgesAction, updatePrinterCartridges } from '../detail-actions'

interface Cartridge {
  id: string
  name: string
  imageUrl: string | null
}

interface CartridgeSelectorProps {
  printerId: string
  initialCartridges: Cartridge[]
}

export function CartridgeSelector({ printerId, initialCartridges }: CartridgeSelectorProps) {
  const [selected, setSelected] = useState<Cartridge[]>(initialCartridges)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Cartridge[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, startSave] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value)
    if (!value.trim()) {
      setResults([])
      return
    }
    setIsSearching(true)
    try {
      const excludeIds = selected.map(c => c.id)
      const found = await searchCartridgesAction(value, excludeIds)
      setResults(found)
    } finally {
      setIsSearching(false)
    }
  }, [selected])

  const addCartridge = (cartridge: Cartridge) => {
    setSelected(prev => [...prev, cartridge])
    setResults([])
    setQuery('')
  }

  const removeCartridge = (id: string) => {
    setSelected(prev => prev.filter(c => c.id !== id))
  }

  const handleSave = () => {
    startSave(async () => {
      try {
        const formData = new FormData()
        formData.append('printerId', printerId)
        selected.forEach(c => formData.append('cartridgeIds', c.id))
        await updatePrinterCartridges(formData)
        toast.success('Uyumlu tonerler güncellendi!')
        setResults([])
        setQuery('')
      } catch {
        toast.error('Kaydedilemedi, tekrar deneyin.')
      }
    })
  }

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Search input */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Toner adı yazarak arayın..."
          className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {isSearching && (
          <Loader2Icon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {/* Search results dropdown */}
        {results.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
            {results.map(cartridge => (
              <button
                key={cartridge.id}
                type="button"
                onClick={() => addCartridge(cartridge)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
              >
                {cartridge.imageUrl ? (
                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-border">
                    <Image src={cartridge.imageUrl} alt={cartridge.name} fill className="object-cover" sizes="28px" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-400/20">
                    <BoxIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                <span className="flex-1 truncate font-medium">{cartridge.name}</span>
                <CheckIcon className="h-4 w-4 text-muted-foreground/40" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected cartridges */}
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map(cartridge => (
            <div
              key={cartridge.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-sm"
            >
              {cartridge.imageUrl ? (
                <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md">
                  <Image src={cartridge.imageUrl} alt={cartridge.name} fill className="object-cover" sizes="20px" />
                </div>
              ) : (
                <BoxIcon className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
              <span className="font-medium max-w-[150px] truncate">{cartridge.name}</span>
              <button
                type="button"
                onClick={() => removeCartridge(cartridge.id)}
                className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Henüz uyumlu  eklenmemiş.</p>
      )}

      {/* Save button */}
      <div className="flex justify-end pt-2 border-t border-border">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {isSaving && <Loader2Icon className="h-4 w-4 animate-spin" />}
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}
