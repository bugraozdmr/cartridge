'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { ArrowUpRightIcon, Loader2Icon, CalendarIcon, BuildingIcon, UserIcon, FileTextIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { SelectCustom } from '@/components/ui/select-custom'
import { addStockOut } from '../stock-actions'

interface Department { id: string; name: string }
interface Printer { id: string; serialNumber?: string | null; inventoryNumber?: string | null }

interface AddStockOutDialogProps {
  cartridgeId: string
  currentStock: number
  departments: Department[]
}

export function AddStockOutDialog({ cartridgeId, currentStock, departments }: AddStockOutDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedDeptId, setSelectedDeptId] = useState<string>('')
  const [printers, setPrinters] = useState<Printer[]>([])
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('')
  const [loadingPrinters, setLoadingPrinters] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!selectedDeptId) {
      setPrinters([])
      setSelectedPrinterId('')
      return
    }

    let cancelled = false
    async function load() {
      setLoadingPrinters(true)
      try {
        const res = await fetch(`/api/printers?departmentId=${selectedDeptId}`)
        if (!res.ok) throw new Error('Yazıcılar yüklenemedi')
        const data = await res.json()
        if (cancelled) return
        setPrinters(data)
        setSelectedPrinterId('')
      } catch (err) {
        console.error(err)
        toast.error('Yazıcılar yüklenirken hata oldu.')
      } finally {
        if (!cancelled) setLoadingPrinters(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedDeptId])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    const formData = new FormData(form)
    formData.append('cartridgeId', cartridgeId)

    startTransition(async () => {
      try {
        await addStockOut(formData)
        toast.success('Stok çıkışı kaydedildi!')
        form.reset()
        setOpen(false)
      } catch (err: any) {
        toast.error(err?.message || 'Bir hata oluştu.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={currentStock === 0}
          title={currentStock === 0 ? 'Stok yok' : undefined}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowUpRightIcon className="h-4 w-4" />
          Stok Çıkışı
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stok Çıkışı Kaydet</DialogTitle>
          <DialogDescription>
            Mevcut stok: <strong className="text-foreground">{currentStock} adet</strong>
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4">
          <fieldset disabled={isPending} className="space-y-4">
            {/* Date */}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Çıkış Tarihi
              </span>
              <DatePicker
                name="issueDate"
                defaultValue={today}
                max={today}
                required
              />
            </label>

            {/* Department */}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                Departman
              </span>
              {departments.length > 0 ? (
                <SelectCustom
                  name="departmentId"
                  options={departments.map(d => ({ value: d.id, label: d.name }))}
                  value={selectedDeptId}
                  onChange={setSelectedDeptId}
                  placeholder="Departman seçin..."
                  required
                />
              ) : (
                <p className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                  Henüz departman tanımlanmamış.{' '}
                  <a href="/departments" className="text-primary underline underline-offset-2">Ekleyin →</a>
                </p>
              )}
            </label>

            {/* Printer (dependent) */}
            {selectedDeptId && (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground/90">Yazıcı <span className="text-muted-foreground font-normal">(isteğe bağlı)</span></span>
                <SelectCustom
                  name="printerId"
                  options={printers.map(p => ({ value: p.id, label: p.serialNumber || p.inventoryNumber || p.id }))}
                  value={selectedPrinterId}
                  onChange={setSelectedPrinterId}
                  placeholder={loadingPrinters ? 'Yükleniyor...' : printers.length ? 'Yazıcı seçin (isteğe bağlı)...' : 'Seçilen departmana ait yazıcı yok'}
                  required={false}
                />
              </label>
            )}

            {/* Quantity */}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/90">Adet</span>
              <input
                name="quantity"
                type="number"
                min="1"
                max={currentStock}
                step="1"
                placeholder={`Maks: ${currentStock}`}
                required
                className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </label>

            {/* Receiver name */}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                Teslim Alan <span className="text-muted-foreground font-normal">(isteğe bağlı)</span>
              </span>
              <input
                name="receiverName"
                type="text"
                placeholder="Örn: Ahmet Yılmaz"
                className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </label>

            {/* Notes */}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                Not <span className="text-muted-foreground font-normal">(isteğe bağlı)</span>
              </span>
              <textarea
                name="notes"
                rows={2}
                placeholder="Ek açıklama..."
                className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
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
                disabled={isPending || departments.length === 0}
                className="flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-500/90 disabled:opacity-70 transition-colors"
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
