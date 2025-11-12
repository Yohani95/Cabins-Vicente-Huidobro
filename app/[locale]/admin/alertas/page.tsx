import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import AlertsClient, { type ReservationAlert, type MessageAlert } from "./AlertsClient";

type AdminAlertsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAlertsPage({ params }: AdminAlertsPageProps) {
  const { locale } = await params;
  if (!locale) {
    notFound();
  }

  const supabase = await getSupabaseServerClient();

  const [{ data: reservations }, { data: unreadMessages }] = await Promise.all([
    supabase
      .from("reservas")
      .select(
        "id, guest_name, status, check_in, check_out, amount, cabanas(name), pagos(amount)"
      ),
    supabase
      .from("mensajes")
      .select("id, guest_name, guest_phone, guest_email, message, created_at")
      .eq("is_read", false)
      .eq("archived", false)
      .order("created_at", { ascending: false })
  ]);

  type ReservationRecord = Omit<ReservationAlert, "cabanas" | "pagos"> & {
    cabanas: { name: string } | { name: string }[] | null;
    pagos: Array<{ amount: number | null }> | null;
  };

  const reservationRecords: ReservationRecord[] = Array.isArray(reservations)
    ? (reservations as ReservationRecord[])
    : [];

  const normalizedReservations: ReservationAlert[] = reservationRecords.map((reservation) => ({
    ...reservation,
    cabanas: Array.isArray(reservation.cabanas)
      ? reservation.cabanas[0] ?? null
      : reservation.cabanas ?? null,
    pagos: reservation.pagos ?? []
  }));

  const normalizedUnreadMessages: MessageAlert[] = Array.isArray(unreadMessages)
    ? (unreadMessages as MessageAlert[])
    : [];

  return (
    <AlertsClient
      locale={locale}
      reservations={normalizedReservations}
      unreadMessages={normalizedUnreadMessages}
    />
  );
}
