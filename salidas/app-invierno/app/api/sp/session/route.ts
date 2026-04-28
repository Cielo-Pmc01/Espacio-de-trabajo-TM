import { cookies } from "next/headers";

import { getServerConfig } from "@/lib/server/config";
import { parseSupervisorLoginInput } from "@/lib/server/evaluation-input";
import {
  createSupervisorSessionValue,
  getSupervisorSessionCookieOptions,
  SUPERVISOR_SESSION_COOKIE,
} from "@/lib/server/supervisor-session";

export async function POST(request: Request) {
  try {
    const config = getServerConfig();

    if (!config.spPin) {
      return Response.json(
        { error: "Falta configurar SP_PIN en el servidor." },
        { status: 503 },
      );
    }

    const input = parseSupervisorLoginInput((await request.json()) as unknown);

    if (input.pin !== config.spPin) {
      return Response.json({ error: "PIN incorrecto." }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(
      SUPERVISOR_SESSION_COOKIE,
      createSupervisorSessionValue(),
      getSupervisorSessionCookieOptions(),
    );

    return Response.json({ ok: true });
  } catch (cause) {
    console.error("[api/sp/session] Error al procesar login:", cause);
    return Response.json({ error: "No se pudo iniciar la sesión." }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SUPERVISOR_SESSION_COOKIE);

  return Response.json({ ok: true });
}
