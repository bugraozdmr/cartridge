import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PrinterListContainer } from '@/features/printers/components/PrinterListContainer'
import { PrinterCardSkeletonList } from '@/features/printers/components/PrinterCardSkeleton'
import { getPage } from '@/features/printers/repo'
import { SearchForm } from '@/components/ui/search-form'
import { Pagination } from '@/components/ui/pagination'
import { AddEntityDialog } from '@/components/ui/add-entity-dialog'
import { addPrinter } from '@/features/printers/actions'
export const metadata = {
  title: 'Yazıcılar',
}

export default async function PrintersPage({
  searchParams: searchParamsPromise
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const searchParams = await searchParamsPromise
  const query = typeof searchParams.q === 'string' ? searchParams.q : searchParams.q?.[0] || ''
  const page = Number(typeof searchParams.page === 'string' ? searchParams.page : searchParams.page?.[0] || 1) || 1

  // Fetch metadata for header and pagination
  const metadata = await getPage({ query, page, pageSize: 20 })

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Yazıcılar</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Bütün yazıcıları yönet ve bağlı tonerleri görüntüle.</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <SearchForm placeholder="Yazıcı adına göre ara..." />
            <AddEntityDialog
              title="Yeni Yazıcı Ekle"
              description="Sisteme yeni bir yazıcı modeli ekleyin."
              triggerLabel="Yeni Ekle"
              action={addPrinter}
              fields={[
                { name: 'image', label: 'Yazıcı Görseli', type: 'image', required: false },
                { name: 'name', label: 'Yazıcı Adı', placeholder: 'Örn: HP LaserJet Pro M102a', required: true }
              ]}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Toplam: <span className="font-semibold text-foreground">{metadata.total}</span> yazıcı
          </p>
        </div>
      </div>

      <Suspense fallback={<PrinterCardSkeletonList count={20} />}>
        <PrinterListContainer query={query} page={page} />
      </Suspense>

      <Pagination currentPage={metadata.page} totalPages={metadata.totalPages} />
    </div>
  )
}
