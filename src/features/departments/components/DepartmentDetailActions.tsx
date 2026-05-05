'use client'

import { Edit2Icon } from 'lucide-react'
import { AddEntityDialog } from '@/components/ui/add-entity-dialog'
import { updateDepartment } from '../actions'

interface DepartmentDetailActionsProps {
  department: { id: string; name: string }
}

export function DepartmentDetailActions({ department }: DepartmentDetailActionsProps) {
  return (
    <AddEntityDialog
      title="Departmanı Düzenle"
      description="Departman adını güncelleyin."
      triggerIcon={<Edit2Icon className="h-4 w-4" />}
      triggerLabel={<span className="hidden md:inline">Düzenle</span>}
      triggerClassName="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/60 px-2.5 py-2 md:px-4 text-sm text-foreground hover:bg-muted transition-colors shrink-0"
      action={updateDepartment}
      defaultValues={department}
      fields={[{ name: 'name', label: 'Departman Adı', placeholder: 'Örn: Muhasebe', required: true }]}
    />
  )
}
