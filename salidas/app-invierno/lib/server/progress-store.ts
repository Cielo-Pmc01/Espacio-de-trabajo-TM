import "server-only";

import { getServerConfig, hasSupabaseConfig } from "@/lib/server/config";
import type { SavedProgressPayload, SavedProgressRecord } from "@/lib/training-types";

const TABLE_NAME = "progresos";

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

export async function saveProgressRecord(payload: SavedProgressPayload): Promise<{ saved: boolean; error?: string }> {
  const config = getServerConfig();

  if (!hasSupabaseConfig(config)) {
    console.error("[progress-store] Configuración de Supabase incompleta. URL:", config.supabaseUrl ? "OK" : "FALTA", "Key:", config.supabaseServiceRoleKey ? "OK" : "FALTA");
    return { saved: false, error: "Servicio de base de datos no disponible." };
  }

  try {
    let existing: SavedProgressRecord | null = null;
    try {
      existing = await findProgressByVendorAndDate(payload.vendor, payload.vendorDate);
    } catch (lookupErr) {
      console.warn("[progress-store] Error buscando progreso existente, se creará nuevo:", lookupErr);
    }

    const body = {
      vendedor: payload.vendor,
      fecha_dia: payload.vendorDate.day,
      fecha_mes: payload.vendorDate.month,
      fecha_anio: payload.vendorDate.year,
      respuestas_mc: payload.mcAnswers,
      respuestas_abiertas: payload.openAnswers,
      respuestas_drag: payload.dragAnswers,
      respuestas_match: payload.matchAnswers,
      updated_at: new Date().toISOString(),
    };

    let response;
    const endpoint = existing
      ? getRestEndpoint(`?id=eq.${encodeURIComponent(existing.id)}`)
      : getRestEndpoint();
    const method = existing ? "PATCH" : "POST";

    console.log("[progress-store] Guardando progreso:", { method, endpoint: endpoint.slice(0, 80) + "...", vendor: payload.vendor });

    if (existing) {
      response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          ...getSupabaseHeaders(),
          Prefer: "return=representation",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });
    } else {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          ...getSupabaseHeaders(),
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          ...body,
          created_at: new Date().toISOString(),
        }),
        cache: "no-store",
      });
    }

    if (!response.ok) {
      const detail = await readErrorMessage(response);
      console.error("[progress-store] Error al guardar progreso (status", response.status, "):", detail);
      return { saved: false, error: `Error ${response.status}: ${detail}` };
    }

    console.log("[progress-store] Progreso guardado exitosamente");
    return { saved: true };
  } catch (cause) {
    console.error("[progress-store] Excepción al guardar progreso:", cause);
    return { saved: false, error: `Excepción: ${cause instanceof Error ? cause.message : String(cause)}` };
  }
}

