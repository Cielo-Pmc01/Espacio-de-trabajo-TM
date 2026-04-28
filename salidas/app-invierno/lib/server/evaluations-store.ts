import "server-only";

import { normalizeSavedEvaluation } from "@/lib/evaluation";
import { getServerConfig, hasSupabaseConfig } from "@/lib/server/config";
import type {
  SavedEvaluationPayload,
  SavedEvaluationRecord,
} from "@/lib/training-types";

const TABLE_NAME = "evaluaciones";

function getRestEndpoint(path = "") {
  const config = getServerConfig();

  if (!config.supabaseUrl) {
    throw new Error("Falta SUPABASE_URL en el servidor.");
  }

  return new URL(`/rest/v1/${TABLE_NAME}${path}`, config.supabaseUrl).toString();
}

function getSupabaseHeaders() {
  const config = getServerConfig();

  if (!config.supabaseServiceRoleKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.");
  }

  return {
    apikey: config.supabaseServiceRoleKey,
    Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
    "Content-Type": "application/json",
  };
}

async function readErrorMessage(response: Response) {
  const rawText = await response.text();

  if (!rawText) {
    return `Supabase respondió ${response.status}.`;
  }

  try {
    const parsed = JSON.parse(rawText) as { message?: string };
    return parsed.message ?? rawText;
  } catch {
    return rawText;
  }
}

export async function saveEvaluationRecord(payload: SavedEvaluationPayload) {
  const config = getServerConfig();
  let saved = false;
  let notificationSent = false;
  let error: string | undefined;

  if (hasSupabaseConfig(config)) {
    try {
      const response = await fetch(getRestEndpoint(), {
        method: "POST",
        headers: {
          ...getSupabaseHeaders(),
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          vendedor: payload.vendor,
          puntaje: payload.pct,
          correctas: payload.correct,
          total: payload.total,
          etiqueta: payload.label,
          secciones: payload.sections,
          respuestas_abiertas: payload.openAnswers,
          resultados: payload.results,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        const detail = await readErrorMessage(response);
        console.error("[evaluaciones-store] Error al guardar en Supabase:", detail);
        error = "No se pudo guardar la evaluación en la base de datos.";
      } else {
        saved = true;
      }
    } catch (cause) {
      console.error("[evaluaciones-store] Excepción al guardar evaluación:", cause);
      error = "No se pudo conectar con la base de datos.";
    }
  } else {
    console.error("[evaluaciones-store] Configuración de Supabase incompleta.");
    error = "Servicio de base de datos no disponible.";
  }

  if (config.webhookUrl) {
    try {
      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
        cache: "no-store",
      });

      notificationSent = response.ok;

      if (!response.ok && !error) {
        error = "El resultado se procesó, pero falló la notificación externa.";
      }
    } catch {
      if (!error) {
        error = "El resultado se procesó, pero no se pudo notificar al webhook.";
      }
    }
  }

  return {
    saved,
    notificationSent,
    error,
  };
}

export async function listEvaluationRecords(): Promise<SavedEvaluationRecord[]> {
  if (!hasSupabaseConfig()) {
    console.error("[evaluaciones-store] Configuración de Supabase incompleta.");
    throw new Error("Servicio de base de datos no disponible.");
  }

  const response = await fetch(
    getRestEndpoint("?select=*&order=created_at.desc"),
    {
      headers: getSupabaseHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await readErrorMessage(response);
    console.error("[evaluaciones-store] Error al listar registros:", detail);
    throw new Error("No se pudieron cargar los resultados.");
  }

  const raw = (await response.json()) as Record<string, unknown>[];
  return raw.map(normalizeSavedEvaluation);
}

export async function deleteEvaluationRecord(id: string) {
  if (!hasSupabaseConfig()) {
    console.error("[evaluaciones-store] Configuración de Supabase incompleta.");
    throw new Error("Servicio de base de datos no disponible.");
  }

  const response = await fetch(
    getRestEndpoint(`?id=eq.${encodeURIComponent(id)}`),
    {
      method: "DELETE",
      headers: getSupabaseHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await readErrorMessage(response);
    console.error("[evaluaciones-store] Error al borrar registro:", detail);
    throw new Error("No se pudo borrar el registro.");
  }
}

export async function clearEvaluationRecords() {
  if (!hasSupabaseConfig()) {
    console.error("[evaluaciones-store] Configuración de Supabase incompleta.");
    throw new Error("Servicio de base de datos no disponible.");
  }

  const response = await fetch(getRestEndpoint("?id=not.is.null"), {
    method: "DELETE",
    headers: getSupabaseHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await readErrorMessage(response);
    console.error("[evaluaciones-store] Error al limpiar registros:", detail);
    throw new Error("No se pudieron borrar los registros.");
  }
}
