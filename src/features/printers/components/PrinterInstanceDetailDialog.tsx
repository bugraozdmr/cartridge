'use client'

import type React from 'react'
import { useMemo } from 'react'
import Link from 'next/link'
import { EyeIcon, Edit2Icon, Trash2Icon, MapPinIcon, HashIcon, UserIcon, StickyNoteIcon, Building2Icon, PrinterIcon, ArrowRightIcon } from 'lucide-react'
import { AddEntityDialog } from '@/components/ui/add-entity-dialog'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { updatePhysicalPrinter, deletePhysicalPrinter } from '@/features/printers/detail-actions'

export type PrinterInstanceDetail = {
  id: string
  serialNumber: string | null
  assignedTo: string | null
  ipAddress: string | null
  notes: string | null
  departmentId: string
  departmentName: string | null
  printerModelId: string
  printerModelName?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export type DepartmentOption = { value: string; label: string }

interface PrinterInstanceDetailDialogProps {
  printerModelId: string
  printerName: string
  printer: PrinterInstanceDetail
  departments: DepartmentOption[]
  showActions?: boolean
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-sm text-foreground break-words">{value}</p>
    </div>
  )
}

export function PrinterInstanceDetailDialog({ printerModelId, printerName, printer, departments, showActions = true }: PrinterInstanceDetailDialogProps) {
  const defaultValues = useMemo(() => ({
    id: printer.id,
    printerModelId,
    serialNumber: printer.serialNumber ?? '',
    assignedTo: printer.assignedTo ?? '',
    ipAddress: printer.ipAddress ?? '',
    notes: printer.notes ?? '',
    departmentId: printer.departmentId,
  }), [printer, printerModelId])

  const formattedCreatedAt = new Date(printer.createdAt).toLocaleString('tr-TR')
  const formattedUpdatedAt = new Date(printer.updatedAt).toLocaleString('tr-TR')

  return (
    <Dialog>
      <div className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center">
        <DialogTrigger asChild>
          <button className="group flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{printerName || 'Yazıcı'}</p>
              <p className="text-xs text-muted-foreground">
                Seri No: {printer.serialNumber || 'Yok'} • {printer.departmentName ?? 'Departman yok'} • {printer.ipAddress ?? 'IP yok'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground transition-colors group-hover:text-primary">
              <EyeIcon className="h-4 w-4" />
            </div>
          </button>
        </DialogTrigger>

        {showActions && (
          <div className="flex items-center justify-end gap-2 self-end sm:self-auto">
            <AddEntityDialog
              title="Fiziksel Yazıcıyı Düzenle"
              description="Bu yazıcıya ait fiziksel cihaz bilgilerini güncelleyin."
              triggerIcon={<Edit2Icon className="h-4 w-4" />}
              triggerClassName="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/15 text-cyan-300 hover:bg-cyan-400/25"
              contentClassName="max-w-2xl"
              action={updatePhysicalPrinter}
              defaultValues={defaultValues}
              fields={[
                { name: 'id', label: 'id', type: 'hidden', value: printer.id },
                { name: 'printerModelId', label: 'printerModelId', type: 'hidden', value: printerModelId },
                { name: 'serialNumber', label: 'Seri Numarası', placeholder: 'Opsiyonel', required: false },
                { name: 'assignedTo', label: 'Atanan Kişi / Yer', placeholder: 'Opsiyonel', required: false },
                { name: 'ipAddress', label: 'IP Adresi', placeholder: 'Opsiyonel', required: false },
                { name: 'notes', label: 'Genel Notlar', placeholder: 'Yazıcıya ait genel notlar...', type: 'textarea', required: false },
                { name: 'departmentId', label: 'Departman', type: 'select', required: true, options: departments },
                {
                  name: 'movementNotes',
                  label: '📍 Taşıma Notu (Geçmişe Kaydedilir)',
                  placeholder: 'Bu taşıma işlemi için not ekleyin... (Örn: Birim değişikliği, Personel değişimi vb.)',
                  type: 'textarea',
                  required: false,
                  condition: (vals) => vals.departmentId !== printer.departmentId
                }
              ]}
            />

            <DeleteDialog
              title="Fiziksel Yazıcıyı Sil"
              description="Bu fiziksel yazıcı kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
              action={async () => {
                const formData = new FormData()
                formData.append('id', printer.id)
                formData.append('printerModelId', printerModelId)
                await deletePhysicalPrinter(formData)
              }}
            >
              <Button type="button" variant="destructive" size="icon" className="rounded-full shadow-lg shadow-rose-600/20">
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </DeleteDialog>
          </div>
        )}
      </div>

      <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[calc(100vh-1rem)] sm:max-h-[88vh]">
        <div className="max-h-[calc(100vh-1rem)] overflow-y-auto px-4 py-4 sm:max-h-[88vh] sm:px-7 sm:py-7">
          <DialogHeader className="pr-16">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 border border-cyan-400/10">
                <PrinterIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-2xl">
                  {printerName || 'Yazıcı'}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Seri No: {printer.serialNumber || 'Yok'} • Fiziksel yazıcı bilgileri.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <DetailRow icon={<HashIcon className="h-3.5 w-3.5" />} label="Seri Numarası" value={printer.serialNumber || '-'} />
            <DetailRow icon={<UserIcon className="h-3.5 w-3.5" />} label="Atanan Kişi / Yer" value={printer.assignedTo || '-'} />
            <DetailRow icon={<MapPinIcon className="h-3.5 w-3.5" />} label="IP Adresi" value={printer.ipAddress || '-'} />
            <DetailRow icon={<Building2Icon className="h-3.5 w-3.5" />} label="Departman" value={printer.departmentName || '-'} />
            <DetailRow icon={<StickyNoteIcon className="h-3.5 w-3.5" />} label="Notlar" value={printer.notes || '-'} />
          </div>

          {/*<div className="mt-4 grid gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground md:grid-cols-2">
            <div>Oluşturulma: <span className="text-foreground">{formattedCreatedAt}</span></div>
            <div>Güncellenme: <span className="text-foreground">{formattedUpdatedAt}</span></div>
          </div>*/}

          {/* Link to full detail page */}
          <div className="mt-6 pt-6 border-t border-border">
            <Link href={`/printers/instances/${printer.id}`}>
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-4 py-2.5 text-sm font-medium text-violet-600 hover:from-violet-500/15 hover:to-fuchsia-500/15 transition-colors dark:text-violet-400">
                Detay
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
