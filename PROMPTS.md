# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:** Baca AGENTS.md dan docs/user-stories.md bagian US-01. Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase. Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:** Berhasil. Dibuat `lib/supabase/server.js` dengan fungsi `buatSupabaseServer()`. `app/page.jsx` diubah menjadi async Server Component yang mengambil data dari Supabase menggunakan secret key. Pesan error dan "Belum ada produk" ditampilkan sesuai kondisi. `CatatanBelumAktif` dihapus.

**Perbaikan:** **[SENDIRI]** — Muncul error "Gagal mengambil data produk" saat akses localhost karena `SUPABASE_URL` di `.env.local` menyertakan path `/rest/v1/` dan role `service_role` belum punya hak akses ke tabel `produk`. Diperbaiki dengan menjalankan `GRANT SELECT ON public.produk TO service_role;` di Supabase SQL Editor, dan memperbaiki URL agar hanya berisi origin (`https://<project-ref>.supabase.co`).

## US-02 Detail produk

**Prompt:** Baca docs/user-stories.md bagian US-02. Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.

**Hasil:** Berhasil. `app/produk/[id]/page.jsx` diubah menjadi async Server Component menggunakan `buatSupabaseServer()` dan `.maybeSingle()`. `notFound()` dipanggil jika id bukan angka atau produk tidak ada di database. Pesan error jaringan ditampilkan jika kueri gagal. `CatatanBelumAktif` dihapus, `TombolWhatsApp` dipertahankan.

**Perbaikan:** *[TIDAK-ADA]* — Build sempat gagal beberapa kali dengan error `EPERM: mkdir` (masalah sementara di environment sandbox), diselesaikan dengan retry build.

## US-03 Pesan via WhatsApp

**Prompt:** Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)". Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.

**Hasil:** Berhasil. `TombolWhatsApp.jsx` diubah dari `<button>` statis menjadi `<a>` dengan `href` dinamis ke `https://wa.me/<nomor>?text=<pesan>`, `target="_blank"`, `rel="noopener noreferrer"`. Pesan otomatis memuat nama toko, nama produk, dan harga rupiah. Tampilan tombol dipertahankan.

**Perbaikan:** *[TIDAK-ADA]*

## US-04 Login admin

**Prompt:** Baca AGENTS.md aturan keamanan dan docs/user-stories.md bagian US-04. Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:** Berhasil. Ditambahkan `buatSupabaseSesi()` di `lib/supabase/server.js` menggunakan `createServerClient` dari `@supabase/ssr` dengan cookie handler. Dibuat `app/admin/actions.js` dengan Server Action `masukAdmin` (login) dan `keluarAdmin` (logout). Dibuat `app/admin/login/FormLogin.jsx` sebagai client component menggunakan `useActionState`. `NavAdmin.jsx` diperbarui dengan `<form action={keluarAdmin}>`. `CatatanBelumAktif` dihapus.

**Perbaikan:** *[TIDAK-ADA]*

## US-05 Ganti password

**Prompt:** Baca docs/user-stories.md bagian US-05. Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:** Berhasil. Ditambahkan Server Action `gantiPassword` di `app/admin/actions.js` yang memvalidasi panjang dan kecocokan password, memeriksa sesi login, lalu memanggil `supabase.auth.updateUser()`. Dibuat `app/admin/password/FormGantiPassword.jsx` sebagai client component dengan `useActionState` untuk menampilkan pesan sukses/error. `app/admin/password/page.jsx` diperbarui dan `CatatanBelumAktif` dihapus.

**Perbaikan:** *[TIDAK-ADA]*

## US-06 Proteksi halaman admin

**Prompt:** Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06. Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:** Berhasil. Dibuat `proxy.js` di root proyek dengan `matcher: ["/admin", "/admin/:path*"]`. Memeriksa sesi memakai `createServerClient` dan `supabase.auth.getUser()` di setiap request; jika belum login, redirect 307 ke `/admin/login`. `/admin/login` dikecualikan. `gantiPassword` di `actions.js` dipindahkan pengecekan sesinya ke awal sebelum validasi. `CatatanBelumAktif` dihapus dari `app/admin/page.jsx`.

**Perbaikan:** *[TIDAK-ADA]* — Build sempat gagal beberapa kali dengan error `EPERM: mkdir` (masalah transien di environment sandbox), diselesaikan dengan retry build.

## Debugging dan fitur bonus

Tambahkan bagian baru untuk setiap error yang kamu perbaiki atau fitur bonus yang kamu kerjakan.

---

## US-07 List produk dari database (bonus)

**Prompt:** Baca docs/user-stories.md bagian US-07. Ubah app/admin/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase di sisi server. Gunakan buatSupabaseSesi() agar sesi login terbaca. Tampilkan produk dalam tabel menggunakan komponen TabelProduk yang sudah ada; tampilkan jumlah produk, pesan error jika gagal, dan teks "Belum ada produk" jika tabel kosong. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:** Berhasil. `app/admin/page.jsx` diubah menjadi async Server Component menggunakan `buatSupabaseSesi()` dan `.select(\"id, nama, harga, foto_url, kategori\")`. Jumlah produk ditampilkan di header. Pesan error dan "Belum ada produk" ditampilkan sesuai kondisi. `TabelProduk` menampilkan foto thumbnail, nama, kategori, harga, dan tombol Ubah/Hapus.

**Perbaikan:** *[TIDAK-ADA]*

---

## US-08 Tambah produk (bonus)

**Prompt:** Baca docs/user-stories.md bagian US-08. Buat fitur tambah produk untuk admin. Buat Server Action tambahProduk di app/admin/actions.js — validasi nama wajib diisi dan harga adalah angka bulat ≥ 0 di sisi server, cek sesi login sebelum insert, simpan ke tabel produk di Supabase, lalu revalidate dan redirect ke /admin. Buat komponen FormProduk di components/ yang dapat dipakai ulang untuk tambah dan ubah (terima prop action). Buat halaman app/admin/produk/baru/page.jsx dan sambungkan ke FormProduk dengan action tambahProduk.

