"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { formatCurrencyCLP, formatDateShort } from "@/lib/utils/format";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type Payment = {
  amount: number | null;
};

type ReservationStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

export type ReservationAlert = {
  id: string;
  guest_name: string;
  status: ReservationStatus;
  check_in: string;
  check_out: string;
  amount: number | null;
  cabanas: {
    name: string;
  } | null;
  pagos: Payment[];
};

export type MessageAlert = {
  id: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  message: string;
  created_at: string;
};

type AlertsClientProps = {
  locale: string;
  reservations: ReservationAlert[];
  unreadMessages: MessageAlert[];
};

export default function AlertsClient({
  locale,
  reservations,
  unreadMessages
}: AlertsClientProps) {
  const t = useTranslations("admin.alertas");
  const statusT = useTranslations("admin.reservas.status");
  const localeFormat = locale === "en" ? "en-US" : "es-CL";

  const today = startOfDay(new Date());
  const threeDaysAhead = new Date(today.getTime() + 3 * MS_PER_DAY);

  const processedReservations = useMemo(() => {
    return reservations.map((reservation) => {
      const totalBooking = reservation.amount ?? 0;
      const totalPaid = reservation.pagos.reduce(
        (sum, payment) => sum + Number(payment.amount ?? 0),
        0
      );
      const balance = totalBooking - totalPaid;
      return {
        ...reservation,
        totalBooking,
        totalPaid,
        balance
      };
    });
  }, [reservations]);

  const upcomingCheckins = processedReservations.filter((reservation) => {
    const checkIn = startOfDay(new Date(reservation.check_in));
    return (
      reservation.status !== "cancelled" &&
      checkIn.getTime() >= today.getTime() &&
      checkIn.getTime() <= threeDaysAhead.getTime()
    );
  });

  const upcomingCheckouts = processedReservations.filter((reservation) => {
    const checkOut = startOfDay(new Date(reservation.check_out));
    return (
      reservation.status !== "cancelled" &&
      checkOut.getTime() >= today.getTime() &&
      checkOut.getTime() <= threeDaysAhead.getTime()
    );
  });

  const pendingBalances = processedReservations.filter(
    (reservation) => reservation.balance > 0.1 && reservation.status !== "cancelled"
  );

  const formatCurrency = (value: number) => formatCurrencyCLP(value, localeFormat);
  const formatDate = (value: string) => formatDateShort(value, localeFormat);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-olive">{t("title")}</h1>
        <p className="text-sm text-slate-600">{t("subtitle")}</p>
      </header>

      <AlertsSection
        title={t("sections.checkins")}
        emptyLabel={t("empty")}
        items={upcomingCheckins.map((reservation) => (
          <AlertCard
            key={`checkin-${reservation.id}`}
            title={`${reservation.guest_name} • ${reservation.cabanas?.name ?? "—"}`}
            description={`${formatDate(reservation.check_in)} • ${statusT(reservation.status)}`}
            link={`/admin/reservas?id=${reservation.id}`}
            linkLabel={t("cta")}
          />
        ))}
      />

      <AlertsSection
        title={t("sections.checkouts")}
        emptyLabel={t("empty")}
        items={upcomingCheckouts.map((reservation) => (
          <AlertCard
            key={`checkout-${reservation.id}`}
            title={`${reservation.guest_name} • ${reservation.cabanas?.name ?? "—"}`}
            description={`${formatDate(reservation.check_out)} • ${statusT(reservation.status)}`}
            link={`/admin/reservas?id=${reservation.id}`}
            linkLabel={t("cta")}
          />
        ))}
      />

      <AlertsSection
        title={t("sections.balances")}
        emptyLabel={t("empty")}
        items={pendingBalances.map((reservation) => (
          <AlertCard
            key={`balance-${reservation.id}`}
            title={`${reservation.guest_name} • ${reservation.cabanas?.name ?? "—"}`}
            description={`${formatCurrency(reservation.balance)} pendientes`}
            link={`/admin/pagos?id=${reservation.id}`}
            linkLabel={t("cta")}
          />
        ))}
      />

      <AlertsSection
        title={t("sections.mensajes")}
        emptyLabel={t("empty")}
        items={unreadMessages.map((message) => (
          <AlertCard
            key={`message-${message.id}`}
            title={`${message.guest_name}`}
            description={`${formatDateShort(message.created_at, localeFormat)} • ${message.guest_email ?? message.guest_phone ?? ""}`}
            link={`/admin/mensajes?id=${message.id}`}
            linkLabel={t("cta")}
          />
        ))}
      />
    </div>
  );
}

function AlertsSection({
  title,
  items,
  emptyLabel
}: {
  title: string;
  items: React.ReactNode[];
  emptyLabel: string;
}) {
  return (
    <section className="rounded-3xl border border-sand/30 bg-white/90 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-olive">
          {title}
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items}
        </div>
      )}
    </section>
  );
}

function AlertCard({
  title,
  description,
  link,
  linkLabel
}: {
  title: string;
  description: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-sand/20 bg-white/80 p-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-semibold text-olive">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <Link href={link} className="inline-flex items-center text-xs font-semibold text-olive">
        {linkLabel} <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </div>
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
