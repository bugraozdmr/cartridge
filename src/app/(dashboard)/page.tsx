import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRightIcon, CheckIcon, AlertCircleIcon, UsersIcon, PrinterIcon, TrendingUpIcon, BoxIcon, CalendarIcon, ActivityIcon, ShoppingBagIcon, AlertTriangleIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link'
import Image from 'next/image'
import { cn } from "@/lib/utils";
import { getDashboardData } from "@/features/dashboard/repo";
import { DashboardCharts } from "@/features/dashboard/components/DashboardCharts";
import { startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
export const metadata = {
    title: 'Genel Bakış',
}

export default async function DashboardPage({
    searchParams
}: {
    searchParams: Promise<{ start?: string; end?: string }>
}) {
    const params = await searchParams;
    const startDate = params.start ? parseISO(params.start) : startOfMonth(subMonths(new Date(), 5));
    const endDate = params.end ? parseISO(params.end) : endOfMonth(new Date());

    const data = await getDashboardData(startDate, endDate);

    const metrics = [
        {
            label: "Aktif Yazıcı",
            value: data.metrics.printerCount.toString(),
            delta: "Sistemde kayıtlı",
            tone: "text-cyan-400",
            icon: PrinterIcon,
        },
        {
            label: "Toplam Kartuş",
            value: data.metrics.totalCartridges.toString(),
            delta: "Farklı model sayısı",
            tone: "text-violet-400",
            icon: BoxIcon,
        },
        {
            label: "Kritik Stok",
            value: data.metrics.criticalCount.toString(),
            delta: "Acil dolum gerek",
            tone: data.metrics.criticalCount > 0 ? "text-rose-400" : "text-emerald-400",
            icon: AlertTriangleIcon,
        },
        {
            label: "Departman",
            value: data.metrics.departmentCount.toString(),
            delta: "Aktif birimler",
            tone: "text-emerald-400",
            icon: UsersIcon,
        },
    ];

    return (
        <div className="space-y-6 lg:space-y-8 pb-10">
            {/* ── Filters & Stats ────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Genel Görünüm</h1>
                    <p className="text-sm text-muted-foreground font-medium italic">Envanter ve stok hareketlerini izleyin.</p>
                </div>
                {/*<div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-sm">
                    <Link href="/?start=&end=" className={cn("px-4 py-1.5 text-xs font-medium rounded-xl transition-all", !params.start ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted")}>
                        Son 6 Ay
                    </Link>
                    <Link href={`/?start=${startOfMonth(new Date()).toISOString()}&end=${endOfMonth(new Date()).toISOString()}`} className={cn("px-4 py-1.5 text-xs font-medium rounded-xl transition-all", params.start?.startsWith(new Date().getFullYear().toString()) ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted")}>
                        Bu Ay
                    </Link>
                </div>*/}
            </div> 

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <Card key={metric.label} className="group border-border bg-card transition-all hover:bg-card hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 rounded-[1.5rem]">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{metric.label}</p>
                                        <p className="text-4xl font-bold text-foreground">{metric.value}</p>
                                        <p className={cn("text-xs font-medium", metric.tone)}>{metric.delta}</p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-foreground ring-1 ring-inset ring-border transition-transform group-hover:scale-110 group-hover:rotate-6">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>

            {/* ── Main Charts & Critical Items ─────────── */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recharts Bar Plots */}
                <DashboardCharts
                    stockInData={data.monthlyStockIn}
                    stockOutData={data.monthlyStockOut}
                />

                {/* Low Stock Cartridges (Critical) */}
                <Card className="border-border bg-card/60 rounded-[2rem] border-rose-500/20">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle>Stok Uyarıları</CardTitle>
                                {data.metrics.criticalCount > 0 && (
                                    <Badge variant="danger" className="animate-pulse">Acil</Badge>
                                )}
                            </div>
                            <CardDescription>Kritik seviyedeki kartuşlar.</CardDescription>
                        </div>
                        <AlertTriangleIcon className="h-5 w-5 text-rose-500" />
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border">
                        {data.lowStockCartridges.length > 0 ? data.lowStockCartridges.map((cart, i) => (
                            <div key={cart.id} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
                                        {cart.imageUrl ? (
                                            <Image src={cart.imageUrl} alt={cart.name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                                <BoxIcon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-semibold text-foreground truncate">{cart.name}</p>
                                        <p className="text-xs text-rose-500 font-medium">Stok: {cart.stock}</p>
                                    </div>
                                </div>
                                <Link href={`/cartridges/${cart.id}`}>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full text-rose-500 hover:bg-rose-500 hover:text-white">
                                        <ArrowUpRightIcon className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-2xl py-10">
                                <CheckIcon className="h-8 w-8 text-emerald-500 mb-2" />
                                <span>Tüm stoklar güvenli seviyede.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── Recent Activities & Distribution ─────────── */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Activities */}
                <Card className="lg:col-span-2 border-border bg-card rounded-[2rem]">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <CardTitle>Son Hareketler</CardTitle>
                            <CardDescription>Sistemdeki en güncel 7 stok çıkış işlemi.</CardDescription>
                        </div>
                        <ActivityIcon className="hidden h-5 w-5 shrink-0 self-start text-muted-foreground sm:block sm:self-auto" />
                    </CardHeader>
                    <CardContent className="max-h-[300px] overflow-y-auto pr-2 sm:max-h-none sm:pr-6">
                        <div className="space-y-1">
                            {data.recentActivities.length > 0 ? data.recentActivities.map((act, i) => (
                                <div key={i} className="group relative flex items-center gap-3 rounded-2xl p-2.5 sm:gap-4 sm:p-3 hover:bg-muted/40 transition-colors">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted border border-border group-hover:border-primary/30 transition-colors sm:h-10 sm:w-10">
                                        <TrendingUpIcon className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-semibold text-foreground truncate sm:text-sm">{act.title}</p>
                                        
                                        <div className="flex items-center gap-2">
                                          <p className="text-[11px] text-muted-foreground sm:text-xs">{act.meta}</p>
                                          {act.printerId && (
                                            <Link href={`/printers/instances/${act.printerId}`} className="text-xs text-muted-foreground hover:text-foreground ml-2">
                                              <span className="inline-flex items-center rounded-lg bg-muted/40 px-2 py-0.5 text-xs font-medium">{act.printerLabel}</span>
                                            </Link>
                                          )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center text-sm text-muted-foreground">İşlem kaydı bulunmuyor.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Distribution (Summary) */}
                <Card className="border-border bg-card rounded-[2rem]">
                    <CardHeader>
                        <CardTitle>Departman Tüketimi</CardTitle>
                        <CardDescription>Seçili aralıktaki kullanım miktarı.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {data.distribution.length > 0 ? data.distribution.map((dept, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-muted-foreground truncate">{dept.name}</span>
                                    <span className="text-foreground">{dept.total} Adet</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted/40">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000",
                                            i === 0 ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" :
                                                i === 1 ? "bg-violet-500" : "bg-emerald-500"
                                        )}
                                        style={{ width: `${dept.percent}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="py-10 text-center text-xs text-muted-foreground">Veri bulunamadı.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}