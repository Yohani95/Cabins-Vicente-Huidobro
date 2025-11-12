"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/utils/format";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type ReservationStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

type Reservation = {
  id: string;
  cabana_id: string;
  guest_name: string;
  status: ReservationStatus;
  check_in: string;
  check_out: string;
  cabanas: {
    name: string;
  } | null;
};

type Cabana = {
  id: string;
  name: string;
};

type CalendarClientProps = {
  locale: string;
  reservations: Reservation[];
  cabanas: Cabana[];
};

export default function CalendarClient({ locale, reservations, cabanas }: CalendarClientProps) {
  const t = useTranslations("admin.calendario");
  const statusReservationT = useTranslations("admin.reservas.status");
  const localeFormat = locale === "en" ? "en-US" : "es-CL";
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedCabin, setSelectedCabin] = useState<string>("all");

  const monthLabel = currentMonth.toLocaleDateString(localeFormat, {
    month: "long",
    year: "numeric"
  });

  const weekdays = t.raw("weekdays") as string[];

  const filteredReservations = useMemo(() => {
    const rangeStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime();
    const rangeEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).getTime();

    return reservations.filter((reservation) => {
      if (selectedCabin !== "all" && reservation.cabana_id !== selectedCabin) {
        return false;
      }
      const checkIn = new Date(reservation.check_in).getTime();
      const checkOut = new Date(reservation.check_out).getTime();
      return checkOut >= rangeStart && checkIn < rangeEnd;
    });
  }, [currentMonth, reservations, selectedCabin]);

  const calendarMatrix = useMemo(() => {
    const firstDayOfMonth = new Date(currentMonth);
    const startDay = getStartOfCalendar(firstDayOfMonth);
    return Array.from({ length: 6 }).map((_, weekIndex) =>
      Array.from({ length: 7 }).map((__, dayIndex) => {
        const day = new Date(startDay.getTime() + (weekIndex * 7 + dayIndex) * MS_PER_DAY);
        return day;
      })
    );
  }, [currentMonth]);

  const dayStatuses = useMemo(() => {
    const map = new Map<string, DayStatus>();
    filteredReservations.forEach((reservation) => {
      if (reservation.status === "cancelled") return;
      const checkIn = startOfDay(reservation.check_in);
      const checkOut = startOfDay(reservation.check_out);
      const cabinName = reservation.cabanas?.name ?? "—";
      for (let time = checkIn.getTime(); time < checkOut.getTime(); time += MS_PER_DAY) {
        const current = new Date(time);
        const key = keyFromDate(current);
        const dayStatus = map.get(key) ?? { occupied: false, cabins: [] };
        dayStatus.occupied = true;

        let cabinStatus = dayStatus.cabins.find((cabin) => cabin.name === cabinName);
        if (!cabinStatus) {
          cabinStatus = { name: cabinName, checkin: false, checkout: false };
          dayStatus.cabins.push(cabinStatus);
        }

        if (time === checkIn.getTime()) {
          cabinStatus.checkin = true;
        }
        if (time + MS_PER_DAY === checkOut.getTime()) {
          cabinStatus.checkout = true;
        }

        map.set(key, dayStatus);
      }
    });
    return map;
  }, [filteredReservations]);

  const changeMonth = (offset: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-olive">{t("title")}</h1>
          <p className="text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => changeMonth(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <p className="w-40 text-center text-sm font-semibold text-olive capitalize">
              {monthLabel}
            </p>
            <Button size="sm" variant="outline" onClick={() => changeMonth(1)}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <select
            value={selectedCabin}
            onChange={(event) => setSelectedCabin(event.target.value)}
            className="rounded-xl border border-sand/40 bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
          >
            <option value="all">{t("filters.cabins")}</option>
            {cabanas.map((cabana) => (
              <option key={cabana.id} value={cabana.id}>
                {cabana.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <Legend t={t} />

      <section className="space-y-3 sm:hidden">
        {calendarMatrix.map((week, weekIndex) => (
          <div
            key={`mobile-week-${weekIndex}`}
            className="rounded-3xl border border-sand/30 bg-white/90 p-4 shadow-card"
          >
            <div className="grid grid-cols-2 gap-3">
              {week.map((day) => {
                const key = keyFromDate(day);
                const status =
                  dayStatuses.get(key) ?? {
                    occupied: false,
                    cabins: []
                  };
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                if (!isCurrentMonth) return null;
                return (
                  <div
                    key={`mobile-${key}`}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-xs",
                      status.occupied
                        ? "border-olive/40 bg-olive/10 text-olive"
                        : "border-sand/30 bg-white text-slate-600"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold">
                        {day.toLocaleDateString(localeFormat, {
                          day: "2-digit",
                          month: "short"
                        })}
                      </span>
                      <span className="uppercase tracking-[0.2em]">
                        {status.occupied ? t("legend.occupied") : t("legend.available")}
                      </span>
                    </div>
                    {status.cabins.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {status.cabins.map((cabin) => {
                          const hasTags = cabin.checkin || cabin.checkout;
                          return (
                            <div
                              key={`mobile-${key}-${cabin.name}`}
                              className="rounded-xl border border-olive/30 bg-white px-2 py-2 text-[11px] font-medium text-olive"
                            >
                              <div>{cabin.name}</div>
                              {hasTags && (
                                <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-normal">
                                  {cabin.checkin && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                                      {t("legend.checkin")}
                                    </span>
                                  )}
                                  {cabin.checkout && (
                                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">
                                      {t("legend.checkout")}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="hidden rounded-3xl border border-sand/30 bg-white/90 p-2 shadow-card sm:block sm:p-4">
        <div className="-mx-2 overflow-x-auto sm:mx-0">
          <table className="min-w-[640px] table-fixed border-collapse text-center text-[11px] text-slate-600 sm:min-w-full sm:text-xs md:text-sm">
            <thead>
              <tr>
                {weekdays.map((day) => (
                  <th
                    key={day}
                    className="pb-3 font-semibold uppercase tracking-[0.2em] text-olive"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarMatrix.map((week, weekIndex) => (
                <tr key={`week-${weekIndex}`} className="h-20 md:h-24">
                  {week.map((day) => {
                    const key = keyFromDate(day);
                    const status =
                      dayStatuses.get(key) ?? {
                        occupied: false,
                        cabins: []
                      };
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    return (
                      <td
                        key={key}
                        className={cn(
                          "relative border border-sand/20 align-top",
                          !isCurrentMonth && "bg-slate-100 text-slate-400"
                        )}
                      >
                        <div className="p-2">
                          <div className="text-xs font-semibold text-slate-700">
                            {day.getDate()}
                          </div>
                          <div className="mt-2 space-y-1">
                            {status.occupied ? (
                              <span className="inline-block rounded-full bg-olive/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-olive">
                                {t("legend.occupied")}
                              </span>
                            ) : (
                              <span className="inline-block rounded-full bg-sand/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                                {t("legend.available")}
                              </span>
                            )}
                            {status.cabins.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {status.cabins.map((cabin) => {
                                  const hasTags = cabin.checkin || cabin.checkout;
                                  return (
                                    <span
                                      key={`${key}-${cabin.name}`}
                                      className="inline-flex flex-col gap-0.5 rounded-lg bg-olive/10 px-2 py-1 text-[10px] font-medium text-olive"
                                    >
                                      <span className="leading-tight">{cabin.name}</span>
                                      {hasTags && (
                                        <span className="space-x-1 text-[9px] font-normal leading-tight">
                                          {cabin.checkin && (
                                            <span className="text-emerald-600">
                                              {t("legend.checkin")}
                                            </span>
                                          )}
                                          {cabin.checkout && (
                                            <span className="text-indigo-600">
                                              {t("legend.checkout")}
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-sand/30 bg-white/90 p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive">
          Próximas reservas
        </p>
        {filteredReservations.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">{t("empty")}</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {filteredReservations.map((reservation) => (
              <li
                key={reservation.id}
                className="flex flex-col gap-1 rounded-xl border border-sand/20 bg-white/80 p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-olive">
                    {reservation.guest_name} • {reservation.cabanas?.name ?? "—"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDateShort(reservation.check_in, localeFormat)} → {formatDateShort(reservation.check_out, localeFormat)}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {statusReservationT(reservation.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type DayStatus = {
  occupied: boolean;
  cabins: {
    name: string;
    checkin: boolean;
    checkout: boolean;
  }[];
};

function getStartOfCalendar(firstDayOfMonth: Date) {
  const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday as first day
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - dayOfWeek);
  return startDate;
}

function startOfDay(value: string) {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function keyFromDate(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function Legend({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
      <LegendItem color="bg-sand-200" label={t("legend.available")} />
      <LegendItem color="bg-olive-300" label={t("legend.occupied")} />
      <LegendItem color="bg-emerald-300" label={t("legend.checkin")} />
      <LegendItem color="bg-indigo-300" label={t("legend.checkout")} />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-sand/30 bg-white/80 px-3 py-1">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      <span className="text-xs text-slate-600">{label}</span>
    </span>
  );
}
