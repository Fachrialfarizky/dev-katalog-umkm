import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Membuat koneksi Supabase di sisi server menggunakan secret key.
 * Dipakai untuk membaca data publik ketika RLS menolak akses anonim.
 */
export function buatSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Variabel environment SUPABASE_URL dan SUPABASE_SECRET_KEY belum diatur."
    );
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Membuat koneksi Supabase di sisi server memakai publishable key dan cookie sesi.
 * Dipakai untuk autentikasi admin dan aksi yang mengikuti aturan RLS.
 */
export async function buatSupabaseSesi() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Variabel environment SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY belum diatur."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Dipanggil dari Server Component (hanya-baca); aman diabaikan.
        }
      },
    },
  });
}
