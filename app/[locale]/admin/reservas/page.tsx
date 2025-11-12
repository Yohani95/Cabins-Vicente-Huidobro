import ReservationsClient from './ReservationsClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function AdminReservationsPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
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

  return (
    <ReservationsClient
      locale={locale}
      reservations={reservations ?? []}
      cabanas={cabanas ?? []}
    />
  );
}

