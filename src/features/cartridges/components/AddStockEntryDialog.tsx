'use client'

import { useState, useRef, useTransition } from 'react'
import { PlusIcon, Loader2Icon, CalendarIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { addStockEntry } from '../stock-actions'

interface AddStockEntryDialogProps {
  cartridgeId: string
  defaultUnitPrice?: string | null
}

export function AddStockEntryDialog({ cartridgeId, defaultUnitPrice }: AddStockEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  // Default date: today
  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    const formData = new FormData(form)
    formData.append('cartridgeId', cartridgeId)

    startTransition(async () => {
      try {
        await addStockEntry(formData)
        toast.success('Stok girişi eklendi!')
        form.reset()
        setOpen(false)
      } catch (err: any) {
        // toast.error(err?.message || 'Bir hata oluştu.')
        toast.error('Bir hata oluştu.')
        console.error(err?.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <PlusIcon className="h-4 w-4" />
          Stok Girişi Ekle
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stok Girişi Ekle</DialogTitle>
          <DialogDescription>
            Satın alma tarihini, adet ve birim fiyatı girin.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4">
          <fieldset disabled={isPending} className="space-y-4 group">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Satın Alma Tarihi
              </span>
              <DatePicker
                name="entryDate"
                defaultValue={today}
                max={today}
                required
              />
            </label>

            {/* Quantity */}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/90">Adet</span>
              <input
                name="quantity"
                type="number"
                min="1"
                step="1"
                placeholder="Örn: 10"
                required
                className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </label>

            {/* Unit price */}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/90">Birim Fiyat (₺)</span>
              <input
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={defaultUnitPrice ?? ''}
                placeholder="Örn: 125.00"
                required
                className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
              {defaultUnitPrice && (
                <p className="text-xs text-muted-foreground">
                  Varsayılan: tonerin birim fiyatı (₺{defaultUnitPrice})
                </p>
              )}
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70 transition-colors"
              >
                {isPending && <Loader2Icon className="h-4 w-4 animate-spin" />}
                {isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  )
}
