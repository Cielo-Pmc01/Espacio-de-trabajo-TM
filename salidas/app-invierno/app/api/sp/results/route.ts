import {
  clearEvaluationRecords,
  listEvaluationRecords,
} from "@/lib/server/evaluations-store";
import { isSupervisorAuthenticated } from "@/lib/server/supervisor-session";

function unauthorizedResponse() {
  return Response.json({ error: "Sesión no autorizada." }, { status: 401 });
}

export async function GET() {
  if (!(await isSupervisorAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const records = await listEvaluationRecords();
    return Response.json(records);
  } catch (cause) {
    console.error("[api/sp/results] Error al cargar resultados:", cause);
    return Response.json({ error: "No se pudieron cargar los resultados." }, { status: 500 });
  }
}

export async function DELETE() {
  if (!(await isSupervisorAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    await clearEvaluationRecords();
    return Response.json({ ok: true });
  } catch (cause) {
    console.error("[api/sp/results] Error al borrar registros:", cause);
    return Response.json({ error: "No se pudieron borrar los resultados." }, { status: 500 });
  }
}
