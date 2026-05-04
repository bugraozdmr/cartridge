import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftIcon, BoxIcon, PrinterIcon, PackageIcon, CalendarIcon, TrendingUpIcon } from 'lucide-react'
import { getById } from '@/features/cartridges/detail-repo'

export default async function CartridgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cartridge = await getById(id)
  if (!cartridge) notFound()

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/cartridges"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kartuşlara Dön
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          {cartridge.imageUrl ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border">
              <Image
                src={cartridge.imageUrl}
                alt={cartridge.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/30 to-teal-400/10 border border-border">
              <BoxIcon className="h-10 w-10 text-emerald-500" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">{cartridge.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {cartridge.printerModels.length} uyumlu yazıcı
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/20">
              <PackageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm text-muted-foreground">Stok</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{cartridge.stock}</p>
          <p className="text-xs text-muted-foreground mt-0.5">adet</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20">
              <TrendingUpIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm text-muted-foreground">Birim Fiyat</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {cartridge.currentPrice ? `₺${cartridge.currentPrice}` : '—'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/20">
              <CalendarIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-sm text-muted-foreground">Eklenme</span>
          </div>
          <p className="text-base font-semibold text-foreground">
            {new Date(cartridge.createdAt).toLocaleDateString('tr-TR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Compatible printers */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Uyumlu Yazıcılar</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Bu kartuşla kullanılabilen yazıcı modelleri.</p>
        </div>

        {cartridge.printerModels.length > 0 ? (
          <div className="grid gap-3">
            {cartridge.printerModels.map(printer => (
              <Link
                key={printer.id}
                href={`/printers/${printer.id}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3 hover:bg-muted/60 transition-colors"
              >
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
            <p className="text-xs text-muted-foreground mt-1">
              Yazıcı detay sayfasından uyumluluk ekleyebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
