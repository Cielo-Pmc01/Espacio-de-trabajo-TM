import { deleteProgressRecord, findProgressById } from "@/lib/server/progress-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const progress = await findProgressById(id);
    if (!progress) {
      return Response.json({ error: "Progreso no encontrado" }, { status: 404 });
    }
    return Response.json(progress);
  } catch (cause) {
    console.error("[api/progress/[id]] Error al cargar:", cause);
    return Response.json(
      { error: "No se pudo cargar el progreso." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteProgressRecord(id);
    return Response.json({ success: true });
  } catch (cause) {
    console.error("[api/progress/[id]] Error al borrar:", cause);
    return Response.json(
      { error: "No se pudo borrar el progreso." },
      { status: 500 }
    );
  }
}
