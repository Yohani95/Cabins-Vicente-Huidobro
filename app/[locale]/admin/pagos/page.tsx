import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import PaymentsClient from "./PaymentsClient";

export default async function AdminPaymentsPage({
  params
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
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

  return <PaymentsClient locale={locale} reservations={reservations ?? []} />;
}
