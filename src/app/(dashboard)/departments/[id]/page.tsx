import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeftIcon,
  BuildingIcon,
  BoxIcon,
  CalendarIcon,
  UserIcon,
  StickyNoteIcon,
  HashIcon,
  ReceiptIcon,
  TrendingDownIcon,
} from 'lucide-react'
import { getDepartmentById } from '@/features/departments/detail-repo'
import { DepartmentDetailActions } from '@/features/departments/components/DepartmentDetailActions'

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dept = await getDepartmentById(id)
  if (!dept) notFound()

  const totalQuantity = dept.stockOuts.reduce((s, o) => s + o.quantity, 0)

  // Group by cartridge for summary
  const cartridgeSummary = dept.stockOuts.reduce<
    Record<string, { name: string; imageUrl: string | null; total: number; cartridgeId: string }>
  >((acc, o) => {
    if (!acc[o.cartridge.id]) {
      acc[o.cartridge.id] = { name: o.cartridge.name, imageUrl: o.cartridge.imageUrl, total: 0, cartridgeId: o.cartridge.id }
    }
    acc[o.cartridge.id].total += o.quantity
    return acc
  }, {})
  const summaryItems = Object.values(cartridgeSummary).sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/departments"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Departmanlara Dön
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/30 to-blue-400/10 border border-border">
            <BuildingIcon className="h-8 w-8 text-sky-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{dept.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {dept.stockOuts.length} stok çıkışı · toplam {totalQuantity} adet
            </p>
          </div>
          <DepartmentDetailActions department={{ id: dept.id, name: dept.name }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-400/20">
              <TrendingDownIcon className="h-4 w-4 text-rose-500" />
            </div>
            <span className="text-xs text-muted-foreground">Toplam Çıkış</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{dept.stockOuts.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">işlem</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/20">
              <HashIcon className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-xs text-muted-foreground">Alınan Adet</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalQuantity}</p>
          <p className="text-xs text-muted-foreground mt-0.5">adet kartuş</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/20">
              <BoxIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-xs text-muted-foreground">Farklı Kartuş</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{summaryItems.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">çeşit</p>
        </div>
      </div>

      {/* Cartridge summary */}
      {summaryItems.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Kartuş Özeti</h2>
          <div className="grid gap-3">
            {summaryItems.map(item => (
              <Link
                key={item.cartridgeId}
                href={`/cartridges/${item.cartridgeId}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3 hover:bg-muted/60 transition-colors"
              >
                {item.imageUrl ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="40px" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/30 to-teal-400/10">
                    <BoxIcon className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
                <span className="flex-1 text-sm font-medium text-foreground truncate">{item.name}</span>
                <span className="shrink-0 rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-500">
                  {item.total} adet
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Detay →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Full stock-out log */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Stok Çıkış Geçmişi</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Tüm alım kayıtları, en yeniden eskiye sıralı.</p>
        </div>

        {dept.stockOuts.length > 0 ? (
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
                    <span className="flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5" />Teslim Alan</span>
                  </th>
                  <th className="pb-3 pl-4 text-left">
                    <span className="flex items-center gap-1.5"><StickyNoteIcon className="h-3.5 w-3.5" />Not</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dept.stockOuts.map(out => (
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
              {dept.stockOuts.length > 1 && (
                <tfoot>
                  <tr className="border-t border-border font-semibold text-foreground">
                    <td className="pt-3 pr-4 text-xs text-muted-foreground uppercase" colSpan={2}>Toplam</td>
                    <td className="pt-3 px-4 text-right">
                      <span className="inline-flex items-center rounded-lg bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500">
                        {totalQuantity} adet
                      </span>
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10">
            <ReceiptIcon className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Henüz stok çıkışı yok.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Kartuş detay sayfasından bu departmana stok çıkışı ekleyebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
