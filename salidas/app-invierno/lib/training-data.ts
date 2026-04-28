import evalQuestionsData from "@/lib/eval-questions.json";
import type { EvalQuestion, ProductType } from "@/lib/training-types";

export type ProductFilter = "all" | "invernal" | "lacustre" | "terrestre" | "aventura" | "alquiler" | "traslado";

export const evalQuestions = evalQuestionsData as EvalQuestion[];

export const productTypeLabels: Record<ProductType, string> = {
  excursion: "Excursión",
  traslado: "Traslado",
  clase: "Clase",
};

export const productTypeAccent: Record<
  ProductType,
  {
    border: string;
    badge: string;
    soft: string;
    price: string;
  }
> = {
  excursion: {
    border: "border-sky-300/90",
    badge: "bg-sky-100 text-sky-800",
    soft: "from-sky-100 via-white to-sky-50",
    price: "from-slate-900 via-slate-800 to-sky-900",
  },
  traslado: {
    border: "border-emerald-300/90",
    badge: "bg-emerald-100 text-emerald-800",
    soft: "from-emerald-100 via-white to-emerald-50",
    price: "from-slate-900 via-emerald-900 to-emerald-700",
  },
  clase: {
    border: "border-amber-300/90",
    badge: "bg-amber-100 text-amber-800",
    soft: "from-amber-100 via-white to-amber-50",
    price: "from-slate-900 via-amber-900 to-amber-700",
  },
};

export const productFilters: Array<{
  value: ProductFilter;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "invernal", label: "Invernales" },
  { value: "lacustre", label: "Lacustres" },
  { value: "terrestre", label: "Terrestres" },
  { value: "aventura", label: "Aventura" },
  { value: "alquiler", label: "Alquiler" },
  { value: "traslado", label: "Traslados" },
];
