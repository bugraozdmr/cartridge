'use client'

import { useState, useRef, useEffect } from 'react'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface DatePickerProps {
  name: string
  value?: string        // YYYY-MM-DD
  defaultValue?: string // YYYY-MM-DD
  max?: string
  min?: string
  required?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
  placeholder?: string
}

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]
const DAYS_TR = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseYMD(str: string): Date | null {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function formatDisplay(str: string) {
  const d = parseYMD(str)
  if (!d) return ''
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`
}

export function DatePicker({
  name, value, defaultValue, max, min, required, disabled, onChange, placeholder
}: DatePickerProps) {
  const today = toYMD(new Date())
  const initVal = value ?? defaultValue ?? today
  const [selected, setSelected] = useState(initVal)
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    const d = parseYMD(initVal) ?? new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const [showJump, setShowJump] = useState(false)
  const [jumpMonth, setJumpMonth] = useState(viewDate.month)
  const [jumpYear, setJumpYear] = useState(viewDate.year)

  useEffect(() => {
    setJumpMonth(viewDate.month)
    setJumpYear(viewDate.year)
  }, [viewDate.month, viewDate.year])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Controlled support
  useEffect(() => {
    if (value !== undefined) setSelected(value)
  }, [value])

  const select = (ymd: string) => {
    setSelected(ymd)
    onChange?.(ymd)
    setOpen(false)
  }

  const prevMonth = () =>
    setViewDate(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })
  const nextMonth = () =>
    setViewDate(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })

  // Build calendar grid: start from Monday
  const firstDay = new Date(viewDate.year, viewDate.month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  const isDisabled = (day: number) => {
    const ymd = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (max && ymd > max) return true
    if (min && ymd < min) return true
    return false
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={selected} />

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`
          flex h-9 w-full items-center justify-center rounded-lg border px-3 text-[11px] font-bold tracking-tight transition-all
          ${open
            ? 'border-primary/60 bg-background ring-2 ring-primary/20'
            : 'border-border bg-muted/20 hover:border-border/80'
          }
          text-foreground disabled:cursor-not-allowed disabled:opacity-50
        `}
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground/60'}>
          {selected ? formatDisplay(selected) : (typeof placeholder === 'string' ? placeholder : 'Tarih seç...')}
        </span>
      </button>

      {/* Dropdown Calendar */}
      {open && (
        <div
          className="absolute left-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-72 rounded-2xl border border-border bg-card p-4 shadow-xl shadow-black/20 sm:w-72"
          style={{ top: '100%' }}
        >
          {/* Month nav with jump-to month/year */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowJump(s => !s)}
                className="text-sm font-semibold text-foreground hover:underline"
                aria-expanded={showJump}
              >
                {MONTHS_TR[viewDate.month]} {viewDate.year}
              </button>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Jump controls (month select + year input) */}
          {showJump && (
            <div className="mb-3 flex items-center gap-2">
              <select
                value={jumpMonth}
                onChange={(e) => setJumpMonth(Number(e.target.value))}
                className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              >
                {MONTHS_TR.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={jumpYear}
                onChange={(e) => setJumpYear(Number(e.target.value))}
                onKeyDown={(e) => { if (e.key === 'Enter') { setViewDate({ year: jumpYear, month: jumpMonth }); setShowJump(false) } }}
                className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => { setViewDate({ year: jumpYear, month: jumpMonth }); setShowJump(false) }}
                className="ml-2 rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
              >
                Git
              </button>
            </div>
          )}

          {/* Day headers */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAYS_TR.map(d => (
              <span key={d} className="pb-1 text-[11px] font-medium text-muted-foreground">{d}</span>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day, i) => {
              if (!day) return <span key={i} />
              const ymd = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isSelected = ymd === selected
              const isTdy = ymd === today
              const dis = isDisabled(day)
              return (
                <button
                  key={i}
                  type="button"
                  disabled={dis}
                  onClick={() => select(ymd)}
                  className={`
                    mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors
                    ${isSelected
                      ? 'bg-primary text-primary-foreground'
                      : isTdy && !isSelected
                        ? 'border border-primary/40 text-primary'
                        : 'text-foreground hover:bg-muted/60'
                    }
                    ${dis ? 'cursor-not-allowed opacity-30' : ''}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setSelected('')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Temizle
            </button>
            <button
              type="button"
              onClick={() => {
                select(today)
                setViewDate({ year: new Date().getFullYear(), month: new Date().getMonth() })
              }}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Bugün
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
