'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeftIcon, PrinterIcon, BoxIcon, CalendarIcon, UserIcon,
  NetworkIcon, ClipboardIcon, ReceiptIcon, ArrowLeftRightIcon, HistoryIcon, MapPinIcon
} from 'lucide-react'
import { LocalPagination } from '@/components/ui/local-pagination'

interface PrinterInstance {
  id: string
  serialNumber: string | null
  assignedTo: string | null
  ipAddress: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  printerModel: {
    id: string
    name: string
    imageUrl: string | null
  }
  department: {
    id: string
    name: string
  } | null
  stockOuts: {
    id: string
    issueDate: Date
    quantity: number
    receiverName: string | null
    notes: string | null
    cartridge: {
      id: string
      name: string
      imageUrl: string | null
      currentPrice: string | null
    }
    department: {
      id: string
      name: string
    }
  }[]
  movements: {
    id: string
    movedAt: Date
    fromDepartment: { id: string; name: string } | null
    toDepartment: { id: string; name: string }
    assignedTo: string | null
    notes: string | null
  }[]
}

type DateRangePreset = 'all' | '7days' | '30days' | '3months' | 'prevMonth' | 'month'

const PAGE_SIZE = 10

interface ClientProps {
  printer: PrinterInstance
}

export function PrinterInstanceDetailClient({ printer }: ClientProps) {
  const [outPage, setOutPage] = useState(1)
  const [outDatePreset, setOutDatePreset] = useState<DateRangePreset>('all')

  const getDateRange = (preset: DateRangePreset) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (preset) {
      case '7days': {
        const from = new Date(today)
        from.setDate(from.getDate() - 7)
        return { from, to: today }
      }
      case '30days': {
        const from = new Date(today)
        from.setDate(from.getDate() - 30)
        return { from, to: today }
      }
      case '3months': {
        const from = new Date(today)
        from.setMonth(from.getMonth() - 3)
        return { from, to: today }
      }
      case 'prevMonth': {
        const from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const to = new Date(today.getFullYear(), today.getMonth(), 0)
        return { from, to }
      }
      case 'month': {
        const from = new Date(today.getFullYear(), today.getMonth(), 1)
        const to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return { from, to }
      }
      default:
        return { from: null, to: null }
    }
  }

  const filteredStockOuts = useMemo(() => {
    const range = getDateRange(outDatePreset)
    if (!range.from || !range.to) return printer.stockOuts
    return printer.stockOuts.filter(o => {
      const d = new Date(o.issueDate)
      return d >= range.from! && d <= range.to!
    })
  }, [printer.stockOuts, outDatePreset])

  const totalOut = filteredStockOuts.reduce((s, o) => s + o.quantity, 0)
  const totalOutPages = Math.ceil(filteredStockOuts.length / PAGE_SIZE)
  const paginatedOuts = filteredStockOuts.slice(
    (outPage - 1) * PAGE_SIZE,
    outPage * PAGE_SIZE
  )

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/printers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Yazıcılara Dön
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          {printer.printerModel.imageUrl ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border">
              <Image src={printer.printerModel.imageUrl} alt={printer.printerModel.name} fill className="object-cover" sizes="96px" />
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400/30 to-fuchsia-400/10 border border-border">
              <PrinterIcon className="h-10 w-10 text-violet-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">{printer.printerModel.name}</h1>
            <div className="mt-2 text-sm text-muted-foreground space-y-1">
              {printer.serialNumber && <div>S/N: <span className="font-mono text-foreground">{printer.serialNumber}</span></div>}
              {printer.ipAddress && <div>IP: <span className="font-mono text-foreground">{printer.ipAddress}</span></div>}
            </div>
          </div>
          {printer.department && (
            <Link href={`/departments/${printer.department.id}`}>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-400/10 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-400/20 transition-colors cursor-pointer">
                <BoxIcon className="h-3.5 w-3.5" />
                {printer.department.name}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/20">
              <PrinterIcon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xs text-muted-foreground">Model</span>
          </div>
          <p className="text-sm font-semibold text-foreground truncate">{printer.printerModel.name}</p>
        </div>

        {printer.serialNumber && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-400/20">
                <NetworkIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs text-muted-foreground">S/N</span>
            </div>
            <p className="text-sm font-semibold text-foreground font-mono">{printer.serialNumber}</p>
          </div>
        )}

        {printer.ipAddress && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/20">
                <ClipboardIcon className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-xs text-muted-foreground">IP</span>
            </div>
            <p className="text-sm font-semibold text-foreground font-mono">{printer.ipAddress}</p>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-400/20">
              <ReceiptIcon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-xs text-muted-foreground">Kaç Kez Kullanıldı</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{printer.stockOuts.length}</p>
        </div>
      </div>

      {/* ── MOVEMENT HISTORY ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/20">
            <ArrowLeftRightIcon className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Yazıcı Hareket Geçmişi</h2>
            <p className="text-xs text-muted-foreground">Departman ve yer değişiklikleri</p>
          </div>
        </div>

        {printer.movements.length > 0 ? (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 text-left">Tarih</th>
                  <th className="pb-3 text-left">Nereden</th>
                  <th className="pb-3 text-left">Nereye</th>
                  <th className="pb-3 text-left">Atanan Kişi / Yer</th>
                  <th className="pb-3 text-left">Notlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {printer.movements.map(m => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 font-medium text-foreground">
                      {new Date(m.movedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-2">
                      {m.fromDepartment ? (
                        <Link href={`/departments/${m.fromDepartment.id}`}>
                          <span className="text-muted-foreground hover:text-blue-500 transition-colors">
                            {m.fromDepartment.name}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-xs italic text-muted-foreground/60">İlk Kayıt</span>
                      )}
                    </td>
                    <td className="py-3.5 px-2">
                      <Link href={`/departments/${m.toDepartment.id}`}>
                        <span className="font-medium text-foreground hover:text-blue-500 transition-colors">
                          {m.toDepartment.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-2">
                      {m.assignedTo ? (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <UserIcon className="h-3 w-3 text-muted-foreground" />
                          {m.assignedTo}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-muted-foreground max-w-[200px] truncate">
                      {m.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8">
            <HistoryIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Henüz hareket kaydı bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* ── STOCK OUT HISTORY ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-400/20">
              <ReceiptIcon className="h-4 w-4 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Toner Kullanım Geçmişi</h2>
              <p className="text-xs text-muted-foreground">Bu yazıcıya takılan tonerler</p>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        {printer.stockOuts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            <button
              onClick={() => { setOutDatePreset('all'); setOutPage(1) }}
              className={`px-2.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                outDatePreset === 'all'
                  ? 'bg-rose-500 text-white'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => { setOutDatePreset('7days'); setOutPage(1) }}
              className={`px-2.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                outDatePreset === '7days'
                  ? 'bg-rose-500 text-white'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
              }`}
            >
              7 Gün
            </button>
            <button
              onClick={() => { setOutDatePreset('30days'); setOutPage(1) }}
              className={`px-2.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                outDatePreset === '30days'
                  ? 'bg-rose-500 text-white'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
              }`}
            >
              30 Gün
            </button>
            <button
              onClick={() => { setOutDatePreset('3months'); setOutPage(1) }}
              className={`px-2.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                outDatePreset === '3months'
                  ? 'bg-rose-500 text-white'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
              }`}
            >
              3 Ay
            </button>
            <button
              onClick={() => { setOutDatePreset('prevMonth'); setOutPage(1) }}
              className={`px-2.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                outDatePreset === 'prevMonth'
                  ? 'bg-rose-500 text-white'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
              }`}
            >
              Geçen Ay
            </button>
            <button
              onClick={() => { setOutDatePreset('month'); setOutPage(1) }}
              className={`px-2.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                outDatePreset === 'month'
                  ? 'bg-rose-500 text-white'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
              }`}
            >
              Bu Ay
            </button>
          </div>
        )}

        {printer.stockOuts.length > 0 ? (
          <>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 text-left">Tarih</th>
                    <th className="pb-3 text-left">Toner</th>
                    <th className="pb-3 text-left">Departman</th>
                    <th className="pb-3 text-right">Adet</th>
                    <th className="pb-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedOuts.map(out => (
                    <tr key={out.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 font-medium text-foreground">
                        {new Date(out.issueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link href={`/cartridges/${out.cartridge.id}`}>
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-400/20 transition-colors cursor-pointer">
                            {out.cartridge.name}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link href={`/departments/${out.department.id}`}>
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-400/10 px-2.5 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-400/20 transition-colors cursor-pointer">
                            {out.department.name}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-rose-500">
                        {out.quantity} <span className="text-xs font-normal text-muted-foreground">adet</span>
                      </td>
                      <td />
                    </tr>
                  ))}
                </tbody>
                {paginatedOuts.length > 1 && (
                  <tfoot>
                    <tr className="border-t border-border font-semibold">
                      <td className="pt-3 pr-4 text-xs text-muted-foreground uppercase" colSpan={3}>Bu Sayfa Toplam</td>
                      <td className="pt-3 px-4 text-right text-rose-500">
                        {paginatedOuts.reduce((s, o) => s + o.quantity, 0)} adet
                      </td>
                      <td />
                    </tr>
                    {totalOutPages > 1 && (
                      <tr className="border-t border-border/50 font-bold text-foreground bg-rose-500/5">
                        <td className="pt-3 pr-4 text-xs text-muted-foreground uppercase" colSpan={3}>Genel Toplam</td>
                        <td className="pt-3 px-4 text-right text-rose-600 dark:text-rose-400">
                          {totalOut} adet
                        </td>
                        <td />
                      </tr>
                    )}
                  </tfoot>
                )}
              </table>
            </div>
            {totalOutPages > 1 && (
              <div className="flex justify-center pt-2">
                <LocalPagination
                  currentPage={outPage}
                  totalPages={totalOutPages}
                  onPageChange={setOutPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8">
            <ReceiptIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Bu yazıcıya henüz toner takılmamış.</p>
          </div>
        )}
      </div>
    </div>
  )
}
