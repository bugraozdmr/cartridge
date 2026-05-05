'use client'

import { useTransition, useRef } from 'react'
import { BuildingIcon, Trash2Icon, Loader2Icon, Edit2Icon, SendIcon, EyeIcon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { addDepartment, deleteDepartment, updateDepartment } from '../actions'
import { AddEntityDialog } from '@/components/ui/add-entity-dialog'

interface Department {
  id: string
  name: string
  _count: { stockOuts: number }
}

export function DepartmentsClient({ departments }: { departments: Department[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const formData = new FormData(form)
    startTransition(async () => {
      try {
        await addDepartment(formData)
        toast.success('Departman eklendi!')
        form.reset()
      } catch (error) {
        const err = error as { message?: string }
        toast.error(err?.message || 'Bir hata oluştu.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* ── Add form ─────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Yeni Departman Ekle</h2>
        <form ref={formRef} onSubmit={handleAdd} className="relative flex items-center">
          <input
            name="name"
            type="text"
            required
            disabled={isPending}
            placeholder="Örn: Muhasebe, İnsan Kaynakları..."
            className="h-12 w-full rounded-2xl border border-border bg-muted/40 py-2 pl-4 pr-14 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending}
            title="Ekle"
            className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
          >
            {isPending
              ? <Loader2Icon className="h-4 w-4 animate-spin" />
              : <SendIcon className="h-4 w-4 -ml-0.5" />
            }
          </button>
        </form>
      </div>

      {/* ── Department list ───────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {departments.length > 0 ? (
          <ul className="divide-y divide-border">
            {departments.map((dept) => (
              <li
                key={dept.id}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/25 to-blue-400/10">
                  <BuildingIcon className="h-4 w-4 text-sky-500" />
                </div>

                {/* Info — no link here, just text */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground leading-tight">{dept.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dept._count.stockOuts} stok çıkışı
                  </p>
                </div>

                {/* Actions: görüntüle · düzenle · sil */}
                <div className="flex shrink-0 items-center gap-0.5">
                  {/* Detail */}
                  <Link
                    href={`/departments/${dept.id}`}
                    title="Görüntüle"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>

                  {/* Edit */}
                  <AddEntityDialog
                    title="Departmanı Düzenle"
                    description="Departman adını güncelleyin."
                    triggerIcon={<Edit2Icon className="h-4 w-4" />}
                    triggerClassName="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    action={updateDepartment}
                    defaultValues={dept}
                    fields={[{ name: 'name', label: 'Departman Adı', placeholder: 'Örn: Muhasebe', required: true }]}
                  />

                  {/* Delete */}
                  <DeleteDialog
                    title="Departmanı Sil"
                    description={`"${dept.name}" departmanını silmek istediğinize emin misiniz? ${
                      dept._count.stockOuts > 0
                        ? `Bu departmana ait ${dept._count.stockOuts} stok çıkışı var, silinemez.`
                        : 'Bu işlem geri alınamaz.'
                    }`}
                    action={async () => {
                      const fd = new FormData()
                      fd.append('id', dept.id)
                      await deleteDepartment(fd)
                    }}
                  >
                    <button
                      title="Sil"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </DeleteDialog>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40">
              <BuildingIcon className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-foreground">Henüz departman eklenmemiş.</p>
            <p className="mt-2 max-w-[200px] text-xs text-muted-foreground">
              Yukarıdaki formdan hemen bir departman oluşturabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}