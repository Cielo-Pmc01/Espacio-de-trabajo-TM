/**
 * update-excursiones-todo-el-anio.mjs
 *
 * Actualiza los campos includes, notIncludes, important de las excursiones
 * del catálogo "todo el año" con la información del archivo markdown.
 *
 * Uso: node scripts/update-excursiones-todo-el-anio.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../salidas/capacitacion-tm/.env.local") });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { db: { schema: "capacitacion_tm" } }
);

const LESSON_ID = "0304006d-d656-459d-84e0-a651d619ad44"; // Catálogo de excursiones — Todo el año

// Datos extraídos del catálogo "Excursiones todo el año.md"
// Clave: fragmento del título en minúsculas para matching flexible
const UPDATES = {
  "circuito chico": {
    includes: ["Paseo terrestre guiado"],
    notIncludes: ["Comidas", "ticket de ascenso al Cerro Campanario (opcional)"],
    important: ["Ascenso a Cerro Campanario con tarifas diferenciales: Adultos / Niños / Jubilados"],
  },
  "san martín": {
    includes: ["Paseo terrestre guiado"],
    notIncludes: ["Comidas"],
    important: [],
  },
  "cerro tronador": {
    includes: ["Paseo terrestre guiado"],
    notIncludes: ["Comidas", "tasas de ingreso a Parques Nacionales"],
    important: [],
  },
  "circuito grande": {
    includes: ["Paseo terrestre guiado"],
    notIncludes: ["Comidas"],
    important: [],
  },
  "bolsón": {
    includes: ["Paseo terrestre guiado"],
    notIncludes: ["Comidas", "tasas de ingreso a Parques Nacionales"],
    important: [],
  },
  "isla victoria": {
    includes: ["Paseo lacustre guiado y caminatas por el bosque"],
    notIncludes: [
      "Comidas",
      "tasas de ingreso a Parques Nacionales y embarque",
      "traslado a Puerto Pañuelo (opcional)",
    ],
    important: [],
  },
  "puerto blest": {
    includes: ["Paseo lacustre guiado y caminatas por el bosque"],
    notIncludes: [
      "Comidas",
      "tasas de ingreso a Parques Nacionales y embarque",
      "traslado a Puerto Pañuelo (opcional)",
    ],
    important: [],
  },
  "rafting light": {
    includes: [
      "Actividad de rafting",
      "Equipo completo (neoprene, chaleco, chaqueta seca, botas, remos, cascos)",
      "Traslado",
    ],
    notIncludes: ["Almuerzo"],
    important: ["Edad mínima: 5 años"],
  },
  "rafting al límite": {
    includes: [
      "Actividad de rafting",
      "Equipo completo (neoprene, chaleco, chaqueta seca, botas, remos, cascos)",
    ],
    notIncludes: ["Almuerzo (hay parador con asado y menú vegetariano)"],
    important: ["Edad mínima: 14 años", "Rápidos Clase III/IV — llega hasta el límite con Chile"],
  },
  "kayak": {
    includes: ["Kayak y equipo de seguridad", "Traslado"],
    notIncludes: ["Comidas"],
    important: [],
  },
  "canopy": {
    includes: [
      "Traslado ida y vuelta",
      "Traslado en 4x4 hasta el inicio de la actividad",
      "12 plataformas de más de 1.600 mts de vuelo",
    ],
    notIncludes: ["Almuerzo"],
    important: ["Edad mínima: 5 años"],
  },
  "cabalgat": {
    includes: ["Cabalgata", "Guías baqueanos", "Traslado"],
    notIncludes: ["Servicios de comida"],
    important: ["Edad mínima: 5 años"],
  },
  "buceo": {
    includes: [
      "Instructores certificados",
      "2 hs de actividad",
      "Equipamiento técnico completo",
      "20-30 min de inmersión",
      "Traslado",
    ],
    notIncludes: ["Comida"],
    important: [
      "La actividad debe realizarse 12 hs previas al viaje en avión",
      "Edad mínima: 8 años",
    ],
  },
  "cervecería": {
    includes: [
      "Traslado ida y vuelta",
      "Guía bilingüe",
      "Visitas guiadas a 3 cervecerías",
      "Degustaciones y maridajes",
      "Picadas regionales",
      "Recuerdo especial",
    ],
    notIncludes: ["Propinas", "Extras", "Bebidas adicionales"],
    important: ["Solo mayores de 18 años", "Miércoles y viernes"],
  },
};

function findUpdate(title) {
  const lower = title.toLowerCase();
  for (const [key, data] of Object.entries(UPDATES)) {
    if (lower.includes(key.toLowerCase())) return data;
  }
  return null;
}

async function main() {
  console.log("📥 Cargando lección de excursiones — Todo el año...\n");

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("content_json")
    .eq("id", LESSON_ID)
    .maybeSingle();

  if (error || !lesson) {
    console.error("❌ Error cargando lección:", error?.message);
    process.exit(1);
  }

  const excursions = lesson.content_json?.excursions ?? [];
  console.log(`   ${excursions.length} excursiones encontradas\n`);

  let updated = 0;
  const newExcursions = excursions.map((exc) => {
    const patch = findUpdate(exc.title);
    if (!patch) {
      console.log(`⚠️  Sin datos para: "${exc.title}"`);
      return exc;
    }

    const merged = {
      ...exc,
      includes: patch.includes.length ? patch.includes : exc.includes,
      notIncludes: patch.notIncludes.length ? patch.notIncludes : exc.notIncludes,
      important: patch.important.length ? patch.important : exc.important,
    };

    // Verificar si hay cambios reales
    const changed =
      JSON.stringify(merged.includes) !== JSON.stringify(exc.includes) ||
      JSON.stringify(merged.notIncludes) !== JSON.stringify(exc.notIncludes) ||
      JSON.stringify(merged.important) !== JSON.stringify(exc.important);

    if (changed) {
      updated++;
      console.log(`✅ "${exc.title}"`);
      if (merged.includes.length) console.log(`   incluye: ${merged.includes.join(", ")}`);
      if (merged.notIncludes.length) console.log(`   no incluye: ${merged.notIncludes.join(", ")}`);
      if (merged.important.length) console.log(`   importante: ${merged.important.join(", ")}`);
    } else {
      console.log(`   "${exc.title}" — sin cambios`);
    }

    return merged;
  });

  if (updated === 0) {
    console.log("\n✨ Todas las excursiones ya tienen datos actualizados.");
    return;
  }

  console.log(`\n💾 Guardando ${updated} excursión(es) actualizada(s)...`);

  // Actualizar ambas lecciones (excursion + provider) para mantener sync
  const newContentJson = {
    ...lesson.content_json,
    excursions: newExcursions,
  };

  const { error: saveError } = await supabase
    .from("lessons")
    .update({ content_json: newContentJson })
    .eq("id", LESSON_ID);

  if (saveError) {
    console.error("❌ Error guardando:", saveError.message);
    process.exit(1);
  }

  console.log(`✅ Lección actualizada con ${updated} excursiones mejoradas.`);
  console.log("\n💡 Nota: La lección 'provider' del mismo bloque se sincronizará");
  console.log("   automáticamente al abrir el admin (carga desde la lección excursion).");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
