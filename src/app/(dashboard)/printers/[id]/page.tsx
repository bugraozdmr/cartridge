import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, PrinterIcon, BoxIcon } from 'lucide-react'
import { getById } from '@/features/printers/detail-repo'
import { addPhysicalPrinter } from '@/features/printers/detail-actions'
import { getAll as getDepartments } from '@/features/departments/repo'
import { CartridgeSelector } from '@/features/printers/components/CartridgeSelector'
import { PrinterDetailActions } from '@/features/printers/components/PrinterDetailActions'
import { PrinterInstanceDetailDialog } from '@/features/printers/components/PrinterInstanceDetailDialog'
import type { PrinterInstanceDetail } from '@/features/printers/components/PrinterInstanceDetailDialog'
import { ImagePreview } from '@/components/ui/image-preview'
import { AddEntityDialog } from '@/components/ui/add-entity-dialog'

type CompactDepartment = { id: string; name: string }
type CompactCartridge = {
  id: string
  name: string
  imageUrl: string | null
  currentPrice?: { toString(): string } | string | number | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const printer = await getById(id)

  return {
    title: printer ? `${printer.name} | Yazıcı` : 'Yazıcı',
  }
}

export default async function PrinterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const printer = await getById(id)
  if (!printer) notFound()

  const departments = (await getDepartments()) as CompactDepartment[]
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }))
  const cartridges = printer.cartridges as CompactCartridge[]
  const physicalPrinters = (printer.printers ?? []) as PrinterInstanceDetail[]

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

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          <ImagePreview
            src={printer.imageUrl}
            alt={printer.name}
            fallbackIcon={<PrinterIcon className="h-10 w-10 text-violet-500" />}
            sizeClassName="h-24 w-24 rounded-2xl"
            previewClassName="max-w-2xl"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">{printer.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {printer.cartridges.length} uyumlu toner
            </p>
          </div>
          <PrinterDetailActions printer={{
            id: printer.id,
            name: printer.name,
            imageUrl: printer.imageUrl ?? null,
          }} />
        </div>
      </div>

      {/* Compatible cartridges manager */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Uyumlu Tonerler</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Arama kutusuna yazarak toner ekleyin, X ile kaldırın, ardından kaydedin.
          </p>
        </div>
        <CartridgeSelector
          printerId={printer.id}
          initialCartridges={cartridges.map((c) => ({
            id: c.id,
            name: c.name,
            imageUrl: c.imageUrl ?? null,
          }))}
        />
      </div>

      {/* Real printers (instances) */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Yazıcılar</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Bu model altında kayıtlı fiziksel yazıcıları yönetin.</p>
          </div>
          <AddEntityDialog
            title="Yeni Yazıcı Ekle"
            description="Bu yazıcı modeline bağlı gerçek bir yazıcı ekleyin."
            triggerLabel="Yeni Yazıcı"
            action={addPhysicalPrinter}
            fields={[
              { name: 'printerModelId', label: 'printerModelId', type: 'hidden', value: printer.id },
              { name: 'serialNumber', label: 'Seri Numarası', placeholder: 'Opsiyonel', required: false },
              { name: 'assignedTo', label: 'Atanan Kişi / Yer', placeholder: 'Opsiyonel', required: false },
              { name: 'ipAddress', label: 'IP Adresi', placeholder: 'Opsiyonel', required: false },
              { name: 'notes', label: 'Notlar', placeholder: 'Opsiyonel', type: 'textarea', required: false },
              { name: 'departmentId', label: 'Departman', type: 'select', required: true, options: departmentOptions }
            ]}
          />
        </div>

        {physicalPrinters.length > 0 ? (
          <div className="grid gap-3">
            {physicalPrinters.map((p) => (
              <PrinterInstanceDetailDialog
                key={p.id}
                printerModelId={printer.id}
                printerName={printer.name}
                printer={p}
                departments={departmentOptions}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Bu modele ait kayıtlı fiziksel yazıcı yok.</p>
        )}
      </div>

      {/* Current cartridges list */}
      {cartridges.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Mevcut Uyumlu Tonerler</h2>
          <div className="grid gap-3">
            {cartridges.map((cartridge) => (
              <div
                key={cartridge.id}
                className="group flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3 hover:bg-muted/60 transition-colors"
              >
                <ImagePreview
                  src={cartridge.imageUrl}
                  alt={cartridge.name}
                  fallbackIcon={<BoxIcon className="h-5 w-5 text-emerald-500" />}
                  sizeClassName="h-10 w-10 rounded-lg"
                  previewClassName="max-w-xl"
                />
                <Link href={`/cartridges/${cartridge.id}`} className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{cartridge.name}</p>
                  {cartridge.currentPrice != null && (
                    <p className="text-xs text-muted-foreground">
                      ₺{typeof cartridge.currentPrice === 'object' ? cartridge.currentPrice.toString() : cartridge.currentPrice}
                    </p>
                  )}
                </Link>
                <Link href={`/cartridges/${cartridge.id}`} className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  Detay →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
