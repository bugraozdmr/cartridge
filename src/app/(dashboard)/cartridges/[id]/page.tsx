import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeftIcon, BoxIcon, PrinterIcon, PackageIcon,
  CalendarIcon, TrendingUpIcon, ReceiptIcon, HashIcon,
  ArrowDownLeftIcon, ArrowUpRightIcon, BuildingIcon, UserIcon, StickyNoteIcon
} from 'lucide-react'
import { getById, getAllDepartments } from '@/features/cartridges/detail-repo'
import { AddStockEntryDialog } from '@/features/cartridges/components/AddStockEntryDialog'
import { DeleteStockEntryButton } from '@/features/cartridges/components/DeleteStockEntryButton'
import { AddStockOutDialog } from '@/features/cartridges/components/AddStockOutDialog'
import { DeleteStockOutButton } from '@/features/cartridges/components/DeleteStockOutButton'
import { CartridgeDetailActions } from '@/features/cartridges/components/CartridgeDetailActions'

export default async function CartridgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [cartridge, departments] = await Promise.all([getById(id), getAllDepartments()])
  if (!cartridge) notFound()

  const totalIn = cartridge.stockEntries.reduce((s, e) => s + e.quantity, 0)
  const totalOut = cartridge.stockOuts.reduce((s, o) => s + o.quantity, 0)

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/cartridges" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeftIcon className="h-4 w-4" />
        Kartuşlara Dön
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          {cartridge.imageUrl ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border">
              <Image src={cartridge.imageUrl} alt={cartridge.name} fill className="object-cover" sizes="96px" />
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/30 to-teal-400/10 border border-border">
              <BoxIcon className="h-10 w-10 text-emerald-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">{cartridge.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {cartridge.printerModels.length} uyumlu yazıcı · {cartridge.stockEntries.length} giriş · {cartridge.stockOuts.length} çıkış
            </p>
          </div>
          <CartridgeDetailActions cartridge={{
            id: cartridge.id,
            name: cartridge.name,
            stock: cartridge.stock,
            currentPrice: cartridge.currentPrice,
            imageUrl: cartridge.imageUrl ?? null,
          }} />
        </div>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/20">
              <PackageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs text-muted-foreground">Güncel Stok</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{cartridge.stock}</p>
          <p className="text-xs text-muted-foreground mt-0.5">adet</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/20">
              <ArrowDownLeftIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
            <span className="text-xs text-muted-foreground">Toplam Giriş</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalIn}</p>
          <p className="text-xs text-muted-foreground mt-0.5">adet alındı</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-400/20">
              <ArrowUpRightIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-xs text-muted-foreground">Toplam Çıkış</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalOut}</p>
          <p className="text-xs text-muted-foreground mt-0.5">adet dağıtıldı</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/20">
              <TrendingUpIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs text-muted-foreground">Birim Fiyat</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {cartridge.currentPrice ? `₺${cartridge.currentPrice}` : '—'}
          </p>
        </div>
      </div>

      {/* ── STOCK IN ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/20">
              <ArrowDownLeftIcon className="h-4 w-4 text-sky-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Stok Girişleri</h2>
              <p className="text-xs text-muted-foreground">Satın alınan kartuşlar</p>
            </div>
          </div>
          <AddStockEntryDialog cartridgeId={cartridge.id} defaultUnitPrice={cartridge.currentPrice} />
        </div>

        {cartridge.stockEntries.length > 0 ? (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 text-left">Tarih</th>
                  <th className="pb-3 text-right">Adet</th>
                  <th className="pb-3 text-right">Birim Fiyat</th>
                  <th className="pb-3 text-right">Toplam</th>
                  <th className="pb-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cartridge.stockEntries.map(entry => {
                  const up = entry.unitPrice ? parseFloat(entry.unitPrice) : 0
                  return (
                    <tr key={entry.id} className="group">
                      <td className="py-3.5 font-medium text-foreground">
                        {new Date(entry.entryDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 text-right text-foreground">{entry.quantity} <span className="text-xs text-muted-foreground">adet</span></td>
                      <td className="py-3.5 text-right">{entry.unitPrice ? `₺${entry.unitPrice}` : '—'}</td>
                      <td className="py-3.5 text-right font-semibold">{entry.unitPrice ? `₺${(up * entry.quantity).toFixed(2)}` : '—'}</td>
                      <td className="py-3.5 text-right">
                        <DeleteStockEntryButton id={entry.id} cartridgeId={cartridge.id} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {cartridge.stockEntries.length > 1 && (
                <tfoot>
                  <tr className="border-t border-border font-semibold text-foreground">
                    <td className="pt-3 text-xs text-muted-foreground uppercase">Toplam</td>
                    <td className="pt-3 text-right">{totalIn} adet</td>
                    <td />
                    <td className="pt-3 text-right">
                      ₺{cartridge.stockEntries.reduce((s, e) => s + (e.unitPrice ? parseFloat(e.unitPrice) * e.quantity : 0), 0).toFixed(2)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8">
            <ReceiptIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Henüz stok girişi yok.</p>
          </div>
        )}
      </div>

      {/* ── STOCK OUT ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-400/20">
              <ArrowUpRightIcon className="h-4 w-4 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Stok Çıkışları</h2>
              <p className="text-xs text-muted-foreground">Departmanlara dağıtılan kartuşlar</p>
            </div>
          </div>
          <AddStockOutDialog
            cartridgeId={cartridge.id}
            currentStock={cartridge.stock}
            departments={departments}
          />
        </div>

        {cartridge.stockOuts.length > 0 ? (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[400px] text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 pr-4 text-left">Tarih</th>
                  <th className="pb-3 px-4 text-left">Departman</th>
                  <th className="pb-3 px-4 text-right">Adet</th>
                  <th className="pb-3 pl-4 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cartridge.stockOuts.map(out => (
                  <tr key={out.id} className="group">
                    <td className="py-3.5 pr-4 font-medium text-foreground whitespace-nowrap">
                      {new Date(out.issueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-400/10 px-2.5 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400">
                        <BuildingIcon className="h-3 w-3" />
                        {out.department.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-rose-500">
                      -{out.quantity} <span className="text-xs font-normal text-muted-foreground">adet</span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <DeleteStockOutButton id={out.id} cartridgeId={cartridge.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
              {cartridge.stockOuts.length > 1 && (
                <tfoot>
                  <tr className="border-t border-border font-semibold">
                    <td className="pt-3 pr-4 text-xs text-muted-foreground uppercase" colSpan={2}>Toplam</td>
                    <td className="pt-3 px-4 text-right text-rose-500">-{totalOut} adet</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8">
            <BuildingIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Henüz stok çıkışı kaydı yok.</p>
          </div>
        )}
      </div>

      {/* ── Compatible printers ──────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Uyumlu Yazıcılar</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Bu kartuşla kullanılabilen yazıcı modelleri.</p>
        </div>
        {cartridge.printerModels.length > 0 ? (
          <div className="grid gap-3">
            {cartridge.printerModels.map(printer => (
              <Link key={printer.id} href={`/printers/${printer.id}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3 hover:bg-muted/60 transition-colors">
                {printer.imageUrl ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border">
                    <Image src={printer.imageUrl} alt={printer.name} fill className="object-cover" sizes="40px" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400/30 to-fuchsia-400/10">
                    <PrinterIcon className="h-5 w-5 text-violet-500" />
                  </div>
                )}
                <span className="flex-1 text-sm font-medium text-foreground truncate">{printer.name}</span>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Detay →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10">
            <PrinterIcon className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Bu kartuş henüz bir yazıcıya bağlı değil.</p>
          </div>
        )}
      </div>
    </div>
  )
}
