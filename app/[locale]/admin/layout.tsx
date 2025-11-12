"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/Button";
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Mail,
  Menu,
  ShieldAlert,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

type AdminLayoutProps = {
  children: ReactNode;
};

type NavItem = {
  key: string;
  href: string;
  translationKey: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    href: "/admin",
    translationKey: "dashboard",
    icon: LayoutDashboard
  },
  {
    key: "reservas",
    href: "/admin/reservas",
    translationKey: "reservas",
    icon: CalendarDays
  },
  {
    key: "pagos",
    href: "/admin/pagos",
    translationKey: "pagos",
    icon: CreditCard
  },
  {
    key: "mensajes",
    href: "/admin/mensajes",
    translationKey: "mensajes",
    icon: Mail
  },
  {
    key: "calendario",
    href: "/admin/calendario",
    translationKey: "calendario",
    icon: CalendarDays
  },
  {
    key: "alertas",
    href: "/admin/alertas",
    translationKey: "alertas",
    icon: ShieldAlert
  }
];

type NavCountKey = "reservas" | "mensajes";

type NavCounts = Partial<Record<NavCountKey, number>>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  const t = useTranslations("admin");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [navCounts, setNavCounts] = useState<NavCounts>({});

  const isAuthRoute = pathname?.includes("/admin/login");
  const [isCheckingSession, setIsCheckingSession] = useState(!isAuthRoute);

  useEffect(() => {
    if (isAuthRoute) {
      setIsCheckingSession(false);
      return;
    }

    let isActive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) return;

      if (!data.session) {
        router.replace(`/${locale}/admin/login`);
      } else {
        setIsCheckingSession(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [isAuthRoute, locale, router]);

  useEffect(() => {
    if (isAuthRoute || isCheckingSession) return;
    let active = true;

    const fetchCounts = async () => {
      try {
        const [reservasCount, mensajesCount] = await Promise.all([
          supabase
            .from("reservas")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("mensajes")
            .select("id", { count: "exact", head: true })
            .eq("is_read", false)
            .eq("archived", false)
        ]);

        if (!active) return;

        setNavCounts({
          reservas: reservasCount.count ?? 0,
          mensajes: mensajesCount.count ?? 0
        });
      } catch (error) {
        console.error("Navbar counts error", error);
      }
    };

    void fetchCounts();

    return () => {
      active = false;
    };
  }, [isAuthRoute, isCheckingSession]);

  const navigation = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        label: t(`nav.${item.translationKey}`)
      })),
    [t]
  );

  const closeSidebar = () => setIsSidebarOpen(false);

  if (isAuthRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="w-full max-w-md rounded-3xl border border-sand/40 bg-white/90 p-6 shadow-card">
          {children}
        </div>
      </div>
    );
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="rounded-3xl border border-sand/30 bg-white/90 px-6 py-10 text-center shadow-card">
          <p className="text-sm font-medium text-olive">Cargando panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 transform border-r border-sand/30 bg-white shadow-lg transition-transform duration-200 ease-out md:static md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-20 items-center px-6">
          <p className="font-display text-lg text-olive">
            Cabañas Vicente Huidobro
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 pb-6">
          {navigation.map(({ key, href, icon: Icon, label }) => {
            const isActive =
              pathname?.startsWith(href) ||
              (href === "/admin" && pathname?.endsWith("/admin"));
            const count = navCounts[key as keyof NavCounts] ?? 0;
            return (
              <Link
                key={key}
                href={href}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-olive text-white shadow-md"
                    : "text-slate-600 hover:bg-olive/10 hover:text-olive"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{label}</span>
                {count > 0 && (
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-olive">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-20 items-center justify-between border-b border-sand/30 bg-white/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-sand/50 text-olive md:hidden"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-olive/80">
                {t("header.title")}
              </p>
              <p className="text-xs text-slate-500 md:text-sm">{t("header.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="hidden md:inline-flex">
              {t("quick_actions.new_reservation")}
            </Button>
            <Button size="sm" className="hidden md:inline-flex">
              {t("quick_actions.register_payment")}
            </Button>
            <Button size="sm" variant="ghost" className="md:hidden">
              {t("quick_actions.view_messages")}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-canvas px-4 py-6 md:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

