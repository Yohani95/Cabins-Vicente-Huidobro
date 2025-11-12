"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { CalendarDays, CreditCard, Mail, Users } from "lucide-react";
import { formatCurrencyCLP } from "@/lib/utils/format";

type DashboardStat = {
  title: string;
  description: string;
  value: string;
  icon: React.ReactNode;
};

type RawStats = {
  occupancyRate: number;
  pendingReservations: number;
  recentPayments: number;
  unreadMessages: number;
};

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [stats, setStats] = useState<RawStats>({
    occupancyRate: 0,
    pendingReservations: 0,
    recentPayments: 0,
    unreadMessages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const dashboardCards = useMemo<DashboardStat[]>(
    () => [
      {
        title: t("status.ocupacion"),
        description: "Cabañas ocupadas hoy",
        value: `${Math.round(stats.occupancyRate * 100)}%`,
        icon: <Users className="h-5 w-5 text-olive" />
      },
      {
        title: t("status.pendientes"),
        description: "Reservas por confirmar",
        value: String(stats.pendingReservations),
        icon: <CalendarDays className="h-5 w-5 text-olive" />
      },
      {
        title: t("status.pagos"),
        description: "Ingresos últimos 7 días",
        value: formatCurrencyCLP(
          stats.recentPayments,
          locale === "en" ? "en-US" : "es-CL"
        ),
        icon: <CreditCard className="h-5 w-5 text-olive" />
      },
      {
        title: t("status.mensajes"),
        description: "Mensajes sin leer",
        value: String(stats.unreadMessages),
        icon: <Mail className="h-5 w-5 text-olive" />
      }
    ],
    [locale, stats, t]
  );

  const loadDashboardStats = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const todayIso = today.toISOString().split("T")[0];

    try {
      const [
        { count: totalCabanas = 0 },
        { data: activeReservations },
        { count: pendingCount = 0 },
        { data: payments },
        { count: unreadCount = 0 }
      ] = await Promise.all([
        supabase
          .from("cabanas")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("reservas")
          .select("cabana_id")
          .in("status", ["confirmed", "checked_in"])
          .lte("check_in", todayIso)
          .gte("check_out", todayIso),
        supabase
          .from("reservas")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("pagos")
          .select("amount")
          .gte("created_at", sevenDaysAgo.toISOString()),
        supabase
          .from("mensajes")
          .select("id", { count: "exact", head: true })
          .eq("is_read", false)
      ]);

      const totalCabanasCount = totalCabanas ?? 0;
      const pendingReservationsCount = pendingCount ?? 0;
      const unreadMessagesCount = unreadCount ?? 0;

      const occupiedCabins =
        activeReservations?.reduce((set, reservation) => {
          if (reservation?.cabana_id) {
            set.add(reservation.cabana_id);
          }
          return set;
        }, new Set<string>()) ?? new Set<string>();

      const paymentsSum =
        payments?.reduce(
          (sum, payment) => sum + Number(payment.amount ?? 0),
          0
        ) ?? 0;

      setStats({
        occupancyRate:
          totalCabanasCount > 0 ? occupiedCabins.size / totalCabanasCount : 0,
        pendingReservations: pendingReservationsCount,
        recentPayments: paymentsSum,
        unreadMessages: unreadMessagesCount
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      setErrorMessage("No pudimos cargar las métricas. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardStats();
  }, []);

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-olive">
            {t("header.title")}
          </h1>
          <p className="text-sm text-slate-600">{t("header.subtitle")}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void loadDashboardStats()}
          disabled={isLoading}
        >
          {isLoading ? "Actualizando..." : "Actualizar métricas"}
        </Button>
      </section>

      {errorMessage && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <DashboardCard key={card.title} {...card} isLoading={isLoading} />
        ))}
      </section>
    </div>
  );
}

type DashboardCardProps = DashboardStat & {
  isLoading: boolean;
};

function DashboardCard({
  title,
  value,
  description,
  icon,
  isLoading
}: DashboardCardProps) {
  return (
    <article className="rounded-3xl border border-sand/40 bg-white/90 p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-semibold text-olive">
        {isLoading ? "—" : value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </article>
  );
}

