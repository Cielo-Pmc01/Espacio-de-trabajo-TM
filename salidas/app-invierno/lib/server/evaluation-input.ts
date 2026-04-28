import "server-only";

import { evalQuestions } from "@/lib/training-data";
import type {
  EvaluationAnswers,
  EvaluationSubmissionInput,
  SupervisorLoginInput,
} from "@/lib/training-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeNumberMap(
  raw: unknown,
  allowedIds: Set<string>,
): Record<string, number> {
  if (!isRecord(raw)) {
    return {};
  }

  const result: Record<string, number> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!allowedIds.has(key) || typeof value !== "number") {
      continue;
    }

    if (Number.isFinite(value)) {
      result[key] = Math.trunc(value);
    }
  }

  return result;
}

function normalizeStringMap(
  raw: unknown,
  allowedIds: Set<string>,
): Record<string, string> {
  if (!isRecord(raw)) {
    return {};
  }

  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!allowedIds.has(key) || typeof value !== "string") {
      continue;
    }

    result[key] = value.slice(0, 3000);
  }

  return result;
}

function normalizeNestedStringMap(
  raw: unknown,
  allowedIds: Set<string>,
): Record<string, Record<string, string>> {
  if (!isRecord(raw)) {
    return {};
  }

  const result: Record<string, Record<string, string>> = {};

  for (const [questionId, value] of Object.entries(raw)) {
    if (!allowedIds.has(questionId) || !isRecord(value)) {
      continue;
    }

    const nested: Record<string, string> = {};

    for (const [itemKey, itemValue] of Object.entries(value)) {
      if (typeof itemValue === "string") {
        nested[itemKey] = itemValue.slice(0, 200);
      }
    }

    result[questionId] = nested;
  }

  return result;
}

export function parseEvaluationSubmission(
  payload: unknown,
): EvaluationSubmissionInput {
  if (!isRecord(payload)) {
    throw new Error("El cuerpo de la evaluación es inválido.");
  }

  const vendor =
    typeof payload.vendor === "string" ? payload.vendor.trim() : "";

  if (!vendor) {
    throw new Error("Ingresá tu nombre antes de enviar.");
  }

  const answersRaw = isRecord(payload.answers) ? payload.answers : {};
  const mcIds = new Set(
    evalQuestions.filter((question) => question.type === "mc").map((question) => question.id),
  );
  const openIds = new Set(
    evalQuestions.filter((question) => question.type === "open").map((question) => question.id),
  );
  const dragIds = new Set(
    evalQuestions.filter((question) => question.type === "drag").map((question) => question.id),
  );
  const matchIds = new Set(
    evalQuestions.filter((question) => question.type === "match").map((question) => question.id),
  );

  const answers: EvaluationAnswers = {
    mc: normalizeNumberMap(answersRaw.mc, mcIds),
    open: normalizeStringMap(answersRaw.open, openIds),
    drag: normalizeNestedStringMap(answersRaw.drag, dragIds),
    match: normalizeNestedStringMap(answersRaw.match, matchIds),
  };

  return {
    vendor: vendor.slice(0, 120),
    answers,
  };
}

export function parseSupervisorLoginInput(payload: unknown): SupervisorLoginInput {
  if (!isRecord(payload) || typeof payload.pin !== "string") {
    throw new Error("Ingresá un PIN válido.");
  }

  return {
    pin: payload.pin.trim(),
  };
}
