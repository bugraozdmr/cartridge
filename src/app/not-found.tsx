import Link from 'next/link'
import { HomeIcon, PrinterIcon, BoxIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4 bg-background">
      <div className="relative select-none mb-8">
        <span className="text-[120px] sm:text-[180px] font-black leading-none text-foreground/[0.04] select-none pointer-events-none">
          404
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
        Sayfa Bulunamadı
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base max-w-sm mb-10 leading-relaxed">
        Aradığınız sayfa mevcut değil ya da taşınmış olabilir.
        Aşağıdan devam edebilirsiniz.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
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

      <div className="mt-16 flex items-center gap-2 opacity-20">
        {[4, 4, 8, 4, 4].map((size, i) => (
          <div
            key={i}
            className="rounded-full bg-foreground"
            style={{ width: size, height: size }}
          />
        ))}
      </div>
    </div>
  )
}
