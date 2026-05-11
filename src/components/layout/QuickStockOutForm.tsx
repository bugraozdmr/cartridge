"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DatePicker } from "@/components/ui/date-picker"
import { SelectCustom } from "@/components/ui/select-custom"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { addStockOut } from "@/features/cartridges/stock-actions"

interface CartridgeItem { id: string; name: string; stock: number }
interface DepartmentItem { id: string; name: string }

interface QuickStockOutFormProps {
  onDone?: () => void
  initialDepartments?: DepartmentItem[]
}

export function QuickStockOutForm({ onDone, initialDepartments = [] }: QuickStockOutFormProps) {
  const [cartridges, setCartridges] = useState<CartridgeItem[]>([])
  const [departments, setDepartments] = useState<DepartmentItem[]>(initialDepartments)
  const [printers, setPrinters] = useState<{ id: string; label: string }[]>([])

  const [cartridgeId, setCartridgeId] = useState<string>("")
  const [departmentId, setDepartmentId] = useState<string>("")
  const [printerId, setPrinterId] = useState<string>("")
  const [quantity, setQuantity] = useState<number | "">("")
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [receiverName, setReceiverName] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [loadingPrinters, setLoadingPrinters] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const cRes = await fetch("/api/cartridges/compact")

        if (cancelled) return

        if (cRes.ok) {
          const cData = await cRes.json()
          setCartridges(cData || [])
        }
      } catch {
        // ignore cartridge load failures; form can still render departments from props
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!departmentId) {
      setPrinters([])
      setPrinterId("")
      return
    }

    let cancelled = false
    setLoadingPrinters(true)

    fetch(`/api/printers?departmentId=${departmentId}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setPrinters(data || [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingPrinters(false)
      })

    return () => {
      cancelled = true
    }
  }, [departmentId])

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    if (!cartridgeId) return toast.error("Kartuş seçin")
    if (!departmentId) return toast.error("Departman seçin")

    const qty = Number(quantity)
    if (!qty || qty < 1) return toast.error("Geçerli adet girin")

    const selected = cartridges.find(c => c.id === cartridgeId)
    if (selected && selected.stock < qty) return toast.error(`Yetersiz stok. Mevcut: ${selected.stock}`)

    const fd = new FormData()
    fd.append("cartridgeId", cartridgeId)
    fd.append("departmentId", departmentId)
    if (printerId) fd.append("printerId", printerId)
    fd.append("quantity", String(qty))
    fd.append("issueDate", issueDate)
    if (receiverName) fd.append("receiverName", receiverName)
    if (notes) fd.append("notes", notes)

    try {
      setIsPending(true)
      await addStockOut(fd)
      toast.success("Stok çıkışı kaydedildi!")

      setCartridges(prev => prev.map(c => (c.id === cartridgeId ? { ...c, stock: Math.max(0, c.stock - qty) } : c)))

      setCartridgeId("")
      setDepartmentId("")
      setPrinterId("")
      setQuantity("")
      setReceiverName("")
      setNotes("")

      try {
        router.refresh()
      } catch {
        // no-op
      }

      try {
        const res = await fetch("/api/cartridges/compact")
        if (res.ok) {
          const data = await res.json()
          setCartridges(data || [])
        }
      } catch {
        // no-op
      }

      if (onDone) onDone()
    } catch (err: any) {
      toast.error(err?.message || "Bir hata oluştu")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Kartuş</label>
        <SelectCustom
          name="cartridgeId"
          options={cartridges.map(c => ({ value: c.id, label: `${c.name} (${c.stock})` }))}
          value={cartridgeId}
          onChange={setCartridgeId}
          placeholder="Kartuş seçin..."
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Departman</label>
        <SelectCustom
          name="departmentId"
          options={departments.map(d => ({ value: d.id, label: d.name }))}
          value={departmentId}
          onChange={setDepartmentId}
          placeholder={departments.length ? "Departman seçin..." : "Departman bulunamadı"}
        />
      </div>

      {departmentId && (
        <div>
          <label className="text-xs text-muted-foreground">Yazıcı (isteğe bağlı)</label>
          <SelectCustom
            name="printerId"
            options={printers.map(p => ({ value: p.id, label: p.label }))}
            value={printerId}
            onChange={setPrinterId}
            placeholder={loadingPrinters ? "Yükleniyor..." : printers.length ? "Yazıcı seçin (isteğe bağlı)..." : "Seçilen departmana ait yazıcı yok"}
            required={false}
          />
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground">Adet</label>
        <input
          type="number"
          min={1}
          value={quantity as any}
          onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="Miktar"
          className="mt-1 h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm text-foreground"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Tarih</label>
        <DatePicker name="issueDate" value={issueDate} onChange={(v: string) => setIssueDate(v)} />
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Teslim Alan (isteğe bağlı)</label>
        <input
          value={receiverName}
          onChange={(e) => setReceiverName(e.target.value)}
          placeholder="Örn: Ahmet Yılmaz"
          className="mt-1 h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm text-foreground"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Not (isteğe bağlı)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full resize-none rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={() => { if (onDone) onDone() }}>
          Kapat
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  )
}
