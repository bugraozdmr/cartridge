"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from 'next/navigation'
import Link from "next/link";
import { useTheme } from "next-themes";

import {
  BarChart3Icon,
  BoxIcon,
  BuildingIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  MoonIcon,
  PanelLeftIcon,
  PanelTopIcon,
  PrinterIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./GlobalSearch";

type NavigationItem = {
  label: string;
  href: string;
  icon: any;
  accent?: string;
};

const navigation: NavigationItem[] = [
  { label: "Genel Bakış", href: "/", icon: PanelTopIcon, accent: "from-cyan-400/40 to-sky-400/20" },
  { label: "Yazıcılar", href: "/printers", icon: PrinterIcon, accent: "from-violet-400/40 to-fuchsia-400/20" },
  { label: "Kartuşlar", href: "/cartridges", icon: BoxIcon, accent: "from-emerald-400/40 to-teal-400/20" },
  { label: "Departmanlar", href: "/departments", icon: BuildingIcon, accent: "from-sky-400/40 to-blue-400/20" },
  { label: "Raporlar", href: "/reports", icon: BarChart3Icon, accent: "from-rose-400/40 to-pink-400/20" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme !== "light" : true;
  const sidebarWidth = collapsed ? "md:w-20" : "md:w-64";
  const contentOffset = collapsed ? "md:pl-20" : "md:pl-64";

  const themeIcon = useMemo(() => {
    if (!mounted) return <MoonIcon className="h-4 w-4" />;
    return isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />;
  }, [isDark, mounted]);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-card transition-[transform,width] duration-300",
          sidebarWidth,
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-transparent">
            <img src="/favicon.ico" alt="Logo" className="h-5 w-5 object-contain" />
          </div>
          {!collapsed && (
            <span className="text-[13px] font-bold tracking-[0.18em] uppercase text-foreground truncate">
              Bilgi İşlem
            </span>
          )}
          {/* Mobile close */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" suppressHydrationWarning>
          {!collapsed && (
            <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Menü
            </p>
          )}
          {mounted && navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  collapsed && "md:justify-center md:px-2",
                )}
                title={collapsed ? item.label : undefined}
              >
                {/* Icon bubble */}
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br transition-transform group-hover:scale-105",
                    item.accent,
                    isActive ? "text-primary" : "text-foreground/80",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && isActive && (
                  <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-primary/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer – collapse toggle (desktop only) */}
        <div className="border-t border-border p-3 hidden md:block">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              collapsed && "justify-center",
            )}
            title={collapsed ? "Genişlet" : "Daralt"}
          >
            {collapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">Daralt</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <div className={cn("min-h-screen w-full transition-[padding] duration-300", contentOffset)}>
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon className="h-4 w-4" />
            </Button>

            {/* Search bar */}
            <div className="hidden min-w-0 flex-1 md:block">
              <GlobalSearch />
            </div>

            {/* Theme toggle */}
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl border border-border bg-muted/60 text-foreground hover:bg-muted"
                onClick={toggleTheme}
                aria-label="Temayı değiştir"
              >
                {themeIcon}
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Kapat"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}
    </div>
  );
}
