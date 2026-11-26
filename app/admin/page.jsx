import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatSupabaseSesi } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function ambilDaftarProdukAdmin() {
  try {
    const supabase = await buatSupabaseSesi();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, foto_url, kategori")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true });

    if (error) {
      console.error("Gagal mengambil daftar produk admin:", error);
      return { daftarProduk: [], pesanError: "Gagal mengambil data produk dari database." };
    }

    return { daftarProduk: data ?? [], pesanError: null };
  } catch (err) {
    console.error("Error koneksi saat mengambil produk admin:", err);
    return { daftarProduk: [], pesanError: "Terjadi gangguan saat menghubungi database." };
  }
}

export default async function HalamanAdmin() {
  const { daftarProduk, pesanError } = await ambilDaftarProdukAdmin();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Produk</h1>
          {!pesanError && (
            <p className="mt-0.5 text-sm text-teks-lembut">
              {daftarProduk.length === 0
                ? "Belum ada produk."
                : `${daftarProduk.length} produk`}
            </p>
          )}
        </div>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      {pesanError ? (
        <div
          role="alert"
          className="rounded-lg border border-bahaya bg-permukaan px-4 py-3 text-sm text-bahaya"
        >
          <p className="font-semibold">Gagal memuat daftar produk</p>
          <p className="mt-1">{pesanError}</p>
        </div>
      ) : daftarProduk.length === 0 ? (
        <p className="rounded-lg border border-garis bg-permukaan px-4 py-6 text-center text-sm text-teks-lembut">
          Belum ada produk. Klik <strong>Tambah produk</strong> untuk mulai menambahkan.
        </p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