**Hasil:** Berhasil. Ditambahkan Server Action `tambahProduk` di `app/admin/actions.js` dengan validasi server, cek sesi `wajibSesiAdmin()`, insert ke Supabase, `revalidatePath("/")` dan `revalidatePath("/admin")`, lalu `redirect("/admin")`. Dibuat `components/FormProduk.jsx` sebagai `"use client"` dengan `useActionState`, menampilkan error dan mempertahankan nilai input. Dibuat `app/admin/produk/baru/page.jsx` yang sambungkan `tambahProduk` ke `FormProduk`.

**Perbaikan:** **[SENDIRI]** — Muncul error "Gagal menyimpan produk ke database" karena role `authenticated` di Supabase belum punya hak INSERT pada tabel `produk` dan belum ada hak USAGE+SELECT pada sequence ID. Diperbaiki dengan menjalankan di Supabase SQL Editor: `GRANT SELECT, INSERT, UPDATE, DELETE ON public.produk TO authenticated; GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;`

---

## US-09 Ubah produk (bonus)

**Prompt:** Baca docs/user-stories.md bagian US-09. Buat fitur ubah produk untuk admin. Buat Server Action ubahProduk di app/admin/actions.js — ambil id dari hidden input, validasi sama dengan tambahProduk, cek sesi login, update baris di Supabase berdasarkan id, revalidate tiga path (/,/admin,/produk/[id]), lalu redirect ke /admin. Buat halaman app/admin/produk/[id]/ubah/page.jsx — ambil data produk lama dari Supabase, tampilkan notFound() jika tidak ada, sambungkan ubahProduk ke FormProduk dengan defaultValue.

**Hasil:** Berhasil. Ditambahkan Server Action `ubahProduk` di `app/admin/actions.js` dengan validasi id integer, validasi data, cek sesi, `.update().eq("id", id).select("id").maybeSingle()`, dan `revalidatePath` tiga path. Dibuat `app/admin/produk/[id]/ubah/page.jsx` sebagai async Server Component dengan `params` sebagai Promise (`const { id } = await params`), ambil data lama, `notFound()` jika tidak ada, render `FormProduk` dengan `defaultValue` dan `action={ubahProduk}`.

**Perbaikan:** *[TIDAK-ADA]*

---

## Fix foto dan kategori null (US-01 scoring)

**Prompt:** Perbaiki nilai null pada foto_url dan kategori di kartu produk. actions.js harus menyimpan nilai default ("/produk/default.svg" dan "Umum") bukan null. KartuProduk, halaman detail, dan TabelProduk harus menampilkan fallback yang sama. Buat file SVG placeholder di public/produk/default.svg.

**Hasil:** Berhasil. `bacaDanValidasiProduk` di `actions.js` diubah: `kategori: kategori || "Umum"` dan `foto_url: foto_url || "/produk/default.svg"`. `KartuProduk.jsx`, `app/produk/[id]/page.jsx`, dan `TabelProduk.jsx` menampilkan fallback yang sama. Dibuat `public/produk/default.svg` sebagai SVG placeholder dengan ikon gambar abu-abu.

**Perbaikan:** *[TIDAK-ADA]*

---

## Fix logout admin (US-04 / debugging)

**Prompt:** Ada error "An unexpected response was received from the server" saat menekan tombol Keluar di NavAdmin. Perbaiki agar saat keluar admin di local langsung ke menu login kembali.

**Hasil:** Berhasil. Root cause: `<form action={keluarAdmin}>` di Server Component `NavAdmin.jsx` menyebabkan runtime error karena Server Action tidak boleh di-pass langsung di JSX Server Component yang di-render di dalam layout. Solusi: buat `components/TombolKeluar.jsx` sebagai `"use client"` yang menggunakan `useFormStatus` dan `form action={keluarAdmin}`, lalu impor di `NavAdmin.jsx`. Logout sekarang berfungsi dan mengarahkan ke `/admin/login`.

**Perbaikan:** **[SENDIRI]** — Ditemukan juga bahwa `proxy.js` memblok Server Action POST (logout) karena semua request ke `/admin` di-redirect ke `/admin/login` termasuk request `next-action` dari form logout. Diperbaiki dengan menambahkan pengecekan `request.headers.get("next-action")` di `proxy.js` — jika ada header ini, skip redirect agar Server Action bisa berjalan.

---

## US-10 Hapus produk (bonus)

**Prompt:** **[SENDIRI]** — Tombol Hapus di TabelProduk masih dummy. Buat fitur hapus produk: Server Action hapusProduk di actions.js (cek sesi, DELETE dari tabel produk berdasarkan id, revalidatePath). Buat TombolHapus.jsx sebagai "use client" dengan konfirmasi window.confirm sebelum submit, tampil pesan error via alert jika gagal, disabled saat proses. Update TabelProduk untuk pakai TombolHapus.

**Hasil:** Berhasil. Ditambahkan Server Action `hapusProduk` di `app/admin/actions.js` dengan cek sesi `wajibSesiAdmin()`, validasi id integer, `.delete().eq("id", id)`, error handling 42501, `revalidatePath("/")`, `revalidatePath("/admin")`. Dibuat `components/TombolHapus.jsx` sebagai client component dengan `useActionState(hapusProduk, ...)`, konfirmasi `window.confirm`, dan `alert` jika error. `TabelProduk.jsx` diperbarui untuk mengimpor dan menggunakan `TombolHapus`.

**Perbaikan:** *[TIDAK-ADA]*
