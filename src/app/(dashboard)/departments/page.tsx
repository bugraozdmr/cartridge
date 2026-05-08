import { getAll } from '@/features/departments/repo'
import { DepartmentsClient } from '@/features/departments/components/DepartmentsClient'
export const metadata = {
  title: 'Departmanlar',
}

export default async function DepartmentsPage() {
  const departments = await getAll()

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Departmanlar</h1>
          <p className="text-sm text-muted-foreground font-medium italic">
            Kurumunuzdaki birimleri yönetin. Stok çıkışlarında departman seçimi yapılır.
          </p>
        </div>
        <span className="shrink-0 rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-sm text-muted-foreground">
          {departments.length} departman
        </span>
      </div>

      <DepartmentsClient departments={departments} />
    </div>
  )
}
