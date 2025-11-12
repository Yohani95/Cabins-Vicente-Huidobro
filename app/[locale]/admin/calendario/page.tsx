import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import CalendarClient from "./CalendarClient";

export default async function AdminCalendarPage({
  params
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
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

  return (
    <CalendarClient
      locale={locale}
      reservations={reservations ?? []}
      cabanas={cabanas ?? []}
    />
  );
}
