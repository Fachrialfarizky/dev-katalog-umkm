import Link from "next/link";
import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";
import { buatSupabaseSesi } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function ambilProdukUntukUbah(id) {
  try {
    const supabase = await buatSupabaseSesi();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Gagal mengambil produk untuk diubah:", error);
      return {
        produk: null,
        pesanError: "Gagal mengambil data produk dari database.",
      };
    }

    return { produk: data, pesanError: null };
  } catch (err) {
    console.error("Error koneksi saat mengambil produk untuk diubah:", err);
    return {
      produk: null,
      pesanError: "Terjadi gangguan saat menghubungi database.",
    };
  }
}

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const { produk, pesanError } = await ambilProdukUntukUbah(id);

  if (pesanError) {
    return (
      <div className="flex flex-col gap-6 py-8">
        <NavAdmin />
        <div
          role="alert"
          className="rounded-lg border border-bahaya bg-permukaan px-4 py-3 text-sm text-bahaya"
        >
          <p className="font-semibold">Gagal memuat data produk</p>
          <p className="mt-1">{pesanError}</p>
        </div>
        <Link href="/admin" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
          Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk action={ubahProduk} produk={produk} labelTombol="Simpan perubahan" />
    </div>
  );
}
