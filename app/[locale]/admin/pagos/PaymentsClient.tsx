"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { formatCurrencyCLP, formatDateShort } from "@/lib/utils/format";
import { useServerAction } from "@/hooks/useServerAction";
import {
  createPaymentAction,
  deletePaymentAction
} from "@/app/actions/payments";
import type { ActionResult } from "@/app/actions/reservations";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plus, RefreshCcw, Search, Trash2, Wallet } from "lucide-react";

const PAYMENT_TYPES = [
  { value: "partial", label: "Anticipo" },
  { value: "full", label: "Pago total" }
] as const;

const METHODS = ["transfer", "cash", "debit", "credit"] as const;

type Payment = {
  id: string;
  amount: number;
  currency: string;
  payment_type: string;
  method: string;
  reference: string | null;
  status: string;
  created_at: string;
};

type ReservationWithPayments = {
  id: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  status: string;
  amount: number | null;
  cabanas: {
    name: string;
  } | null;
  pagos: Payment[];
};

type PaymentsClientProps = {
  locale: string;
  reservations: ReservationWithPayments[];
};

const DEFAULT_FORM = {
  reserva_id: "",
  amount: "",
  payment_type: "partial",
  method: "transfer",
  reference: ""
};

type PaymentFormState = typeof DEFAULT_FORM;

type ModalState = {
  open: boolean;
  reservationId: string | null;
};

