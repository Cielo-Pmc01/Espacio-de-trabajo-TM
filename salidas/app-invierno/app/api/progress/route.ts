import {
  deleteProgressRecord,
  listAllProgressRecords,
  saveProgressRecord,
  searchProgressByVendor,
} from "@/lib/server/progress-store";
import type { ProgressSaveResponse, SavedProgressPayload } from "@/lib/training-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;

    const payload = body as SavedProgressPayload;
    if (
      !payload.vendor ||
      typeof payload.vendor !== "string" ||
      !payload.vendorDate ||
      typeof payload.vendorDate !== "object" ||
      !payload.vendorDate.day ||
      !payload.vendorDate.month ||
      !payload.vendorDate.year
    ) {
      return Response.json(
        { error: "Faltan datos obligatorios: vendor y vendorDate" },
        { status: 400 }
      );
    }

    const result = await saveProgressRecord(payload);

    const response: ProgressSaveResponse = {
      saved: result.saved,
      ...(result.error ? { error: result.error } : {}),
    };

    return Response.json(response, {
      status: result.saved ? 200 : 500,
    });
  } catch (cause) {
    console.error("[api/progress] Error:", cause);
    return Response.json(
      { error: "No se pudo procesar el progreso." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    if (search) {
      const results = await searchProgressByVendor(search);
      return Response.json(results);
    }

    const results = await listAllProgressRecords();
    return Response.json(results);
  } catch (cause) {
    console.error("[api/progress] Error en GET:", cause);
    return Response.json(
      { error: "No se pudieron cargar los progresos." },
      { status: 500 }
    );
  }
}
