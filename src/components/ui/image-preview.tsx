"use client"

import * as React from 'react'
import Image from 'next/image'
import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'

type ImagePreviewProps = {
  src?: string | null
  alt: string
  fallbackIcon: React.ReactNode
  sizeClassName: string
  previewClassName?: string
}

export function ImagePreview({ src, alt, fallbackIcon, sizeClassName, previewClassName }: ImagePreviewProps) {
  if (!src) {
    return (
      <div className={cn('relative shrink-0 overflow-hidden border border-border bg-background shadow-sm', sizeClassName)}>
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/80 to-muted/40">
          {fallbackIcon}
        </div>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`${alt} önizlemesini aç`}
          className={cn(
            'group relative shrink-0 overflow-hidden border border-border bg-background shadow-sm transition duration-200 hover:scale-[1.02] hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            sizeClassName,
          )}
        >
          <Image src={src} alt={alt} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </DialogTrigger>
      <DialogContent className={cn('max-w-5xl p-0 overflow-hidden rounded-[2rem] border-border bg-card', previewClassName)}>
        <div className="border-b border-border/60 bg-card/80 px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Görsel Önizleme</p>
          <p className="mt-1 text-sm font-medium text-foreground truncate">{alt}</p>
        </div>

        <div className="bg-gradient-to-b from-background via-background to-muted/10 p-4 sm:p-6">
          <div className="relative max-h-[75vh] min-h-[280px] w-full overflow-hidden rounded-3xl border border-border/70 bg-black/15">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain p-2 sm:p-4"
              sizes="(max-width: 768px) 92vw, 80vw"
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Yakınlaştırılmış önizleme</p>
            <DialogClose
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              <XIcon className="h-3.5 w-3.5" />
              Kapat
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}