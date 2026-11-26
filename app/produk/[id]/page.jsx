import Link from "next/link";
import { notFound } from "next/navigation";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { buatSupabaseServer } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

async function ambilProduk(id) {
  try {
    const supabase = buatSupabaseServer();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Gagal mengambil detail produk dari Supabase:", error);
      return {
        produk: null,
        pesanError:
          "Gagal mengambil data produk dari database. Coba muat ulang halaman beberapa saat lagi.",
      };
    }

    return {
      produk: data,
      pesanError: null,
    };
  } catch (err) {
    console.error("Error koneksi Supabase (ambilProduk):", err);
    const belumKonfigurasi =
      !process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY;

    return {
      produk: null,
      pesanError: belumKonfigurasi
        ? "Konfigurasi Supabase belum lengkap. Isi SUPABASE_URL dan SUPABASE_SECRET_KEY di environment variable server."
        : "Terjadi gangguan saat menghubungi database. Coba muat ulang halaman beberapa saat lagi.",
    };
  }
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const { produk, pesanError } = await ambilProduk(id);

  if (pesanError) {
    return (
      <div className="flex flex-col gap-4 py-8 md:py-12">
        <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
          Kembali ke katalog
        </Link>
        <div
          role="alert"
          className="rounded-lg border border-bahaya bg-permukaan px-4 py-3 text-sm text-bahaya"
        >
          <p className="font-semibold">Gagal memuat detail produk</p>
          <p className="mt-1">{pesanError}</p>
        </div>
      </div>
    );
  }

  if (!produk) {
    notFound();
  }

  return (
    <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
      <img
        src={produk.foto_url || "/produk/default.svg"}
        alt={produk.nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
      />
      <div className="flex flex-col gap-4">
        <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
          Kembali ke katalog
        </Link>
        <p className="text-sm text-teks-lembut">{produk.kategori || "Umum"}</p>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
        <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
          {formatRupiah(produk.harga)}
        </p>
        <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>
        <TombolWhatsApp produk={produk} />
      </div>
    </article>
  );
}
