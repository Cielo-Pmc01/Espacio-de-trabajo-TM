"use client";

import { useState, useTransition } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SupervisorLoginForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submitLogin() {
    setError(null);

    try {
      const response = await fetch("/api/sp/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo iniciar sesión.");
      }

      router.replace("/sp");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo iniciar sesión.",
      );
      setPin("");
    }
  }

  return (
    <div className="snow-shell relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface-card w-full max-w-md rounded-[2.4rem] border border-white/80 p-7 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.34em] text-slate-400">
          Acceso SP
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold text-slate-900">
          Panel del supervisor
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Ingresá el PIN del supervisor para acceder a los resultados guardados desde
          el servidor.
        </p>

        <form
          className="mt-8"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(() => void submitLogin());
          }}
        >
          <label
            htmlFor="sp-pin"
            className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400"
          >
            PIN del supervisor
          </label>
          <input
            id="sp-pin"
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="••••"
            className="mt-3 w-full rounded-[1.5rem] border-2 border-slate-200 bg-white px-4 py-4 text-center text-3xl font-black tracking-[0.4em] text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
          />

          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-5 w-full rounded-[1.4rem] bg-[linear-gradient(135deg,#0f2027_0%,#203a43_48%,#2c5364_100%)] px-4 py-4 text-sm font-bold uppercase tracking-[0.24em] text-white transition hover:opacity-92 disabled:cursor-wait disabled:opacity-75"
          >
            {isPending ? "Validando..." : "Ingresar"}
          </button>

          <Link
            href="/"
            className="mt-3 block w-full rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-center text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Volver a la capacitación
          </Link>
        </form>
      </div>
    </div>
  );
}
