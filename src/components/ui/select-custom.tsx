"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface SelectCustomProps {
  options: Option[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  name?: string
  required?: boolean
  className?: string
}

export function SelectCustom({
  options,
  value,
  onChange,
  placeholder = "Seçiniz...",
  name,
  required,
  className
}: SelectCustomProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [openUpward, setOpenUpward] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    if (!open || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const estimatedDropdownHeight = options.length > 5 ? 320 : 260

    setOpenUpward(spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow)
  }, [open, options.length])

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={value || ""}
        required={required}
      />

      <button
        type="button"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20 hover:bg-muted/60",
          !value && "text-muted-foreground",
          open && "border-primary/60 ring-2 ring-primary/20 bg-background"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className={cn("absolute z-50 w-full animate-in fade-in zoom-in-95 duration-200", openUpward ? "bottom-full mb-2" : "top-full mt-2")}>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {options.length > 5 && (
              <div className="flex items-center border-b border-border/50 px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  className="flex h-8 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            )}
            <div className="max-h-[240px] overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Sonuç bulunamadı.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                      setSearch("")
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary",
                      value === option.value ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-foreground"
                    )}
                  >
                    <span className="truncate font-medium">{option.label}</span>
                    {value === option.value && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