export async function findProgressById(id: string): Promise<SavedProgressRecord | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  try {
    const response = await fetch(
      getRestEndpoint(`?id=eq.${encodeURIComponent(id)}&select=*`),
      {
        headers: getSupabaseHeaders(),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Array<{
      id: string;
      vendedor: string;
      fecha_dia: string;
      fecha_mes: string;
      fecha_anio: string;
      respuestas_mc: Record<string, number>;
      respuestas_abiertas: Record<string, string>;
      respuestas_drag: Record<string, Record<string, string>>;
      respuestas_match: Record<string, Record<string, string>>;
      created_at: string;
      updated_at: string;
    }>;

    if (data.length === 0) return null;

    const record = data[0];
    return {
      id: record.id,
      vendor: record.vendedor,
      vendorDate: {
        day: record.fecha_dia,
        month: record.fecha_mes,
        year: record.fecha_anio,
      },
      mcAnswers: record.respuestas_mc || {},
      openAnswers: record.respuestas_abiertas || {},
      dragAnswers: record.respuestas_drag || {},
      matchAnswers: record.respuestas_match || {},
      timestamp: record.updated_at || record.created_at,
    };
  } catch {
    return null;
  }
}

export async function findProgressByVendorAndDate(
  vendor: string,
  date: { day: string; month: string; year: string }
): Promise<SavedProgressRecord | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  try {
    const response = await fetch(
      getRestEndpoint(
        `?vendedor=eq.${encodeURIComponent(vendor)}&fecha_dia=eq.${date.day}&fecha_mes=eq.${date.month}&fecha_anio=eq.${date.year}&select=*`
      ),
      {
        headers: getSupabaseHeaders(),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Array<{
      id: string;
      vendedor: string;
      fecha_dia: string;
      fecha_mes: string;
      fecha_anio: string;
      respuestas_mc: Record<string, number>;
      respuestas_abiertas: Record<string, string>;
      respuestas_drag: Record<string, Record<string, string>>;
      respuestas_match: Record<string, Record<string, string>>;
      created_at: string;
      updated_at: string;
    }>;

    if (data.length === 0) return null;

    const record = data[0];
    return {
      id: record.id,
      vendor: record.vendedor,
      vendorDate: {
        day: record.fecha_dia,
        month: record.fecha_mes,
        year: record.fecha_anio,
      },
      mcAnswers: record.respuestas_mc || {},
      openAnswers: record.respuestas_abiertas || {},
      dragAnswers: record.respuestas_drag || {},
      matchAnswers: record.respuestas_match || {},
      timestamp: record.updated_at || record.created_at,
    };
  } catch {
    return null;
  }
}

export async function searchProgressByVendor(vendorQuery: string): Promise<SavedProgressRecord[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  try {
    const response = await fetch(
      getRestEndpoint(
        `?vendedor=ilike.${encodeURIComponent(`%${vendorQuery}%`)}&select=*&order=updated_at.desc`
      ),
      {
        headers: getSupabaseHeaders(),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as Array<{
      id: string;
      vendedor: string;
      fecha_dia: string;
      fecha_mes: string;
      fecha_anio: string;
      respuestas_mc: Record<string, number>;
      respuestas_abiertas: Record<string, string>;
      respuestas_drag: Record<string, Record<string, string>>;
      respuestas_match: Record<string, Record<string, string>>;
      created_at: string;
      updated_at: string;
    }>;

    return data.map((record) => ({
      id: record.id,
      vendor: record.vendedor,
      vendorDate: {
        day: record.fecha_dia,
        month: record.fecha_mes,
        year: record.fecha_anio,
      },
      mcAnswers: record.respuestas_mc || {},
      openAnswers: record.respuestas_abiertas || {},
      dragAnswers: record.respuestas_drag || {},
      matchAnswers: record.respuestas_match || {},
      timestamp: record.updated_at || record.created_at,
    }));
  } catch {
    return [];
  }
}

export async function deleteProgressRecord(id: string) {
  if (!hasSupabaseConfig()) {
    throw new Error("Servicio de base de datos no disponible.");
  }

  const response = await fetch(
    getRestEndpoint(`?id=eq.${encodeURIComponent(id)}`),
    {
      method: "DELETE",
      headers: getSupabaseHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const detail = await readErrorMessage(response);
    console.error("[progress-store] Error al borrar progreso:", detail);
    throw new Error("No se pudo borrar el progreso.");
  }
}

export async function listAllProgressRecords(): Promise<SavedProgressRecord[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const response = await fetch(
    getRestEndpoint("?select=*&order=updated_at.desc"),
    {
      headers: getSupabaseHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const detail = await readErrorMessage(response);
    console.error("[progress-store] Error al listar progresos:", detail);
    return [];
  }

  const data = (await response.json()) as Array<{
    id: string;
    vendedor: string;
    fecha_dia: string;
    fecha_mes: string;
    fecha_anio: string;
    respuestas_mc: Record<string, number>;
    respuestas_abiertas: Record<string, string>;
    respuestas_drag: Record<string, Record<string, string>>;
    respuestas_match: Record<string, Record<string, string>>;
    created_at: string;
    updated_at: string;
  }>;

  return data.map((record) => ({
    id: record.id,
    vendor: record.vendedor,
    vendorDate: {
      day: record.fecha_dia,
      month: record.fecha_mes,
      year: record.fecha_anio,
    },
    mcAnswers: record.respuestas_mc || {},
    openAnswers: record.respuestas_abiertas || {},
    dragAnswers: record.respuestas_drag || {},
    matchAnswers: record.respuestas_match || {},
    timestamp: record.updated_at || record.created_at,
  }));
}
