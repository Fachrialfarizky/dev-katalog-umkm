import KartuProduk from "@/components/KartuProduk";
import { buatSupabaseServer } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

async function ambilDaftarProduk() {
  try {
    const supabase = buatSupabaseServer();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, foto_url, kategori")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true });

    if (error) {
      return {
        daftarProduk: [],
        pesanError:
          "Gagal mengambil data produk dari database. Pastikan tabel \"produk\" sudah tersedia lalu coba muat ulang halaman.",
      };
    }

    return {
      daftarProduk: data ?? [],
      pesanError: null,
    };
  } catch (err) {
    const belumKonfigurasi =
      !process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY;

    return {
      daftarProduk: [],
      pesanError: belumKonfigurasi
        ? "Konfigurasi Supabase belum lengkap. Isi SUPABASE_URL dan SUPABASE_SECRET_KEY di environment variable server."
        : "Terjadi gangguan saat menghubungi database. Coba muat ulang halaman beberapa saat lagi.",
    };
  }
}

export default async function HalamanKatalog() {
  const { daftarProduk, pesanError } = await ambilDaftarProduk();

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>
        {pesanError ? (
          <div
            role="alert"
            className="rounded-lg border border-bahaya bg-permukaan px-4 py-3 text-sm text-bahaya"
          >
            <p className="font-semibold">Gagal memuat katalog produk</p>
            <p className="mt-1">{pesanError}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-lg border border-garis bg-permukaan px-4 py-6 text-sm text-teks-lembut">
            Belum ada produk
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
