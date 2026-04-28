"use client";

import { useDeferredValue, useEffect, useRef, useState, useTransition } from "react";

import NotionBlockRenderer from "@/components/NotionBlockRenderer";
import { generalClothingNotes, moduleTabs } from "@/lib/training-content";
import {
  productFilters,
  productTypeAccent,
  productTypeLabels,
} from "@/lib/training-data";
import type { ProtocolsData } from "@/lib/server/protocols-notion";
import type {
  ComercialData,
  EvalQuestion,
  EvaluationSubmitResponse,
  InfoAdicionalData,
  IntroData,
  ModuleMeta,
  Product,
  SavedEvaluationPayload,
} from "@/lib/training-types";

type ActiveModule = "module0" | "module1" | "module2" | "module3" | "eval" | "info";

const pairColors = [
  "rgba(14, 165, 233, 0.18)",
  "rgba(251, 146, 60, 0.18)",
  "rgba(52, 211, 153, 0.18)",
  "rgba(244, 114, 182, 0.18)",
  "rgba(167, 139, 250, 0.18)",
];

function formatSectionPercentage(correct: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

function getScoreTone(score: number) {
  if (score >= 80) {
    return {
      ring: "border-emerald-200",
      pill: "bg-emerald-100 text-emerald-800",
      accent: "bg-emerald-500",
      text: "text-emerald-700",
    };
  }

  if (score >= 60) {
    return {
      ring: "border-amber-200",
      pill: "bg-amber-100 text-amber-800",
      accent: "bg-amber-500",
      text: "text-amber-700",
    };
  }

  return {
    ring: "border-rose-200",
    pill: "bg-rose-100 text-rose-800",
    accent: "bg-rose-500",
    text: "text-rose-700",
  };
}

function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!product) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, product]);

  if (!product) {
    return null;
  }

  const accent = productTypeAccent[product.type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="surface-card soft-scrollbar max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/60">
        <div
          className={`rounded-t-[2rem] bg-gradient-to-br ${accent.price} px-6 py-7 text-white sm:px-8`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-4xl">{product.emoji}</p>
              <div className="space-y-2">
                <span className="inline-flex rounded-full bg-white/18 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
                  {productTypeLabels[product.type]}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold sm:text-4xl">
                    {product.name}
                  </h2>
                  {product.provider ? (
                    <p className="mt-2 text-sm text-white/78">{product.provider}</p>
                  ) : null}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          <p className="text-sm leading-7 text-slate-600 sm:text-base">
            {product.description}
          </p>

          {product.diferencial ? (
            <section className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/90 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">
                Diferencial de Venta
              </p>
              <p className="mt-2 text-sm font-medium leading-7 text-emerald-900">
                {product.diferencial}
              </p>
            </section>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                Duración
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                {product.duration ?? "Consultar"}
              </p>
            </article>
            <article className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                Temporada
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">{product.season}</p>
            </article>
            <article className="rounded-[1.4rem] border border-slate-200 bg-white p-5 md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                Punto de encuentro
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{product.meetingPoint}</p>
            </article>
            {product.itinerary ? (
              <article className="rounded-[1.4rem] border border-slate-200 bg-white p-5 md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                  Itinerario
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.itinerary.split(" | ").map((step) => (
                    <span
                      key={step}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </article>
            ) : null}
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/70 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
                Incluye
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {product.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-[1.5rem] border border-rose-200 bg-rose-50/70 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-700">
                No Incluye
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {product.notIncludes.length === 0 ? (
                  <li className="text-slate-500">Sin exclusiones destacadas.</li>
                ) : (
                  product.notIncludes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-rose-500">✕</span>
                      <span>{item}</span>
                    </li>
                  ))
                )}
              </ul>
            </article>
            <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
                Adicionales
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {product.additional?.length ? (
                  product.additional.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-amber-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No hay notas adicionales.</li>
                )}
              </ul>
            </article>
          </section>

          <section className={`rounded-[1.8rem] bg-gradient-to-br ${accent.price} p-6 text-white`}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/80">
                  Precios
                </p>
                {product.freeAge ? (
                  <p className="mt-2 text-sm text-white/80">👶 {product.freeAge}</p>
                ) : null}
              </div>
              <div className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                {product.tags.join(" · ")}
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {product.prices.map((price) => (
                <div
                  key={`${product.id}-${price.method}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/8 px-4 py-3"
                >
                  <span className="text-sm text-white/84">{price.method}</span>
                  <span className="text-lg font-bold">{price.price}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ResultView({
  result,
  saved,
  onRetry,
}: {
  result: SavedEvaluationPayload;
  saved: boolean;
  notificationSent: boolean;
  error?: string;
  onRetry: () => void;
  evalQuestions: EvalQuestion[];
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="surface-card rounded-[2.5rem] border border-white/70 p-10 sm:p-14">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-5xl">
          ✓
        </div>
        <h2 className="font-display mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
          ¡Evaluación enviada con éxito!
        </h2>
        <p className="mt-3 text-slate-600">
          Gracias {result.vendor}, tu evaluación ha sido registrada correctamente.
        </p>
        {saved ? (
          <p className="mt-4 text-sm text-slate-400">
            Guardado en la nube
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="rounded-[1.4rem] bg-slate-900 px-8 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        Volver al inicio
      </button>
    </div>
  );
}

export default function TrainingApp({
  products,
  protocols,
  intro,
  comercial,
  infoAdicional,
  moduleMeta,
  evalQuestions,
}: {
  products: Product[];
  protocols: ProtocolsData;
  intro: IntroData;
  comercial: ComercialData;
  infoAdicional: InfoAdicionalData;
  moduleMeta: [ModuleMeta, ModuleMeta, ModuleMeta, ModuleMeta];
  evalQuestions: EvalQuestion[];
}) {
  const {
    bloque1,
    salesPriority,
    salesPriorityAnual,
    providerAvailability,
    availabilityChecklist,
    bloque2,
  } = protocols;
  const [activeModule, setActiveModule] = useState<ActiveModule>("module0");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const deferredSearchText = useDeferredValue(searchText);
  const [activeFilter, setActiveFilter] = useState<(typeof productFilters)[number]["value"]>("all");
  const [showProviders, setShowProviders] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [vendorDate, setVendorDate] = useState({ day: "", month: "", year: "" });
  const [showVendorError, setShowVendorError] = useState(false);
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [dragAnswers, setDragAnswers] = useState<Record<string, Record<string, string>>>({});
  const [matchAnswers, setMatchAnswers] = useState<Record<string, Record<string, string>>>({});
  const [searchName, setSearchName] = useState("");
  const [searchResult, setSearchResult] = useState<
    | { status: "found"; matches: { label: string; key: string }[] }
    | { status: "notfound" }
    | null
  >(null);
  const [selectedDragItem, setSelectedDragItem] = useState<{
    qid: string;
    item: string;
  } | null>(null);
  const [selectedMatchLeft, setSelectedMatchLeft] = useState<{
    qid: string;
    item: string;
  } | null>(null);
  const [result, setResult] = useState<SavedEvaluationPayload | null>(null);
  const [saveState, setSaveState] = useState<{
    saved: boolean;
    notificationSent: boolean;
    error?: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [savedFeedback, setSavedFeedback] = useState(false);
  const vendorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const draft = localStorage.getItem("eval_draft_v1");
      if (draft) {
        const data = JSON.parse(draft) as {
          vendorName?: string;
          vendorDate?: { day: string; month: string; year: string };
          mcAnswers?: Record<string, number>;
          openAnswers?: Record<string, string>;
          dragAnswers?: Record<string, Record<string, string>>;
          matchAnswers?: Record<string, Record<string, string>>;
        };
        if (data.vendorName) setVendorName(data.vendorName);
        if (data.vendorDate) setVendorDate(data.vendorDate);
        if (data.mcAnswers) setMcAnswers(data.mcAnswers);
        if (data.openAnswers) setOpenAnswers(data.openAnswers);
        if (data.dragAnswers) setDragAnswers(data.dragAnswers);
        if (data.matchAnswers) setMatchAnswers(data.matchAnswers);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (result) return;
    try {
      localStorage.setItem(
        "eval_draft_v1",
        JSON.stringify({ vendorName, vendorDate, mcAnswers, openAnswers, dragAnswers, matchAnswers }),
      );
    } catch { /* ignore */ }
  }, [vendorName, vendorDate, mcAnswers, openAnswers, dragAnswers, matchAnswers, result]);

  async function searchSavedProgress() {
    const query = searchName.trim();
    if (!query) return;

    try {
      const response = await fetch(`/api/progress?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        setSearchResult({ status: "notfound" });
        return;
      }

      const data = (await response.json()) as Array<{
        id: string;
        vendor: string;
        vendorDate: { day: string; month: string; year: string };
      }>;

      const matches = data.map((item) => {
        const d = item.vendorDate;
        const date = `${d.day.padStart(2, "0")}/${d.month.padStart(2, "0")}/${d.year}`;
        return {
          label: `${item.vendor} — ${date}`,
          key: item.id,
        };
      });

      setSearchResult(
        matches.length === 0
          ? { status: "notfound" }
          : { status: "found", matches },
      );
    } catch {
      setSearchResult({ status: "notfound" });
    }
  }

  async function loadSavedProgress(id: string) {
    try {
      const response = await fetch(`/api/progress/${encodeURIComponent(id)}`);
      if (!response.ok) return;

      const progress = await response.json() as {
        id: string;
        vendor: string;
        vendorDate: { day: string; month: string; year: string };
        mcAnswers?: Record<string, number>;
        openAnswers?: Record<string, string>;
        dragAnswers?: Record<string, Record<string, string>>;
        matchAnswers?: Record<string, Record<string, string>>;
      };

      setVendorName(progress.vendor);
      setVendorDate(progress.vendorDate);
      if (progress.mcAnswers) setMcAnswers(progress.mcAnswers);
      if (progress.openAnswers) setOpenAnswers(progress.openAnswers);
      if (progress.dragAnswers) setDragAnswers(progress.dragAnswers);
      if (progress.matchAnswers) setMatchAnswers(progress.matchAnswers);
      try {
        localStorage.setItem(
          "eval_draft_v1",
          JSON.stringify({
            vendorName: progress.vendor,
            vendorDate: progress.vendorDate,
            mcAnswers: progress.mcAnswers ?? {},
            openAnswers: progress.openAnswers ?? {},
            dragAnswers: progress.dragAnswers ?? {},
            matchAnswers: progress.matchAnswers ?? {},
          }),
        );
      } catch { /* ignore */ }
    } catch { /* ignore */ }
    setSearchResult(null);
    setSearchName("");
  }

  useEffect(() => {
    if (result) return;
    const hasFullName = vendorName.trim().includes(" ");
    const hasFullDate = vendorDate.day && vendorDate.month && vendorDate.year;
    if (!hasFullName || !hasFullDate) return;

    const timeoutId = setTimeout(async () => {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendor: vendorName.trim(),
            vendorDate: {
              day: String(vendorDate.day),
              month: String(vendorDate.month),
              year: String(vendorDate.year),
            },
            mcAnswers,
            openAnswers,
            dragAnswers,
            matchAnswers,
          }),
        });
      } catch { /* ignore */ }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [vendorName, vendorDate, mcAnswers, openAnswers, dragAnswers, matchAnswers, result]);

  const isEvalComplete = evalQuestions.every((question) => {
    if (question.type === "mc") return question.id in mcAnswers;
    if (question.type === "open") return !!openAnswers[question.id]?.trim();
    if (question.type === "drag") {
      const placements = dragAnswers[question.id] ?? {};
      return question.items.every((item) => item in placements);
    }
    if (question.type === "match") {
      const matches = matchAnswers[question.id] ?? {};
      return question.left.every((item) => item in matches);
    }
    return false;
  });

  async function saveExplicitly() {
    const hasFullName = vendorName.trim().includes(" ");
    const hasFullDate = vendorDate.day && vendorDate.month && vendorDate.year;
    if (!hasFullName || !hasFullDate) {
      alert("Para guardar el progreso, completá tu nombre completo (nombre y apellido) y la fecha.");
      return;
    }

    try {
      const body = {
        vendor: vendorName.trim(),
        vendorDate: {
          day: String(vendorDate.day),
          month: String(vendorDate.month),
          year: String(vendorDate.year),
        },
        mcAnswers,
        openAnswers,
        dragAnswers,
        matchAnswers,
      };

      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const responseData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));

      if (response.ok) {
        setSavedFeedback(true);
        setTimeout(() => setSavedFeedback(false), 2500);
      } else {
        alert(responseData.error || `No se pudo guardar el progreso. (${response.status})`);
      }
    } catch {
      alert("Error de conexión. Verificá tu internet.");
    }
  }

  async function clearSavedProgress() {}

  const effectiveTabs = moduleTabs.map((tab, i) => ({
    ...tab,
    shortLabel: moduleMeta[i]?.shortLabel || tab.shortLabel,
    title: moduleMeta[i]?.title || tab.title,
  }));

  const normalizedSearch = deferredSearchText.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    if (activeFilter !== "all") {
      if (activeFilter === "traslado") {
        if (product.type !== "traslado") return false;
      } else {
        if (product.categoria !== activeFilter) return false;
      }
    }

    if (!normalizedSearch) {
      return true;
    }

    return [product.name, product.description, product.provider ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);
  });

  const providerNames = Array.from(
    new Set(
      products
        .map((product) => product.provider)
        .filter((provider): provider is string => Boolean(provider)),
    ),
  ).sort((left, right) => left.localeCompare(right, "es"));

  async function submitEvaluation() {
    if (!vendorName.trim()) {
      setShowVendorError(true);
      vendorInputRef.current?.focus();
      vendorInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setShowVendorError(false);
    setSubmitError(null);

    try {
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendor: vendorName,
          answers: {
            mc: mcAnswers,
            open: openAnswers,
            drag: dragAnswers,
            match: matchAnswers,
          },
        }),
      });

      const data = (await response.json()) as
        | EvaluationSubmitResponse
        | { error?: string };

      if (!response.ok && !("evaluation" in data)) {
        throw new Error(data.error ?? "No se pudo enviar la evaluación.");
      }

      if (!("evaluation" in data)) {
        throw new Error("La respuesta del servidor no incluyó el resultado.");
      }

      setResult(data.evaluation);
      setSaveState({
        saved: data.saved,
        notificationSent: data.notificationSent,
        ...(data.error ? { error: data.error } : {}),
      });
      clearSavedProgress();
      try { localStorage.removeItem("eval_draft_v1"); } catch { /* ignore */ }
      setActiveModule("eval");
    } catch (cause) {
      setSubmitError(
        cause instanceof Error
          ? cause.message
          : "No se pudo enviar la evaluación.",
      );
    }
  }

  function resetEvaluation() {
    setResult(null);
    setSaveState(null);
    setSubmitError(null);
    setVendorName("");
    setShowVendorError(false);
    setMcAnswers({});
    setOpenAnswers({});
    setDragAnswers({});
    setMatchAnswers({});
    setSelectedDragItem(null);
    setSelectedMatchLeft(null);
    clearSavedProgress();
  }

  function renderQuestionInput(question: EvalQuestion) {
    if (question.type === "mc") {
      return (
        <div className="space-y-2">
          {question.opts.map((option, optionIndex) => {
            const isSelected = mcAnswers[question.id] === optionIndex;

            return (
              <label
                key={`${question.id}-${option}`}
                className={`flex cursor-pointer items-start gap-3 rounded-[1.2rem] border-2 px-4 py-3 transition ${
                  isSelected
                    ? "border-sky-300 bg-sky-50"
                    : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/60"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={isSelected}
                  onChange={() =>
                    setMcAnswers((current) => ({
                      ...current,
                      [question.id]: optionIndex,
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-sky-500"
                />
                <span className="text-sm leading-6 text-slate-700">{option}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (question.type === "open") {
      return (
        <textarea
          value={openAnswers[question.id] ?? ""}
          rows={4}
          placeholder={question.placeholder}
          onChange={(event) =>
            setOpenAnswers((current) => ({
              ...current,
              [question.id]: event.target.value,
            }))
          }
          className="min-h-[128px] w-full rounded-[1.4rem] border-2 border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
        />
      );
    }

    if (question.type === "drag") {
      const placements = dragAnswers[question.id] ?? {};
      const unplacedItems = question.items.filter((item) => !(item in placements));

      return (
        <div className="space-y-4">
          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Tocá un elemento y luego tocá la zona donde querés colocarlo.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {unplacedItems.map((item) => {
                const isSelected =
                  selectedDragItem?.qid === question.id &&
                  selectedDragItem.item === item;

                return (
                  <button
                    key={`${question.id}-${item}`}
                    type="button"
                    onClick={() =>
                      setSelectedDragItem((current) =>
                        current?.qid === question.id && current.item === item
                          ? null
                          : { qid: question.id, item },
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? "border-orange-300 bg-orange-100 text-orange-800"
                        : "border-slate-300 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {question.zones.map((zone) => {
              const placedItems = Object.entries(placements)
                .filter(([, selectedZone]) => selectedZone === zone)
                .map(([item]) => item);

              return (
                <div
                  key={`${question.id}-${zone}`}
                  onClick={() => {
                    if (!selectedDragItem || selectedDragItem.qid !== question.id) {
                      return;
                    }

                    setDragAnswers((current) => ({
                      ...current,
                      [question.id]: {
                        ...(current[question.id] ?? {}),
                        [selectedDragItem.item]: zone,
                      },
                    }));
                    setSelectedDragItem(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") {
                      return;
                    }

                    event.preventDefault();

                    if (!selectedDragItem || selectedDragItem.qid !== question.id) {
                      return;
                    }

                    setDragAnswers((current) => ({
                      ...current,
                      [question.id]: {
                        ...(current[question.id] ?? {}),
                        [selectedDragItem.item]: zone,
                      },
                    }));
                    setSelectedDragItem(null);
                  }}
                  role="button"
                  tabIndex={0}
                  className="min-h-[110px] rounded-[1.4rem] border-2 border-dashed border-slate-200 bg-white p-4 text-left transition hover:border-orange-200 hover:bg-orange-50/40"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    {zone}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {placedItems.map((item) => (
                      <span
                        key={`${question.id}-${zone}-${item}`}
                        className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-800"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDragAnswers((current) => {
                              const next = { ...(current[question.id] ?? {}) };
                              delete next[item];
                              return {
                                ...current,
                                [question.id]: next,
                              };
                            });
                            setSelectedDragItem(null);
                          }}
                          className="font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const pairs = matchAnswers[question.id] ?? {};

    return (
      <div className="space-y-4">
        <p className="text-xs font-medium text-slate-500">
          Tocá un elemento de la izquierda y después el correspondiente de la derecha.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            {question.left.map((item, itemIndex) => {
              const matchedValue = pairs[item];
              const isSelected =
                selectedMatchLeft?.qid === question.id &&
                selectedMatchLeft.item === item;
              const color = matchedValue
                ? pairColors[itemIndex % pairColors.length]
                : "white";

              return (
                <button
                  key={`${question.id}-left-${item}`}
                  type="button"
                  onClick={() =>
                    setSelectedMatchLeft((current) =>
                      current?.qid === question.id && current.item === item
                        ? null
                        : { qid: question.id, item },
                    )
                  }
                  className={`w-full rounded-[1.2rem] border-2 px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-violet-300 bg-violet-50"
                      : "border-slate-200 hover:border-violet-200"
                  }`}
                  style={{
                    backgroundColor: isSelected ? undefined : color,
                  }}
                >
                  <div className="text-sm font-semibold text-slate-800">{item}</div>
                  {matchedValue ? (
                    <div className="mt-1 text-xs text-slate-500">↔ {matchedValue}</div>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="space-y-2">
            {question.right.map((item) => {
              const matchedLeft = Object.entries(pairs).find(([, value]) => value === item)?.[0];
              const matchedIndex = matchedLeft
                ? question.left.indexOf(matchedLeft)
                : -1;

              return (
                <button
                  key={`${question.id}-right-${item}`}
                  type="button"
                  onClick={() => {
                    if (!selectedMatchLeft || selectedMatchLeft.qid !== question.id) {
                      return;
                    }

                    setMatchAnswers((current) => {
                      const next = { ...(current[question.id] ?? {}) };
                      const existingLeft = Object.entries(next).find(
                        ([, value]) => value === item,
                      )?.[0];

                      if (existingLeft) {
                        delete next[existingLeft];
                      }

                      next[selectedMatchLeft.item] = item;

                      return {
                        ...current,
                        [question.id]: next,
                      };
                    });
                    setSelectedMatchLeft(null);
                  }}
                  className="w-full rounded-[1.2rem] border-2 border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-violet-200"
                  style={{
                    backgroundColor:
                      matchedIndex >= 0
                        ? pairColors[matchedIndex % pairColors.length]
                        : "white",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderQuestionCard(question: EvalQuestion, index: number) {
    const sectionColor: Record<string, string> = {
      Protocolos: "bg-sky-500",
      Proveedores: "bg-amber-500",
      Ventas: "bg-emerald-500",
      Excursiones: "bg-violet-500",
    };

    const inputTypeTone: Record<EvalQuestion["type"], string> = {
      mc: "bg-sky-100 text-sky-800",
      open: "bg-violet-100 text-violet-800",
      drag: "bg-orange-100 text-orange-800",
      match: "bg-emerald-100 text-emerald-800",
    };

    const inputTypeLabel: Record<EvalQuestion["type"], string> = {
      mc: "Opción múltiple",
      open: "Respuesta abierta",
      drag: "Asignación",
      match: "Unir conceptos",
    };

    return (
      <article
        key={question.id}
        className="surface-card rounded-[2rem] border border-white/70 p-6"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white ${sectionColor[question.section]}`}
          >
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${inputTypeTone[question.type]}`}>
                {inputTypeLabel[question.type]}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                {question.section}
              </span>
              {question.pts > 0 ? (
                <span className="text-xs text-slate-400">
                  {question.pts} pt{question.pts > 1 ? "s" : ""}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-900 sm:text-base">
              {question.q}
            </p>
          </div>
        </div>
        <div className="mt-5">{renderQuestionInput(question)}</div>
      </article>
    );
  }

  return (
    <div className="snow-shell relative flex min-h-screen flex-1 flex-col overflow-hidden">
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      <header className="relative overflow-hidden px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-[410px] rounded-b-[3rem] bg-[linear-gradient(135deg,#0f2027_0%,#203a43_48%,#2c5364_100%)] shadow-[0_32px_90px_rgba(12,26,43,0.35)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl font-bold text-white sm:text-6xl">
                Capacitación Vendedores
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-sky-100 sm:text-lg">
                Guía completa de excursiones, traslados y protocolos de venta para la
                temporada de invierno.
              </p>
            </div>

            <a
              href="/sp/login"
              className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-white/70 transition hover:bg-white/14 hover:text-white"
            >
              Acceso SP
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {effectiveTabs.map((tab) => {
              const isActive = activeModule === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveModule(tab.id as ActiveModule)}
                  className={`rounded-[1.3rem] px-5 py-3 text-left transition ${
                    isActive
                      ? "bg-sky-300 text-slate-900 shadow-lg"
                      : "bg-white/10 text-white/72 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.24em]">
                    {tab.shortLabel}
                  </div>
                  <div className="mt-1 text-sm font-semibold">{tab.title}</div>
                </button>
              );
            })}

            <div className="h-auto w-px self-stretch bg-white/15" aria-hidden />

            <button
              type="button"
              onClick={() => setActiveModule("eval")}
              className={`rounded-[1.3rem] px-5 py-3 text-left transition ${
                activeModule === "eval"
                  ? "bg-violet-400 text-slate-900 shadow-lg"
                  : "bg-white/10 text-white/72 hover:bg-white/15 hover:text-white"
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.24em]">Cierre</div>
              <div className="mt-1 text-sm font-semibold">Evaluación</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule("info")}
              className={`rounded-[1.3rem] px-5 py-3 text-left transition ${
                activeModule === "info"
                  ? "bg-emerald-300 text-slate-900 shadow-lg"
                  : "bg-white/10 text-white/72 hover:bg-white/15 hover:text-white"
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.24em]">Recursos</div>
              <div className="mt-1 text-sm font-semibold">Info Adicional</div>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 pb-16">
        {activeModule === "module0" ? (
          <div className="mx-auto -mt-6 flex w-full max-w-3xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
            <section className="surface-card rounded-[2rem] border-l-4 border-sky-400 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-slate-400">
                Módulo 1
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold text-slate-900">
                Contenido
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Conocé la empresa, nuestra misión y el detalle de lo que vas a aprender en este módulo.
              </p>
            </section>
            <section className="surface-card rounded-[2rem] border border-white/80 p-6">
              <NotionBlockRenderer blocks={intro.blocks} />
            </section>

            <section className="surface-card rounded-[2rem] border border-white/80 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-sky-500">Índice de aprendizajes</p>
              <ul className="mt-4 space-y-3">
                {[
                  "La propuesta de valor y los principales servicios de iAdventure Center.",
                  "Cómo funcionan las excursiones, traslados y operaciones de nieve.",
                  "Los protocolos de venta y los pasos para una atención segura y eficiente.",
                  "Los recursos comerciales, los puntos de contacto y las mejores prácticas.",
                  "Qué esperar en la evaluación final y cómo prepararte para el cierre.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-7 text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="surface-card rounded-[2rem] border border-white/80 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-slate-400">Glosario</p>
              <dl className="mt-4 space-y-4">
                {[
                  { term: "Excursión", def: "Experiencia turística guiada que incluye traslado, actividades y atención al cliente." },
                  { term: "Protocolo", def: "Normas y pasos establecidos para garantizar seguridad, calidad y coherencia operativa." },
                  { term: "Voucher", def: "Comprobante de reserva y pago que el cliente recibe como garantía del servicio." },
                  { term: "Disponibilidad", def: "Confirmación del proveedor de que el servicio puede venderse y ejecutarse en la fecha solicitada." },
                  { term: "Venta cruzada", def: "Sugerir productos o servicios adicionales que mejoren la experiencia del cliente." },
                ].map(({ term, def }) => (
                  <div key={term} className="rounded-[1.2rem] bg-slate-50 px-5 py-4">
                    <dt className="text-sm font-bold text-slate-900">{term}</dt>
                    <dd className="mt-1 text-sm leading-6 text-slate-600">{def}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        ) : null}

        {activeModule === "module1" ? (
          <div className="mx-auto -mt-6 flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
            <section className="surface-card rounded-[2rem] border border-white/80 p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <label className="sr-only" htmlFor="search-products">
                    Buscar excursiones
                  </label>
                  <input
                    id="search-products"
                    value={searchText}
                    onChange={(event) => {
                      setSearchText(event.target.value);
                      setShowProviders(false);
                    }}
                    placeholder="Buscar excursión, traslado o proveedor..."
                    className="w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {productFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setShowProviders(false);
                        setActiveFilter(filter.value);
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        !showProviders && activeFilter === filter.value
                          ? "bg-sky-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setShowProviders(true);
                      setExpandedProvider(null);
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      showProviders
                        ? "bg-slate-900 text-white"
                        : "bg-sky-100 text-sky-800 hover:bg-sky-200"
                    }`}
                  >
                    Proveedores
                  </button>
                </div>
              </div>
            </section>

            {showProviders ? (
              <section className="space-y-4">
                {providerNames.map((providerName) => {
                  const providerProducts = products.filter(
                    (product) => product.provider === providerName,
                  );
                  const isExpanded = expandedProvider === providerName;

                  return (
                    <article
                      key={providerName}
                      className="surface-card animate-rise overflow-hidden rounded-[2rem] border border-white/80"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedProvider((current) =>
                            current === providerName ? null : providerName,
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 bg-[linear-gradient(135deg,#7c3aed_0%,#8b5cf6_48%,#a855f7_100%)] px-6 py-5 text-left text-white"
                      >
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.26em] text-violet-200">
                            Proveedor
                          </p>
                          <h3 className="mt-1 text-xl font-bold">{providerName}</h3>
                          <p className="mt-1 text-sm text-violet-100">
                            {providerProducts.length} producto
                            {providerProducts.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold">
                          {isExpanded ? "Cerrar" : "Ver"}
                        </span>
                      </button>
                      {isExpanded ? (
                        <div className="grid gap-3 p-4 sm:p-5">
                          {providerProducts.map((product) => {
                            const accent = productTypeAccent[product.type];

                            return (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => setSelectedProduct(product)}
                                className={`rounded-[1.5rem] border ${accent.border} bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <span className="text-2xl">{product.emoji}</span>
                                    <h4 className="mt-3 text-base font-bold text-slate-900">
                                      {product.name}
                                    </h4>
                                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                                      {product.description}
                                    </p>
                                  </div>
                                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${accent.badge}`}>
                                    {productTypeLabels[product.type]}
                                  </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm">
                                  <span className="text-slate-500">
                                    Desde <strong className="text-slate-900">{product.prices[0]?.price}</strong>
                                  </span>
                                  <span className="font-semibold text-sky-700">
                                    Ver detalle →
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </section>
            ) : (
              <section className="grid gap-5 lg:grid-cols-2">
                {filteredProducts.map((product) => {
                  const accent = productTypeAccent[product.type];

                  return (
                    <article
                      key={product.id}
                      className={`surface-card animate-rise overflow-hidden rounded-[2rem] border ${accent.border} transition hover:-translate-y-1 hover:shadow-[var(--shadow-strong)]`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className="w-full text-left"
                      >
                        <div className={`bg-gradient-to-br ${accent.soft} p-5`}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-3">
                              <span className="text-4xl">{product.emoji}</span>
                              <div className="flex flex-wrap gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${accent.badge}`}>
                                  {productTypeLabels[product.type]}
                                </span>
                                {product.provider ? (
                                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                    {product.provider}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600">
                              {product.schedule}
                            </span>
                          </div>
                          <h3 className="mt-5 text-xl font-bold text-slate-900">
                            {product.name}
                          </h3>
                          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                            {product.description}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {product.tags.map((tag) => (
                              <span
                                key={`${product.id}-${tag}`}
                                className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className={`bg-gradient-to-br ${accent.price} px-5 py-5 text-white`}>
                          <div className="flex items-end justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                                Desde
                              </p>
                              <p className="mt-2 text-3xl font-black">{product.prices[0]?.price}</p>
                              <p className="mt-1 text-sm text-white/75">
                                {product.prices[0]?.method}
                              </p>
                              {product.freeAge ? (
                                <p className="mt-2 text-xs text-white/75">👶 {product.freeAge}</p>
                              ) : null}
                            </div>
                            <span className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-semibold">
                              Ver detalle
                            </span>
                          </div>
                        </div>
                      </button>
                    </article>
                  );
                })}

                {filteredProducts.length === 0 ? (
                  <div className="surface-card col-span-full rounded-[2rem] border border-white/70 px-6 py-16 text-center text-slate-500">
                    No se encontraron resultados para la búsqueda actual.
                  </div>
                ) : null}
              </section>
            )}
          </div>
        ) : null}

        {activeModule === "module2" ? (
          <div className="mx-auto -mt-6 flex w-full max-w-5xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0c1a2e_0%,#0f3460_55%,#16213e_100%)] p-6 text-white shadow-[0_28px_70px_rgba(15,52,96,0.40)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-sky-300">Módulo 2</p>
                  <h2 className="font-display mt-2 text-3xl font-bold leading-tight">Protocolos Operativos</h2>
                  <p className="mt-1 text-base font-medium text-sky-200">Venta y Reserva — Excursiones de Nieve</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-900/50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-sky-200">
                  ❄ Temporada Invierno 2026
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Procedimientos obligatorios para confirmar disponibilidad, gestionar pagos y completar reservas durante la temporada.
              </p>

              {(salesPriority.length > 0 || salesPriorityAnual.length > 0 || generalClothingNotes.length > 0) ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {(salesPriority.length > 0 || salesPriorityAnual.length > 0) ? (
                    <div className="rounded-[1.4rem] bg-white/8 p-4 backdrop-blur-sm sm:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Prioridad de Venta</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {salesPriority.length > 0 ? (
                          <div>
                            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300">❄ Invernales</p>
                            <div className="space-y-1.5">
                              {salesPriority.map((item, i) => (
                                <div key={item.nombre} className="flex items-start gap-2">
                                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-400/30 text-[11px] font-bold text-sky-200">{i + 1}</span>
                                  <div>
                                    <p className="text-sm font-semibold text-white">{item.nombre}</p>
                                    {item.descripcion ? <p className="text-xs leading-5 text-sky-200/70">{item.descripcion}</p> : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {salesPriorityAnual.length > 0 ? (
                          <div>
                            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">Todo el Año</p>
                            <div className="space-y-1.5">
                              {salesPriorityAnual.map((item, i) => (
                                <div key={item.nombre} className="flex items-start gap-2">
                                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/30 text-[11px] font-bold text-emerald-200">{i + 1}</span>
                                  <p className="text-sm font-semibold text-white">{item.nombre}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}



                </div>
              ) : null}
            </section>

            {bloque1.length > 0 ? (
              <div className="flex flex-col gap-3">
                {bloque1.map((section, idx) => {
                  const isOpen = expandedSection === `b1-${section.id}`;
                  const isDisponibilidad = section.title.toLowerCase().includes("disponib");
                  return (
                    <section
                      key={section.id}
                      className={`overflow-hidden rounded-[2rem] border transition-shadow ${
                        isOpen
                          ? "border-sky-200 shadow-[0_8px_32px_rgba(14,165,233,0.12)]"
                          : "surface-card border-white/70"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedSection(isOpen ? null : `b1-${section.id}`)}
                        className={`flex w-full items-center gap-4 px-6 py-4 text-left ${isOpen ? "bg-sky-50/80" : ""}`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isOpen ? "bg-sky-500 text-white" : "bg-sky-100 text-sky-700"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-display flex-1 text-base font-bold text-slate-900">{section.title}</span>
                        {isDisponibilidad ? (
                          <span className="hidden rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 sm:inline">
                            Obligatorio
                          </span>
                        ) : null}
                        <svg
                          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {isOpen ? (
                        <div className="border-t border-sky-100 bg-white px-6 pb-6 pt-5">
                          <NotionBlockRenderer blocks={section.blocks} />

                          {isDisponibilidad && (providerAvailability.length > 0 || availabilityChecklist.length > 0) ? (
                            <div className="mt-6 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Grupos de disponibilidad</span>
                                <div className="h-px flex-1 bg-slate-200" />
                              </div>

                              {providerAvailability.length > 0 ? (
                                <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                                  <table className="w-full border-collapse bg-white text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-[0.22em] text-slate-400">
                                      <tr>
                                        <th className="px-4 py-3">Proveedor / Actividad</th>
                                        <th className="px-4 py-3">Grupo WhatsApp</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {providerAvailability.map((row) => (
                                        <tr key={`${row.nombre}-${row.descripcion}`} className="border-t border-slate-100">
                                          <td className="px-4 py-3 text-slate-600">{row.nombre}</td>
                                          <td className="px-4 py-3 font-semibold text-slate-900">{row.descripcion}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : null}

                              {availabilityChecklist.length > 0 ? (
                                <div className="grid gap-2 sm:grid-cols-3">
                                  {availabilityChecklist.map((item) => (
                                    <div
                                      key={item}
                                      className="rounded-[1.2rem] border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-800"
                                    >
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </div>
            ) : null}

            {bloque2.length > 0 ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Sistemas y Reservas Externas</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                {bloque2.map((section) => (
                  <section
                    key={section.id}
                    className="surface-card overflow-hidden rounded-[2rem] border border-white/70"
                  >
                    <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5">
                      <h3 className="font-display text-xl font-bold text-slate-900">{section.title}</h3>
                    </div>
                    <div className="p-6">
                      <NotionBlockRenderer blocks={section.blocks} />
                    </div>
                  </section>
                ))}
              </>
            ) : null}
          </div>
        ) : null}

        {activeModule === "module3" ? (
          <div className="mx-auto -mt-6 flex w-full max-w-4xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
            <section className="surface-card rounded-[2rem] border-l-4 border-emerald-400 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-slate-400">
                Módulo 3
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold text-slate-900">
                Desarrollo del Área Comercial
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Herramientas, técnicas y habilidades para vender mejor y acompañar al cliente desde el primer contacto hasta el cierre.
              </p>
            </section>

            {comercial.map((bloque) => (
              <div key={bloque.bloque}>
                {comercial.length > 1 ? (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                      {bloque.bloque}
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                ) : null}
                <div className="flex flex-col gap-4">
                  {bloque.sections.map((section) => {
                    const isOpen = expandedSection === section.id;
                    return (
                      <section
                        key={section.id}
                        className="surface-card overflow-hidden rounded-[2rem] border border-white/70"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedSection(isOpen ? null : section.id)}
                          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                        >
                          <h3 className="font-display text-lg font-bold text-slate-900">
                            {section.title}
                          </h3>
                          <span className="shrink-0 text-slate-400 transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                            ▼
                          </span>
                        </button>
                        {isOpen ? (
                          <div className="border-t border-slate-100 px-6 py-5">
                            <NotionBlockRenderer blocks={section.blocks} />
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeModule === "eval" ? (
          result && saveState ? (
            <ResultView
              result={result}
              saved={saveState.saved}
              notificationSent={saveState.notificationSent}
              error={saveState.error}
              onRetry={resetEvaluation}
              evalQuestions={evalQuestions}
            />
          ) : (
            <div className="mx-auto -mt-6 flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
              <section className="surface-card rounded-[2rem] border-l-4 border-violet-400 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-slate-400">
                  Módulo 3
                </p>
                <h2 className="font-display mt-2 text-3xl font-bold text-slate-900">
                  Evaluación Final
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  20 preguntas sobre excursiones, protocolos y proveedores. El
                  resultado se calcula en servidor y se guarda sin exponer acceso directo
                  a la base.
                </p>
              </section>

              <section className="surface-card rounded-[2rem] border border-white/70 p-5">
                <label
                  htmlFor="vendor-name"
                  className="text-xs font-bold uppercase tracking-[0.26em] text-slate-400"
                >
                  Nombre del vendedor
                </label>
                <input
                  ref={vendorInputRef}
                  id="vendor-name"
                  value={vendorName}
                  autoComplete="name"
                  onChange={(event) => setVendorName(event.target.value)}
                  placeholder="Ingresá tu nombre y apellido..."
                  className={`mt-3 w-full rounded-[1.4rem] border-2 px-4 py-3 text-sm text-slate-700 outline-none transition ${
                    showVendorError
                      ? "border-rose-300 bg-rose-50 focus:ring-4 focus:ring-rose-100"
                      : "border-slate-200 bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  }`}
                />
                {showVendorError ? (
                  <p className="mt-2 text-sm font-medium text-rose-600">
                    Por favor ingresá tu nombre antes de enviar.
                  </p>
                ) : null}

                <label className="mt-5 block text-xs font-bold uppercase tracking-[0.26em] text-slate-400">
                  Fecha en que empezaste la capacitación
                </label>
                <p className="mt-1 text-xs text-slate-400">
                  Si la empezaste ayer o antes, poné esa fecha — ayuda a identificar tu progreso guardado.
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    id="vendor-date-day"
                    type="number"
                    min={1}
                    max={31}
                    value={vendorDate.day}
                    onChange={(e) => setVendorDate((prev) => ({ ...prev, day: e.target.value }))}
                    placeholder="Día"
                    className="w-1/3 rounded-[1.4rem] border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  />
                  <input
                    id="vendor-date-month"
                    type="number"
                    min={1}
                    max={12}
                    value={vendorDate.month}
                    onChange={(e) => setVendorDate((prev) => ({ ...prev, month: e.target.value }))}
                    placeholder="Mes"
                    className="w-1/3 rounded-[1.4rem] border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  />
                  <input
                    id="vendor-date-year"
                    type="number"
                    min={2024}
                    max={2100}
                    value={vendorDate.year}
                    onChange={(e) => setVendorDate((prev) => ({ ...prev, year: e.target.value }))}
                    placeholder="Año"
                    className="w-1/3 rounded-[1.4rem] border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </section>

              <section className="surface-card rounded-[2rem] border border-sky-200 bg-sky-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-sky-500">
                  Progreso guardado
                </p>
                <p className="mt-1 text-sm font-semibold text-sky-900">
                  ¿Empezaste la evaluación otro día y la dejaste sin terminar?
                </p>
                <p className="mt-1 text-xs text-sky-700">
                  Ingresá tu nombre y apellido tal como los pusiste antes y buscá tu progreso.
                </p>
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => { setSearchName(e.target.value); setSearchResult(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") searchSavedProgress(); }}
                    placeholder="Nombre y apellido..."
                    className="flex-1 rounded-[1.4rem] border-2 border-sky-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                  <button
                    type="button"
                    onClick={searchSavedProgress}
                    disabled={!searchName.trim()}
                    className="rounded-[1.4rem] bg-sky-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Buscar
                  </button>
                </div>

                {searchResult?.status === "found" ? (
                  <div className="mt-4 rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <p className="text-sm font-semibold text-emerald-800">
                      ✓ Progreso encontrado ({searchResult.matches.length} coincidencia{searchResult.matches.length > 1 ? "s" : ""})
                    </p>
                    {searchResult.matches.length === 1 ? (
                      <>
                        <p className="mt-0.5 text-xs text-emerald-700">{searchResult.matches[0]!.label}</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => loadSavedProgress(searchResult.matches[0]!.key)}
                            className="rounded-[1.2rem] bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                          >
                            Retomar evaluación →
                          </button>
                          <button
                            type="button"
                            onClick={() => { localStorage.removeItem(searchResult.matches[0]!.key); setSearchResult(null); setSearchName(""); }}
                            className="rounded-[1.2rem] border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                          >
                            Empezar de cero
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-emerald-700">Seleccioná cuál querés retomar:</p>
                        {searchResult.matches.map((match) => (
                          <div key={match.key} className="flex items-center justify-between gap-2 rounded-[1rem] bg-white px-3 py-2">
                            <span className="text-sm text-slate-700">{match.label}</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => loadSavedProgress(match.key)}
                                className="rounded-[1rem] bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                              >
                                Retomar →
                              </button>
                              <button
                                type="button"
                                onClick={() => { localStorage.removeItem(match.key); searchSavedProgress(); }}
                                className="rounded-[1rem] border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                              >
                                Borrar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : searchResult?.status === "notfound" ? (
                  <p className="mt-3 text-sm text-rose-600">
                    No encontramos progreso guardado para ese nombre. Asegurate de escribirlo igual que antes.
                  </p>
                ) : null}
              </section>

              <div className="space-y-5">
                {evalQuestions.map((question, index) => renderQuestionCard(question, index))}
              </div>

              {!isEvalComplete && vendorName.trim() ? (
                <section className="surface-card rounded-[2rem] border border-violet-200 bg-violet-50 p-5">
                  <p className="text-sm font-semibold text-violet-800">
                    Todavía hay preguntas sin responder.
                  </p>
                  <p className="mt-1 text-xs text-violet-700">
                    Podés guardar el progreso y continuar mañana desde donde lo dejaste.
                  </p>
                  <button
                    type="button"
                    onClick={saveExplicitly}
                    className="mt-4 rounded-[1.2rem] bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                  >
                    {savedFeedback ? "✓ Progreso guardado" : "Guardar progreso"}
                  </button>
                </section>
              ) : null}

              <section className="surface-card rounded-[2rem] border border-white/70 p-6">
                <p className="text-sm leading-7 text-slate-500">
                  Al enviar, el SP podrá revisar el puntaje automático y las respuestas
                  abiertas desde una ruta protegida.
                </p>
                {submitError ? (
                  <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {submitError}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => startSubmitTransition(() => void submitEvaluation())}
                  disabled={isSubmitting}
                  className="mt-5 w-full rounded-[1.4rem] bg-[linear-gradient(135deg,#0f2027_0%,#203a43_48%,#2c5364_100%)] px-4 py-4 text-base font-bold text-white transition hover:opacity-92 disabled:cursor-wait disabled:opacity-75"
                >
                  {isSubmitting ? "Enviando evaluación..." : "Enviar Evaluación →"}
                </button>
              </section>
            </div>
          )
        ) : null}

        {activeModule === "info" ? (
          <div className="mx-auto -mt-6 flex w-full max-w-3xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
            <section className="surface-card rounded-[2rem] border-l-4 border-emerald-400 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-slate-400">
                Recursos
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold text-slate-900">
                Información Adicional
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Material de consulta complementario: canales de venta online y glosario de términos operativos.
              </p>
            </section>

            {infoAdicional.map((section) => {
              const isOpen = expandedSection === section.id;
              return (
                <section
                  key={section.id}
                  className="surface-card overflow-hidden rounded-[2rem] border border-white/70"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedSection(isOpen ? null : section.id)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      {section.title}
                    </h3>
                    <span className="shrink-0 text-slate-400 transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                      ▼
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="border-t border-slate-100 px-6 py-5">
                      <NotionBlockRenderer blocks={section.blocks} />
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        ) : null}
      </main>
    </div>
  );
}
