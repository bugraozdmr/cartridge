'use client'

import { useTransition } from 'react'
import { Trash2Icon, Loader2Icon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { deleteStockOut } from '../stock-actions'

export function DeleteStockOutButton({ id, cartridgeId }: { id: string; cartridgeId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <DeleteDialog
      title="Stok Çıkışını Sil"
      description="Bu stok çıkışını silmek istediğinize emin misiniz? Stok miktarı otomatik olarak güncellenir."
      action={() => new Promise<void>((resolve, reject) => {
        startTransition(async () => {
          try {
            const fd = new FormData()
            fd.append('id', id)
            fd.append('cartridgeId', cartridgeId)
            await deleteStockOut(fd)
            toast.success('Stok çıkışı silindi.')
            resolve()
          } catch {
            toast.error('Silinemedi.')
            reject()
          }
        })
      })}
    >
      <button
        disabled={isPending}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors disabled:opacity-50"
        title="Sil"
      >
        {isPending ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <Trash2Icon className="h-3.5 w-3.5" />}
      </button>
    </DeleteDialog>
  )
}
