import { gradeEvaluation } from "@/lib/evaluation";
import { evalQuestions } from "@/lib/training-data";
import { parseEvaluationSubmission } from "@/lib/server/evaluation-input";
import { saveEvaluationRecord } from "@/lib/server/evaluations-store";
import type { EvaluationSubmitResponse } from "@/lib/training-types";

export async function POST(request: Request) {
  try {
    const rawBody = (await request.json()) as unknown;
    const input = parseEvaluationSubmission(rawBody);
    const evaluation = gradeEvaluation(evalQuestions, input.answers, input.vendor);
    const persistence = await saveEvaluationRecord(evaluation);

    const response: EvaluationSubmitResponse = {
      evaluation,
      saved: persistence.saved,
      notificationSent: persistence.notificationSent,
      ...(persistence.error ? { error: persistence.error } : {}),
    };

    return Response.json(response, {
      status: persistence.saved ? 200 : 202,
    });
  } catch (cause) {
    if (cause instanceof Error && cause.message.length < 200) {
      // Errores de validación del input (parseEvaluationSubmission) son seguros de mostrar
      return Response.json({ error: cause.message }, { status: 400 });
    }
    console.error("[api/evaluations] Error inesperado:", cause);
    return Response.json({ error: "No se pudo procesar la evaluación." }, { status: 400 });
  }
}
