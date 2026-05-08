'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BoxIcon, CalendarIcon, UserIcon, StickyNoteIcon, HashIcon, PrinterIcon
} from 'lucide-react'
import { LocalPagination } from '@/components/ui/local-pagination'

interface StockOut {
  id: string
  issueDate: Date
  quantity: number
  cartridge: { id: string; name: string; imageUrl: string | null }
  receiverName: string | null
  notes: string | null
  printer?: { id: string; serialNumber?: string | null; inventoryNumber?: string | null } | null
}

interface StockOutTableProps {
  stockOuts: StockOut[]
  totalQuantity: number
}

const PAGE_SIZE = 10

export function StockOutTable({ stockOuts, totalQuantity }: StockOutTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(stockOuts.length / PAGE_SIZE)
  const paginatedOuts = stockOuts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  return (
    <>
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[600px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
              <th className="pb-3 pr-4 text-left">
                <span className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" />Tarih</span>
              </th>
              <th className="pb-3 px-4 text-left">
                <span className="flex items-center gap-1.5"><BoxIcon className="h-3.5 w-3.5" />Kartuş</span>
              </th>
              <th className="pb-3 px-4 text-right">
                <span className="flex justify-end items-center gap-1.5"><HashIcon className="h-3.5 w-3.5" />Adet</span>
              </th>
              <th className="pb-3 px-4 text-left">
                <span className="flex items-center gap-1.5"><PrinterIcon className="h-3.5 w-3.5" />Yazıcı</span>
              </th>
              <th className="pb-3 px-4 text-left">
                <span className="flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5" />Teslim Alan</span>
              </th>
              <th className="pb-3 pl-4 text-left">
                <span className="flex items-center gap-1.5"><StickyNoteIcon className="h-3.5 w-3.5" />Not</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedOuts.map(out => (
              <tr key={out.id} className="group">
                <td className="py-3.5 pr-4 font-medium text-foreground whitespace-nowrap">
                  {new Date(out.issueDate).toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </td>
                <td className="py-3.5 px-4">
                  <Link
                    href={`/cartridges/${out.cartridge.id}`}
                    className="flex items-center gap-2.5 hover:text-primary transition-colors"
                  >
                    {out.cartridge.imageUrl ? (
                      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-border">
                        <Image src={out.cartridge.imageUrl} alt={out.cartridge.name} fill className="object-cover" sizes="28px" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-400/20">
                        <BoxIcon className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                    )}
                    <span className="text-sm font-medium">{out.cartridge.name}</span>
                  </Link>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center rounded-lg bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500">
                    {out.quantity} adet
                  </span>
                </td>
                <td className="py-3.5 px-4 text-foreground/80">
                  {out.printer ? (
                    <Link href={`/printers/instances/${out.printer.id}`} className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                      <PrinterIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {out.printer.serialNumber || out.printer.inventoryNumber || 'Yazıcı'}
                      </span>
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-foreground/80">
                  {out.receiverName ? (
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {out.receiverName}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-3.5 pl-4 max-w-[200px]">
                  {out.notes ? (
                    <span className="flex items-start gap-1.5 text-xs text-foreground/70">
                      <StickyNoteIcon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="line-clamp-2">{out.notes}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {paginatedOuts.length > 1 && (
            <tfoot>
              <tr className="border-t border-border font-semibold text-foreground">
                <td className="pt-3 pr-4 text-xs text-muted-foreground uppercase" colSpan={2}>Bu Sayfa Toplam</td>
                <td className="pt-3 px-4 text-right">
                  <span className="inline-flex items-center rounded-lg bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500">
                    {paginatedOuts.reduce((s, o) => s + o.quantity, 0)} adet
                  </span>
                </td>
                <td colSpan={2} />
              </tr>
              {totalPages > 1 && (
                <tr className="border-t border-border/50 font-bold text-foreground bg-muted/10">
                  <td className="pt-3 pr-4 text-xs text-muted-foreground uppercase" colSpan={2}>Genel Toplam</td>
                  <td className="pt-3 px-4 text-right">
                    <span className="inline-flex items-center rounded-lg bg-rose-500/20 px-2.5 py-0.5 text-xs font-black text-rose-600 dark:text-rose-400">
                      {totalQuantity} adet
                    </span>
                  </td>
                  <td colSpan={2} />
                </tr>
              )}
            </tfoot>
          )}
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center pt-4 border-t border-border mt-4">
          <LocalPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </>
  )
}
