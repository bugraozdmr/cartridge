'use client'

import { deletePrinter, updatePrinter } from '../actions'
import Link from 'next/link'
import { PrinterIcon, EyeIcon, Edit2Icon, Trash2Icon } from 'lucide-react'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { AddEntityDialog } from '@/components/ui/add-entity-dialog'
import Image from 'next/image'

interface PrinterListProps {
  items: any[]
}

export default function PrinterList({ items }: PrinterListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 py-12">
        <PrinterIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">Henüz yazıcı eklenmemiş.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {items.map((printer) => (
          <div key={printer.id} className="group relative rounded-lg border border-border bg-card/60 hover:bg-card/80 transition-colors p-4">
            <div className="flex items-start gap-4">
              {printer.imageUrl ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  <Image src={printer.imageUrl} alt={printer.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400/20 to-fuchsia-400/10 text-foreground">
                  <PrinterIcon className="h-5 w-5" />
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground truncate">{printer.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {printer.cartridges?.length || 0} bağlı kartuş
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/printers/${printer.id}`}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                  title="Görüntüle"
                >
                  <EyeIcon className="h-4 w-4" />
                </Link>
                
                <AddEntityDialog 
                  title="Yazıcıyı Düzenle"
                  description="Yazıcı bilgilerini güncelleyin."
                  triggerIcon={<Edit2Icon className="h-4 w-4" />}
                  triggerClassName="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                  action={updatePrinter}
                  defaultValues={printer}
                  fields={[
                    { name: 'image', label: 'Yazıcı Görseli', type: 'image', required: false },
                    { name: 'name', label: 'Yazıcı Adı', placeholder: 'Örn: HP LaserJet Pro M102a', required: true }
                  ]}
                />

                <DeleteDialog
                  title="Yazıcıyı Sil"
                  description={`"${printer.name}" isimli yazıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                  action={async () => {
                    const formData = new FormData()
                    formData.append('id', printer.id)
                    await deletePrinter(formData)
                  }}
                >
                  <button
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors"
                    title="Sil"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </DeleteDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
