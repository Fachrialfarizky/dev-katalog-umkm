"use server";

import { redirect } from "next/navigation";
import { buatSupabaseSesi } from "@/lib/supabase/server";

/**
 * Memproses login admin menggunakan email dan password via Supabase Auth.
 */
export async function masukAdmin(_prevState, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "Email dan password wajib diisi.",
      email,
    };
  }

  let berhasil = false;

  try {
    const supabase = await buatSupabaseSesi();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Gagal login admin:", error.message);
      const kredensialSalah =
        error.status === 400 ||
        /invalid login credentials/i.test(error.message);

      return {
        error: kredensialSalah
          ? "Email atau password salah. Periksa kembali lalu coba lagi."
          : "Gagal masuk ke akun admin. Coba beberapa saat lagi.",
        email,
      };
    }

    berhasil = true;
  } catch (err) {
    console.error("Error koneksi saat login admin:", err);
    const belumKonfigurasi =
      !process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY;

    return {
      error: belumKonfigurasi
        ? "Konfigurasi Supabase belum lengkap. Isi SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY di server."
        : "Terjadi gangguan saat menghubungi layanan autentikasi. Coba lagi.",
      email,
    };
  }

  if (berhasil) {
    redirect("/admin");
  }
}

/**
 * Mengakhiri sesi admin lalu mengarahkan kembali ke halaman login.
 */
export async function keluarAdmin() {
  try {
    const supabase = await buatSupabaseSesi();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Gagal keluar dari sesi admin:", err);
  }

  redirect("/admin/login");
}
