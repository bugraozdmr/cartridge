'use client'

import { useState, useEffect } from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchIcon, XIcon } from 'lucide-react'

export function ReportFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [start, setStart] = useState(searchParams.get('start') || '')
  const [end, setEnd] = useState(searchParams.get('end') || '')

  // Auto-apply when both dates are selected (debounced)
  useEffect(() => {
    let t: number | undefined
    if (start && end) {
      t = window.setTimeout(() => applyFilters(), 300)
    }
    return () => { if (t) window.clearTimeout(t) }
  }, [start, end])

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (start) params.set('start', new Date(start).toISOString())
    if (end) params.set('end', new Date(end).toISOString())
    router.push(`/reports?${params.toString()}`)
  }

  const clearFilters = () => {
    setStart('')
    setEnd('')
    router.push('/reports')
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <div className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-muted/40 p-1.5 sm:w-auto sm:flex-row sm:items-center">
        <div className="w-full min-w-0 sm:w-[160px]">
          <DatePicker 
            name="start" 
            placeholder='Başlangıç'
            value={start} 
            onChange={setStart} 
          />
        </div>
        <div className="hidden h-4 w-px bg-border sm:block" />
        <div className="w-full min-w-0 sm:w-[160px]">
          <DatePicker 
            name="end" 
            placeholder='Bitiş'
            value={end} 
            onChange={setEnd} 
          />
        </div>
      </div>
      

      {(start || end) && (
        <Button 
          variant="ghost" 
          onClick={clearFilters}
          className="h-11 w-full rounded-xl px-3 text-muted-foreground hover:text-foreground sm:w-auto"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
