'use client'

import { Edit2Icon } from 'lucide-react'
import { AddEntityDialog } from '@/components/ui/add-entity-dialog'
import { updateCartridge } from '@/features/cartridges/actions'

interface CartridgeDetailActionsProps {
  cartridge: {
    id: string
    name: string
    stock: number
    currentPrice: string | null
    imageUrl: string | null
  }
}

export function CartridgeDetailActions({ cartridge }: CartridgeDetailActionsProps) {
  return (
    <AddEntityDialog
      title="Toneri Düzenle"
      description="Toner bilgilerini güncelleyin."
      triggerIcon={<Edit2Icon className="h-4 w-4" />}
      triggerClassName="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/60 px-2.5 py-2 md:px-4 text-sm text-foreground hover:bg-muted transition-colors"
      triggerLabel={<span className="hidden md:inline">Düzenle</span>}
      action={updateCartridge}
      defaultValues={cartridge}
      fields={[
        { name: 'image', label: 'Toner Görseli', type: 'image', required: false },
        { name: 'name', label: 'Toner Adı', placeholder: 'Örn: HP 83A', required: true },
        { name: 'stock', label: 'Stok Adedi', type: 'number', placeholder: '0', required: true },
        { name: 'currentPrice', label: 'Birim Fiyatı (₺)', type: 'number', step: '0.01', placeholder: '0.00', required: false },
      ]}
    />
  )
}
