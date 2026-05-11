import Link from 'next/link'
import { HomeIcon, PrinterIcon, BoxIcon, ArrowLeftIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="relative select-none mb-8">
        <span className="text-[120px] sm:text-[160px] font-black leading-none text-foreground/5 select-none pointer-events-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-400/30 to-fuchsia-400/10 border border-border shadow-[0_0_40px_rgba(167,139,250,0.15)]">
              <PrinterIcon className="h-9 w-9 text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
        Sayfa Bulunamadı
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base max-w-sm mb-10">
        Aradığınız sayfa mevcut değil ya da taşınmış olabilir. Aşağıdan devam edebilirsiniz.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <HomeIcon className="h-4 w-4" />
          Ana Sayfa
        </Link>
        <Link
          href="/printers"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <PrinterIcon className="h-4 w-4" />
          Yazıcılar
        </Link>
        <Link
          href="/cartridges"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <BoxIcon className="h-4 w-4" />
          Tonerler
        </Link>
      </div>

      <div className="mt-16 flex items-center gap-2 opacity-30">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-full bg-foreground"
            style={{ width: i === 2 ? 8 : 4, height: i === 2 ? 8 : 4 }}
          />
        ))}
      </div>
    </div>
  )
}
