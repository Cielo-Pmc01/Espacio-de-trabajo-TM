import { getServerConfig, hasSupabaseConfig } from "@/lib/server/config";

export async function GET() {
  try {
    const config = getServerConfig();

    if (!hasSupabaseConfig(config)) {
      return Response.json(
        { error: "Faltan variables de entorno de Supabase", url: config.supabaseUrl ? "OK" : "FALTA", key: config.supabaseServiceRoleKey ? "OK" : "FALTA" },
        { status: 500 }
      );
    }

    const supabaseUrl = config.supabaseUrl!;
    const supabaseKey = config.supabaseServiceRoleKey!;

    const testUrl = new URL("/rest/v1/progresos?select=*&limit=1", supabaseUrl).toString();
    const response = await fetch(testUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const body = await response.text();

    return Response.json({
      status: response.status,
      ok: response.ok,
      body: body || "(vacío)",
      url: supabaseUrl,
    });
  } catch (cause) {
    return Response.json(
      { error: `Excepción: ${cause instanceof Error ? cause.message : String(cause)}` },
      { status: 500 }
    );
  }
}
