"use client";

import { useActionState, useEffect, useRef } from "react";
import { hapusProduk } from "@/app/admin/actions";

const keadaanAwal = { error: null, sukses: false };

export default function TombolHapus({ idProduk, namaProduk }) {
  const [state, formAction, sedangProses] = useActionState(hapusProduk, keadaanAwal);
  const formRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const yakin = window.confirm(
      `Hapus produk "${namaProduk}"?\n\nTindakan ini tidak dapat dibatalkan.`
    );
    if (yakin) {
      formRef.current?.requestSubmit();
    }
  }

  useEffect(() => {
    if (state?.error) {
      alert(`Gagal menghapus produk: ${state.error}`);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="id" value={idProduk} />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={sedangProses}
        className="rounded-md border border-bahaya px-3 py-1.5 text-xs font-semibold text-bahaya transition-colors hover:bg-bahaya hover:text-putih disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sedangProses ? "Menghapus…" : "Hapus"}
      </button>
    </form>
  );
}
