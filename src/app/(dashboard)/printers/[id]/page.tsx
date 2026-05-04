import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftIcon, PrinterIcon, BoxIcon } from 'lucide-react'
import { getById } from '@/features/printers/detail-repo'
import { CartridgeSelector } from '@/features/printers/components/CartridgeSelector'

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
          {/* Image / placeholder */}
          {printer.imageUrl ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border">
              <Image
                src={printer.imageUrl}
                alt={printer.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400/30 to-fuchsia-400/10 border border-border">
              <PrinterIcon className="h-10 w-10 text-violet-500" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">{printer.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {printer.cartridges.length} uyumlu kartuş
            </p>
          </div>
        </div>
      </div>

      {/* Compatible cartridges manager */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Uyumlu Kartuşlar</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Bu yazıcıyla uyumlu kartuşları yönetin. Arama kutusuna yazarak kartuş ekleyin, X ile kaldırın.
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
              <Link
                key={cartridge.id}
                href={`/cartridges/${cartridge.id}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3 hover:bg-muted/60 transition-colors"
              >
                {cartridge.imageUrl ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border">
                    <Image src={cartridge.imageUrl} alt={cartridge.name} fill className="object-cover" sizes="40px" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/30 to-teal-400/10">
                    <BoxIcon className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{cartridge.name}</p>
                  {cartridge.currentPrice && (
                    <p className="text-xs text-muted-foreground">₺{cartridge.currentPrice}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  Detay →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
