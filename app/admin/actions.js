"use server";

import { redirect } from "next/navigation";
import { buatSupabaseSesi } from "@/lib/supabase/server";

function pesanErrorKoneksiAuth(err, konteks) {
  console.error(`Error koneksi saat ${konteks}:`, err);
  const belumKonfigurasi =
    !process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY;

  return belumKonfigurasi
    ? "Konfigurasi Supabase belum lengkap. Isi SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY di server."
    : "Terjadi gangguan saat menghubungi layanan autentikasi. Coba lagi.";
}

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
    return {
      error: pesanErrorKoneksiAuth(err, "login admin"),
      email,
    };
  }

  if (berhasil) {
    redirect("/admin");
  }
}

/**
 * Mengganti password admin yang sedang login lewat Supabase Auth.
 */
export async function gantiPassword(_prevState, formData) {
  const passwordBaru = String(formData.get("password_baru") ?? "");
  const konfirmasi = String(formData.get("konfirmasi_password") ?? "");

  if (passwordBaru.length < 8) {
    return {
      error: "Password baru minimal 8 karakter.",
      sukses: null,
    };
  }

  if (passwordBaru !== konfirmasi) {
    return {
      error: "Konfirmasi password tidak sama dengan password baru.",
      sukses: null,
    };
  }

  try {
    const supabase = await buatSupabaseSesi();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        error:
          "Sesi login tidak ditemukan atau sudah berakhir. Silakan masuk kembali.",
        sukses: null,
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      console.error("Gagal mengganti password admin:", error.message);
      const samaDenganLama =
        error.code === "same_password" ||
        /different from the old password/i.test(error.message);

      return {
        error: samaDenganLama
          ? "Password baru harus berbeda dari password sebelumnya."
          : "Gagal mengganti password. Pastikan password memenuhi syarat lalu coba lagi.",
        sukses: null,
      };
    }

    return {
      error: null,
      sukses: "Password berhasil diperbarui.",
    };
  } catch (err) {
    return {
      error: pesanErrorKoneksiAuth(err, "ganti password admin"),
      sukses: null,
    };
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
