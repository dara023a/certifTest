"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  ChevronRight,
  Home,
  Info,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  PanelLeft,
  ScanLine,
  X,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { LangToggle } from "@/components/lang-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSettings } from "@/contexts/settings-context";
import { translations } from "@/lib/i18n";
import { getSession, logout } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function useNavGroups(): NavGroup[] {
  const { language } = useSettings();
  const t = translations[language].admin;
  return useMemo(
    () => [
      {
        label: t.nav.groupOverview,
        items: [
          {
            href: "/admin",
            label: t.nav.dashboard,
            icon: LayoutDashboard,
            exact: true,
          },
        ],
      },
      {
        label: t.nav.groupContent,
        items: [
          { href: "/admin/certificates", label: t.nav.certificates, icon: Award },
          { href: "/admin/templates", label: t.nav.templates, icon: LayoutTemplate },
        ],
      },
      {
        label: t.nav.groupMonitoring,
        items: [
          { href: "/admin/logs", label: t.nav.logs, icon: ScanLine },
        ],
      },
    ],
    [t]
  );
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarBody({
  collapsed,
  onNavigate,
  onToggleCollapse,
  onClose,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}) {
  const { language } = useSettings();
  const t = translations[language].admin;
  const groups = useNavGroups();
  const pathname = usePathname();
  const router = useRouter();
  const session = getSession();

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <div className="flex h-full flex-col bg-[#0d1345] text-white">
      <div
        className={cn(
          "flex items-center px-4 py-4",
          collapsed ? "justify-center px-2" : "justify-between"
        )}
      >
        <Logo />
        {onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label={t.nav.collapse}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <Separator className="bg-white/10" />

      <nav aria-label={t.panelTitle} className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p
              className={cn(
                "px-2 text-sm font-medium uppercase tracking-wide text-white/50",
                collapsed && "sr-only"
              )}
            >
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/60 [@media(pointer:coarse)]:min-h-11",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-white/10 font-medium text-white ring-1 ring-white/15"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className={cn(collapsed && "sr-only")}>{item.label}</span>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <Separator className="bg-white/10" />
      <div className={cn("flex flex-col gap-2 p-3", collapsed && "items-center")}>
        {!collapsed && (
          <div className="px-2">
            <p className="truncate text-sm font-medium text-white">
              {session?.username ?? "admin"}
            </p>
            <p className="text-sm text-white/50">{t.panelTitle}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white/70 hover:bg-white/5 hover:text-white",
            collapsed && "w-9 justify-center px-0"
          )}
          onClick={handleLogout}
          aria-label={t.logout}
          title={t.logout}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {!collapsed && <span>{t.logout}</span>}
        </Button>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/50 hover:bg-white/5 hover:text-white",
              collapsed && "w-9 justify-center px-0"
            )}
            onClick={onToggleCollapse}
            aria-label={collapsed ? t.nav.expand : t.nav.collapse}
            title={collapsed ? t.nav.expand : t.nav.collapse}
          >
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
            {!collapsed && <span>{t.nav.collapse}</span>}
          </Button>
        )}
      </div>
    </div>
  );
}

function Breadcrumbs() {
  const { language } = useSettings();
  const t = translations[language].admin;
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    const items: Array<{ label: string; href?: string }> = [
      { label: t.nav.dashboard, href: "/admin" },
    ];
    if (pathname.startsWith("/admin/certificates")) {
      items.push({ label: t.nav.certificates, href: "/admin/certificates" });
      if (pathname.endsWith("/new")) {
        items.push({ label: t.certificates.createTitle });
      } else if (pathname.endsWith("/edit")) {
        items.push({ label: t.certificates.editTitle });
      }
    } else if (pathname.startsWith("/admin/templates")) {
      items.push({ label: t.nav.templates });
    } else if (pathname.startsWith("/admin/logs")) {
      items.push({ label: t.nav.logs });
    }
    return items;
  }, [pathname, t]);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 rounded-xl bg-card px-3 py-1.5 text-sm text-muted-foreground ring-1 ring-foreground/10">
        <li>
          <Link
            href="/admin"
            className="flex items-center gap-1 transition-colors hover:text-foreground [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11 [@media(pointer:coarse)]:justify-center"
            aria-label={t.nav.dashboard}
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
            {crumb.href && index < crumbs.length - 1 ? (
              <Link href={crumb.href} className="transition-colors hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { language } = useSettings();
  const t = translations[language].admin;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh w-full flex-1">
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 lg:block",
          collapsed ? "w-[72px]" : "w-60"
        )}
      >
        <SidebarBody
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 py-2.5 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label={t.nav.openMenu}
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </Button>
            <div className="min-w-0 overflow-x-auto">
              <Breadcrumbs />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LangToggle />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex items-center justify-center gap-2 border-b border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span className="font-medium text-foreground">{t.simulationMode}</span>
          <span className="hidden truncate sm:inline">· {t.simulationNote}</span>
        </div>

        <main className="flex-1 bg-[#f5f7ff] p-4 sm:p-6 dark:bg-[#0d1345]">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">{t.panelTitle}</SheetTitle>
          <SidebarBody
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
            onClose={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
