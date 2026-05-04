import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRightIcon, CheckIcon, AlertCircleIcon, UsersIcon, PrinterIcon,  TrendingUpIcon, BoxIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link'
import { cn } from "@/lib/utils";

const metrics = [
    {
        label: "Aktif yazıcı",
        value: "48",
        delta: "+12%",
        tone: "text-cyan-300",
        icon: PrinterIcon,
    },
    {
        label: "Kritik kartuş",
        value: "7",
        delta: "+2 bugün",
        tone: "text-amber-300",
        icon: BoxIcon,
    },
    {
        label: "Açık talep",
        value: "13",
        delta: "4 acil",
        tone: "text-violet-300",
        icon: TrendingUpIcon,
    },
    {
        label: "Departman",
        value: "9",
        delta: "Tam kapsama",
        tone: "text-emerald-300",
        icon: UsersIcon,
    },
];

const printers = [
    { name: "HP LaserJet 4200", location: "Mali Hizmetler", status: "Çevrim içi", color: "success", load: "82%" },
    { name: "Canon iR 2625", location: "Yazı İşleri", status: "Bakım gerekebilir", color: "warning", load: "64%" },
    { name: "Epson EcoTank L6270", location: "Destek Masası", status: "Beklemede", color: "secondary", load: "38%" },
    { name: "Xerox VersaLink", location: "Fen İşleri", status: "Çevrim içi", color: "success", load: "91%" },
];

const cartridges = [
    { name: "Cyan XL", remaining: 92, status: "Yeterli" },
    { name: "Magenta XL", remaining: 56, status: "Orta seviye" },
    { name: "Yellow XL", remaining: 28, status: "Az kaldı" },
    { name: "Black XL", remaining: 14, status: "Kritik" },
];

