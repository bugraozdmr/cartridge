import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeftIcon,
  DownloadIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  WalletIcon,
  LayersIcon,
  SearchIcon,
  CalendarIcon,
  FileTextIcon
} from "lucide-react"
import Link from 'next/link'
import { getReportsData } from "@/features/reports/repo"
import { ReportCharts } from "@/features/reports/components/ReportCharts"
import { ReportFilters } from "@/features/reports/components/ReportFilters"
import { startOfDay, endOfDay, parseISO, format, subDays } from "date-fns"
import { tr } from 'date-fns/locale'
import { cn } from "@/lib/utils"
import { ImagePreview } from "@/components/ui/image-preview"
import { Pagination } from "@/components/ui/pagination"
import { ExportButton } from "@/features/reports/components/ExportButton"

const PAGE_SIZE = 10

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ start?: string; end?: string; pageIn?: string; pageOut?: string }>
}) {
  const params = await searchParams
  const startDate = params.start ? parseISO(params.start) : startOfDay(subDays(new Date(), 30))
  const endDate = params.end ? parseISO(params.end) : endOfDay(new Date())
  const pageIn = Number(params.pageIn) || 1
  const pageOut = Number(params.pageOut) || 1

  const fullData = await getReportsData({ start: startDate, end: endDate })

  // Paginate Entries
  const totalInPages = Math.ceil(fullData.stockEntries.length / PAGE_SIZE)
  const paginatedEntries = fullData.stockEntries.slice((pageIn - 1) * PAGE_SIZE, pageIn * PAGE_SIZE)

  // Paginate Outs
  const totalOutPages = Math.ceil(fullData.stockOuts.length / PAGE_SIZE)
  const paginatedOuts = fullData.stockOuts.slice((pageOut - 1) * PAGE_SIZE, pageOut * PAGE_SIZE)

  const summaryCards = [
    {
      label: "Toplam Satın Alım",
      value: fullData.summary.totalSpend.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
      icon: WalletIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "Dönemlik bütçe kullanımı"
    },
    {
      label: "Giriş Miktarı",
      value: `${fullData.summary.totalUnitsPurchased} Adet`,
      icon: ShoppingBagIcon,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      description: "Yeni eklenen stoklar"
    },
    {
      label: "Çıkış Miktarı",
      value: `${fullData.summary.totalUnitsIssued} Adet`,
      icon: TrendingUpIcon,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      description: "Departmanlara giden"
    },
    {
      label: "İşlem Sayısı",
      value: `${fullData.stockEntries.length + fullData.stockOuts.length}`,
      icon: FileTextIcon,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      description: "Toplam kayıt sayısı"
    }
  ]

  return (
    <div className="space-y-6 pb-20 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-border/50 pb-6 sm:gap-6 sm:pb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 min-w-0">
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent sm:text-4xl">Rapor</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Envanter maliyetleri ve kurum içi sirkülasyon takibi.</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          <ReportFilters />
          <div className="hidden h-10 w-px bg-border/50 mx-2 lg:block" />
          <ExportButton
            data={fullData}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-border bg-card/60 shadow-sm rounded-[1.5rem] overflow-hidden group hover:bg-card transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-6 sm:h-12 sm:w-12", card.bg)}>
                  <card.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", card.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{card.label}</p>
                  <p className="mt-0.5 text-xl font-bold text-foreground sm:text-2xl">{card.value}</p>
                  <p className="text-[10px] text-muted-foreground/60 font-medium">{card.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <ReportCharts
        spendByCartridge={fullData.analytics.spendByCartridge}
        consumptionByDept={fullData.analytics.consumptionByDept}
      />

      {/* Tables Section */}
      <div className="grid gap-6 sm:gap-8">
        {/* Purchases Table (Financial Focus) */}
        <Card className="border-border bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="flex flex-col gap-3 border-b border-border/50 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
            <div className="min-w-0">
              <CardTitle>Stok Girişleri</CardTitle>
              <CardDescription>Bütçe bazlı alım hareketleri.</CardDescription>
            </div>
            <Badge variant="soft" className="self-start bg-emerald-500/10 text-emerald-500 sm:self-auto">Maliyetli Kayıtlar</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="block sm:hidden px-4 py-4">
                {paginatedEntries.map((e) => (
                  <div key={e.id} className="mb-3 rounded-2xl border border-border bg-muted/20 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <ImagePreview
                          src={e.imageUrl}
                          alt={e.name}
                          fallbackIcon={<LayersIcon className="h-4 w-4 text-muted-foreground" />}
                          sizeClassName="h-10 w-10 rounded-lg"
                          previewClassName="max-w-3xl"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{e.name}</p>
                          <p className="text-xs text-muted-foreground">{format(e.date, 'dd MMMM yyyy', { locale: tr })}</p>
                          <p className="text-xs text-muted-foreground">{e.quantity} Adet • {e.unitPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-500">{e.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/50">
                      <th className="px-4 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] sm:px-8">Tarih</th>
                      <th className="px-4 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] sm:px-8">Ürün</th>
                      <th className="px-4 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] sm:px-8">Miktar</th>
                      <th className="px-4 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] sm:px-8">Birim Fiyat</th>
                      <th className="px-4 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] text-right sm:px-8">Toplam Ödeme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginatedEntries.map((e) => (
                      <tr key={e.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4 text-muted-foreground sm:px-8">{format(e.date, 'dd MMMM yyyy', { locale: tr })}</td>
                        <td className="px-4 py-4 sm:px-8">
                          <div className="flex items-center gap-3">
                            <ImagePreview
                              src={e.imageUrl}
                              alt={e.name}
                              fallbackIcon={<LayersIcon className="h-4 w-4 text-muted-foreground" />}
                              sizeClassName="h-8 w-8 rounded-lg"
                              previewClassName="max-w-3xl"
                            />
                            <span className="min-w-0 font-semibold text-foreground truncate">{e.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium text-foreground sm:px-8">{e.quantity} Adet</td>
                        <td className="px-4 py-4 text-muted-foreground sm:px-8">{e.unitPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                        <td className="px-4 py-4 text-right font-bold text-emerald-500 sm:px-8">
                          {e.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </td>
                      </tr>
                    ))}
                    {paginatedEntries.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground italic sm:px-8">Bu dönemde satın alım bulunmuyor.</td>
                      </tr>
                    )}
                  </tbody>
                  {fullData.stockEntries.length > 0 && (
                    <tfoot className="bg-muted/10 border-t-2 border-border/50 font-medium">
                      <tr>
                        <td colSpan={2} className="px-4 py-5 font-bold text-foreground sm:px-8 italic text-xs uppercase tracking-widest">Seçili Aralık Toplamı</td>
                        <td className="px-4 py-5 font-bold text-foreground sm:px-8">{fullData.summary.totalUnitsPurchased} Adet</td>
                        <td className="px-4 py-5"></td>
                        <td className="px-4 py-5 text-right font-black text-emerald-500 text-lg sm:px-8">
                          {fullData.summary.totalSpend.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
            {totalInPages > 1 && (
              <div className="border-t border-border/50 px-4 py-4 sm:px-8">
                <Pagination currentPage={pageIn} totalPages={totalInPages} paramName="pageIn" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consumption Table (Quantity Focus) */}
        <Card className="border-border bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="flex flex-col gap-3 border-b border-border/50 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
            <div className="min-w-0">
              <CardTitle>Stok Çıkışları</CardTitle>
              <CardDescription>Departmanlara yapılan iç transferler.</CardDescription>
            </div>
            <Badge variant="soft" className="self-start bg-rose-500/10 text-rose-500 sm:self-auto">Dahili Hareket</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="block sm:hidden px-4 py-4">
                {paginatedOuts.map((o) => (
                  <div key={o.id} className="mb-3 rounded-2xl border border-border bg-muted/20 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{o.cartridgeName}</p>
                        <p className="text-xs text-muted-foreground">{format(o.date, 'dd MMMM yyyy', { locale: tr })}</p>
                        <p className="text-xs text-muted-foreground">{o.departmentName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-rose-500">-{o.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/50">
                      <th className="px-4 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] sm:px-8">İşlem Tarihi</th>
                      <th className="px-4 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] sm:px-8">İlgili Departman</th>
                      <th className="px-4 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] sm:px-8">Verilen Ürün</th>
                      <th className="px-4 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] text-right sm:px-8">Miktar (Adet)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginatedOuts.map((o) => (
                      <tr key={o.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4 text-muted-foreground sm:px-8">{format(o.date, 'dd MMMM yyyy', { locale: tr })}</td>
                        <td className="px-4 py-4 sm:px-8">
                          <span className="inline-flex items-center rounded-lg bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground border border-border">
                            {o.departmentName}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium text-foreground sm:px-8">{o.cartridgeName}</td>
                        <td className="px-4 py-4 text-right sm:px-8">
                          <span className="font-bold text-lg text-rose-500">-{o.quantity}</span>
                        </td>
                      </tr>
                    ))}
                    {paginatedOuts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground italic sm:px-8">Bu dönemde tüketim bulunmuyor.</td>
                      </tr>
                    )}
                  </tbody>
                  {fullData.stockOuts.length > 0 && (
                    <tfoot className="bg-muted/10 border-t-2 border-border/50">
                      <tr>
                        <td colSpan={2} className="px-4 py-5 font-bold text-foreground sm:px-8 italic text-xs uppercase tracking-widest">Seçili Aralık Toplamı</td>
                        <td className="px-4 py-5 font-bold text-foreground sm:px-8">---</td>
                        <td className="px-4 py-5 text-right font-black text-rose-500 text-lg sm:px-8">
                          {fullData.summary.totalUnitsIssued} Adet
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
            {totalOutPages > 1 && (
              <div className="border-t border-border/50 px-4 py-4 sm:px-8">
                <Pagination currentPage={pageOut} totalPages={totalOutPages} paramName="pageOut" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
