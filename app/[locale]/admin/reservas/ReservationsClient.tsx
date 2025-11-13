"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Search, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatCurrencyCLP,
  formatDateForInput,
  formatDateShort
} from "@/lib/utils/format";
import {
  createReservationAction,
  updateReservationAction,
  cancelReservationAction,
  type ActionResult
} from "@/app/actions/reservations";
import { useRouter } from "next/navigation";
import { useServerAction } from "@/hooks/useServerAction";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const STATUS_VALUES = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"] as const;

type ReservationStatus = (typeof STATUS_VALUES)[number];

const STATUS_STYLES: Record<ReservationStatus, { text: string; bg: string; border: string }> = {
  pending: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200"
  },
  confirmed: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200"
  },
  checked_in: {
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200"
  },
  checked_out: {
    text: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200"
  },
  cancelled: {
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200"
  }
};

const STATUS_OPTIONS: ReadonlyArray<{ value: ReservationStatus }> = STATUS_VALUES.map((value) => ({
  value
}));

function isReservationStatus(value: string): value is ReservationStatus {
  return (STATUS_VALUES as readonly string[]).includes(value);
}

type StatusFilterKey = `statuses.${ReservationStatus}`;

type Reservation = {
  id: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  guests_count: number;
  check_in: string;
  check_out: string;
  status: ReservationStatus;
  amount: number | null;
  notes: string | null;
  cabana_id: string;
  cabanas: {
    name: string;
  } | null;
};

type CabanaOption = {
  id: string;
  name: string;
};

type ReservationFormState = {
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  guests_count: string;
  check_in: string;
  check_out: string;
  status: ReservationStatus;
  cabana_id: string;
  amount: string;
  notes: string;
};

const DEFAULT_FORM_STATE: ReservationFormState = {
  guest_name: "",
  guest_phone: "",
  guest_email: "",
  guests_count: "1",
  check_in: "",
  check_out: "",
  status: "pending",
  cabana_id: "",
  amount: "",
  notes: ""
};

type ReservationsClientProps = {
  locale: string;
  reservations: Reservation[];
  cabanas: CabanaOption[];
};

