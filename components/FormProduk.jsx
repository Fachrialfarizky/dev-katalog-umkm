"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ action, produk = {}, labelTombol }) {
  const [state, formAction, sedangMemproses] = useActionState(action, {
    error: null,
    nilai: produk,
  });

  const nilai = state?.nilai ?? produk;

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {produk.id != null && <input type="hidden" name="id" value={produk.id} />}
      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-bahaya bg-permukaan px-3 py-2 text-sm text-bahaya"
        >
          {state.error}
        </p>
      )}
      <Input label="Nama produk" name="nama" defaultValue={nilai.nama ?? ""} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        step="1"
        defaultValue={nilai.harga ?? ""}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={nilai.kategori ?? ""} />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={nilai.foto_url ?? ""}
      />
      <Input label="Deskripsi" name="deskripsi" textarea defaultValue={nilai.deskripsi ?? ""} />
      <div className="flex gap-3">
        <Tombol type="submit" disabled={sedangMemproses}>
          {sedangMemproses ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
