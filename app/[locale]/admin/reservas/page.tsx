import ReservationsClient from './ReservationsClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

type AdminReservationsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminReservationsPage({ params }: AdminReservationsPageProps) {
  const { locale } = await params;
  if (!locale) {
    notFound();
  }

  const supabase = await getSupabaseServerClient();

  const [{ data: reservations }, { data: cabanas }] = await Promise.all([
    supabase
      .from('reservas')
      .select(
        'id, guest_name, guest_phone, guest_email, guests_count, check_in, check_out, status, amount, notes, cabana_id, cabanas(name)'
      )
      .order('check_in', { ascending: true }),
    supabase
      .from('cabanas')
      .select('id, name')
      .order('name', { ascending: true })
  ]);

  type ReservationStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

  type ReservationRecord = {
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
    cabanas: { name: string } | { name: string }[] | null;
  };

  type CabanaRecord = {
    id: string;
    name: string;
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

  const normalizedCabanas: CabanaRecord[] = Array.isArray(cabanas)
    ? (cabanas as CabanaRecord[])
    : [];

  return (
    <ReservationsClient
      locale={locale}
      reservations={normalizedReservations}
      cabanas={normalizedCabanas}
    />
  );
}

