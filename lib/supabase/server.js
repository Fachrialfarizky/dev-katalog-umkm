import { createClient } from "@supabase/supabase-js";

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
