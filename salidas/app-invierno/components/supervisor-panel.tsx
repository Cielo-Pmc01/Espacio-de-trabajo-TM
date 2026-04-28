"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { EvalQuestion, SavedEvaluationRecord, SavedProgressRecord } from "@/lib/training-types";

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function getScoreTone(score: number) {
  if (score >= 80) {
    return {
      pill: "bg-emerald-100 text-emerald-800",
      bar: "bg-emerald-500",
    };
  }

  if (score >= 60) {
    return {
      pill: "bg-amber-100 text-amber-800",
      bar: "bg-amber-500",
    };
  }

  return {
    pill: "bg-rose-100 text-rose-800",
    bar: "bg-rose-500",
  };
}

export default function SupervisorPanel({ evalQuestions }: { evalQuestions: EvalQuestion[] }) {
  const router = useRouter();
  const [records, setRecords] = useState<SavedEvaluationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [isPending, startTransition] = useTransition();

  const [progressRecords, setProgressRecords] = useState<SavedProgressRecord[]>([]);
  const [showProgresses, setShowProgresses] = useState(false);
  const [progressFilter, setProgressFilter] = useState("");

  const averageScore =
    records.length > 0
      ? Math.round(
          records.reduce((accumulator, record) => accumulator + record.pct, 0) /
            records.length,
        )
      : 0;
  const questionMap = new Map(evalQuestions.map((question, index) => [question.id, { question, index }]));

  const loadResults = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/sp/results", {
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/sp/login");
        return;
      }

      const payload = (await response.json()) as
        | SavedEvaluationRecord[]
        | { error?: string };

      if (!response.ok || !Array.isArray(payload)) {
        throw new Error(
          Array.isArray(payload) ? "No se pudieron cargar los registros." : payload.error,
        );
      }

      setRecords(payload);
      setExpandedId(payload[0]?.id ?? null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudieron cargar los resultados.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  async function deleteRecord(id: string | number) {
    if (!window.confirm("¿Eliminar este registro?")) {
      return;
    }

    try {
      const response = await fetch(`/api/sp/results/${id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.replace("/sp/login");
        return;
      }

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo eliminar el registro.");
      }

      await loadResults();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo eliminar el registro.",
      );
    }
  }

  async function clearAllRecords() {
    if (
      !window.confirm("¿Borrar TODOS los registros? Esta acción no se puede deshacer.")
    ) {
      return;
    }

    try {
      const response = await fetch("/api/sp/results", {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.replace("/sp/login");
        return;
      }

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudieron borrar los registros.");
      }

      await loadResults();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudieron borrar los registros.",
      );
    }
  }

  async function logout() {
    await fetch("/api/sp/session", { method: "DELETE" });
    router.replace("/sp/login");
    router.refresh();
  }

  async function loadProgressRecords() {
    try {
      const response = await fetch("/api/progress");
      if (response.ok) {
        const data = await response.json() as SavedProgressRecord[];
        setProgressRecords(data);
      }
    } catch { /* ignore */ }
  }

  async function deleteProgress(id: string) {
    if (!window.confirm("¿Eliminar este progreso guardado?")) return;
    try {
      const response = await fetch(`/api/progress/${id}`, { method: "DELETE" });
      if (response.ok) {
        await loadProgressRecords();
      }
    } catch { /* ignore */ }
  }

  async function clearAllProgresses() {
    const count = progressRecords.length;
    if (!window.confirm(`¿Eliminar TODOS los progresos guardados?\n\nEsto borrará ${count} registros.`)) return;
    try {
      for (const record of progressRecords) {
        await fetch(`/api/progress/${record.id}`, { method: "DELETE" });
      }
      await loadProgressRecords();
    } catch { /* ignore */ }
  }

  const filteredProgresses = useMemo(() => {
    if (!progressFilter.trim()) return progressRecords;
    const filter = progressFilter.toLowerCase();
    return progressRecords.filter(p =>
      p.vendor.toLowerCase().includes(filter) ||
      p.id.toLowerCase().includes(filter)
    );
  }, [progressRecords, progressFilter]);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  return (
    <div className="snow-shell relative min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="surface-card rounded-[2.2rem] border border-white/80 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.34em] text-slate-400">
                Panel SP
              </p>
              <h1 className="font-display mt-3 text-3xl font-bold text-slate-900 sm:text-5xl">
                Resultados de evaluaciones
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Esta vista consume únicamente rutas protegidas del servidor. No hay
                acceso directo desde el navegador a Supabase ni al PIN del supervisor.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                ← Volver
              </Link>
              <button
                type="button"
                onClick={() => startTransition(() => void loadResults())}
                disabled={isPending}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
              >
                Actualizar
              </button>
              <button
                type="button"
                onClick={() => startTransition(() => void clearAllRecords())}
                disabled={isPending || records.length === 0}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
              >
                Borrar todo
              </button>
              <button
                type="button"
                onClick={() => startTransition(() => void logout())}
                disabled={isPending}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="surface-card rounded-[1.8rem] border border-white/80 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Evaluaciones
            </p>
            <p className="mt-3 text-4xl font-black text-slate-900">{records.length}</p>
          </article>
          <article className="surface-card rounded-[1.8rem] border border-white/80 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Promedio
            </p>
            <p className="mt-3 text-4xl font-black text-slate-900">{averageScore}%</p>
          </article>
          <article className="surface-card rounded-[1.8rem] border border-white/80 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Último registro
            </p>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">
              {records[0] ? formatTimestamp(records[0].timestamp) : "Sin registros"}
            </p>
          </article>
        </section>

        {/* Sección de progresos guardados en el servidor */}
        <section className="surface-card rounded-[2rem] border border-violet-200 bg-violet-50/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-violet-600">
                Capacitación en progreso
              </p>
              <h2 className="font-display mt-1 text-xl font-bold text-slate-900">
                Progresos guardados
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Evaluaciones en progreso guardadas en el servidor (accesibles desde cualquier dispositivo)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!showProgresses) void loadProgressRecords();
                  setShowProgresses((v: boolean) => !v);
                }}
                className="rounded-full border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                {showProgresses ? "Ocultar" : "Mostrar"} ({progressRecords.length})
              </button>
              {showProgresses && progressRecords.length > 0 && (
                <button
                  type="button"
                  onClick={() => void clearAllProgresses()}
                  className="rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  Borrar todos
                </button>
              )}
            </div>
          </div>

          {showProgresses && (
            <div className="mt-4">
              <input
                type="text"
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                placeholder="Filtrar por nombre..."
                className="mb-3 w-full rounded-[1.2rem] border border-violet-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-violet-200"
              />
              <div className="max-h-80 overflow-y-auto rounded-[1.2rem] border border-violet-200 bg-white">
                {filteredProgresses.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-500">
                    {progressRecords.length === 0
                      ? "No hay progresos guardados en el servidor."
                      : "Ningún resultado coincide con el filtro."}
                  </p>
                ) : (
                  <ul className="divide-y divide-violet-100">
                    {filteredProgresses.map((entry: SavedProgressRecord) => (
                      <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-slate-800">
                              {entry.vendor}
                            </span>
                            <span className="shrink-0 text-xs text-slate-500">
                              — {entry.vendorDate.day.padStart(2, "0")}/{entry.vendorDate.month.padStart(2, "0")}/{entry.vendorDate.year}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-slate-400">ID: {entry.id.slice(0, 8)}...</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {Object.keys(entry.mcAnswers ?? {}).length} respuestas MC ·{" "}
                            {Object.keys(entry.openAnswers ?? {}).length} respuestas abiertas ·{" "}
                            Actualizado: {formatTimestamp(entry.timestamp)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void deleteProgress(entry.id)}
                          className="shrink-0 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          Borrar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        {error ? (
          <p className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <section className="space-y-4">
          {isLoading ? (
            <div className="surface-card rounded-[2rem] border border-white/80 px-6 py-16 text-center text-slate-500">
              Cargando resultados...
            </div>
          ) : null}

          {!isLoading && records.length === 0 ? (
            <div className="surface-card rounded-[2rem] border border-white/80 px-6 py-16 text-center text-slate-500">
              Todavía no hay evaluaciones guardadas.
            </div>
          ) : null}

          {!isLoading
            ? records.map((record) => {
                const tone = getScoreTone(record.pct);
                const isExpanded = expandedId === record.id;

                return (
                  <article
                    key={record.id}
                    className="surface-card overflow-hidden rounded-[2rem] border border-white/80"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId((current) => (current === record.id ? null : record.id))
                      }
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <div className="flex flex-1 items-center gap-4">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white">
                          <span className="text-lg font-black text-slate-900">{record.pct}%</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-lg font-bold text-slate-900">
                            {record.vendor}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatTimestamp(record.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone.pill}`}>
                          {record.label}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          {isExpanded ? "Cerrar" : "Ver"}
                        </span>
                      </div>
                    </button>

                    {isExpanded ? (
                      <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
                        <div className="grid gap-5 xl:grid-cols-[0.9fr,1.1fr]">
                          <div className="space-y-4">
                            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                                Rendimiento por área
                              </p>
                              <div className="mt-4 space-y-3">
                                {Object.entries(record.sections).map(([section, values]) => {
                                  const pct = values.total
                                    ? Math.round((values.correct / values.total) * 100)
                                    : 0;
                                  const sectionTone = getScoreTone(pct);

                                  return (
                                    <div key={section}>
                                      <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="font-medium text-slate-700">{section}</span>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${sectionTone.pill}`}>
                                          {pct}%
                                        </span>
                                      </div>
                                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                          className={`h-full rounded-full ${sectionTone.bar}`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </section>

                            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                                Respuestas abiertas
                              </p>
                              <div className="mt-4 space-y-3">
                                {record.openAnswers.length === 0 ? (
                                  <p className="text-sm text-slate-500">Sin respuestas abiertas.</p>
                                ) : (
                                  record.openAnswers.map((answer) => (
                                    <div
                                      key={`${record.id}-${answer.qid}`}
                                      className="rounded-[1.2rem] border border-violet-200 bg-violet-50/70 p-3"
                                    >
                                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">
                                        {answer.section}
                                      </p>
                                      <p className="mt-2 text-sm font-semibold text-slate-800">
                                        {answer.question}
                                      </p>
                                      <p className="mt-2 whitespace-pre-wrap rounded-xl bg-white px-3 py-3 text-sm leading-7 text-slate-700">
                                        {answer.answer || "Sin respuesta"}
                                      </p>
                                    </div>
                                  ))
                                )}
                              </div>
                            </section>
                          </div>

                          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                                Detalle automático
                              </p>
                              <button
                                type="button"
                                onClick={() => startTransition(() => void deleteRecord(record.id))}
                                disabled={isPending}
                                className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600 transition hover:text-rose-700 disabled:opacity-50"
                              >
                                Eliminar
                              </button>
                            </div>
                            <div className="mt-4 space-y-3">
                              {record.results.map((entry) => {
                                const info = questionMap.get(entry.qid);
                                const title = info?.question.q ?? entry.qid;
                                const number = (info?.index ?? 0) + 1;

                                if (entry.type === "mc") {
                                  return (
                                    <div
                                      key={`${record.id}-${entry.qid}`}
                                      className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                            P{number} · {entry.section}
                                          </p>
                                          <p className="mt-2 text-sm font-semibold text-slate-800">
                                            {title}
                                          </p>
                                        </div>
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                                            entry.ok
                                              ? "bg-emerald-100 text-emerald-700"
                                              : "bg-rose-100 text-rose-700"
                                          }`}
                                        >
                                          {entry.ok ? "Correcta" : "Incorrecta"}
                                        </span>
                                      </div>
                                      {!entry.ok ? (
                                        <p className="mt-3 text-sm text-emerald-700">
                                          Correcta: {entry.correctAns}
                                        </p>
                                      ) : null}
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    key={`${record.id}-${entry.qid}`}
                                    className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                          P{number} · {entry.section}
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-slate-800">
                                          {title}
                                        </p>
                                      </div>
                                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                                        {entry.earned}/{entry.pts} pts
                                      </span>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                      {Object.entries(entry.detail).map(([key, value]) => (
                                        <div
                                          key={`${record.id}-${entry.qid}-${key}`}
                                          className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm"
                                        >
                                          <span className="font-medium text-slate-700">{key}</span>
                                          <span className={value.ok ? "text-emerald-700" : "text-rose-700"}>
                                            {value.ok
                                              ? "✓"
                                              : `Esperado: ${value.expected ?? "sin respuesta"}`}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </section>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })
            : null}
        </section>
      </div>
    </div>
  );
}
