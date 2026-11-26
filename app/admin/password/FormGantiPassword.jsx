"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { gantiPassword } from "../actions";

export default function FormGantiPassword() {
  const [state, formAction, sedangMemproses] = useActionState(gantiPassword, {
    error: null,
    sukses: null,
  });

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-bahaya bg-permukaan px-3 py-2 text-sm text-bahaya"
        >
          {state.error}
        </p>
      )}
      {state?.sukses && (
        <p
          role="status"
          className="rounded-lg border border-utama bg-permukaan px-3 py-2 text-sm text-utama"
        >
          {state.sukses}
        </p>
      )}
      <Input
        label="Password baru"
        name="password_baru"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <Input
        label="Ulangi password baru"
        name="konfirmasi_password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <Tombol type="submit" className="self-start" disabled={sedangMemproses}>
        {sedangMemproses ? "Menyimpan..." : "Simpan password"}
      </Tombol>
    </form>
  );
}
