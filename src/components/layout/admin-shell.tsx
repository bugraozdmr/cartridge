"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from 'next/navigation'
import Link from "next/link";
import { useTheme } from "next-themes";


import { BellIcon, BoxIcon, CheckIcon, ChevronRightIcon, MenuIcon, MoonIcon, PanelTopIcon, PrinterIcon, SearchIcon, SettingsIcon, SunIcon, TrendingUpIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

type NavigationItem = {
	label: string;
	href: string;
	icon: typeof PanelTopIcon;
	accent?: string;
};

const navigation: NavigationItem[] = [
	{ label: "Genel Bakış", href: "/", icon: PanelTopIcon, accent: "from-cyan-400/40 to-sky-400/10" },
	{ label: "Yazıcılar", href: "/printers", icon: PrinterIcon, accent: "from-violet-400/40 to-fuchsia-400/10" },
	{ label: "Kartuşlar", href: "/cartridges", icon: BoxIcon, accent: "from-emerald-400/40 to-teal-400/10" },
	{ label: "Talepler", href: "/requests", icon: TrendingUpIcon, accent: "from-amber-400/40 to-orange-400/10" },
	{ label: "Ayarlar", href: "/settings", icon: SettingsIcon, accent: "from-slate-400/40 to-slate-500/10" },
];

export function AdminShell({ children }: { children: ReactNode }) {
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const pathname = usePathname()
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = mounted ? theme !== "light" : true;
	const sidebarWidth = collapsed ? "md:w-24" : "md:w-72";
	const contentOffset = collapsed ? "md:pl-24" : "md:pl-72";

	const themeIcon = useMemo(() => {
		if (!mounted) {
			return <MoonIcon className="h-4 w-4" />;
		}

		return isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />;
	}, [isDark, mounted]);

	const toggleTheme = () => {
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<div className="min-h-screen bg-transparent text-foreground">
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card/95 backdrop-blur-2xl transition-[transform,width] duration-300 shadow-[0_24px_80px_rgba(0,0,0,0.18)]",
					sidebarWidth,
					mobileOpen ? "translate-x-0" : "-translate-x-full",
					"md:translate-x-0",
				)}
			>
				<div className="flex items-center gap-4 px-5 py-5 backdrop-blur-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-transparent shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <img 
              src="/favicon.ico" 
              alt="Logo" 
              className="h-6 w-6 object-contain drop-shadow-md" 
            />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-[15px] font-bold tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground">
                Bilgi İşlem
              </h1>
            </div>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto h-8 w-8 text-muted-foreground hover:bg-white/5 hover:text-foreground md:hidden transition-colors" 
            onClick={() => setMobileOpen(false)} 
            aria-label="Menüyü kapat"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>


				<nav className="flex-1 px-3 pb-4 pt-4">
					<div className="mb-3 flex items-center justify-between px-2 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
						<span>Menü</span>
					</div>
					<div className="space-y-1.5" suppressHydrationWarning>
						{mounted && navigation.map((item) => {
							const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
							const Icon = item.icon;

							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setMobileOpen(false)}
									className={cn(
										"group flex items-center gap-3 rounded-[1.25rem] border px-3 py-3 text-sm font-medium transition-all duration-200",
										isActive
											? "border-border bg-muted text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
											: "border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground",
										collapsed && "md:justify-center md:px-2",
									)}
									title={collapsed ? item.label : undefined}
								>
									<span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-white/90 transition-transform group-hover:scale-105", item.accent)}>
										<Icon className="h-4.5 w-4.5" />
									</span>
									{!collapsed && <span className="flex-1">{item.label}</span>}
									{!collapsed && isActive && <ChevronRightIcon className="h-4 w-4 text-slate-500" />}
								</Link>
							);
						})}
					</div>
				</nav>

			</aside>

			<div className={cn("min-h-screen transition-[padding] duration-300", contentOffset)}>
				<header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-2xl">
					<div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
						<Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Menüyü aç">
							<MenuIcon className="h-4.5 w-4.5" />
						</Button>

						<Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setCollapsed((value) => !value)} aria-label="Kenarı daralt">
							<PanelTopIcon className="h-4.5 w-4.5" />
						</Button>

						<div className="hidden min-w-0 flex-1 md:block">
							<div className="flex max-w-xl items-center gap-3 rounded-[1.4rem] border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
								<SearchIcon className="h-4.5 w-4.5" />
								<Input className="h-auto border-0 bg-transparent px-0 text-sm text-foreground placeholder:text-muted-foreground focus:ring-0" placeholder="Yazıcı, kartuş veya talep ara" />
							</div>
						</div>

						<div className="ml-auto flex items-center gap-2">
							<Button variant="outline" className="hidden rounded-2xl border-border bg-muted/50 text-foreground md:inline-flex" onClick={toggleTheme} aria-label="Temayı değiştir">
								{themeIcon}
							</Button>
						</div>
					</div>
				</header>

				<main className="px-4 py-4 sm:px-6 lg:px-8 lg:py-8">{children}</main>
			</div>

			{mobileOpen && <button aria-label="Arka planı kapat" className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} type="button" />}
		</div>
	);
}