export default function ReservationsClient({
  locale,
  reservations,
  cabanas
}: ReservationsClientProps) {
  const t = useTranslations("admin.reservas");
  const statusT = useTranslations("admin.reservas.status");
  const filtersT = useTranslations("admin.reservas.filters");
  const formT = useTranslations("admin.reservas.form");
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [formState, setFormState] = useState<ReservationFormState>(
    DEFAULT_FORM_STATE
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [dateConflictMessage, setDateConflictMessage] = useState("");

  const createReservationSA = useServerAction<Record<string, unknown>, ActionResult>(
    (payload) => createReservationAction(locale, payload)
  );
  const updateReservationSA = useServerAction<Record<string, unknown>, ActionResult>(
    (payload) => updateReservationAction(locale, payload)
  );
  const cancelReservationSA = useServerAction<string, ActionResult>((id) =>
    cancelReservationAction(locale, id)
  );

  const isSubmitting =
    createReservationSA.isPending || updateReservationSA.isPending;
  const isCanceling = cancelReservationSA.isPending;

  const filteredReservations = useMemo(() => {
    return reservations
      .filter((reservation) => {
        if (statusFilter !== "all" && reservation.status !== statusFilter) {
          return false;
        }
        if (dateFrom) {
          const fromTime = new Date(dateFrom).getTime();
          const checkIn = new Date(reservation.check_in).getTime();
          if (checkIn < fromTime) return false;
        }
        if (dateTo) {
          const toTime = new Date(dateTo).getTime();
          const checkOut = new Date(reservation.check_out).getTime();
          if (checkOut > toTime + MS_PER_DAY) return false;
        }
        return true;
      })
      .filter((reservation) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return [
          reservation.guest_name,
          reservation.guest_phone ?? "",
          reservation.guest_email ?? ""
        ].some((value) => value.toLowerCase().includes(term));
      });
  }, [reservations, statusFilter, dateFrom, dateTo, searchTerm]);

  const formatAmount = (value: number) => formatCurrencyCLP(value, locale === 'en' ? 'en-US' : 'es-CL');
  const formatDate = (value: string) => formatDateShort(value, locale === 'en' ? 'en-US' : 'es-CL');

  const reservationBlocks = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        start: number;
        end: number;
        check_in: string;
        check_out: string;
      }[]
    >();

    reservations.forEach((reservation) => {
      if (reservation.status === "cancelled") return;
      const start = startOfDay(reservation.check_in).getTime();
      const end = startOfDay(reservation.check_out).getTime();
      if (!map.has(reservation.cabana_id)) {
        map.set(reservation.cabana_id, []);
      }
      map.get(reservation.cabana_id)!.push({
        id: reservation.id,
        start,
        end: startOfDay(reservation.check_out).getTime(),
        check_in: reservation.check_in,
        check_out: reservation.check_out
      });
    });

    return map;
  }, [reservations]);

  const selectedCabinBlocks = useMemo(() => {
    if (!formState.cabana_id) return [];
    const blocks = reservationBlocks.get(formState.cabana_id) ?? [];
    const filtered = blocks.filter((block) => {
      if (mode === "edit" && editingId) {
        return block.id !== editingId;
      }
      return true;
    });
    return filtered.sort((a, b) => a.start - b.start);
  }, [formState.cabana_id, reservationBlocks, mode, editingId]);

  const isDateInvalid =
    Boolean(formState.check_in) &&
    Boolean(formState.check_out) &&
    new Date(formState.check_out) <= new Date(formState.check_in);

  const hasRangeConflict = useCallback(
    (cabanaId: string, startISO: string, endISO: string) => {
      if (!cabanaId || !startISO || !endISO) return false;
      const blocks = reservationBlocks.get(cabanaId) ?? [];
      const start = startOfDay(startISO).getTime();
      const end = startOfDay(endISO).getTime();
      if (Number.isNaN(start) || Number.isNaN(end)) return false;
      return blocks.some((block) => {
        if (mode === "edit" && editingId && block.id === editingId) {
          return false;
        }
        return start < block.end && end > block.start;
      });
    },
    [reservationBlocks, mode, editingId]
  );

  const selectedCabinName = useMemo(() => {
    if (!formState.cabana_id) return "";
    const cabin = cabanas.find((cabana) => cabana.id === formState.cabana_id);
    return cabin?.name ?? "";
  }, [cabanas, formState.cabana_id]);

  const steps = useMemo(
    () => [
      { id: 1, label: formT("steps.cabin") },
      { id: 2, label: formT("steps.dates") },
      { id: 3, label: formT("steps.details") }
    ],
    [formT]
  );

  const canProceedToDates = Boolean(formState.cabana_id);
  const canProceedToDetails =
    canProceedToDates &&
    Boolean(formState.check_in) &&
    Boolean(formState.check_out) &&
    !isDateInvalid &&
    !dateConflictMessage;

  const handleSelectCabin = useCallback(
    (cabanaId: string) => {
      setDateConflictMessage("");
      setFormState((prev) => {
        if (prev.cabana_id === cabanaId) return prev;
        return {
          ...prev,
          cabana_id: cabanaId,
          check_in: "",
          check_out: ""
        };
      });
      setCurrentStep(2);
    },
    []
  );

  const handlePrevStep = useCallback(() => {
    setDateConflictMessage("");
    setCurrentStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3)));
  }, []);

  const handleNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (!canProceedToDates) return;
      setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      if (!canProceedToDetails) return;
      setCurrentStep(3);
    }
  }, [currentStep, canProceedToDates, canProceedToDetails]);

  const openCreateForm = () => {
    setMode("create");
    setEditingId(null);
    setFormState(DEFAULT_FORM_STATE);
    createReservationSA.setError("");
    updateReservationSA.setError("");
    setDateConflictMessage("");
    setCurrentStep(1);
    setIsFormOpen(true);
  };

  const openEditForm = (reservation: Reservation) => {
    setMode("edit");
    setEditingId(reservation.id);
    createReservationSA.setError("");
    updateReservationSA.setError("");
    setDateConflictMessage("");
    setCurrentStep(3);
    setFormState({
      guest_name: reservation.guest_name,
      guest_phone: reservation.guest_phone ?? "",
      guest_email: reservation.guest_email ?? "",
      guests_count: reservation.guests_count.toString(),
      check_in: formatDateForInput(reservation.check_in),
      check_out: formatDateForInput(reservation.check_out),
      status: reservation.status,
      cabana_id: reservation.cabana_id,
      amount: reservation.amount ? reservation.amount.toString() : "",
      notes: reservation.notes ?? ""
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (createReservationSA.isPending || updateReservationSA.isPending) return;
    setIsFormOpen(false);
    setFormState(DEFAULT_FORM_STATE);
    setEditingId(null);
    createReservationSA.setError("");
    updateReservationSA.setError("");
    setDateConflictMessage("");
    setCurrentStep(1);
  };

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createReservationSA.setError("");
    updateReservationSA.setError("");
    setDateConflictMessage("");

    if (isDateInvalid) {
      return;
    }

    const payload = {
      guest_name: formState.guest_name,
      guest_phone: formState.guest_phone,
      guest_email: formState.guest_email,
      guests_count: formState.guests_count,
      check_in: formState.check_in,
      check_out: formState.check_out,
      status: formState.status,
      cabana_id: formState.cabana_id,
      amount: formState.amount,
      notes: formState.notes
    } satisfies Record<string, unknown>;

    if (
      formState.cabana_id &&
      formState.check_in &&
      formState.check_out &&
      hasRangeConflict(formState.cabana_id, formState.check_in, formState.check_out)
    ) {
      setDateConflictMessage(formT("date_conflict"));
      return;
    }

    const actionHook =
      mode === "create" ? createReservationSA : updateReservationSA;

    actionHook.execute({
      ...(mode === "edit" && editingId ? { id: editingId } : {}),
      ...payload
    }, () => {
      closeForm();
      router.refresh();
    });
  };

  const cancelReservation = (id: string) => {
    if (!window.confirm(t("confirm_cancel"))) return;
    cancelReservationSA.execute(id, () => router.refresh());
  };

  const todayStart = useMemo(() => startOfDay(new Date()), []);

  const selectedRange = useMemo(() => {
    if (!formState.check_in) return undefined;
    const from = toLocalDate(formState.check_in);
    if (!formState.check_out) return { from } as { from: Date; to?: Date };
    const to = toLocalDate(formState.check_out);
    return { from, to };
  }, [formState.check_in, formState.check_out]);

  const disabledDays = useMemo(() => {
    const occupiedRanges = selectedCabinBlocks.map((block) => ({
      from: new Date(block.start),
      to: addDays(new Date(block.end), -1)
    }));
    return [{ before: todayStart }, ...occupiedRanges];
  }, [selectedCabinBlocks, todayStart]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl  font-semibold text-olive">{t("title")}</h1>
          <p className="text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder={t("search_placeholder")}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full md:w-64 rounded-xl border border-sand/40 bg-white/80 py-2 pl-9 pr-3 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-sand/40 bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
          >
            <option value="all">{filtersT("statuses.all")}</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {filtersT(`statuses.${option.value}` as StatusFilterKey)}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">{filtersT("from")}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="rounded-xl border border-sand/40 bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">{filtersT("to")}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="rounded-xl border border-sand/40 bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.refresh()}
            disabled={isSubmitting || isCanceling}
          >
            {isSubmitting || isCanceling ? "Actualizando…" : t("refresh")}
          </Button>
          <Button size="sm" onClick={openCreateForm} disabled={isSubmitting}>
            {t("create")}
          </Button>
        </div>
      </header>

      {filteredReservations.length === 0 ? (
        <section className="rounded-3xl border border-sand/30 bg-white/80 p-8 text-center shadow-card">
          <Users className="mx-auto h-10 w-10 text-olive" />
          <h2 className="mt-4 text-lg font-semibold text-olive">
            {t("empty.title")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{t("empty.description")}</p>
          <Button size="sm" className="mt-6" onClick={openCreateForm}>
            {t("create")}
          </Button>
        </section>
      ) : (
        <>
          <section className="space-y-3 md:hidden">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="rounded-3xl border border-sand/30 bg-white/90 p-5 shadow-card"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-olive">
                      {reservation.guest_name}
                    </span>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {reservation.cabanas?.name ?? "—"}
                    </span>
                  </div>
                  <StatusBadge status={reservation.status}>
                    {statusT(reservation.status)}
                  </StatusBadge>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {t("table.dates")}
                    </span>
                    <span className="text-slate-700">
                      {formatDate(reservation.check_in)} →{" "}
                      {formatDate(reservation.check_out)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {t("table.guests")}
                    </span>
                    <span>{reservation.guests_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {t("table.amount")}
                    </span>
                    <span className="font-medium text-slate-700">
                      {reservation.amount
                        ? formatAmount(reservation.amount)
                        : "—"}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    {reservation.guest_phone && <p>{reservation.guest_phone}</p>}
                    {reservation.guest_email && <p>{reservation.guest_email}</p>}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    variant="outline"
                    onClick={() => openEditForm(reservation)}
                  >
                    {t("actions.edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-red-600"
                    onClick={() => cancelReservation(reservation.id)}
                    disabled={isCanceling}
                  >
                    {t("actions.cancel")}
                  </Button>
                </div>
              </div>
            ))}
          </section>

          <section className="hidden rounded-3xl border border-sand/30 bg-white/90 shadow-card md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-sand/30 text-left text-sm text-slate-700">
                <thead className="bg-sand/10 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3">{t("table.guest")}</th>
                    <th className="px-6 py-3">{t("table.cabana")}</th>
                    <th className="px-6 py-3">{t("table.dates")}</th>
                    <th className="px-6 py-3">{t("table.guests")}</th>
                    <th className="px-6 py-3">{t("table.status")}</th>
                    <th className="px-6 py-3 text-right">{t("table.amount")}</th>
                    <th className="px-6 py-3 text-right">{t("table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/20">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {reservation.guest_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {reservation.guest_phone ?? "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {reservation.guest_email ?? "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {reservation.cabanas?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatDate(reservation.check_in)} →{" "}
                        {formatDate(reservation.check_out)}
                      </td>
                      <td className="px-6 py-4">{reservation.guests_count}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={reservation.status}>
                        {statusT(reservation.status)}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">
                        {reservation.amount
                          ? formatAmount(reservation.amount)
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditForm(reservation)}
                          >
                            {t("actions.edit")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => cancelReservation(reservation.id)}
                            disabled={isCanceling}
                          >
                            {t("actions.cancel")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6 sm:py-10">
          <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-sand/40 bg-white/95 shadow-2xl">
            <div className="flex items-start justify-between gap-3 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-olive">
                  {mode === "create" ? formT("create_title") : formT("edit_title")}
                </h2>
                <p className="text-xs text-slate-500">{t("subtitle")}</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-sand/30 p-1 text-slate-500 transition hover:border-olive hover:text-olive"
                onClick={closeForm}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              className="h-full max-h-[80vh] overflow-y-auto px-5 pb-6 pt-2 sm:px-6 sm:pb-8"
              onSubmit={submitForm}
            >
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  {steps.map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-center gap-2",
                          isActive ? "text-olive" : isCompleted ? "text-olive/60" : "text-slate-400"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                            isActive
                              ? "border-olive bg-olive text-white"
                              : isCompleted
                                ? "border-olive/50 bg-olive/10 text-olive"
                                : "border-sand/40 bg-white"
                          )}
                        >
                          {step.id}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.25em]">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {formT("step_hint.cabin")}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {cabanas.map((cabana) => {
                        const blocks = reservationBlocks.get(cabana.id) ?? [];
                        const upcoming = blocks
                          .filter((block) => block.end >= Date.now())
                          .sort((a, b) => a.start - b.start)[0];
                        const isSelected = formState.cabana_id === cabana.id;
                        return (
                          <button
                            type="button"
                            key={cabana.id}
                            onClick={() => handleSelectCabin(cabana.id)}
                            className={cn(
                              "w-full rounded-2xl border px-4 py-4 text-left transition hover:border-olive/60 hover:bg-olive/5",
                              isSelected ? "border-olive bg-olive/10 shadow-sm" : "border-sand/40 bg-white"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-olive">{cabana.name}</span>
                              {isSelected && (
                                <span className="rounded-full bg-olive px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                                  {formT("selected_label")}
                                </span>
                              )}
                            </div>
                            <p className="mt-3 text-xs text-slate-500">
                              {upcoming
                                ? `${formT("step_hint.next")} ${formatDate(upcoming.check_in)} → ${formatDate(upcoming.check_out)}`
                                : formT("step_hint.free")}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                      <span>{formT("step_hint.dates")}</span>
                      {selectedCabinName && (
                        <span className="rounded-full border border-olive/40 bg-white px-2 py-0.5 text-[11px] font-medium text-olive">
                          {selectedCabinName}
                        </span>
                      )}
                    </div>

                    <div className="rounded-2xl border border-sand/40 bg-white p-4">
                      <DayPicker
                        mode="range"
                        selected={selectedRange}
                        numberOfMonths={1}
                        defaultMonth={formState.check_in ? toLocalDate(formState.check_in) : todayStart}
                        onSelect={(range) => {
                          setDateConflictMessage("");
                          if (!range?.from || !range?.to) {
                            setFormState((prev) => ({ ...prev, check_in: "", check_out: "" }));
                            return;
                          }
                          const fromISO = formatDateForInput(startOfDay(range.from));
                          const toISO = formatDateForInput(startOfDay(range.to));
                          if (
                            formState.cabana_id &&
                            hasRangeConflict(formState.cabana_id, fromISO, toISO)
                          ) {
                            setDateConflictMessage(formT("date_conflict"));
                            setFormState((prev) => ({ ...prev, check_in: "", check_out: "" }));
                            return;
                          }
                          setFormState((prev) => ({
                            ...prev,
                            check_in: fromISO,
                            check_out: toISO
                          }));
                        }}
                        disabled={disabledDays}
                        formatters={{
                          formatCaption: (month) =>
                            month.toLocaleDateString(locale === "en" ? "en-US" : "es-CL", {
                              month: "long",
                              year: "numeric"
                            }),
                          formatWeekdayName: (day) =>
                            day.toLocaleDateString(locale === "en" ? "en-US" : "es-CL", {
                              weekday: "short"
                            })
                        }}
                      />
                    </div>

                    {(isDateInvalid || dateConflictMessage) && (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        {isDateInvalid ? formT("date_error") : dateConflictMessage}
                      </p>
                    )}

                    {selectedCabinBlocks.length > 0 && (
                      <div className="rounded-xl border border-sand/30 bg-sand/10 p-3 text-xs text-slate-600">
                        <p className="font-semibold uppercase tracking-[0.2em] text-olive">
                          {formT("occupied_ranges_title")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedCabinBlocks.map((block) => (
                            <span
                              key={block.id}
                              className="inline-flex items-center gap-2 rounded-full border border-olive/20 bg-white px-3 py-1 text-[11px] font-medium text-olive"
                            >
                              {formatDate(block.check_in)} → {formatDate(block.check_out)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                      <span>{formT("step_hint.details")}</span>
                      {selectedCabinName && (
                        <span className="rounded-full border border-olive/40 bg-white px-2 py-0.5 text-[11px] font-medium text-olive">
                          {selectedCabinName}
                        </span>
                      )}
                      {formState.check_in && formState.check_out && (
                        <span className="rounded-full border border-sand/40 bg-sand/10 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {formatDate(formState.check_in)} → {formatDate(formState.check_out)}
                        </span>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        label={formT("guest_name")}
                        value={formState.guest_name}
                        onChange={(value) =>
                          setFormState((prev) => ({ ...prev, guest_name: value }))
                        }
                        required
                      />
                      <FormField
                        label={formT("guest_phone")}
                        value={formState.guest_phone}
                        onChange={(value) =>
                          setFormState((prev) => ({ ...prev, guest_phone: value }))
                        }
                      />
                      <FormField
                        label={formT("guest_email")}
                        type="email"
                        value={formState.guest_email}
                        onChange={(value) =>
                          setFormState((prev) => ({ ...prev, guest_email: value }))
                        }
                      />
                      <FormField
                        label={formT("guests_count")}
                        type="number"
                        min="1"
                        value={formState.guests_count}
                        onChange={(value) =>
                          setFormState((prev) => ({ ...prev, guests_count: value }))
                        }
                      />
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-olive">
                          {formT("status")}
                        </label>
                        <select
                          value={formState.status}
                          onChange={(event) =>
                      setFormState((prev) => {
                        const nextStatus = event.target.value;
                        return isReservationStatus(nextStatus)
                          ? { ...prev, status: nextStatus }
                          : prev;
                      })
                          }
                          className="w-full rounded-xl border border-sand/40 bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
                        >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {statusT(option.value)}
                      </option>
                    ))}
                        </select>
                      </div>
                      <FormField
                        label={formT("amount")}
                        type="number"
                        min="0"
                        step="1000"
                        value={formState.amount}
                        onChange={(value) =>
                          setFormState((prev) => ({ ...prev, amount: value }))
                        }
                      />
                      <div className="md:col-span-2 space-y-1">
                        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-olive">
                          {formT("notes")}
                        </label>
                        <textarea
                          value={formState.notes}
                          onChange={(event) =>
                            setFormState((prev) => ({ ...prev, notes: event.target.value }))
                          }
                          rows={3}
                          className="w-full rounded-xl border border-sand/40 bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {createReservationSA.error || updateReservationSA.error ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {createReservationSA.error || updateReservationSA.error}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {formT("cancel")}
                </Button>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {formT("back")}
                  </Button>
                )}
                {currentStep < 3 && (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={
                      isSubmitting ||
                      (currentStep === 1 && !canProceedToDates) ||
                      (currentStep === 2 && !canProceedToDetails)
                    }
                    className="w-full sm:w-auto"
                  >
                    {currentStep === 1 ? formT("next_step") : formT("go_to_details")}
                  </Button>
                )}
                {currentStep === 3 && (
                  <Button
                    type="submit"
                    disabled={isSubmitting || isDateInvalid || Boolean(dateConflictMessage)}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting
                      ? "Guardando…"
                      : mode === "create"
                        ? formT("submit_create")
                        : formT("submit_update")}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      {cancelReservationSA.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {cancelReservationSA.error}
        </p>
      )}
    </div>
  );
}

type StatusBadgeProps = {
  status: ReservationStatus;
  children: React.ReactNode;
};

function StatusBadge({ status, children }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES["pending"];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        styles.text,
        styles.bg,
        styles.border
      )}
    >
      {children}
    </span>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  min?: string;
  step?: string;
  max?: string;
};

function FormField({
  label,
  value,
  onChange,
  required,
  type = "text",
  min,
  step,
  max
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-olive">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-xl border border-sand/40 bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
      />
    </div>
  );
}

function toLocalDate(value: string | Date) {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function startOfDay(value: string | Date) {
  const date = toLocalDate(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  base.setDate(base.getDate() + days);
  return base;
}
