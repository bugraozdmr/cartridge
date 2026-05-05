import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, PrinterIcon, BoxIcon } from 'lucide-react'
import { getById } from '@/features/printers/detail-repo'
import { CartridgeSelector } from '@/features/printers/components/CartridgeSelector'
import { PrinterDetailActions } from '@/features/printers/components/PrinterDetailActions'
import { ImagePreview } from '@/components/ui/image-preview'

export default async function PrinterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const printer = await getById(id)
  if (!printer) notFound()

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
              {printer.cartridges.length} uyumlu kartuş
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
          <h2 className="text-lg font-semibold text-foreground">Uyumlu Kartuşlar</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Arama kutusuna yazarak kartuş ekleyin, X ile kaldırın, ardından kaydedin.
          </p>
        </div>
        <CartridgeSelector
          printerId={printer.id}
          initialCartridges={printer.cartridges.map(c => ({
            id: c.id,
            name: c.name,
            imageUrl: c.imageUrl ?? null,
          }))}
        />
      </div>

      {/* Current cartridges list */}
      {printer.cartridges.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Mevcut Uyumlu Kartuşlar</h2>
          <div className="grid gap-3">
            {printer.cartridges.map(cartridge => (
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
                  {cartridge.currentPrice && (
                    <p className="text-xs text-muted-foreground">₺{cartridge.currentPrice}</p>
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
