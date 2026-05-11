import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeftIcon,
  BuildingIcon,
  BoxIcon,
  HashIcon,
  ReceiptIcon,
  TrendingDownIcon,
  PrinterIcon,
} from 'lucide-react'
import { getDepartmentById } from '@/features/departments/detail-repo'
import { getAll as getAllDepartments } from '@/features/departments/repo'
import { DepartmentDetailActions } from '@/features/departments/components/DepartmentDetailActions'
import { PrinterInstanceDetailDialog } from '@/features/printers/components/PrinterInstanceDetailDialog'
import type { PrinterInstanceDetail } from '@/features/printers/components/PrinterInstanceDetailDialog'
import { StockOutTable } from '@/features/departments/components/StockOutTable'
import { AddEntityDialog } from '@/components/ui/add-entity-dialog'
import { addPhysicalPrinter } from '@/features/printers/detail-actions'
import { getAllCompact as getAllPrinterModels } from '@/features/printers/repo'

type DeptStockOut = {
  quantity: number
  cartridge: { id: string; name: string; imageUrl: string | null }
}

type CompactPrinterModel = { id: string; name: string }

type CompactDepartment = { id: string; name: string }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dept = await getDepartmentById(id)

  return {
    title: dept ? `${dept.name} | Departman` : 'Departman',
  }
}

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dept = await getDepartmentById(id)
  if (!dept) notFound()
  const allDepartments = (await getAllDepartments()) as CompactDepartment[]
  const printerModels = (await getAllPrinterModels()) as CompactPrinterModel[]
  const printers = dept.printers as PrinterInstanceDetail[]

  const stockOuts = dept.stockOuts as DeptStockOut[]
  const totalQuantity = stockOuts.reduce((sum, o) => sum + o.quantity, 0)
  const totalPrinters = dept.printers.length

  // Group by cartridge for summary
  const cartridgeSummary = stockOuts.reduce<
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
              {dept.stockOuts.length} stok çıkışı · toplam {totalQuantity} adet · {totalPrinters} fiziksel yazıcı
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
          <p className="text-xs text-muted-foreground mt-0.5">adet toner</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/20">
              <BoxIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-xs text-muted-foreground">Farklı Toner</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{summaryItems.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">çeşit</p>
        </div>
      </div>

      {/* Printers */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Bağlı Yazıcılar</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Bu departmana kayıtlı fiziksel yazıcılar.</p>
          </div>

          <AddEntityDialog
            title="Yeni Yazıcı Ekle"
            description="Bu departmana bağlı gerçek bir yazıcı ekleyin."
            triggerLabel="Yazıcı Tanımla"
            action={addPhysicalPrinter}
            fields={[
              {
                name: 'printerModelId',
                label: 'Yazıcı Modeli',
                type: 'select',
                required: true,
                options: printerModels.map((p) => ({ value: p.id, label: p.name })),
              },
              { name: 'serialNumber', label: 'Seri Numarası', placeholder: 'Opsiyonel', required: false },
              { name: 'assignedTo', label: 'Atanan Kişi / Yer', placeholder: 'Opsiyonel', required: false },
              { name: 'ipAddress', label: 'IP Adresi', placeholder: 'Opsiyonel', required: false },
              { name: 'notes', label: 'Notlar', placeholder: 'Opsiyonel', type: 'textarea', required: false },
              {
                name: 'departmentId',
                label: 'Departman',
                type: 'select',
                required: true,
                value: dept.id,
                options: [{ value: dept.id, label: dept.name }],
              },
            ]}
          />
        </div>

        {printers.length > 0 ? (
          <div className="grid gap-3">
            {printers.map((printer) => (
              <PrinterInstanceDetailDialog
                key={printer.id}
                printerModelId={printer.printerModelId}
                printerName={printer.printerModelName || 'Fiziksel Yazıcı'}
                printer={{
                  ...printer,
                  departmentName: dept.name,
                }}
                departments={allDepartments.map((d) => ({ value: d.id, label: d.name }))}
                showActions
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10">
            <PrinterIcon className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Bu departmana bağlı yazıcı yok.</p>
          </div>
        )}
      </div>

      {/* Cartridge summary */}
      {summaryItems.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Toner Özeti</h2>
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
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
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
          <StockOutTable stockOuts={dept.stockOuts} totalQuantity={totalQuantity} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10">
            <ReceiptIcon className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Henüz stok çıkışı yok.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Toner detay sayfasından bu departmana stok çıkışı ekleyebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
