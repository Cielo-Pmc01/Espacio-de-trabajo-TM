import { deleteEvaluationRecord } from "@/lib/server/evaluations-store";
import { isSupervisorAuthenticated } from "@/lib/server/supervisor-session";

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/sp/results/[id]">,
) {
  if (!(await isSupervisorAuthenticated())) {
    return Response.json({ error: "Sesión no autorizada." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await deleteEvaluationRecord(id);
    return Response.json({ ok: true });
  } catch (cause) {
    console.error("[api/sp/results/[id]] Error al borrar registro:", cause);
    return Response.json({ error: "No se pudo borrar el registro." }, { status: 500 });
  }
}
