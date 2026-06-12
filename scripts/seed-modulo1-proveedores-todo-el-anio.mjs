import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  "https://mrovdtkeckxgknkoeqva.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb3ZkdGtlY2t4Z2tua29lcXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2MzE1NywiZXhwIjoyMDkxNDM5MTU3fQ.uEefeNA9mfrHMdLn9resciBZpb6VK36rRCvthPQ59wY",
  { db: { schema: "capacitacion_tm" } }
);

const BLOCK_PROVEEDORES = "6b94e483-12c0-43b6-a455-33178a15cf4c";

// Cada item es un servicio de un proveedor. El ProvidersViewer agrupa por campo "provider".
// category se usa como etiqueta de tipo en la vista expandida de cada producto.

const SERVICIOS = [
  // ── Adventure Center ─────────────────────────────────────────────────────────
  { id: randomUUID(), provider: "🏢 Adventure Center", title: "Villa La Angostura",            category: "Terrestre",    duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },
  { id: randomUUID(), provider: "🏢 Adventure Center", title: "Traslado al Cerro Catedral",    category: "Traslado",     duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },
  { id: randomUUID(), provider: "🏢 Adventure Center", title: "Traslado Cerro Bayo",           category: "Traslado",     duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },
  { id: randomUUID(), provider: "🏢 Adventure Center", title: "Traslado Villa La Angostura",   category: "Traslado",     duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },

  // ── Interno ──────────────────────────────────────────────────────────────────
  { id: randomUUID(), provider: "🏠 Interno",           title: "Noche Encantada",               category: "Aventura",     duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },
  { id: randomUUID(), provider: "🏠 Interno",           title: "Nieve Encantada",               category: "Aventura",     duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },
  { id: randomUUID(), provider: "🏠 Interno",           title: "Culipatin en el Cerro López",   category: "Aventura",     duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },

  // ── Epic ─────────────────────────────────────────────────────────────────────
  { id: randomUUID(), provider: "⛷️ Epic",              title: "Clase Bautismo de Ski/Snow Catedral (pase no incluido)", category: "Ski / Snow", duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },
  { id: randomUUID(), provider: "⛷️ Epic",              title: "Clase Bautismo de Ski o Snow Semi Exclusiva",            category: "Ski / Snow", duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },

  // ── La Cueva ─────────────────────────────────────────────────────────────────
  { id: randomUUID(), provider: "🕳️ La Cueva",          title: "Excursión La Cueva (excursión 1)", category: "Aventura",  duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },
  { id: randomUUID(), provider: "🕳️ La Cueva",          title: "Excursión La Cueva (excursión 2)", category: "Aventura",  duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },
  { id: randomUUID(), provider: "🕳️ La Cueva",          title: "Excursión La Cueva (excursión 3)", category: "Aventura",  duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },

  // ── Mountain ─────────────────────────────────────────────────────────────────
  { id: randomUUID(), provider: "🎿 Mountain",           title: "Escuelita de Ski",              category: "Ski / Snow",   duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },

  // ── Roca Negra ───────────────────────────────────────────────────────────────
  { id: randomUUID(), provider: "🪨 Roca Negra",         title: "Excursión Roca Negra",          category: "Aventura",     duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },

  // ── Diversidad ───────────────────────────────────────────────────────────────
  { id: randomUUID(), provider: "🏔️ Diversidad",         title: "Caminata a la Laguna Congelada",   category: "Aventura", duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },
  { id: randomUUID(), provider: "🏔️ Diversidad",         title: "Raquetas y Sabores Regionales",     category: "Aventura", duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },

  // ── Piedras Blancas ──────────────────────────────────────────────────────────
  { id: randomUUID(), provider: "❄️ Piedras Blancas",    title: "Piedras Blancas Trineos-Culipatin + Traslado", category: "Nieve", duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },

  // ── Winterpark ───────────────────────────────────────────────────────────────
  { id: randomUUID(), provider: "🎉 Winterpark",          title: "Winterpark Ski Principiantes + Traslado",      category: "Nieve", duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },
  { id: randomUUID(), provider: "🎉 Winterpark",          title: "Winternight - Cena Show y Ski Nocturno",       category: "Nieve", duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },

  // ── Noche Nórdica ────────────────────────────────────────────────────────────
  { id: randomUUID(), provider: "🌙 Noche Nórdica",       title: "Cena Nórdica",                 category: "Gastronomía",  duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },

  // ── Patagonia Showroom ───────────────────────────────────────────────────────
  { id: randomUUID(), provider: "🎭 Patagonia Showroom",  title: "Alquiler de ropa de nieve (ski/snowboard)", category: "Equipamiento", duration: "A consultar", experience: [], includes: [], notIncludes: [], important: [] },
];

// ── Helper ────────────────────────────────────────────────────────────────────

async function upsertLeccion({ blockId, title, contentJson, lessonType, order }) {
  const { data: existing } = await supabase
    .from("lessons")
    .select("id, title")
    .eq("block_id", blockId)
    .eq("title", title)
    .maybeSingle();

  if (existing) {
    console.log(`⚠️  Ya existe: "${title}" — actualizando...`);
    const { error } = await supabase
      .from("lessons")
      .update({ content_json: contentJson, lesson_type: lessonType, is_published: true, visible_sectors: ["B1", "VR", "VP"] })
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
    lesson_type: lessonType,
    is_published: true,
    visible_sectors: ["B1", "VR", "VP"],
  });
  if (error) throw error;
  console.log(`✅ Creada: "${title}"`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Cargando Proveedores y prestadores — Todo el año\n");
  console.log(`   ${SERVICIOS.length} servicios en ${new Set(SERVICIOS.map(s => s.provider)).size} proveedores\n`);

  await upsertLeccion({
    blockId: BLOCK_PROVEEDORES,
    title: "Proveedores y prestadores — Todo el año",
    contentJson: { excursions: SERVICIOS },
    lessonType: "provider",
    order: 1,
  });

  console.log("\n✨ Listo.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
