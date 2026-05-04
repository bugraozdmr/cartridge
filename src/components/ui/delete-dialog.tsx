"use client"

import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2Icon, AlertTriangleIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

type DeleteDialogProps = {
  title: string
  description: string
  action: () => Promise<void>
  children: React.ReactElement
}

export function DeleteDialog({ title, description, action, children }: DeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      await action()
      toast.success('Başarıyla silindi!')
      setOpen(false)
    } catch (error) {
      console.error(error)
      toast.error('Silinirken bir hata oluştu.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <AlertTriangleIcon className="h-5 w-5" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-3">{description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-3 pt-6">
          <Button
            type="button"
            disabled={isPending}
            onClick={() => setOpen(false)}
            className="rounded-xl border border-border bg-card px-5 text-foreground hover:bg-muted"
          >
            İptal
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="rounded-xl bg-rose-600 px-5 text-white hover:bg-rose-700 disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-rose-600/20"
          >
            {isPending && <Loader2Icon className="h-4 w-4 animate-spin" />}
            {isPending ? 'Siliniyor...' : 'Evet, Sil'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
