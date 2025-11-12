import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import PaymentsClient from "./PaymentsClient";

type AdminPaymentsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPaymentsPage({ params }: AdminPaymentsPageProps) {
  const { locale } = await params;
  if (!locale) {
    notFound();
  }

  const supabase = await getSupabaseServerClient();

  const { data: reservations } = await supabase
    .from("reservas")
    .select(
      "id, guest_name, guest_phone, guest_email, status, amount, cabana_id, cabanas(name), pagos(id, amount, currency, payment_type, method, reference, status, created_at)"
    )
    .order("check_in", { ascending: true });

  type ReservationStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

  type PaymentRecord = {
    id: string;
    amount: number;
    currency: string;
    payment_type: string;
    method: string;
    reference: string | null;
    status: string;
    created_at: string;
  };

  type ReservationRecord = {
    id: string;
    guest_name: string;
    guest_phone: string | null;
    guest_email: string | null;
    status: ReservationStatus;
    amount: number | null;
    cabana_id: string;
    cabanas: { name: string } | { name: string }[] | null;
    pagos: PaymentRecord[] | null;
  };

  const reservationRecords: ReservationRecord[] = Array.isArray(reservations)
    ? (reservations as ReservationRecord[])
    : [];

  const normalizedReservations = reservationRecords.map((reservation) => ({
    ...reservation,
    cabanas: Array.isArray(reservation.cabanas)
      ? reservation.cabanas[0] ?? null
      : reservation.cabanas ?? null,
    pagos: reservation.pagos ?? []
  }));

  return <PaymentsClient locale={locale} reservations={normalizedReservations} />;
}
