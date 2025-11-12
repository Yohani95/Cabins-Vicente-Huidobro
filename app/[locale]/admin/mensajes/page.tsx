import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import MessagesClient from "./MessagesClient";

export default async function AdminMessagesPage({
  params
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
  if (!locale) {
    notFound();
  }

  const supabase = await getSupabaseServerClient();

  const { data: messages } = await supabase
    .from("mensajes")
    .select("id, guest_name, guest_email, guest_phone, message, source, is_read, archived, created_at")
    .order("created_at", { ascending: false });

  return <MessagesClient locale={locale} messages={messages ?? []} />;
}
