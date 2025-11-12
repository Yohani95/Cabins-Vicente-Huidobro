"use server";

import { revalidatePath } from "next/cache";
import { paymentSchema, paymentIdSchema } from "@/lib/schemas/payment";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/actions/reservations";

const dashboardPaths = ["/admin", "/admin/reservas", "/admin/pagos"];

function revalidateLocales(locale: string) {
  dashboardPaths.forEach((path) => revalidatePath(`/${locale}${path}`));
}

export async function createPaymentAction(
  locale: string,
  raw: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const parsed = paymentSchema.parse(raw);
    const supabase = await getSupabaseServerClient();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user?.id) {
      return { ok: false, error: "Sesión inválida" };
    }

    const payload = {
      ...parsed,
      reference: parsed.reference?.trim() || null,
      notes: parsed.notes?.trim() || null,
      created_by: sessionData.session.user.id
    };

    const { error } = await supabase.from("pagos").insert(payload);
    if (error) {
      console.error("createPaymentAction", error);
      return { ok: false, error: "Error al registrar el pago" };
    }

    revalidateLocales(locale);
    return { ok: true };
  } catch (error) {
    console.error("createPaymentAction", error);
    return { ok: false, error: "Datos inválidos" };
  }
}

export async function deletePaymentAction(
  locale: string,
  raw: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const parsed = paymentIdSchema.parse(raw);
    const supabase = await getSupabaseServerClient();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user?.id) {
      return { ok: false, error: "Sesión inválida" };
    }

    const { error } = await supabase
      .from("pagos")
      .delete()
      .eq("id", parsed.id);

    if (error) {
      console.error("deletePaymentAction", error);
      return { ok: false, error: "No pudimos eliminar el pago" };
    }

    revalidateLocales(locale);
    return { ok: true };
  } catch (error) {
    console.error("deletePaymentAction", error);
    return { ok: false, error: "Datos inválidos" };
  }
}