export default function PaymentsClient({ locale, reservations }: PaymentsClientProps) {
  const t = useTranslations("admin.pagos");
  const statusReservationT = useTranslations("admin.reservas.status");
  const localeFormat = locale === "en" ? "en-US" : "es-CL";
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [formState, setFormState] = useState<PaymentFormState>(DEFAULT_FORM);
  const [modalState, setModalState] = useState<ModalState>({ open: false, reservationId: null });

  const createPaymentSA = useServerAction<Record<string, unknown>, ActionResult>((payload) =>
    createPaymentAction(locale, payload)
  );
  const deletePaymentSA = useServerAction<Record<string, unknown>, ActionResult>((payload) =>
    deletePaymentAction(locale, payload)
  );

  const summary = useMemo(() => {
    return reservations.map((reservation) => {
      const totalBooking = reservation.amount ?? 0;
      const totalPaid = reservation.pagos.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
      const balance = totalBooking - totalPaid;
      return {
        ...reservation,
        totalBooking,
        totalPaid,
        balance
      };
    });
  }, [reservations]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return summary;
    const term = searchTerm.toLowerCase();
    return summary.filter((reservation) =>
      [
        reservation.guest_name,
        reservation.cabanas?.name ?? "",
        reservation.guest_phone ?? "",
        reservation.guest_email ?? ""
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [summary, searchTerm]);

  const openModal = (reservationId: string) => {
    setModalState({ open: true, reservationId });
    setFormState({ ...DEFAULT_FORM, reserva_id: reservationId });
    createPaymentSA.setError("");
  };

  const closeModal = () => {
    if (createPaymentSA.isPending) return;
    setModalState({ open: false, reservationId: null });
    setFormState(DEFAULT_FORM);
    createPaymentSA.setError("");
  };

  const submitPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createPaymentSA.setError("");
    const payload = {
      reserva_id: formState.reserva_id,
      amount: formState.amount,
      payment_type: formState.payment_type,
      method: formState.method,
      reference: formState.reference
    } satisfies Record<string, unknown>;

    createPaymentSA.execute(payload, () => {
      closeModal();
      router.refresh();
    });
  };

  const removePayment = (paymentId: string) => {
    if (!window.confirm(t("delete.confirm"))) return;
    deletePaymentSA.setError("");
    deletePaymentSA.execute({ id: paymentId }, () => router.refresh());
  };

  const formatCurrency = (value: number) => formatCurrencyCLP(value, localeFormat);
  const formatDate = (value: string) => formatDateShort(value, localeFormat);

  const paymentTypeOptions = PAYMENT_TYPES.map((option) => ({
    value: option.value,
    label: t(`form.payment_types.${option.value}`)
  }));
  const methodOptions = METHODS.map((method) => ({
    value: method,
    label: t(`form.methods.${method}`)
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-olive">{t("title")}</h1>
          <p className="text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder={t("search_placeholder")}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-64 rounded-xl border border-sand/40 bg-white/80 py-2 pl-9 pr-3 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.refresh()}
            disabled={createPaymentSA.isPending || deletePaymentSA.isPending}
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Actualizar
          </Button>
        </div>
      </header>

      {(createPaymentSA.error || deletePaymentSA.error) && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {createPaymentSA.error || deletePaymentSA.error}
        </p>
      )}

      {filtered.length === 0 ? (
        <section className="rounded-3xl border border-sand/30 bg-white/80 p-8 text-center shadow-card">
          <Wallet className="mx-auto h-10 w-10 text-olive" />
          <h2 className="mt-4 text-lg font-semibold text-olive">
            {t("empty.title")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{t("empty.description")}</p>
        </section>
      ) : (
        <section className="space-y-4">
          {filtered.map((reservation) => (
            <article
              key={reservation.id}
              className="rounded-3xl border border-sand/30 bg-white/90 p-6 shadow-card"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-olive">{reservation.guest_name}</p>
                  <p className="text-xs text-slate-500">
                    {reservation.cabanas?.name ?? "—"} • {statusReservationT(reservation.status as any)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-700">
                  <SummaryPill label={t("table.booking_amount")}>{formatCurrency(reservation.totalBooking)}</SummaryPill>
                  <SummaryPill label={t("table.paid")}>{formatCurrency(reservation.totalPaid)}</SummaryPill>
                  <SummaryPill label={t("table.balance")}>{formatCurrency(reservation.balance)}</SummaryPill>
                  <Button size="sm" onClick={() => openModal(reservation.id)}>
                    <Plus className="mr-2 h-4 w-4" /> {t("form.title")}
                  </Button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-sand/20 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive">
                  {t("payments.title")}
                </p>
                {reservation.pagos.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    {t("payments.no_payments")}
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {reservation.pagos.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-col gap-2 rounded-xl border border-sand/30 bg-white/90 p-3 text-sm text-slate-700 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-medium text-olive">
                            {formatCurrency(payment.amount)} • {payment.payment_type}
                          </p>
                          <p className="text-xs text-slate-500">
                            {t("payments.method")}: {payment.method} • {t("payments.date")}: {formatDate(payment.created_at)}
                          </p>
                          {payment.reference && (
                            <p className="text-xs text-slate-500">
                              {t("payments.reference")}: {payment.reference}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => removePayment(payment.id)}
                          disabled={deletePaymentSA.isPending}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> {t("delete.label")}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {modalState.open && modalState.reservationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-10">
          <div className="w-full max-w-md rounded-3xl border border-sand/40 bg-white/95 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-olive">{t("form.title")}</h2>
                <p className="text-xs text-slate-500">{t("subtitle")}</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-sand/30 p-1 text-slate-500 transition hover:border-olive hover:text-olive"
                onClick={closeModal}
                disabled={createPaymentSA.isPending}
              >
                ×
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={submitPayment}>
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-olive">
                  {t("form.amount")}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formState.amount}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  required
                  className="w-full rounded-xl border border-sand/40 bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-olive">
                  {t("form.payment_type")}
                </label>
                <select
                  value={formState.payment_type}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, payment_type: event.target.value }))
                  }
                  className="w-full rounded-xl border border-sand/40 bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
                >
                  {paymentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-olive">
                  {t("form.method")}
                </label>
                <select
                  value={formState.method}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, method: event.target.value }))
                  }
                  className="w-full rounded-xl border border-sand/40 bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
                >
                  {methodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-olive">
                  {t("form.reference")}
                </label>
                <input
                  type="text"
                  value={formState.reference}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, reference: event.target.value }))
                  }
                  className="w-full rounded-xl border border-sand/40 bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
                />
              </div>

              {createPaymentSA.error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {createPaymentSA.error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeModal} disabled={createPaymentSA.isPending}>
                  {t("form.cancel")}
                </Button>
                <Button type="submit" disabled={createPaymentSA.isPending}>
                  {createPaymentSA.isPending ? "Guardando…" : t("form.submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryPill({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-sand/40 bg-white/70 px-3 py-2 text-xs">
      <p className="font-semibold text-slate-600">{label}</p>
      <p className="text-sm text-olive">{children}</p>
    </div>
  );
}
