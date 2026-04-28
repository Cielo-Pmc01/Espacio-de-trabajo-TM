import type {
  DragQuestion,
  EvalQuestion,
  EvaluationAnswers,
  MatchQuestion,
  SavedEvaluationPayload,
  SavedEvaluationRecord,
  SavedInteractiveResult,
  SavedMcResult,
  SectionBreakdown,
} from "@/lib/training-types";

function formatLabel(pct: number) {
  if (pct >= 80) return "Excelente";
  if (pct >= 60) return "En progreso";
  return "Necesita refuerzo";
}

function scoreInteractiveQuestion(
  question: DragQuestion | MatchQuestion,
  answers: Record<string, string>,
) {
  const keys = question.type === "drag" ? question.items : question.left;
  let correct = 0;
  const detail: SavedInteractiveResult["detail"] = {};

  for (const key of keys) {
    const expected = question.correct[key];
    const actual = answers[key];
    const ok = actual === expected;

    if (ok) {
      correct += 1;
    }

    detail[key] = {
      ok,
      expected,
      ...(question.type === "drag" ? { placed: actual } : { matched: actual }),
    };
  }

  return {
    earned: Math.round((correct / keys.length) * question.pts),
    detail,
  };
}

export function gradeEvaluation(
  questions: EvalQuestion[],
  answers: EvaluationAnswers,
  vendorName: string,
): SavedEvaluationPayload {
  const vendor = vendorName.trim() || "Sin nombre";
  let totalAuto = 0;
  let correctAuto = 0;
  const results: SavedEvaluationPayload["results"] = [];
  const openAnswers: SavedEvaluationPayload["openAnswers"] = [];

  for (const question of questions) {
    if (question.type === "mc") {
      totalAuto += question.pts;
      const chosen = answers.mc[question.id] ?? -1;
      const ok = chosen === question.ans;

      if (ok) {
        correctAuto += question.pts;
      }

      const result: SavedMcResult = {
        qid: question.id,
        section: question.section,
        type: question.type,
        pts: question.pts,
        ok,
        chosen,
        correctAns: question.opts[question.ans] ?? "",
      };

      results.push(result);
      continue;
    }

    if (question.type === "open") {
      openAnswers.push({
        qid: question.id,
        section: question.section,
        question: question.q,
        answer: answers.open[question.id]?.trim() ?? "",
      });
      continue;
    }

    totalAuto += question.pts;

    const sourceAnswers =
      question.type === "drag"
        ? answers.drag[question.id] ?? {}
        : answers.match[question.id] ?? {};

    const { earned, detail } = scoreInteractiveQuestion(question, sourceAnswers);

    correctAuto += earned;
    results.push({
      qid: question.id,
      section: question.section,
      type: question.type,
      pts: question.pts,
      earned,
      detail,
    });
  }

  const sections: SectionBreakdown = {};

  for (const result of results) {
    const current = sections[result.section] ?? { correct: 0, total: 0 };
    current.total += result.pts;

    if (result.type === "mc") {
      current.correct += result.ok ? result.pts : 0;
    } else {
      current.correct += result.earned;
    }

    sections[result.section] = current;
  }

  const pct = totalAuto > 0 ? Math.round((correctAuto / totalAuto) * 100) : 0;

  return {
    vendor,
    pct,
    correct: correctAuto,
    total: totalAuto,
    label: formatLabel(pct),
    sections,
    results,
    openAnswers,
  };
}

export function normalizeSavedEvaluation(raw: Record<string, unknown>) {
  const normalized: SavedEvaluationRecord = {
    id: (raw.id as number | string | undefined) ?? "",
    timestamp:
      (raw.created_at as string | undefined) ??
      (raw.timestamp as string | undefined) ??
      new Date().toISOString(),
    vendor:
      (raw.vendedor as string | undefined) ??
      (raw.vendor as string | undefined) ??
      "Sin nombre",
    pct: Number((raw.puntaje as number | string | undefined) ?? raw.pct ?? 0),
    correct: Number(
      (raw.correctas as number | string | undefined) ?? raw.correct ?? 0,
    ),
    total: Number((raw.total as number | string | undefined) ?? 0),
    label:
      (raw.etiqueta as string | undefined) ??
      (raw.label as string | undefined) ??
      "Sin etiqueta",
    sections:
      (raw.secciones as SectionBreakdown | undefined) ??
      (raw.sections as SectionBreakdown | undefined) ??
      {},
    results:
      (raw.resultados as SavedEvaluationRecord["results"] | undefined) ??
      (raw.results as SavedEvaluationRecord["results"] | undefined) ??
      [],
    openAnswers:
      (raw.respuestas_abiertas as SavedEvaluationRecord["openAnswers"] | undefined) ??
      (raw.openAnswers as SavedEvaluationRecord["openAnswers"] | undefined) ??
      [],
  };

  return normalized;
}
