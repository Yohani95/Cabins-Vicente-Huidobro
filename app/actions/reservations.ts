"use server";

import { revalidatePath } from "next/cache";
import { createReservationSchema, updateReservationSchema } from "@/lib/schemas/reservation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createReservationAction(
  locale: string,
  rawInput: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const parsed = createReservationSchema.parse(rawInput);
    const supabase = await getSupabaseServerClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { ok: false, error: "Sesión inválida" };
    }

    const { data: conflicts, error: conflictsError } = await supabase
      .from("reservas")
      .select("id")
      .eq("cabana_id", parsed.cabana_id)
      .neq("status", "cancelled")
      .gt("check_out", parsed.check_in)
      .lt("check_in", parsed.check_out);

    if (conflictsError) {
      console.error("createReservationAction conflict check", conflictsError);
      return { ok: false, error: "Error al crear la reserva" };
    }

    if (conflicts && conflicts.length > 0) {
      return {
        ok: false,
        error:
          locale === "en"
            ? "This cabin already has a reservation for those dates."
            : "Esa cabaña ya tiene reservas en esas fechas."
      };
    }

    const payload = {
      ...parsed,
      guest_phone: parsed.guest_phone?.trim() || null,
      guest_email: parsed.guest_email?.toString().trim() || null,
      notes: parsed.notes?.trim() || null,
      created_by: userData.user.id
    };

    const { error } = await supabase.from("reservas").insert(payload);
    if (error) {
      console.error("createReservationAction", error);
      return { ok: false, error: "Error al crear la reserva" };
    }

    revalidatePath(`/${locale}/admin/reservas`);
    revalidatePath(`/${locale}/admin`);
    return { ok: true };
  } catch (error) {
    console.error("createReservationAction", error);
    return { ok: false, error: "Datos inválidos" };
  }
}

export async function updateReservationAction(
  locale: string,
  rawInput: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const parsed = updateReservationSchema.parse(rawInput);
    const supabase = await getSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { ok: false, error: "Sesión inválida" };
    }

    const { data: conflicts, error: conflictsError } = await supabase
      .from("reservas")
      .select("id")
      .eq("cabana_id", parsed.cabana_id)
      .neq("status", "cancelled")
      .neq("id", parsed.id)
      .gt("check_out", parsed.check_in)
      .lt("check_in", parsed.check_out);

    if (conflictsError) {
      console.error("updateReservationAction conflict check", conflictsError);
      return { ok: false, error: "Error al actualizar la reserva" };
    }

    if (conflicts && conflicts.length > 0) {
      return {
        ok: false,
        error:
          locale === "en"
            ? "This cabin already has a reservation for those dates."
            : "Esa cabaña ya tiene reservas en esas fechas."
      };
    }

    const payload = {
      guest_name: parsed.guest_name,
      guest_phone: parsed.guest_phone?.trim() || null,
      guest_email: parsed.guest_email?.toString().trim() || null,
      guests_count: parsed.guests_count,
      check_in: parsed.check_in,
      check_out: parsed.check_out,
      status: parsed.status,
      cabana_id: parsed.cabana_id,
      amount: parsed.amount,
      notes: parsed.notes?.trim() || null
    };

    const { error } = await supabase
      .from("reservas")
      .update(payload)
      .eq("id", parsed.id);

    if (error) {
      console.error("updateReservationAction", error);
      return { ok: false, error: "Error al actualizar la reserva" };
    }

    revalidatePath(`/${locale}/admin/reservas`);
    revalidatePath(`/${locale}/admin`);
    return { ok: true };
  } catch (error) {
    console.error("updateReservationAction", error);
    return { ok: false, error: "Datos inválidos" };
  }
}

export async function cancelReservationAction(
  locale: string,
  reservationId: string
): Promise<ActionResult> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { ok: false, error: "Sesión inválida" };
    }

    const { error } = await supabase
      .from("reservas")
      .update({ status: "cancelled" })
      .eq("id", reservationId);

    if (error) {
      console.error("cancelReservationAction", error);
      return { ok: false, error: "Error al cancelar la reserva" };
    }

    revalidatePath(`/${locale}/admin/reservas`);
    revalidatePath(`/${locale}/admin`);
    return { ok: true };
  } catch (error) {
    console.error("cancelReservationAction", error);
    return { ok: false, error: "Error inesperado" };
  }
}

