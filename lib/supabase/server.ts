"use server";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type SupabaseCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            const restOptions = options ?? {};
            const normalizedOptions: Partial<ResponseCookie> = {
              ...restOptions,
              sameSite:
                restOptions.sameSite !== undefined
                  ? restOptions.sameSite
                  : "lax"
            };
            cookieStore.set(name, value, normalizedOptions);
          });
        } catch {
          // Ignorar cuando se ejecute en componentes de servidor puros
        }
      }
    }
  });
}


