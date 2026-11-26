"use server";

import { revalidatePath } from "next/cache";
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

async function wajibSesiAdmin() {
  const supabase = await buatSupabaseSesi();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase: null,
      error:
        "Sesi login tidak ditemukan atau sudah berakhir. Silakan masuk kembali.",
    };
  }

  return { supabase, error: null };
}

function bacaDanValidasiProduk(formData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const hargaRaw = String(formData.get("harga") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "").trim();
  const foto_url = String(formData.get("foto_url") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "").trim();

  const nilai = { nama, harga: hargaRaw, kategori, foto_url, deskripsi };

  if (!nama) {
    return { error: "Nama produk wajib diisi.", data: null, nilai };
  }

  const harga = Number(hargaRaw);
  if (hargaRaw === "" || !Number.isInteger(harga) || harga < 0) {
    return {
      error: "Harga produk harus berupa angka bulat 0 atau lebih.",
      data: null,
      nilai,
    };
  }

  return {
    error: null,
    data: {
      nama,
      harga,
      kategori: kategori || null,
      foto_url: foto_url || null,
      deskripsi: deskripsi || null,
    },
    nilai,
  };
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

function pesanErrorSimpanProduk(error) {
  if (error?.code === "42501" || /permission denied/i.test(error?.message ?? "")) {
    return "Izin database ditolak (42501). Pastikan role authenticated di Supabase sudah diberi hak SELECT, INSERT, UPDATE, DELETE pada tabel produk dan sequence-nya.";
  }

  if (error?.code === "23514") {
    return "Data tidak memenuhi aturan tabel produk (pastikan harga tidak negatif).";
  }

  return "Gagal menyimpan produk ke database. Periksa log server untuk detail errornya.";
}

/**
 * Menambahkan produk baru ke tabel "produk" di Supabase.
 */
export async function tambahProduk(_prevState, formData) {
  const { nilai, data, error: errorValidasi } = bacaDanValidasiProduk(formData);
  let berhasil = false;

  try {
    const { supabase, error: errorAuth } = await wajibSesiAdmin();
    if (errorAuth) {
      return { error: errorAuth, nilai };
    }

    if (errorValidasi) {
      return { error: errorValidasi, nilai };
    }

    const { error } = await supabase.from("produk").insert(data);
    if (error) {
      console.error("Gagal menambah produk:", error);
      return {
        error: pesanErrorSimpanProduk(error),
        nilai,
      };
    }

    berhasil = true;
  } catch (err) {
    console.error("Error koneksi saat menambah produk:", err);
    return {
      error: "Terjadi gangguan saat menghubungi database. Coba lagi.",
      nilai,
    };
  }

  if (berhasil) {
    revalidatePath("/");
    revalidatePath("/admin");
    redirect("/admin");
  }
}

/**
 * Memperbarui data produk yang sudah ada di tabel "produk" di Supabase.
 */
export async function ubahProduk(_prevState, formData) {
  const id = String(formData.get("id") ?? "").trim();
  const { nilai, data, error: errorValidasi } = bacaDanValidasiProduk(formData);
  let berhasil = false;

  try {
    const { supabase, error: errorAuth } = await wajibSesiAdmin();
    if (errorAuth) {
      return { error: errorAuth, nilai };
    }

    if (!/^\d+$/.test(id)) {
      return { error: "ID produk tidak valid.", nilai };
    }

    if (errorValidasi) {
      return { error: errorValidasi, nilai };
    }

    const { data: updated, error } = await supabase
      .from("produk")
      .update(data)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Gagal mengubah produk:", error);
      return {
        error: pesanErrorSimpanProduk(error),
        nilai,
      };
    }

    if (!updated) {
      return {
        error: "Produk tidak ditemukan atau sudah dihapus.",
        nilai,
      };
    }

    berhasil = true;
  } catch (err) {
    console.error("Error koneksi saat mengubah produk:", err);
    return {
      error: "Terjadi gangguan saat menghubungi database. Coba lagi.",
      nilai,
    };
  }

  if (berhasil) {
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/produk/${id}`);
    redirect("/admin");
  }
}
