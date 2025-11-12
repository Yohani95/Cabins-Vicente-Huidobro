"use server";

import { revalidatePath } from "next/cache";
import {
  messageIdSchema,
  updateMessageStatusSchema
} from "@/lib/schemas/message";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/actions/reservations";

const basePaths = ["/admin", "/admin/mensajes"];

function revalidate(locale: string) {
  basePaths.forEach((path) => revalidatePath(`/${locale}${path}`));
}

export async function markMessageReadAction(
  locale: string,
  raw: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const parsed = messageIdSchema.parse(raw);
    const supabase = await getSupabaseServerClient();

    const { error } = await supabase
      .from("mensajes")
      .update({ is_read: true })
      .eq("id", parsed.id);

    if (error) {
      console.error("markMessageReadAction", error);
      return { ok: false, error: "No pudimos actualizar el mensaje" };
    }

    revalidate(locale);
    return { ok: true };
  } catch (error) {
    console.error("markMessageReadAction", error);
    return { ok: false, error: "Datos inválidos" };
  }
}

export async function archiveMessageAction(
  locale: string,
  raw: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const parsed = updateMessageStatusSchema.parse(raw);
    const supabase = await getSupabaseServerClient();

    const { error } = await supabase
      .from("mensajes")
      .update({
        is_read: parsed.is_read ?? true,
        archived: parsed.archived ?? true
      })
      .eq("id", parsed.id);

    if (error) {
      console.error("archiveMessageAction", error);
      return { ok: false, error: "No pudimos archivar el mensaje" };
    }

    revalidate(locale);
    return { ok: true };
  } catch (error) {
    console.error("archiveMessageAction", error);
    return { ok: false, error: "Datos inválidos" };
  }
}
