import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CartridgeListContainer } from '@/features/cartridges/components/CartridgeListContainer'
import { CartridgeCardSkeletonList } from '@/features/cartridges/components/CartridgeCardSkeleton'
import { getPage } from '@/features/cartridges/repo'
import { SearchForm } from '@/components/ui/search-form'
import { Pagination } from '@/components/ui/pagination'
import { AddEntityDialog } from '@/components/ui/add-entity-dialog'
import { addCartridge } from '@/features/cartridges/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'

export default async function CartridgesPage({
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
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Kartuşlar</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Stok, fiyat ve giriş çıkış geçmişini yönetin.</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <SearchForm placeholder="Kartuş adına göre ara..." />
            <div className="flex items-center gap-2">
              <Link href="/cartridges/bulk-entry">
                <Button variant="outline" className="h-11 rounded-xl border-border bg-card/60 gap-2 font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all">
                  <PlusIcon className="h-4 w-4" />
                  Toplu Giriş
                </Button>
              </Link>
              <AddEntityDialog
                title="Yeni Kartuş Ekle"
                description="Sisteme yeni bir kartuş modeli ekleyin."
                triggerLabel="Yeni Ekle"
                action={addCartridge}
                fields={[
                  { name: 'image', label: 'Kartuş Görseli', type: 'image', required: false },
                  { name: 'name', label: 'Kartuş Adı', placeholder: 'Örn: HP 83A', required: true },
                  { name: 'stock', label: 'Stok Adedi', type: 'number', placeholder: '0', required: true },
                  { name: 'currentPrice', label: 'Birim Fiyatı (₺)', type: 'number', step: '0.01', placeholder: '0.00', required: false }
                ]}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Toplam: <span className="font-semibold text-foreground">{metadata.total}</span> kartuş
          </p>
        </div>
      </div>

      <Suspense fallback={<CartridgeCardSkeletonList count={20} />}>
        <CartridgeListContainer query={query} page={page} />
      </Suspense>

      <Pagination currentPage={metadata.page} totalPages={metadata.totalPages} />
    </div>
  )
}