const requests = [
    {
        title: "Kartuş talebi onaylandı",
        meta: "Satın alma • 12 dk önce",
        tone: "success",
    },
    {
        title: "Fen İşleri yazıcı hattı kontrol edildi",
        meta: "Teknik servis • 34 dk önce",
        tone: "secondary",
    },
    {
        title: "Kritik toner için uyarı üretildi",
        meta: "Sistem • 1 saat önce",
        tone: "warning",
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6 lg:space-y-8">
            <section id="ozet" className="relative overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.10)] backdrop-blur-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsla(var(--primary),0.18),transparent_28%),radial-gradient(circle_at_bottom_left,hsla(var(--secondary),0.16),transparent_30%)]" />
                <div className="relative grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
                    <div>
                        <Badge variant="soft" className="mb-4">Canlı kontrol merkezi</Badge>
                        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                            Yazıcılar ve kartuşlar için tek ekrandan, temiz ve hızlı yönetim.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                            Departman bazlı kullanım, stok takibi ve bakım durumlarını sade bir panelde topla. Dark mode odaklı bu arayüz, yoğun kullanımda da okunaklı kalacak şekilde hazırlandı.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Yeni yazıcı ekle
                                <ArrowUpRightIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" className="border-border bg-muted/40 text-foreground hover:bg-muted/70">
                                Kartuş stoklarını aç
                            </Button>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-[1.4rem] border border-border bg-muted/40 p-4">
                                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Aylık baskı</p>
                                <p className="mt-3 text-2xl font-semibold text-foreground">18.240</p>
                                <p className="mt-2 text-sm text-emerald-500">+8.4% artış</p>
                            </div>
                            <div className="rounded-[1.4rem] border border-border bg-muted/40 p-4">
                                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Bakım gecikmesi</p>
                                <p className="mt-3 text-2xl font-semibold text-foreground">2 cihaz</p>
                                <p className="mt-2 text-sm text-amber-500">Bugün müdahale gerekli</p>
                            </div>
                            <div className="rounded-[1.4rem] border border-border bg-muted/40 p-4">
                                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Stok güveni</p>
                                <p className="mt-3 text-2xl font-semibold text-foreground">%86</p>
                                <p className="mt-2 text-sm text-cyan-500">Hafta sonuna hazır</p>
                            </div>
                        </div>
                    </div>

                    <Card className="border-border bg-card/95">
                        <CardHeader>
                            <CardTitle className="text-foreground">Bugünkü durum</CardTitle>
                            <CardDescription className="text-muted-foreground">Panel özet sinyalleri ve hızlı aksiyonlar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Çevrim içi yazıcılar</span>
                                    <span className="text-foreground">42 / 48</span>
                                </div>
                                <div className="h-3 rounded-full bg-muted">
                                    <div className="h-3 w-[87%] rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />
                                </div>
                            </div>
                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Kartuş doluluk ortalaması</span>
                                    <span className="text-foreground">%47</span>
                                </div>
                                <div className="h-3 rounded-full bg-muted">
                                    <div className="h-3 w-[47%] rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />
                                </div>
                            </div>
                            <Separator className="bg-border" />
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-[1.2rem] border border-border bg-muted/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sistem durumu</p>
                                    <div className="mt-3 flex items-center gap-2 text-sm text-emerald-500">
                                        <CheckIcon className="h-4 w-4" />
                                        Sorunsuz çalışıyor
                                    </div>
                                </div>
                                <div className="rounded-[1.2rem] border border-border bg-muted/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Uyarı</p>
                                    <div className="mt-3 flex items-center gap-2 text-sm text-amber-500">
                                        <AlertCircleIcon className="h-4 w-4" />
                                        3 stok kalemi kritik seviyede
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                        <Card key={metric.label} className="group border-border bg-card/80 transition-transform duration-200 hover:-translate-y-1">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                                        <p className="mt-3 text-3xl font-semibold text-foreground">{metric.value}</p>
                                        <p className={cn("mt-2 text-sm", metric.tone)}>{metric.delta}</p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-foreground ring-1 ring-inset ring-border transition group-hover:scale-105">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>

            <section id="yazicilar" className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                <Card className="border-border bg-card/80">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-foreground">Yazıcılar</CardTitle>
                                <CardDescription className="text-muted-foreground">Birim bazlı durum ve doluluk takibi.</CardDescription>
                            </div>
                            <Badge variant="outline">48 cihaz</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Yazıcı listesini ayrı sayfada detaylı yönet.</p>
                            <Link href="/printers" className="rounded-md bg-primary px-3 py-2 text-primary-foreground">Yazıcılar</Link>
                        </div>
                        <p className="text-xs text-muted-foreground">Burada sadece kısa özet gösterilir; tam yönetim için sayfaya git.</p>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-border bg-card/80">
                        <CardHeader>
                            <CardTitle className="text-foreground">Kartuş stoğu</CardTitle>
                            <CardDescription className="text-muted-foreground">Renk bazlı tüketim ve kritik eşikler.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Kartuş stoklarını ayrı sayfada detaylı görüntüle ve yönet.</p>
                            <Link href="/cartridges" className="rounded-md bg-primary px-3 py-2 text-primary-foreground">Kartuşlar</Link>
                        </div>
                        <p className="text-xs text-muted-foreground">Stok, fiyat ve geçmiş hareketler bu sayfada gösterilir.</p>
                    </CardContent>
                    </Card>

                    <Card className="border-border bg-card/80">
                        <CardHeader>
                            <CardTitle id="talepler" className="text-foreground">Son işlemler</CardTitle>
                            <CardDescription className="text-muted-foreground">Kısa faaliyet akışı ve uyarılar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {requests.map((request) => (
                                <div key={request.title} className="flex items-start gap-3 rounded-[1.2rem] border border-border bg-muted/40 p-4">
                                    <Badge variant={request.tone as "success" | "warning" | "secondary"} className="mt-0.5">
                                        {request.tone === "success" ? "Tamam" : request.tone === "warning" ? "Uyarı" : "Bilgi"}
                                    </Badge>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-foreground">{request.title}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">{request.meta}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section id="kartuslar" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Card className="border-border bg-card/80">
                    <CardHeader>
                        <Badge variant="soft" className="w-fit">Öncelikli stok</Badge>
                        <CardTitle className="text-foreground">Kartuşlar</CardTitle>
                        <CardDescription className="text-muted-foreground">Azalan stoklar için otomatik uyarı akışı.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-[1.2rem] border border-border bg-muted/40 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Bugün tüketim</p>
                            <p className="mt-2 text-3xl font-semibold text-foreground">32 adet</p>
                        </div>
                        <div className="rounded-[1.2rem] border border-border bg-muted/40 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Yenileme planı</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">Black ve Yellow kartuşları için yeni sipariş planı bugün kapanmadan hazırlanmalı.</p>
                        </div>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Stok planını oluştur</Button>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card/80">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-foreground">Departman dağılımı</CardTitle>
                                <CardDescription className="text-muted-foreground">Hangi birim ne kadar baskı üretiyor.</CardDescription>
                            </div>
                            <Badge variant="outline">Haftalık</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {[
                            ["Mali Hizmetler", "24%", "bg-cyan-500"],
                            ["Yazı İşleri", "18%", "bg-violet-500"],
                            ["Fen İşleri", "31%", "bg-emerald-500"],
                            ["Destek Masası", "27%", "bg-amber-500"],
                        ].map(([name, percent, tone]) => (
                            <div key={name} className="rounded-[1.3rem] border border-border bg-muted/40 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-foreground">{name}</p>
                                    <p className="text-sm text-muted-foreground">{percent}</p>
                                </div>
                                <div className="mt-3 h-2 rounded-full bg-muted">
                                    <div className={cn("h-2 rounded-full", tone)} style={{ width: percent }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>

            <section id="ayarlar" className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <Card className="border-border bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-foreground">Bakım notu</CardTitle>
                        <CardDescription className="text-muted-foreground">Paneli sade tut, kritik uyarıları üstte göster.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                        <p>• Son bakım tarihi 12 gün önce geçtiyse kartı sarı renge geçir.</p>
                        <p>• Kartuş eşikleri %25 altına indiğinde otomatik uyarı üret.</p>
                        <p>• Yoğun kullanımda üst header sabit kalsın, içerik alanı kendi içinde akmaya devam etsin.</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-foreground">Hızlı özet</CardTitle>
                        <CardDescription className="text-muted-foreground">Tek bakışta durum tablosu.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            ["Servis planı", "3 cihaz sırada"],
                            ["Stok emniyeti", "%86"],
                            ["Haftalık hedef", "48/50 tamamlandı"],
                        ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between rounded-[1.2rem] border border-border bg-muted/40 px-4 py-3">
                                <span className="text-sm text-muted-foreground">{label}</span>
                                <span className="text-sm font-medium text-foreground">{value}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}