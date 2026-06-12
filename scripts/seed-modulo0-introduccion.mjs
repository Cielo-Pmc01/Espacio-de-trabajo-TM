import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  "https://mrovdtkeckxgknkoeqva.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb3ZkdGtlY2t4Z2tua29lcXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2MzE1NywiZXhwIjoyMDkxNDM5MTU3fQ.uEefeNA9mfrHMdLn9resciBZpb6VK36rRCvthPQ59wY",
  { db: { schema: "capacitacion_tm" } }
);

// IDs de bloques del Módulo 0 - Introducción Institucional
const BLOQUES = {
  bienvenida:    "eaecad32-02ee-45ac-a2d9-da2dc428c7ca",
  indice:        "559840d4-a09c-4164-bf2e-1600582ce831",
  glosario:      "1bd69784-ed46-4b3f-8688-48bdb90807d1",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function richTextBlock(tiptapContent) {
  return { id: randomUUID(), type: "rich_text", content: tiptapContent };
}

function cardBlock(title, description, icon) {
  return { id: randomUUID(), type: "card", title, description, icon };
}

function separatorBlock() {
  return { id: randomUUID(), type: "separator" };
}

function doc(...nodes) {
  return { type: "doc", content: nodes };
}

function paragraph(...inlines) {
  return { type: "paragraph", content: inlines };
}

function h2(text) {
  return { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] };
}

function h3(text) {
  return { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text }] };
}

function bold(text) {
  return { type: "text", text, marks: [{ type: "bold" }] };
}

function text(t) {
  return { type: "text", text: t };
}

function orderedList(...items) {
  return {
    type: "orderedList",
    attrs: { start: 1 },
    content: items.map((item) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [{ type: "text", text: item }] }],
    })),
  };
}

// ── Contenido lección 1: Bienvenida ─────────────────────────────────────────

const contenidoBienvenida = [
  richTextBlock(doc(
    paragraph(
      bold("Turismo Bariloche"),
      text(" es una empresa con más de "),
      bold("30 años de trayectoria"),
      text(" en la industria del turismo receptivo en la región andina patagónica. Nuestra historia está marcada por la "),
      bold("excelencia operativa, la innovación constante y un profundo compromiso con la calidad de servicio al cliente"),
      text("."),
    ),
    paragraph(
      text("Con el correr de los años, nos hemos posicionado como "),
      bold("líderes absolutos del mercado"),
      text(", no solo en términos de volumen de pasajeros atendidos, sino también por la "),
      bold("magnitud de nuestra estructura comercial y operativa"),
      text(". Nuestra presencia física se destaca por locales estratégicamente ubicados en la "),
      bold("primera, segunda, cuarta y quinta cuadra de la calle Mitre"),
      text(", el principal eje comercial del centro de San Carlos de Bariloche."),
    ),
    paragraph(
      text("A la vez, contamos con un "),
      bold("robusto ecosistema digital"),
      text(": operamos múltiples marcas posicionadas online a nivel regional y nacional, apalancadas en "),
      bold("tecnología de vanguardia, inteligencia artificial y plataformas web optimizadas para la conversión de ventas"),
      text(". Esto nos permite tener "),
      bold("canales de venta híbridos y eficientes"),
      text(", que combinan lo mejor del asesoramiento presencial con la inmediatez y alcance de la venta digital."),
    ),
  )),
];

// ── Contenido lección 2: Índice de aprendizajes ──────────────────────────────

const contenidoIndice = [
  richTextBlock(doc(
    h3("En esta capacitación vas a aprender"),
    orderedList(
      "La propuesta de valor y los principales servicios de iAdventure Center.",
      "Cómo funcionan las excursiones, traslados y operaciones de nieve.",
      "Los protocolos de venta y los pasos para una atención segura y eficiente.",
      "Los recursos comerciales, los puntos de contacto y las mejores prácticas.",
      "Qué esperar en la evaluación final y cómo prepararte para el cierre.",
    ),
  )),
];

// ── Contenido lección 3: Glosario ────────────────────────────────────────────

const contenidoGlosario = [
  cardBlock(
    "Excursión",
    "Experiencia turística guiada que incluye traslado, actividades y atención al cliente.",
    "🗺️"
  ),
  cardBlock(
    "Protocolo",
    "Normas y pasos establecidos para garantizar seguridad, calidad y coherencia operativa.",
    "📋"
  ),
  cardBlock(
    "Voucher",
    "Comprobante de reserva y pago que el cliente recibe como garantía del servicio.",
    "🎫"
  ),
  cardBlock(
    "Disponibilidad",
    "Confirmación del proveedor de que el servicio puede venderse y ejecutarse en la fecha solicitada.",
    "✅"
  ),
  cardBlock(
    "Venta cruzada",
    "Sugerir productos o servicios adicionales que mejoren la experiencia del cliente.",
    "🔄"
  ),
];

// ── Insertar lecciones ────────────────────────────────────────────────────────

async function crearLeccion({ blockId, title, contentJson, order }) {
  // Verificar si ya existe
  const { data: existing } = await supabase
    .from("lessons")
    .select("id, title")
    .eq("block_id", blockId)
    .eq("title", title)
    .maybeSingle();

  if (existing) {
    console.log(`⚠️  Ya existe: "${title}" — actualizando contenido...`);
    const { error } = await supabase
      .from("lessons")
      .update({ content_json: contentJson, is_published: true, visible_sectors: ["B1", "VR", "VP"] })
      .eq("id", existing.id);
    if (error) throw error;
    console.log(`✅ Actualizado: "${title}"`);
    return;
  }

  const { error } = await supabase.from("lessons").insert({
    id: randomUUID(),
    block_id: blockId,
    title,
    content_json: contentJson,
    order,
    lesson_type: "generic",
    is_published: true,
    visible_sectors: ["B1", "VR", "VP"],
  });

  if (error) throw error;
  console.log(`✅ Creada: "${title}"`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Cargando contenido del Módulo 0 — Introducción Institucional\n");

  await crearLeccion({
    blockId: BLOQUES.bienvenida,
    title: "Quiénes somos",
    contentJson: contenidoBienvenida,
    order: 1,
  });

  await crearLeccion({
    blockId: BLOQUES.indice,
    title: "Índice de aprendizajes",
    contentJson: contenidoIndice,
    order: 1,
  });

  await crearLeccion({
    blockId: BLOQUES.glosario,
    title: "Glosario de términos",
    contentJson: contenidoGlosario,
    order: 1,
  });

  console.log("\n✨ Listo. Abrí el admin para verificar el contenido.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
