'use client'

import Link from 'next/link'
import { BoxIcon, EyeIcon, Edit2Icon, Trash2Icon } from 'lucide-react'
import { deleteCartridge, updateCartridge } from '../actions'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { AddEntityDialog } from '@/components/ui/add-entity-dialog'
import Image from 'next/image'

interface CartridgeListProps {
  items: any[]
}

export default function CartridgeList({ items }: CartridgeListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 py-12">
        <BoxIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">Henüz kartuş eklenmemiş.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {items.map((cartridge) => (
          <div key={cartridge.id} className="group relative rounded-lg border border-border bg-card/60 hover:bg-card/80 transition-colors p-4">
            <div className="flex items-start gap-4">
              {cartridge.imageUrl ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  <Image src={cartridge.imageUrl} alt={cartridge.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/20 to-teal-400/10 text-foreground">
                  <BoxIcon className="h-5 w-5" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground truncate">{cartridge.name}</h3>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Stok: <span className="font-semibold text-foreground">{cartridge.stock || 0}</span> adet</span>
                  <span>Fiyat: <span className="font-semibold text-foreground">{cartridge.currentPrice ? `₺${parseFloat(cartridge.currentPrice).toFixed(2)}` : '-'}</span></span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/cartridges/${cartridge.id}`}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                  title="Görüntüle"
                >
                  <EyeIcon className="h-4 w-4" />
                </Link>
                
                <AddEntityDialog 
                  title="Kartuşu Düzenle"
                  description="Kartuş bilgilerini güncelleyin."
                  triggerIcon={<Edit2Icon className="h-4 w-4" />}
                  triggerClassName="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                  action={updateCartridge}
                  defaultValues={cartridge}
                  fields={[
                    { name: 'image', label: 'Kartuş Görseli', type: 'image', required: false },
                    { name: 'name', label: 'Kartuş Adı', placeholder: 'Örn: HP 83A', required: true },
                    { name: 'stock', label: 'Stok Adedi', type: 'number', placeholder: '0', required: true },
                    { name: 'currentPrice', label: 'Birim Fiyatı (₺)', type: 'number', step: '0.01', placeholder: '0.00', required: false }
                  ]}
                />

                <DeleteDialog
                  title="Kartuşu Sil"
                  description={`"${cartridge.name}" isimli kartuşu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                  action={async () => {
                    const formData = new FormData()
                    formData.append('id', cartridge.id)
                    await deleteCartridge(formData)
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
