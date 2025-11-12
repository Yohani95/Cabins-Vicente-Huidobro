import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import CalendarClient from "./CalendarClient";

type AdminCalendarPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCalendarPage({ params }: AdminCalendarPageProps) {
  const { locale } = await params;
  if (!locale) {
    notFound();
  }

  const supabase = await getSupabaseServerClient();

  const [{ data: reservations }, { data: cabanas }] = await Promise.all([
    supabase
      .from("reservas")
      .select("id, cabana_id, guest_name, status, check_in, check_out, cabanas(name)")
      .order("check_in", { ascending: true }),
    supabase.from("cabanas").select("id, name").order("name", { ascending: true })
  ]);

  type ReservationStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

  type ReservationRecord = {
    id: string;
    cabana_id: string;
    guest_name: string;
    status: ReservationStatus;
    check_in: string;
    check_out: string;
    cabanas: { name: string } | { name: string }[] | null;
  };

  const reservationRecords: ReservationRecord[] = Array.isArray(reservations)
    ? (reservations as ReservationRecord[])
    : [];

  const normalizedReservations = reservationRecords.map((reservation) => ({
    ...reservation,
    cabanas: Array.isArray(reservation.cabanas)
      ? reservation.cabanas[0] ?? null
      : reservation.cabanas ?? null
  }));

  const normalizedCabanas = Array.isArray(cabanas) ? cabanas : [];

  return (
    <CalendarClient
      locale={locale}
      reservations={normalizedReservations}
      cabanas={normalizedCabanas}
    />
  );
}
