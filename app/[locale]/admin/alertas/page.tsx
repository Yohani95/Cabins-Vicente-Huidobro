import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import AlertsClient from "./AlertsClient";

export default async function AdminAlertsPage({
  params
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
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

  return (
    <AlertsClient
      locale={locale}
      reservations={reservations ?? []}
      unreadMessages={unreadMessages ?? []}
    />
  );
}
