'use client'

import { Edit2Icon } from 'lucide-react'
import { AddEntityDialog } from '@/components/ui/add-entity-dialog'
import { updatePrinter } from '@/features/printers/actions'

interface PrinterDetailActionsProps {
  printer: {
    id: string
    name: string
    imageUrl: string | null
  }
}

export function PrinterDetailActions({ printer }: PrinterDetailActionsProps) {
  return (
    <AddEntityDialog
      title="Yazıcıyı Düzenle"
      description="Yazıcı bilgilerini güncelleyin."
      triggerIcon={<Edit2Icon className="h-4 w-4" />}
      triggerClassName="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/60 px-2.5 py-2 md:px-4 text-sm text-foreground hover:bg-muted transition-colors"
      triggerLabel={<span className="hidden md:inline">Düzenle</span>}
      action={updatePrinter}
      defaultValues={printer}
      fields={[
        { name: 'image', label: 'Yazıcı Görseli', type: 'image', required: false },
        { name: 'name', label: 'Yazıcı Adı', placeholder: 'Örn: HP LaserJet Pro M102a', required: true },
      ]}
    />
  )
}
