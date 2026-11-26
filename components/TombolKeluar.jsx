"use client";

import { useFormStatus } from "react-dom";
import { keluarAdmin } from "@/app/admin/actions";

function TombolSubmitKeluar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-teks-lembut hover:text-bahaya disabled:opacity-50"
    >
      {pending ? "Keluar..." : "Keluar"}
    </button>
  );
}

export default function TombolKeluar() {
  return (
    <form action={keluarAdmin} className="ml-auto">
      <TombolSubmitKeluar />
    </form>
  );
}
